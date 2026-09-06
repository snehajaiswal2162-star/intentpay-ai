import { ExternalProduct } from "../lib/productApi";
import { detectPromptInjection } from "../lib/security";

export type Product = ExternalProduct & {
  matchScore?: number;
  qualityScore?: number;
  matchReasons?: string[];
};

export type Intent = {
  category: string;
  brand: string;
  budgetMin: number | null;
  budgetMax: number | null;
  purpose: string;
  requirements: string[];
  preferences: string[];
  hardConstraints: string[];
  softConstraints?: string[];
  missingInformation: string[];
};

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
  "perfume",
  "perfumes",
  "fragrance",
  "fragrances",
  "cologne",
  "scent",
  "body mist",
  "eau de parfum",
  "eau de toilette",
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
  intentCategory: string,
  productCategory: string
) {
  const intent = normalize(intentCategory);
  const product = normalize(productCategory);

  // Direct category match
  if (intent === product) {
    return true;
  }

  // Synonym/category mapping
 const categoryAliases: Record<string, string[]> = {
  perfume: ["fragrances"],
  fragrance: ["fragrances"],
  fragrances: ["fragrances"],

  phone: ["smartphones"],
  smartphone: ["smartphones"],
  smartphones: ["smartphones"],

  laptop: ["laptops"],
  laptops: ["laptops"],

  headphones: ["mobile-accessories"],

  shoes: ["mens-shoes", "womens-shoes"],

  skincare: ["skin-care"],

  // ADD THESE
  mascara: ["beauty"],
  "beauty product": ["beauty"],
  makeup: ["beauty"],
  cosmetics: ["beauty"],
};

  const intentAliases = categoryAliases[intent] || [intent];

  return intentAliases.includes(product);
}

/* =========================================================
   FEATURE ALIASES
========================================================= */

const featureAliases: Record<string, string[]> = {
  red: ["red"],
  blue: ["blue"],
  black: ["black"],
  white: ["white"],
  green: ["green"],
  pink: ["pink"],
  purple: ["purple"],

  wireless: [
    "wireless",
    "bluetooth",
    "bluetooth enabled",
  ],

  waterproof: [
    "waterproof",
    "water resistant",
    "water-resistant",
  ],

  lightweight: [
    "lightweight",
    "light weight",
  ],

  gaming: [
    "gaming",
    "game",
    "gamer",
  ],

  running: [
    "running",
    "runner",
    "sports",
  ],

  casual: [
    "casual",
    "everyday",
  ],

  "long lasting": [
    "long lasting",
    "long-lasting",
    "durable",
  ],

  organic: [
    "organic",
    "natural",
  ],

  "dry skin": [
    "dry skin",
    "dry",
  ],

  "oily skin": [
    "oily skin",
    "oily",
  ],

  "sensitive skin": [
    "sensitive skin",
    "sensitive",
  ],

  "fragrance free": [
    "fragrance free",
    "fragrance-free",
    "unscented",
  ],

  vegan: [
    "vegan",
  ],

  leather: [
    "leather",
  ],
};

function featureMatches(
  requirement: string,
  productText: string
) {
  const normalizedRequirement = normalize(requirement);
  const normalizedProductText = normalize(productText);

  /* Direct text match */
  if (normalizedProductText.includes(normalizedRequirement)) {
    return true;
  }

  /* Alias match */
  for (const [key, aliases] of Object.entries(featureAliases)) {
    if (
      aliases.some(
        (alias) =>
          normalizedRequirement.includes(normalize(alias))
      )
    ) {
      if (
        aliases.some((alias) =>
          normalizedProductText.includes(normalize(alias))
        )
      ) {
        return true;
      }
    }
  }

  /* Battery requirements */
  const batteryMatch = normalizedRequirement.match(
    /(\d{3,5})\s*(mah|m ah)/
  );

  if (batteryMatch) {
    const requestedBattery = Number(batteryMatch[1]);

    const productBatteryMatch =
      normalizedProductText.match(
        /(\d{3,5})\s*(mah|m ah)/
      );

    if (productBatteryMatch) {
      const productBattery = Number(
        productBatteryMatch[1]
      );

      return productBattery >= requestedBattery;
    }
  }

  /* Large battery */
  if (
    normalizedRequirement.includes("large battery") ||
    normalizedRequirement.includes("big battery")
  ) {
    const productBatteryMatch =
      normalizedProductText.match(
        /(\d{3,5})\s*(mah|m ah)/
      );

    if (productBatteryMatch) {
      return Number(productBatteryMatch[1]) >= 6000;
    }
  }

  return false;
}

