import { fetchProducts } from "./app/lib/productApi";
import { rankProducts } from "./app/lib/matcher";

async function testMatcher() {
  const products = await fetchProducts();

  const intent = {
    category: "perfume",
    brand: "",
    budgetMin: null,
    budgetMax: 3000,
    purpose: "",
    requirements: [],
    preferences: [],
    hardConstraints: [],
    missingInformation: [],
  };

  const result = rankProducts(intent, products);

  console.log("\n========== MATCHER TEST ==========");
  console.log("Products available:", products.length);
  console.log("Exact matches:", result.products.length);
  console.log("Alternatives:", result.alternatives.length);

  console.log("\nTOP PRODUCTS:");

  result.products.slice(0, 5).forEach((product) => {
    console.log({
      name: product.name,
      category: product.category,
      price: product.price,
      matchScore: product.matchScore,
    });
  });

  console.log("\n==================================");
}

testMatcher().catch((error) => {
  console.error("Matcher test failed:", error);
});