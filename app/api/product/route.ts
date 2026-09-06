import { fetchProducts } from "../../lib/productApi";

export async function GET() {
  try {
    const products = await fetchProducts();

    return Response.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Product API Error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to fetch products.",
      },
      { status: 500 }
    );
  }
}