/* =========================================================
   PURPOSE MATCHING
========================================================= */

function purposeMatches(
  purpose: string,
  productText: string
) {
  if (!purpose) return false;

  return featureMatches(purpose, productText);
}

/* =========================================================
   BRAND MATCHING
========================================================= */

function brandMatches(
  requestedBrand: string,
  productBrand: string,
  productText: string
) {
  if (!requestedBrand) return false;

  const requested = normalize(requestedBrand);

  return (
    normalize(productBrand).includes(requested) ||
    normalize(productText).includes(requested)
  );
}

/* =========================================================
   PRODUCT TEXT
========================================================= */

function getProductText(product: ExternalProduct) {
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
   PRICE CONSTRAINTS
========================================================= */

function priceConstraintMatches(
  constraint: string,
  product: ExternalProduct
) {
  const normalized = normalize(constraint);

  /*
    Examples supported:

    under 3000
    below 3000
    less than 3000
    price under 3000
    maximum 3000
    max 3000
    <= 3000
  */

  const numberMatch = normalized.match(
    /(?:under|below|less than|maximum|max|price under|price below|price less than|<=)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)/i
  );

  if (numberMatch) {
    const maximum = Number(numberMatch[1]);

    return product.price <= maximum;
  }

  /* >= style */
  const minimumMatch = normalized.match(
    /(?:above|over|more than|minimum|min|>=)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)/i
  );

  if (minimumMatch) {
    const minimum = Number(minimumMatch[1]);

    return product.price >= minimum;
  }

  /* Handle generated constraint like price_under_3000 */
  const generatedUnderMatch = normalized.match(
    /price[_\s-]*under[_\s-]*(\d+(?:\.\d+)?)/
  );

  if (generatedUnderMatch) {
    const maximum = Number(generatedUnderMatch[1]);

    return product.price <= maximum;
  }

  const generatedBelowMatch = normalized.match(
    /price[_\s-]*below[_\s-]*(\d+(?:\.\d+)?)/
  );

  if (generatedBelowMatch) {
    const maximum = Number(generatedBelowMatch[1]);

    return product.price <= maximum;
  }

  const generatedMaxMatch = normalized.match(
    /price[_\s-]*(?:maximum|max)[_\s-]*(\d+(?:\.\d+)?)/
  );

  if (generatedMaxMatch) {
    const maximum = Number(generatedMaxMatch[1]);

    return product.price <= maximum;
  }

  return true;
}

/* =========================================================
   HARD CONSTRAINTS
========================================================= */

function hardConstraintMatches(
  intent: Intent,
  product: ExternalProduct
) {
  const constraints = intent.hardConstraints || [];

  for (const constraint of constraints) {
    if (!priceConstraintMatches(constraint, product)) {
      return false;
    }
  }

  return true;
}

/* =========================================================
   SECURITY
========================================================= */

function isSafeProduct(product: ExternalProduct) {
  try {
    const securityResult = detectPromptInjection({
      name: product.name,
      description: product.description,
      features: product.features,
    });

    return !securityResult.suspicious;
  } catch {
    /*
      Fail closed.

      If security checking fails, do NOT allow
      the product into the buyer result.
    */
    return false;
  }
}

/* =========================================================
   MAIN RANKING FUNCTION
========================================================= */

