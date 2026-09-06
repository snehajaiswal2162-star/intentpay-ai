import Razorpay from "razorpay";

import { fetchProducts } from "../../../lib/productApi";
import { detectPromptInjection } from "../../../lib/security";
import {
  getBuyerProposal,
  deleteBuyerProposal,
} from "../../../lib/buyerProposal";
import { recordAuditEvent } from "../../../lib/audit";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { proposalId } = body;

    // =====================================================
    // 1. Validate Proposal ID
    // =====================================================

    if (!proposalId || typeof proposalId !== "string") {
      return Response.json(
        {
          success: false,
          error: "Buyer proposal ID is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Retrieve Server-Side Proposal
    //
    // IMPORTANT:
    // We do NOT accept product price or budget
    // from the browser anymore.
    // =====================================================

    const proposal = getBuyerProposal(proposalId);

    if (!proposal) {
      return Response.json(
        {
          success: false,
          error:
            "Buyer proposal not found or already used.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 3. Check Proposal Expiry
    // =====================================================

    if (Date.now() > proposal.expiresAt) {
      deleteBuyerProposal(proposalId);

      return Response.json(
        {
          success: false,
          error:
            "Buyer proposal has expired. Please create a new proposal.",
        },
        { status: 410 }
      );
    }

    // =====================================================
// 3.5. Explicit User Authorization Check
// =====================================================

if (!proposal.authorized) {
  return Response.json(
    {
      success: false,
      error:
        "Payment blocked because explicit user authorization is required.",
      security: {
        blocked: true,
        reason: "USER_AUTHORIZATION_REQUIRED",
      },
    },
    { status: 403 }
  );
}

    // =====================================================
    // 4. Fetch Trusted Product Catalogue
    // =====================================================

    const products = await fetchProducts();

    const product = products.find(
      (item) => item.id === proposal.productId
    );

    if (!product) {
      return Response.json(
        {
          success: false,
          error:
            "Product from buyer proposal is no longer available.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 5. Security Check
    // =====================================================

    const securityResult = detectPromptInjection({
      name: product.name,
      description: product.description,
      features: product.features,
    });

    console.log("PAYMENT SECURITY CHECK:", {
      proposalId,
      productId: product.id,
      suspicious: securityResult.suspicious,
      detectedPatterns:
        securityResult.detectedPatterns,
    });

    if (securityResult.suspicious) {
      return Response.json(
        {
          success: false,
          error:
            "Payment blocked because the product failed security validation.",
          security: {
            blocked: true,
            reason: "PROMPT_INJECTION",
            detectedPatterns:
              securityResult.detectedPatterns,
          },
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 6. Validate Product Price
    // =====================================================

    if (
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price <= 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid product price.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 7. Verify Price Has Not Changed
    //
    // The proposal stores the price that the user
    // originally authorized.
    // =====================================================

    if (product.price !== proposal.productPrice) {
      console.warn(
        "PAYMENT BLOCKED: PRODUCT PRICE CHANGED",
        {
          proposalId,
          proposalPrice: proposal.productPrice,
          currentPrice: product.price,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            "Payment blocked because the product price has changed since the buyer proposal was created.",
          security: {
            blocked: true,
            reason: "PRICE_CHANGED",
            originalPrice: proposal.productPrice,
            currentPrice: product.price,
          },
        },
        { status: 409 }
      );
    }

    // =====================================================
    // 8. Server-Side Budget Protection
    //
    // Budget comes from the stored proposal,
    // NOT from the browser.
    // =====================================================

    if (
      proposal.budgetMax !== null &&
      product.price > proposal.budgetMax
    ) {
      console.warn(
        "PAYMENT BLOCKED: BUDGET EXCEEDED",
        {
          proposalId,
          productPrice: product.price,
          budgetMax: proposal.budgetMax,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            "Payment blocked because the product exceeds the user's maximum budget.",
          security: {
            blocked: true,
            reason: "BUDGET_EXCEEDED",
            productPrice: product.price,
            budgetMax: proposal.budgetMax,
            difference:
              product.price - proposal.budgetMax,
          },
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 9. Calculate Razorpay Amount
    //
    // Price comes from the trusted server catalogue.
    // =====================================================

    const amountInPaise = Math.round(
      product.price * 100
    );

    if (amountInPaise <= 0) {
      return Response.json(
        {
          success: false,
          error: "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 10. Create Razorpay Order
    // =====================================================

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",

      receipt: `intentpay_${Date.now()}`,

      notes: {
        proposalId: proposal.id,
        productId: product.id,
        productName: product.name,
        productPrice: String(product.price),
        budgetMax:
          proposal.budgetMax !== null
            ? String(proposal.budgetMax)
            : "none",
        source: "IntentPay AI",
        securityChecked: "true",
        budgetChecked:
          proposal.budgetMax !== null
            ? "true"
            : "false",
      },
    });

    // =====================================================
    // 11. Delete Proposal After Successful Order Creation
    //
    // Prevents the same proposal from being reused.
    // =====================================================

    deleteBuyerProposal(proposalId);

    recordAuditEvent("PAYMENT_ORDER_CREATED", {
  proposalId: proposal.id,
  productId: product.id,
  details: {
    orderId: order.id,
    productName: product.name,
    amount: order.amount,
    currency: order.currency,
    budgetMax: proposal.budgetMax,
    securityChecked: true,
    budgetChecked: proposal.budgetMax !== null,
  },
});

    // =====================================================
    // 12. Return Order
    // =====================================================

    return Response.json({
      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },

      security: {
        passed: true,
        budgetChecked:
          proposal.budgetMax !== null,
        proposalVerified: true,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay order creation error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}