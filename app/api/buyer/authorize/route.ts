import {
  authorizeBuyerProposal,
  getBuyerProposal,
} from "../../../lib/buyerProposal";
import { recordAuditEvent } from "../../../lib/audit";

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
    // =====================================================

    const proposal = getBuyerProposal(proposalId);

    if (!proposal) {
      return Response.json(
        {
          success: false,
          error: "Buyer proposal not found or already used.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 3. Check Proposal Expiry
    // =====================================================

    if (Date.now() > proposal.expiresAt) {
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
    // 4. Prevent Re-Authorization
    // =====================================================

    if (proposal.authorized) {
      return Response.json(
        {
          success: false,
          error: "Buyer proposal has already been authorized.",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // 5. Authorize Proposal
    // =====================================================

    const authorizedProposal =
      authorizeBuyerProposal(proposalId);

    if (authorizedProposal) {
  recordAuditEvent("USER_AUTHORIZED", {
    proposalId: authorizedProposal.id,
    productId: authorizedProposal.productId,
    details: {
      productName: authorizedProposal.productName,
      productPrice: authorizedProposal.productPrice,
      budgetMax: authorizedProposal.budgetMax,
    },
  });
}

    if (!authorizedProposal) {
      return Response.json(
        {
          success: false,
          error: "Unable to authorize buyer proposal.",
        },
        { status: 500 }
      );
    }

    console.log(
      "BUYER PROPOSAL AUTHORIZED:",
      authorizedProposal
    );

    // =====================================================
    // 6. Return Authorization Result
    // =====================================================

    return Response.json({
      success: true,
      authorized: true,
      proposal: {
        id: authorizedProposal.id,
        productId: authorizedProposal.productId,
        productName: authorizedProposal.productName,
        productPrice: authorizedProposal.productPrice,
        budgetMax: authorizedProposal.budgetMax,
        authorized: authorizedProposal.authorized,
        expiresAt: authorizedProposal.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Buyer authorization error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Unable to authorize buyer proposal.",
      },
      { status: 500 }
    );
  }
}