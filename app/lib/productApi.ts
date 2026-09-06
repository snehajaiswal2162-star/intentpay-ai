export type ExternalProduct = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  description: string;
  features: string[];
  image?: string;
  rating?: number;
  stock?: number;
};

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  brand?: string;
  rating?: number;
  stock?: number;
  thumbnail?: string;
  tags?: string[];
};

type DummyJSONResponse = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};

export async function fetchProducts(): Promise<ExternalProduct[]> {
  const response = await fetch(
    "https://dummyjson.com/products?limit=0",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch products from product API.");
  }

  const data: DummyJSONResponse = await response.json();

  return data.products.map((product) => ({
    id: `external-${product.id}`,
    name: product.title,
    category: product.category,
    brand: product.brand || "",
    price: Math.round(product.price * 85),
    description: product.description,
    features: product.tags || [],
    image: product.thumbnail,
    rating: product.rating,
    stock: product.stock,
  }));
}