import { fetchProducts } from "./app/lib/productApi";
import { detectPromptInjection } from "./app/lib/security";

async function testPaymentSecurity() {
  const products = await fetchProducts();

  // Simulate a buyer proposal with a ₹3,000 maximum budget
  const product = products.find(
  (item) => item.name === "Essence Mascara Lash Princess"
);

if (!product) {
  console.log("❌ Calvin Klein CK One not found.");
  return;
}

const proposal = {
  id: "test-proposal-1",
  productId: product.id,
  productPrice: product.price,
  budgetMax: 3000,
  createdAt: Date.now(),
  expiresAt: Date.now() + 5 * 60 * 1000,
};

  console.log("\n========== PAYMENT SECURITY TEST ==========");

  if (!product) {
    console.log("❌ Test product not found.");
    return;
  }

  console.log("Product:", product.name);
  console.log("Server price:", product.price);
  console.log("Proposal price:", proposal.productPrice);
  console.log("User budget:", proposal.budgetMax);

  // Security check
  const securityResult = detectPromptInjection({
    name: product.name,
    description: product.description,
    features: product.features,
  });

  console.log("Security suspicious:", securityResult.suspicious);

  // Price verification
  const priceChanged =
    product.price !== proposal.productPrice;

  console.log("Price changed:", priceChanged);

  // Budget verification
  const budgetExceeded =
    proposal.budgetMax !== null &&
    product.price > proposal.budgetMax;

  console.log("Budget exceeded:", budgetExceeded);

  if (budgetExceeded) {
  console.log(
    "❌ VALID PAYMENT TEST FAILED — Product is incorrectly marked over-budget."
  );
} else {
  console.log(
    "✅ VALID PAYMENT TEST PASSED — Payment would be ALLOWED to proceed."
  );
}

  console.log("============================================\n");
}

testPaymentSecurity().catch((error) => {
  console.error("Payment security test failed:", error);
});