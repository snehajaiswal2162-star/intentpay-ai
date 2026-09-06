type Intent = {
  category?: string;
  brand?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  purpose?: string;
  requirements?: string[];
  preferences?: string[];
  hardConstraints?: string[];
};

type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
};

export function createBuyerProposal(
  intent: Intent,
  product: Product
) {
  const budgetMax = intent.budgetMax ?? null;

  const budgetExceeded =
    budgetMax !== null &&
    product.price > budgetMax;

  const budgetDifference =
    budgetExceeded
      ? product.price - budgetMax!
      : 0;

  const authorized = false;

  let decision: string;

  if (budgetExceeded) {
    decision = "USER_APPROVAL_REQUIRED";
  } else {
    decision = "ELIGIBLE_FOR_USER_APPROVAL";
  }

  return {
    productId: product.id,
    productName: product.name,
    price: product.price,

    userBudget: budgetMax,

    budgetExceeded,
    budgetDifference,

    decision,

    authorized,

    paymentAllowed: false,

    reason: budgetExceeded
      ? `This product exceeds your stated budget by ₹${budgetDifference.toLocaleString(
          "en-IN"
        )}. User approval is required before any payment.`
      : "This product satisfies the stated budget constraint. Payment still requires explicit user authorization.",
  };
}