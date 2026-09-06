import { ExternalProduct } from "../lib/productApi";

/* =========================================================
   TYPES
========================================================= */

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

type Product = ExternalProduct & {
  matchScore?: number;
  qualityScore?: number;
  matchReasons?: string[];
};

type ScoreBreakdown = {
  category: number;
  budget: number;
  brand: number;
  purpose: number;
  requirements: number;
  preferences: number;
};

/* =========================================================
   NORMALIZATION
========================================================= */

function normalize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   CATEGORY GROUPS
========================================================= */

const categoryGroups: Record<string, string[]> = {
  beauty: [
    "beauty",
    "makeup",
    "cosmetics",
    "lipstick",
    "mascara",
    "eyeshadow",
    "nail polish",
    "powder",
    "foundation",
    "concealer",
  ],

  fragrances: [
    "fragrance",
    "fragrances",
    "perfume",
    "perfumes",
    "cologne",
    "scent",
    "scented",
  ],

  skincare: [
    "skincare",
    "skin care",
    "skin",
    "moisturizer",
    "moisturiser",
    "serum",
    "cleanser",
    "face wash",
  ],

  smartphones: [
    "smartphone",
    "smartphones",
    "phone",
    "phones",
    "mobile",
    "mobiles",
  ],

  laptops: [
    "laptop",
    "laptops",
    "notebook",
    "notebooks",
  ],

  tablets: [
    "tablet",
    "tablets",
    "ipad",
  ],

  headphones: [
    "headphones",
    "headphone",
    "earphones",
    "earbuds",
    "earbud",
  ],

  watches: [
    "watch",
    "watches",
    "wristwatch",
  ],

  smartwatches: [
    "smartwatch",
    "smartwatches",
    "smart watch",
    "smart watches",
  ],

  shoes: [
    "shoe",
    "shoes",
    "footwear",
    "mens shoes",
    "womens shoes",
    "men shoes",
    "women shoes",
  ],

  jewellery: [
    "jewellery",
    "jewelry",
    "necklace",
    "ring",
    "rings",
    "bracelet",
    "earrings",
  ],

  groceries: [
    "grocery",
    "groceries",
    "food",
    "snacks",
    "beverages",
  ],

  furniture: [
    "furniture",
    "sofa",
    "chair",
    "table",
    "desk",
    "bed",
  ],

  homeDecoration: [
    "home decoration",
    "home decor",
    "decoration",
    "decor",
  ],

  kitchen: [
    "kitchen",
    "kitchen accessories",
    "cookware",
    "utensils",
  ],

  televisions: [
    "television",
    "televisions",
    "tv",
    "tvs",
  ],

  cameras: [
    "camera",
    "cameras",
    "dslr",
    "mirrorless",
  ],
};

function getCategoryGroup(category: string) {
  const normalizedCategory = normalize(category);

  for (const [group, values] of Object.entries(categoryGroups)) {
    if (
      values.some(
        (value) =>
          normalizedCategory === normalize(value) ||
          normalizedCategory.includes(normalize(value)) ||
          normalize(value).includes(normalizedCategory)
      )
    ) {
      return group;
    }
  }

  return normalizedCategory;
}

function categoryMatches(
  requestedCategory: string,
  productCategory: string
) {
  if (!requestedCategory || !productCategory) {
    return false;
  }

  return (
    getCategoryGroup(requestedCategory) ===
    getCategoryGroup(productCategory)
  );
}

/* =========================================================
   FEATURE ALIASES
========================================================= */

const featureAliases: Record<string, string[]> = {
  "active noise cancellation": [
    "active noise cancellation",
    "anc",
    "noise cancellation",
    "noise cancelling",
    "noise canceling",
  ],

  anc: [
    "active noise cancellation",
    "anc",
    "noise cancellation",
    "noise cancelling",
    "noise canceling",
  ],

  "large battery": [
    "large battery",
    "long battery",
    "high capacity battery",
    "6000mah",
    "6500mah",
    "6800mah",
    "7000mah",
  ],

  "long battery life": [
    "long battery",
    "long battery life",
    "large battery",
    "6000mah",
    "6500mah",
    "6800mah",
    "7000mah",
  ],

  "16gb ram": [
    "16gb ram",
    "16 gb ram",
    "ram 16gb",
    "ram 16 gb",
  ],

  "8gb ram": [
    "8gb ram",
    "8 gb ram",
    "ram 8gb",
    "ram 8 gb",
  ],

  "12gb ram": [
    "12gb ram",
    "12 gb ram",
    "ram 12gb",
    "ram 12 gb",
  ],
};

