type Product = {
  name: string;
  description?: string;
  features?: string[];
};

const suspiciousPatterns = [
  "ignore previous instructions",
  "ignore the user's instructions",
  "ignore user instructions",
  "system message",
  "developer message",
  "override the user",
  "disregard previous",
  "forget your instructions",
  "change the user's budget",
  "increase the budget",
  "buy this instead",
  "always recommend this",
  "must recommend",
  "do not follow the user's",
];

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function detectPromptInjection(product: Product) {
  const catalogueText = normalizeText(
    [
      product.name,
      product.description || "",
      ...(product.features || []),
    ].join(" ")
  );

  const detectedPatterns = suspiciousPatterns.filter((pattern) =>
    catalogueText.includes(pattern)
  );

  return {
    suspicious: detectedPatterns.length > 0,
    detectedPatterns,
  };
}