export function rankProducts(
  intent: Intent,
  products: ExternalProduct[]
) {
  /*
    STEP 1
    Security filtering
  */

  const safeProducts = products.filter(isSafeProduct);

  console.log(
    `SECURITY CHECK: ${products.length} → ${safeProducts.length}`
  );

  /*
    STEP 2
    Create scored products
  */

  const scoredProducts: Product[] = safeProducts.map(
    (product) => {
      const productText = getProductText(product);

      let score = 0;

      const reasons: string[] = [];

      /* -----------------------------------------
         CATEGORY — 20 POINTS
      ----------------------------------------- */

      const categoryMatch = categoryMatches(
        intent.category,
        product.category
      );

      if (categoryMatch) {
        score += 20;

        reasons.push(
          `Category matches your request: ${product.category}.`
        );
      }

      /* -----------------------------------------
         BUDGET — 25 POINTS
      ----------------------------------------- */

      const withinBudget =
        intent.budgetMax === null ||
        product.price <= intent.budgetMax;

      const aboveMinimum =
        intent.budgetMin === null ||
        product.price >= intent.budgetMin;

      if (withinBudget && aboveMinimum) {
        score += 25;

        if (intent.budgetMax !== null) {
          reasons.push(
            `Price ₹${product.price} is within your budget of ₹${intent.budgetMax}.`
          );
        } else {
          reasons.push(
            `Price ₹${product.price} fits the requested budget range.`
          );
        }
      }

      /* -----------------------------------------
         BRAND — 10 POINTS
      ----------------------------------------- */

      if (
        brandMatches(
          intent.brand,
          product.brand,
          productText
        )
      ) {
        score += 10;

        reasons.push(
          `Matches your requested brand: ${product.brand}.`
        );
      }

      /* -----------------------------------------
         PURPOSE — 15 POINTS
      ----------------------------------------- */

      if (
        intent.purpose &&
        purposeMatches(
          intent.purpose,
          productText
        )
      ) {
        score += 15;

        reasons.push(
          `Product appears suitable for your purpose: ${intent.purpose}.`
        );
      }

      /* -----------------------------------------
         REQUIREMENTS — 20 POINTS
      ----------------------------------------- */

      const requirements =
        intent.requirements || [];

      if (requirements.length > 0) {
        let matchedRequirements = 0;

        for (const requirement of requirements) {
          if (
            featureMatches(
              requirement,
              productText
            )
          ) {
            matchedRequirements++;
          }
        }

        const requirementScore =
          (matchedRequirements /
            requirements.length) *
          20;

        score += requirementScore;

        if (matchedRequirements > 0) {
          reasons.push(
            `Matches ${matchedRequirements} of ${requirements.length} required feature(s).`
          );
        }
      }

      /* -----------------------------------------
         PREFERENCES — 10 POINTS
      ----------------------------------------- */

      const preferences =
        intent.preferences || [];

      if (preferences.length > 0) {
        let matchedPreferences = 0;

        for (const preference of preferences) {
          if (
            featureMatches(
              preference,
              productText
            )
          ) {
            matchedPreferences++;
          }
        }

        const preferenceScore =
          (matchedPreferences /
            preferences.length) *
          10;

        score += preferenceScore;

        if (matchedPreferences > 0) {
          reasons.push(
            `Matches ${matchedPreferences} of ${preferences.length} preferred feature(s).`
          );
        }
      }

      /* -----------------------------------------
         QUALITY SCORE
         
         IMPORTANT:
         This does NOT replace the user's intent score.

         It is only used as a tie-breaker when
         multiple products have the same matchScore.
      ----------------------------------------- */

      const rating =
        typeof product.rating === "number"
          ? product.rating
          : 0;

      const qualityScore = rating / 5;

      if (rating > 0) {
        reasons.push(
          `Rated ${rating.toFixed(1)}/5 in the catalogue.`
        );
      }

      /* -----------------------------------------
         STOCK
      ----------------------------------------- */

      if (
        typeof product.stock === "number" &&
        product.stock > 0
      ) {
        reasons.push(
          "Currently in stock."
        );
      }

      /* -----------------------------------------
         RETURN SCORED PRODUCT
      ----------------------------------------- */

      return {
        ...product,
        matchScore: Math.round(score),
        qualityScore,
        matchReasons: reasons,
      };
    }
  );

  /*
    STEP 3
    Remove products violating hard constraints
  */

  const hardConstraintSafeProducts =
    scoredProducts.filter((product) =>
      hardConstraintMatches(intent, product)
    );

  /*
    STEP 4
    Exact matches

    A product must have:

    1. Correct category
    2. Correct budget
    3. All requirements satisfied
  */

  const exactMatches =
    hardConstraintSafeProducts
      .filter((product) => {
        const categoryMatch =
          categoryMatches(
            intent.category,
            product.category
          );

        const budgetMatch =
          (intent.budgetMax === null ||
            product.price <=
              intent.budgetMax) &&
          (intent.budgetMin === null ||
            product.price >=
              intent.budgetMin);

        const requirements =
          intent.requirements || [];

        const allRequirementsMatch =
          requirements.every((requirement) =>
            featureMatches(
              requirement,
              getProductText(product)
            )
          );

        return (
          categoryMatch &&
          budgetMatch &&
          allRequirementsMatch
        );
      })
      .sort((a, b) => {
        /*
          PRIMARY:
          AI intent match score

          SECONDARY:
          Product quality
        */

        const scoreDifference =
          (b.matchScore ?? 0) -
          (a.matchScore ?? 0);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return (
          (b.qualityScore ?? 0) -
          (a.qualityScore ?? 0)
        );
      });

  /*
    STEP 5
    Category + budget fallback

    Used when there are no perfect matches.
  */

  const fallbackMatches =
    hardConstraintSafeProducts
      .filter((product) => {
        const categoryMatch =
          categoryMatches(
            intent.category,
            product.category
          );

        const budgetMatch =
          (intent.budgetMax === null ||
            product.price <=
              intent.budgetMax) &&
          (intent.budgetMin === null ||
            product.price >=
              intent.budgetMin);

        return (
          categoryMatch &&
          budgetMatch
        );
      })
      .sort((a, b) => {
        const scoreDifference =
          (b.matchScore ?? 0) -
          (a.matchScore ?? 0);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return (
          (b.qualityScore ?? 0) -
          (a.qualityScore ?? 0)
        );
      });

  /*
    STEP 6
    Alternatives

    Alternatives can be useful when:
    - category matches
    - but budget or another hard constraint
      prevents it from being an exact result.

    IMPORTANT:
    Alternatives are NOT treated as valid purchases.
  */

  const alternatives =
    scoredProducts
      .filter((product) => {
        const categoryMatch =
          categoryMatches(
            intent.category,
            product.category
          );

        const hardConstraintsSatisfied =
          hardConstraintMatches(
            intent,
            product
          );

        return (
          categoryMatch &&
          !hardConstraintsSatisfied
        );
      })
      .sort((a, b) => {
        const scoreDifference =
          (b.matchScore ?? 0) -
          (a.matchScore ?? 0);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return (
          (b.qualityScore ?? 0) -
          (a.qualityScore ?? 0)
        );
      });

  /*
    STEP 7
    Choose final products

    Priority:

    Exact matches
       ↓
    Category + budget fallback
       ↓
    No valid product

    Alternatives are returned separately.
  */

  const finalProducts =
    exactMatches.length > 0
      ? exactMatches
      : fallbackMatches;

  console.log(
    "EXACT MATCHES:",
    exactMatches.length
  );

  console.log(
    "FALLBACK MATCHES:",
    fallbackMatches.length
  );

  console.log(
    "ALTERNATIVES:",
    alternatives.length
  );

  /*
    Return only top 5 results.

    This keeps the UI clean and avoids sending
    unnecessary products to the frontend.
  */

  return {
    products: finalProducts.slice(0, 5),

    alternatives:
      alternatives.slice(0, 5),
  };
}