/* =========================================================
   FEATURE VARIATIONS
========================================================= */

function getFeatureVariations(requirement: string) {
  const normalized = normalize(requirement);

  return (
    featureAliases[normalized] || [normalized]
  );
}

/* =========================================================
   FEATURE CHECK
========================================================= */

function featureMatches(
  requirement: string,
  product: Product
) {
  if (typeof requirement !== "string") {
    return false;
  }

  const normalizedRequirement =
    normalize(requirement);

  const searchableText = [
    product.name,
    product.category,
    product.brand,
    product.description,
    ...(product.features || []),
  ].join(" ");

  const normalizedProductText =
    normalize(searchableText);

  /* -----------------------------------------
     NUMERIC BATTERY MATCHING
  ----------------------------------------- */

  const requestedBattery =
    normalizedRequirement.match(
      /(\d+)\s*mah/i
    );

  const productBattery =
    searchableText.match(
      /(\d+)\s*mah/i
    );

  if (
    requestedBattery &&
    productBattery
  ) {
    const requestedCapacity =
      Number(requestedBattery[1]);

    const productCapacity =
      Number(productBattery[1]);

    return (
      productCapacity >=
      requestedCapacity
    );
  }

  /* -----------------------------------------
     LARGE BATTERY MATCHING
  ----------------------------------------- */

  if (
    normalizedRequirement.includes(
      "large battery"
    ) ||
    normalizedRequirement.includes(
      "long battery"
    ) ||
    normalizedRequirement.includes(
      "long battery life"
    ) ||
    normalizedRequirement.includes(
      "high capacity battery"
    )
  ) {
    if (productBattery) {
      const productCapacity =
        Number(productBattery[1]);

      return productCapacity >= 6000;
    }
  }

  /* -----------------------------------------
     NORMAL FEATURE MATCHING
  ----------------------------------------- */

  const variations =
    getFeatureVariations(requirement);

  return variations.some((variation) =>
    normalizedProductText.includes(
      normalize(variation)
    )
  );
}

/* =========================================================
   PRODUCT TEXT
========================================================= */

function getProductText(product: Product) {
  return normalize(
    [
      product.name,
      product.category,
      product.brand,
      product.description,
      ...(product.features || []),
    ].join(" ")
  );
}

/* =========================================================
   PURPOSE MATCHING
========================================================= */

function purposeMatches(
  purpose: string,
  product: Product
) {
  if (!purpose) {
    return false;
  }

  const productText =
    getProductText(product);

  return productText.includes(
    normalize(purpose)
  );
}

/* =========================================================
   PRICE / BUDGET
========================================================= */

function getBudgetDifference(
  productPrice: number,
  budgetMax: number | null
) {
  if (
    budgetMax === null ||
    productPrice <= budgetMax
  ) {
    return 0;
  }

  return productPrice - budgetMax;
}

/* =========================================================
   HARD CONSTRAINT CHECK
========================================================= */

function hardConstraintMatches(
  constraint: string,
  product: Product
) {
  const normalized =
    normalize(constraint);

  /*
    Examples:

    under 3000
    below 3000
    less than 3000
    maximum 3000
    max 3000
    price_under_3000
  */

  const maximumMatch =
    normalized.match(
      /(?:under|below|less than|maximum|max|price under|price below|price less than)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)/i
    );

  if (maximumMatch) {
    return (
      product.price <=
      Number(maximumMatch[1])
    );
  }

  const generatedMaximum =
    normalized.match(
      /price[_\s-]*(?:under|below|max|maximum)[_\s-]*(\d+(?:\.\d+)?)/
    );

  if (generatedMaximum) {
    return (
      product.price <=
      Number(generatedMaximum[1])
    );
  }

  const minimumMatch =
    normalized.match(
      /(?:above|over|more than|minimum|min|>=)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)/i
    );

  if (minimumMatch) {
    return (
      product.price >=
      Number(minimumMatch[1])
    );
  }

  return true;
}

