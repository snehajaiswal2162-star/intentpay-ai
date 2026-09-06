import { GoogleGenAI } from "@google/genai";
import { rankProducts } from "../../lib/matcher";
import { explainProduct } from "../../lib/explainer";
import { createBuyerProposal } from "../../lib/buyer";
import { saveBuyerProposal } from "../../lib/buyerProposal";
import { fetchProducts } from "@/app/lib/productApi";
import { recordAuditEvent } from "@/app/lib/audit";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // --------------------------------
    // 1. Get the user's shopping request
    // --------------------------------

    const body = await req.json();
    const query = body.query;

    if (!query || typeof query !== "string") {
      return Response.json(
        {
          success: false,
          error: "Shopping request is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 2. Ask Gemini to understand intent
    // --------------------------------

    const prompt = `
You are an AI shopping intent extraction system.

Understand the user's shopping request and return ONLY valid JSON.

User request:

"${query}"

Return this exact structure:

{
  "category": "string",
  "brand": "string",
  "budgetMin": number or null,
  "budgetMax": number or null,
  "purpose": "string",
  "requirements": [],
  "preferences": [],
  "hardConstraints": [],
  "missingInformation": []
}

Rules:

- Identify the general product category.
- Extract brand if mentioned.
- Extract minimum and maximum budget.
- Extract the user's purpose.
- Put important required features in requirements.
- Put optional preferences in preferences.
- Put strict conditions in hardConstraints.
- Do not invent requirements.
- If something is not mentioned, use null or an empty string/array.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // --------------------------------
    // 3. Convert Gemini response to JSON
    // --------------------------------

    const intentText = response.text;

    if (!intentText) {
      throw new Error("Gemini returned an empty response.");
    }

    const intent = JSON.parse(intentText);

    // --------------------------------
    // 4. Send intent to our matcher
    // --------------------------------

    const products = await fetchProducts();

    console.log("EXTERNAL PRODUCTS COUNT:", products.length);
    console.log("FIRST 5 PRODUCTS:", products.slice(0, 5));
    console.log("AI INTENT:", intent);

    const result = rankProducts(intent, products);
    console.log("MATCHER RESULT:", result);
    // --------------------------------
    // 5. Create buyer proposal
    // --------------------------------

    const bestProduct =
      result.products[0] || result.alternatives[0] || null;

    let buyerProposal = null;

    if (bestProduct) {
      const proposal = createBuyerProposal(
        intent,
        bestProduct
      );

      const now = Date.now();

      const storedProposal = {
        id: crypto.randomUUID(),
        productId: bestProduct.id,
        productName: bestProduct.name,
        productPrice: bestProduct.price,
        budgetMax: intent.budgetMax ?? null,
        authorized: false,
        createdAt: now,
        expiresAt: now + 10 * 60 * 1000,
      };

      saveBuyerProposal(storedProposal);

      recordAuditEvent("PROPOSAL_CREATED", {
        proposalId: storedProposal.id,
        productId: storedProposal.productId,
        details: {
          productName: storedProposal.productName,
          productPrice: storedProposal.productPrice,
          budgetMax: storedProposal.budgetMax,
        },
      });

      buyerProposal = {
        ...proposal,
        id: storedProposal.id,
      };

      console.log(
        "BUYER PROPOSAL CREATED:",
        buyerProposal
      );
    }

    // --------------------------------
    // 6. Create explanation
    // --------------------------------

    let explanation = null;

    if (bestProduct) {
      explanation = explainProduct(intent, {
        ...bestProduct,
        matchScore: bestProduct.matchScore,
      });
    }

    // --------------------------------
    // 7. Return everything to frontend
    // --------------------------------

    return Response.json({
      success: true,
      intent,
      products: result.products,
      alternatives: result.alternatives,
      explanation,
      buyerProposal,
    });
  } catch (error) {
    console.error("IntentPay AI Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    const isQuotaError =
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("Quota exceeded") ||
      errorMessage.includes("quota");

    if (isQuotaError) {
      return Response.json(
        {
          success: false,
          error:
            "AI request limit has been reached. Please try again later.",
          errorCode: "GEMINI_QUOTA_EXCEEDED",
          retryable: true,
        },
        { status: 429 }
      );
    }

    return Response.json(
      {
        success: false,
        error: "AI agent failed. Please try again.",
        errorCode: "AI_AGENT_ERROR",
        retryable: true,
      },
      { status: 500 }
    );
  }
}