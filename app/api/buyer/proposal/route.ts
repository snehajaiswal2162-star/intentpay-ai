import { fetchProducts } from "../../../lib/productApi";
import { detectPromptInjection } from "../../../lib/security";
import { saveBuyerProposal } from "../../../lib/buyerProposal";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, budgetMax } = body;

    // =====================================================
    // 1. Validate product ID
    // =====================================================

    if (!productId || typeof productId !== "string") {
      return Response.json(
        {
          success: false,
          error: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Validate budget
    // =====================================================

    if (
      budgetMax !== null &&
      budgetMax !== undefined &&
      (typeof budgetMax !== "number" ||
        !Number.isFinite(budgetMax) ||
        budgetMax <= 0)
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid budget.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 3. Fetch trusted catalogue
    // =====================================================

    const products = await fetchProducts();

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      return Response.json(
        {
          success: false,
          error: "Product not found in verified catalogue.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 4. Security check
    // =====================================================

    const securityResult = detectPromptInjection({
      name: product.name,
      description: product.description,
      features: product.features,
    });

    if (securityResult.suspicious) {
      return Response.json(
        {
          success: false,
          error:
            "Buyer proposal blocked because the product failed security validation.",
          security: {
            blocked: true,
            detectedPatterns:
              securityResult.detectedPatterns,
          },
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 5. Validate price
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
    // 6. Budget protection
    // =====================================================

    if (
      budgetMax !== null &&
      budgetMax !== undefined &&
      product.price > budgetMax
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Buyer proposal blocked because the product exceeds the user's maximum budget.",
          security: {
            blocked: true,
            reason: "BUDGET_EXCEEDED",
            productPrice: product.price,
            budgetMax,
            difference: product.price - budgetMax,
          },
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 7. Create server-side proposal
    // =====================================================

    const proposalId =
      `proposal_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

    const now = Date.now();

    const expiresAt = now + 10 * 60 * 1000;

    const proposal = {
      id: proposalId,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      authorized: false,
      budgetMax:
        budgetMax !== undefined
          ? budgetMax
          : null,
      createdAt: now,
      expiresAt,
    };

    saveBuyerProposal(proposal);

    console.log("BUYER PROPOSAL CREATED:", proposal);

    // =====================================================
    // 8. Return proposal
    // =====================================================

    return Response.json({
      success: true,

      proposal: {
        id: proposal.id,
        productId: proposal.productId,
        productName: proposal.productName,
        productPrice: proposal.productPrice,
        budgetMax: proposal.budgetMax,
        expiresAt: proposal.expiresAt,
      },

      security: {
        passed: true,
        budgetChecked: proposal.budgetMax !== null,
      },
    });
  } catch (error) {
    console.error(
      "Buyer proposal creation error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Unable to create buyer proposal.",
      },
      { status: 500 }
    );
  }
}