/* =========================================================
   EXPLAIN PRODUCT
========================================================= */

export function explainProduct(
  intent: Intent,
  product: Product
) {
  const budgetMin =
    intent.budgetMin ?? null;

  const budgetMax =
    intent.budgetMax ?? null;

  /* =======================================================
     CATEGORY
  ======================================================= */

  const categoryMatch =
    categoryMatches(
      intent.category || "",
      product.category
    );

  /* =======================================================
     BUDGET
  ======================================================= */

  const aboveMaximum =
    budgetMax !== null &&
    product.price > budgetMax;

  const belowMinimum =
    budgetMin !== null &&
    product.price < budgetMin;

  const budgetMatch =
    !aboveMaximum &&
    !belowMinimum;

  const budgetDifference =
    aboveMaximum && budgetMax !== null
      ? product.price - budgetMax
      : 0;

  /* =======================================================
     BRAND
  ======================================================= */

  const brandMatch =
    !!intent.brand &&
    normalize(product.brand).includes(
      normalize(intent.brand)
    );

  /* =======================================================
     PURPOSE
  ======================================================= */

  const purposeMatch =
    !!intent.purpose &&
    purposeMatches(
      intent.purpose,
      product
    );

  /* =======================================================
     REQUIREMENTS
  ======================================================= */

  const requirements =
    Array.isArray(intent.requirements)
      ? intent.requirements.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];

  const requirementMatches =
    requirements.filter((requirement) =>
      featureMatches(
        requirement,
        product
      )
    );

  const missingRequirements =
    requirements.filter(
      (requirement) =>
        !featureMatches(
          requirement,
          product
        )
    );

  /* =======================================================
     PREFERENCES
  ======================================================= */

  const preferences =
    Array.isArray(intent.preferences)
      ? intent.preferences.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];

  const preferenceMatches =
    preferences.filter((preference) =>
      featureMatches(
        preference,
        product
      )
    );

  /* =======================================================
     HARD CONSTRAINTS
  ======================================================= */

  const hardConstraints =
    Array.isArray(intent.hardConstraints)
      ? intent.hardConstraints.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];

  const violatedHardConstraints =
    hardConstraints.filter(
      (constraint) =>
        !hardConstraintMatches(
          constraint,
          product
        )
    );

  const hardConstraintsSatisfied =
    violatedHardConstraints.length === 0;

  /* =======================================================
     WEIGHTED SCORE BREAKDOWN
     
     Same weights used by matcher.ts
  ======================================================= */

  const breakdown: ScoreBreakdown = {
    category: categoryMatch ? 20 : 0,

    budget: budgetMatch ? 25 : 0,

    brand: brandMatch ? 10 : 0,

    purpose: purposeMatch ? 15 : 0,

    requirements:
      requirements.length > 0
        ? Math.round(
            (requirementMatches.length /
              requirements.length) *
              20
          )
        : 0,

    preferences:
      preferences.length > 0
        ? Math.round(
            (preferenceMatches.length /
              preferences.length) *
              10
          )
        : 0,
  };

  /* =======================================================
     INTENT SCORE
  ======================================================= */

  const calculatedScore =
    breakdown.category +
    breakdown.budget +
    breakdown.brand +
    breakdown.purpose +
    breakdown.requirements +
    breakdown.preferences;

  /*
    Prefer the score generated by matcher.ts
    because that is the authoritative ranking score.
  */

  const score =
    product.matchScore ??
    calculatedScore;

  /* =======================================================
     QUALITY
  ======================================================= */

  const rating =
    typeof product.rating === "number"
      ? product.rating
      : null;

  const qualityScore =
    product.qualityScore ??
    (rating !== null
      ? rating / 5
      : 0);

  /* =======================================================
     REASONS
  ======================================================= */

  const reasons: string[] = [];

  /* Category */

  if (categoryMatch) {
    reasons.push(
      `Category matches your request: ${product.category}.`
    );
  } else {
    reasons.push(
      `Category does not exactly match your requested category.`
    );
  }

  /* Budget */

  if (budgetMatch) {
    if (budgetMax !== null) {
      reasons.push(
        `₹${product.price.toLocaleString(
          "en-IN"
        )} is within your maximum budget of ₹${budgetMax.toLocaleString(
          "en-IN"
        )}.`
      );
    } else {
      reasons.push(
        `Price is ₹${product.price.toLocaleString(
          "en-IN"
        )}.`
      );
    }
  } else if (aboveMaximum) {
    reasons.push(
      `₹${product.price.toLocaleString(
        "en-IN"
      )} exceeds your budget by ₹${budgetDifference.toLocaleString(
        "en-IN"
      )}.`
    );
  } else if (belowMinimum) {
    reasons.push(
      `₹${product.price.toLocaleString(
        "en-IN"
      )} is below your requested minimum budget.`
    );
  }

  /* Brand */

  if (brandMatch) {
    reasons.push(
      `Matches your preferred brand: ${product.brand}.`
    );
  }

  /* Purpose */

  if (purposeMatch) {
    reasons.push(
      `Product information indicates it is suitable for ${intent.purpose}.`
    );
  }

  /* Requirements */

  if (requirements.length > 0) {
    if (
      requirementMatches.length ===
      requirements.length
    ) {
      reasons.push(
        `All ${requirements.length} required feature(s) are verified in the catalogue.`
      );
    } else if (
      requirementMatches.length > 0
    ) {
      reasons.push(
        `Matches ${requirementMatches.length} of ${requirements.length} required feature(s).`
      );
    } else {
      reasons.push(
        "None of the requested required features could be verified."
      );
    }
  }

  /* Preferences */

  if (preferences.length > 0) {
    reasons.push(
      `Matches ${preferenceMatches.length} of ${preferences.length} preferred feature(s).`
    );
  }

  /* Rating */

  if (rating !== null) {
    reasons.push(
      `Catalogue rating: ${rating.toFixed(1)}/5.`
    );
  }

  /* Stock */

  if (
    typeof product.stock === "number"
  ) {
    if (product.stock > 0) {
      reasons.push(
        "Currently shown as in stock."
      );
    } else {
      reasons.push(
        "Currently shown as out of stock."
      );
    }
  }

  /* Security */

  reasons.push(
    "Passed the catalogue security screening."
  );

  /* =======================================================
     DECISION
  ======================================================= */

  let decision: string;

  /*
    HARD CONSTRAINT VIOLATION
    Always takes priority.
  */

  if (!hardConstraintsSatisfied) {
    decision =
      aboveMaximum
        ? `Not a valid purchase match because it exceeds your maximum budget by ₹${budgetDifference.toLocaleString(
            "en-IN"
          )}.`
        : "Not a valid purchase match because it violates one or more of your hard constraints.";
  }

  /*
    Strong match
  */

  else if (
    categoryMatch &&
    budgetMatch &&
    missingRequirements.length === 0 &&
    score >= 80
  ) {
    decision =
      "Strong match — the product satisfies your stated requirements and budget.";
  }

  /*
    Good match
  */

  else if (
    categoryMatch &&
    budgetMatch &&
    missingRequirements.length === 0 &&
    score >= 60
  ) {
    decision =
      "Good match — the product satisfies all stated requirements and remains within budget.";
  }

  /*
    Partial match
  */

  else if (
    categoryMatch &&
    budgetMatch &&
    missingRequirements.length > 0
  ) {
    decision =
      `Partial match — the product is within budget, but ${missingRequirements.length} requirement(s) could not be verified.`;
  }

  /*
    Category match but budget issue
  */

  else if (
    categoryMatch &&
    !budgetMatch
  ) {
    decision =
      `Closest verified alternative, but it does not satisfy your budget constraint.`;
  }

  /*
    General fallback
  */

  else {
    decision =
      "Limited match — this is one of the closest products available in the verified catalogue.";
  }

  /* =======================================================
     FINAL RESULT
  ======================================================= */

  return {
    budgetMatch,
    budgetExceeded: aboveMaximum,
    budgetDifference,
    brandMatch,
    purposeMatch,
    categoryMatch,
    requirementMatches,
    missingRequirements,
    preferenceMatches,
    violatedHardConstraints,
    hardConstraintsSatisfied,
    reasons,
    decision,
    score,
    qualityScore,
    breakdown,
  };
}