import crypto from "crypto";
import { recordAuditEvent } from "../../../lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      orderId,
      paymentId,
      signature,
      productId,
    } = body;

    // --------------------------------
    // 1. Validate required fields
    // --------------------------------

    if (!orderId || !paymentId || !signature) {
      return Response.json(
        {
          success: false,
          error: "Payment verification details are missing.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 2. Get Razorpay secret
    // --------------------------------

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is missing.");

      return Response.json(
        {
          success: false,
          error: "Payment verification is not configured.",
        },
        { status: 500 }
      );
    }

    // --------------------------------
    // 3. Generate expected signature
    // --------------------------------

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // --------------------------------
    // 4. Compare signatures
    // --------------------------------

    const isValid =
      generatedSignature === signature;

    if (!isValid) {
      console.error("Invalid Razorpay payment signature.");

      return Response.json(
        {
          success: false,
          error: "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 5. Payment verified
    // --------------------------------

    console.log("Payment verified successfully:", {
      orderId,
      paymentId,
      productId,
    });

    recordAuditEvent("PAYMENT_VERIFIED", {
      productId: productId || undefined,
      details: {
        orderId,
        paymentId,
        verification: "RAZORPAY_SIGNATURE_VALID",
      },
    });

    return Response.json({
      success: true,
      message: "Payment verified successfully.",
      payment: {
        orderId,
        paymentId,
        productId: productId || null,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}