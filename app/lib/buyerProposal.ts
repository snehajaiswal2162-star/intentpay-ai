export type BuyerProposal = {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  budgetMax: number | null;
  authorized: boolean;
  createdAt: number;
  expiresAt: number;
};

// Temporary server-side proposal store.
// Later this can be replaced with MongoDB/PostgreSQL.
const proposals = new Map<string, BuyerProposal>();

export function saveBuyerProposal(
  proposal: BuyerProposal
) {
  proposals.set(proposal.id, proposal);
}

export function getBuyerProposal(
  proposalId: string
) {
  return proposals.get(proposalId);
}

export function authorizeBuyerProposal(
  proposalId: string
) {
  const proposal = proposals.get(proposalId);

  if (!proposal) {
    return null;
  }

  proposal.authorized = true;

  proposals.set(proposalId, proposal);

  return proposal;
}
export function deleteBuyerProposal(
  proposalId: string
) {
  proposals.delete(proposalId);
}