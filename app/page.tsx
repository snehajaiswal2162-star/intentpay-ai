"use client";

import { useEffect, useState } from "react";

const examples = [
  "Find a phone under ₹30,000 with a 6000mAh battery",
  "Find headphones under ₹20,000 with active noise cancellation",
  "Find a laptop under ₹60,000 with 16GB RAM",
];

const aiSteps = [
  "Understanding natural intent & constraints",
  "Extracting hardware specification bounds",
  "Querying verified merchant inventories",
  "Evaluating multi-variable candidate scoring",
  "Running transaction & security policies",
  "Preparing verified purchase payload",
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function getProductIcon(category: string) {
  const value = category.toLowerCase();

  if (
    value.includes("phone") ||
    value.includes("smartphone")
  ) {
    return (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  }

  if (
    value.includes("headphone") ||
    value.includes("audio")
  ) {
    return (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    );
  }

  if (value.includes("laptop")) {
    return (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  }

  if (value.includes("watch")) {
    return (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 3h6l1 4H8l1-4zm0 18h6l1-4H8l1 4zm-1-14h8v10H8V7z"
        />
      </svg>
    );
  }

  if (value.includes("camera")) {
    return (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
        />
        <circle
          cx="12"
          cy="13"
          r="3"
          strokeWidth={1.5}
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        strokeWidth={1.5}
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v8m-4-4h8"
      />
    </svg>
  );
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const [isThinking, setIsThinking] =
    useState(false);

  const [step, setStep] = useState(-1);

  const [product, setProduct] =
    useState<any>(null);

  const [agentResult, setAgentResult] =
    useState<any>(null);

  const [showResult, setShowResult] =
    useState(false);

  const [isAlternative, setIsAlternative] =
    useState(false);

  const [showAuthorization, setShowAuthorization] =
    useState(false);

  const [isProcessingPayment, setIsProcessingPayment] =
    useState(false);

  const [paymentStatus, setPaymentStatus] =
    useState<"idle" | "success" | "failed">(
      "idle"
    );

  /*
   * =====================================================
   * AI PIPELINE ANIMATION
   * =====================================================
   */

  useEffect(() => {
    if (!isThinking) return;

    setStep(0);
    setShowResult(false);

    const timer = setInterval(() => {
      setStep((current) => {
        if (current >= aiSteps.length - 1) {
          clearInterval(timer);
          return current;
        }

        return current + 1;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [isThinking]);

  /*
   * =====================================================
   * RUN REAL AI AGENT
   * =====================================================
   */

  useEffect(() => {
    if (
      !isThinking ||
      step !== aiSteps.length - 1 ||
      !activeQuery
    ) {
      return;
    }

    const timeout = setTimeout(async () => {
      const success = await runAgent(activeQuery);

      setIsThinking(false);
      setShowResult(success);
    }, 900);

    return () => clearTimeout(timeout);
  }, [step, isThinking, activeQuery]);

  /*
   * =====================================================
   * AUTO SCROLL TO INTELLIGENCE
   * =====================================================
   */

  useEffect(() => {
    if (!isThinking) return;

    document
      .getElementById("intelligence")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [isThinking]);

  /*
   * =====================================================
   * LOAD RAZORPAY CHECKOUT SCRIPT
   * =====================================================
   */

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  /*
   * =====================================================
   * GUARDED CHECKOUT
   * =====================================================
   */

async function handleAuthorizeAndPay() {
  if (!product || isAlternative) return;

  try {
    setIsProcessingPayment(true);
    setPaymentStatus("idle");

    // =====================================================
    // 1. Get the buyer proposal ID
    // =====================================================

    const proposalId =
      agentResult?.buyerProposal?.id;

    if (!proposalId) {
      throw new Error(
        "Buyer proposal is missing. Please run the AI agent again."
      );
    }

    // =====================================================
    // 2. Explicitly authorize the buyer proposal
    // =====================================================

    const authorizationResponse = await fetch(
      "/api/buyer/authorize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId,
        }),
      }
    );

    const authorizationText =
      await authorizationResponse.text();

    let authorizationData;

    try {
      authorizationData =
        JSON.parse(authorizationText);
    } catch {
      console.error(
        "Authorization returned:",
        authorizationText
      );

      throw new Error(
        "Authorization server returned an invalid response."
      );
    }

    if (
      !authorizationResponse.ok ||
      !authorizationData.success ||
      !authorizationData.authorized
    ) {
      throw new Error(
        authorizationData.error ||
          "User authorization failed."
      );
    }

    console.log(
      "BUYER PROPOSAL AUTHORIZED:",
      authorizationData
    );

    // =====================================================
    // 3. Load Razorpay checkout
    // =====================================================

    const loaded =
      await loadRazorpayScript();

    if (!loaded) {
      throw new Error(
        "Razorpay checkout failed to load."
      );
    }

    // =====================================================
    // 4. Create Razorpay order
    // =====================================================

    const orderResponse = await fetch(
      "/api/payment/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId,
        }),
      }
    );

    const orderText =
      await orderResponse.text();

    let orderData;

    try {
      orderData =
        JSON.parse(orderText);
    } catch {
      console.error(
        "Create order returned:",
        orderText
      );

      throw new Error(
        "Payment server returned an invalid response."
      );
    }

    if (
      !orderResponse.ok ||
      !orderData.success
    ) {
      throw new Error(
        orderData.error ||
          "Unable to create payment order."
      );
    }

    // =====================================================
    // 5. Get public Razorpay key
    // =====================================================

    const razorpayKey =
      process.env
        .NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      throw new Error(
        "Razorpay public key is missing."
      );
    }

    // =====================================================
    // 6. Open Razorpay checkout
    // =====================================================

    const options = {
      key: razorpayKey,

      amount:
        orderData.order.amount,

      currency:
        orderData.order.currency,

      name: "IntentPay AI",

      description:
        product.name,

      order_id:
        orderData.order.id,

      handler: async function (
        paymentResponse: any
      ) {
        try {
          console.log(
            "RAZORPAY PAYMENT SUCCESS:",
            paymentResponse
          );

          // =================================================
          // 7. Verify payment on our server
          // =================================================

          const verifyResponse =
            await fetch(
              "/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  orderId:
                    paymentResponse.razorpay_order_id,

                  paymentId:
                    paymentResponse.razorpay_payment_id,

                  signature:
                    paymentResponse.razorpay_signature,

                  productId:
                    product.id,
                }),
              }
            );

          const verifyText =
            await verifyResponse.text();

          console.log(
            "VERIFY STATUS:",
            verifyResponse.status
          );

          console.log(
            "VERIFY RESPONSE:",
            verifyText
          );

          let verifyData;

          try {
            verifyData =
              JSON.parse(verifyText);
          } catch {
            throw new Error(
              "Payment verification server returned an invalid response."
            );
          }

          if (
            !verifyResponse.ok ||
            !verifyData.success
          ) {
            throw new Error(
              verifyData.error ||
                "Payment verification failed."
            );
          }

          // =================================================
          // 8. Payment verified successfully
          // =================================================

          console.log(
            "PAYMENT VERIFIED SUCCESSFULLY"
          );

          setPaymentStatus("success");

          setShowAuthorization(false);

          setIsProcessingPayment(false);
        } catch (error) {
          console.error(
            "Payment verification error:",
            error
          );

          setPaymentStatus("failed");

          setIsProcessingPayment(false);
        }
      },

      modal: {
        ondismiss: function () {
          console.log(
            "Razorpay checkout dismissed"
          );

          setIsProcessingPayment(false);
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response: any) {
        console.error(
          "Razorpay payment failed:",
          response
        );

        setPaymentStatus("failed");

        setIsProcessingPayment(false);
      }
    );

    // Close custom authorization modal
    // before opening Razorpay.
    setShowAuthorization(false);

    razorpay.open();

    // IMPORTANT:
    // Do not set isProcessingPayment(false) here.
  } catch (error) {
    console.error(
      "Payment error:",
      error
    );

    setPaymentStatus("failed");

    setIsProcessingPayment(false);
  }
}

  /*
   * =====================================================
   * CALL BACKEND
   * =====================================================
   */

  async function runAgent(
    searchQuery: string
  ) {
    try {
      const response = await fetch(
        "/api/agent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            query: searchQuery,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "AI RESULT:",
        data
      );

      if (!response.ok || !data.success) {
  if (data.errorCode === "GEMINI_QUOTA_EXCEEDED") {
    throw new Error(
      "AI is temporarily unavailable because the request limit has been reached. Please try again later."
    );
  }

  throw new Error(
    data.error || "AI agent failed."
  );
}

      setAgentResult(data);

      /*
       * =================================================
       * EXACT MATCH FOUND
       * =================================================
       */

      if (
        data.products &&
        data.products.length > 0
      ) {
        setProduct(
          data.products[0]
        );

        setIsAlternative(false);

        return true;
      }

      /*
       * =================================================
       * NO EXACT MATCH
       * SHOW CLOSEST ALTERNATIVE
       * =================================================
       */

      if (
        data.alternatives &&
        data.alternatives.length > 0
      ) {
        setProduct(
          data.alternatives[0]
        );

        setIsAlternative(true);

        return true;
      }

      /*
       * =================================================
       * NOTHING FOUND
       * =================================================
       */

      setProduct(null);

      setIsAlternative(false);

      return true;
    } catch (error) {
      console.error(
        "Agent error:",
        error
      );

      setProduct(null);

      setAgentResult(null);

      setIsAlternative(false);

      return false;
    }
  }

  /*
   * =====================================================
   * START AI
   * =====================================================
   */

  function startAI() {
    const text =
      query.trim() ||
      examples[0];

    setQuery(text);

    setActiveQuery(text);

    setProduct(null);

    setAgentResult(null);

    setIsAlternative(false);

    setShowResult(false);

    setPaymentStatus("idle");

    setShowAuthorization(false);

    setIsThinking(true);
  }

  /*
   * =====================================================
   * EXAMPLE BUTTON
   * =====================================================
   */

  function tryExample(
    text: string
  ) {
    setQuery(text);

    setActiveQuery(text);

    setProduct(null);

    setAgentResult(null);

    setIsAlternative(false);

    setShowResult(false);

    setPaymentStatus("idle");

    setShowAuthorization(false);

    setIsThinking(true);
  }

  /*
   * =====================================================
   * DERIVED RESULT INFORMATION
   * =====================================================
   */

  const budgetMax =
    agentResult?.intent?.budgetMax ??
    null;

  const withinBudget =
    product &&
      budgetMax !== null
      ? product.price <=
      budgetMax
      : true;

  const budgetDifference =
    product &&
      budgetMax !== null &&
      product.price > budgetMax
      ? product.price - budgetMax
      : 0;

  const matchScore =
    product?.matchScore ?? 0;

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-[#07090e]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <div
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="flex cursor-pointer items-center gap-3.5 group"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl font-bold tracking-tight">
                I
              </span>
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Intent
                <span className="text-blue-500">
                  Pay
                </span>
              </div>

              <div className="text-[10px] font-semibold tracking-[0.25em] text-slate-400 uppercase">
                AI Agentic Commerce
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a
              href="#product"
              className="transition hover:text-white"
            >
              Product
            </a>

            <a
              href="#intelligence"
              className="transition hover:text-white"
            >
              Intelligence
            </a>

            <a
              href="#security"
              className="transition hover:text-white"
            >
              Security
            </a>
          </div>

          <button
            onClick={() =>
              document
                .getElementById("buyer")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold rounded-xl group bg-gradient-to-br from-blue-500 to-indigo-600 hover:text-white text-white shadow-lg shadow-blue-500/15 transition-all duration-300 hover:shadow-blue-500/30"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#07090e] rounded-[10px] group-hover:bg-opacity-0">
              Launch Agent
            </span>
          </button>
        </div>
      </nav>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section
        id="product"
        className="relative overflow-hidden pt-36 pb-20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize:
              "60px 60px",
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)",
          }}
        />

        <div className="pointer-events-none absolute left-1/2 top-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="relative mx-auto max-w-5xl px-6 pt-12 text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>

            Autonomous Intent Architecture 2.0
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[1.08]">
            Commerce that
            <br />

            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-600 bg-clip-text text-transparent">
              understands intent.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Specify constraints in natural language.
            IntentPay interprets specs, filters merchant
            inventory, and verifies safety guards before
            executing transactions.
          </p>

          {/* INPUT COMMAND CENTER */}

          <div
            id="buyer"
            className="mx-auto mt-12 max-w-3xl scroll-mt-32"
          >
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/80 p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 hover:border-slate-700">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                <div className="flex flex-1 items-center gap-3.5 px-4">

                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />

                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                  </div>

                  <input
                    value={query}
                    onChange={(e) =>
                      setQuery(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        startAI();
                      }
                    }}
                    placeholder="Describe what you want to buy..."
                    className="w-full bg-transparent py-3.5 text-sm sm:text-base text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <button
                  onClick={startAI}
                  disabled={isThinking}
                  className="relative inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
                >
                  <span className="flex items-center gap-2">

                    {isThinking ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />

                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>

                        Evaluating...
                      </>
                    ) : (
                      <>
                        Execute Agent

                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}

                  </span>
                </button>
              </div>
            </div>

            {/* SUGGESTION PILLS */}

            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {examples.map(
                (example) => (
                  <button
                    key={example}
                    onClick={() =>
                      tryExample(
                        example
                      )
                    }
                    className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400 backdrop-blur-md transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200 active:scale-95"
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTELLIGENCE WORKSPACE
      ===================================================== */}

      <section
        id="intelligence"
        className="scroll-mt-20 border-y border-slate-800/80 bg-[#0b0e14] py-28 relative"
      >
        <div className="mx-auto max-w-6xl px-6">

          <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
                Real-time Execution
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Reasoning Workspace
              </h2>
            </div>

            <p className="max-w-md text-sm text-slate-400 leading-relaxed">
              Decisions are computed dynamically against
              real-time buyer constraints, merchant APIs,
              and security rulesets.
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-12">

            {/* =================================================
                AGENT ACTIVITY TRACKER
            ================================================= */}

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-7 backdrop-blur-xl">

              <div className="mb-8 flex items-center justify-between border-b border-slate-800/80 pb-5">

                <div>
                  <h3 className="text-base font-semibold text-white">
                    Agent Pipeline
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Execution DAG status
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[11px] font-mono">

                  <span
                    className={`h-2 w-2 rounded-full ${isThinking
                      ? "bg-amber-400 animate-pulse"
                      : showResult
                        ? "bg-emerald-400"
                        : "bg-blue-400"
                      }`}
                  />

                  <span
                    className={
                      isThinking
                        ? "text-amber-400"
                        : showResult
                          ? "text-emerald-400"
                          : "text-blue-400"
                    }
                  >
                    {isThinking
                      ? "RUNNING"
                      : showResult
                        ? "COMPLETED"
                        : "STANDBY"}
                  </span>
                </div>
              </div>

              <div className="relative space-y-6">

                <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-px bg-slate-800" />

                {aiSteps.map(
                  (item, index) => {

                    const completed =
                      isThinking
                        ? index <= step
                        : showResult;

                    const current =
                      isThinking &&
                      index === step;

                    return (
                      <div
                        key={item}
                        className={`relative z-10 flex items-center gap-4 transition-all duration-300 ${current
                          ? "translate-x-1"
                          : ""
                          }`}
                      >

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${completed
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                            : "border-slate-800 bg-slate-950 text-slate-600"
                            } ${current
                              ? "ring-4 ring-blue-500/20 border-blue-500 text-blue-400"
                              : ""
                            }`}
                        >

                          {completed ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div className="flex-1">

                          <p
                            className={`text-sm font-medium ${completed
                              ? "text-slate-200"
                              : "text-slate-600"
                              }`}
                          >
                            {item}
                          </p>

                          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {current
                              ? "In progress..."
                              : completed
                                ? "Verified"
                                : "Pending"}
                          </p>

                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* =================================================
                RESULT PANEL
            ================================================= */}

            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-7 backdrop-blur-xl flex flex-col justify-between">

              <div>

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-7">

                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Recommended Match
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      AI-synthesized decision matrix
                    </p>
                  </div>

                  {showResult &&
                    product && (
                      <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 shadow-sm animate-fade-in">
                        {matchScore}% Match Score
                      </div>
                    )}
                </div>

                {/* BEFORE SEARCH */}

                {!showResult ? (
                  <div className="flex min-h-[340px] flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">

                    <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500 shadow-inner">

                      <svg
                        className="w-8 h-8 opacity-60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>

                    <h4 className="font-medium text-slate-300 text-base">
                      Awaiting Intent Specification
                    </h4>

                    <p className="mt-2 max-w-xs text-xs text-slate-500 leading-relaxed">
                      Enter a prompt above to trigger
                      real-time candidate search, policy
                      evaluation, and match synthesis.
                    </p>
                  </div>
                ) : !product ? (

                  /* NO PRODUCT */

                  <div className="flex min-h-[340px] flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">

                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">

                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                        />
                      </svg>
                    </div>

                    <h4 className="font-semibold text-slate-200 text-lg">
                      No Suitable Product Found
                    </h4>

                    <p className="mt-2 max-w-sm text-xs text-slate-500 leading-relaxed">
                      We couldn't find a suitable product
                      in the verified catalogue for your
                      request. Try relaxing one of your
                      requirements.
                    </p>
                  </div>
                ) : (

                  /* PRODUCT RESULT */

                  <div className="space-y-6 animate-scale-in">

                    {/* PRODUCT CARD */}

                    <div
                      className={`rounded-xl border p-6 ${isAlternative
                        ? "border-amber-500/20 bg-amber-500/[0.03]"
                        : "border-slate-800 bg-slate-950/80"
                        }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-blue-400 shadow-inner">
                            {getProductIcon(
                              product.category
                            )}
                          </div>

                          <div>

                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${isAlternative
                                ? "text-amber-400"
                                : "text-blue-400"
                                }`}
                            >
                              {isAlternative
                                ? "Closest Alternative"
                                : "Top Verified Match"}
                            </span>

                            <h3 className="text-xl font-bold text-white mt-0.5">
                              {product.name}
                            </h3>

                            <p className="text-xs text-slate-500 capitalize">
                              {product.category}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">

                          <p className="text-2xl font-bold text-white">
                            {formatPrice(
                              product.price
                            )}
                          </p>

                          {withinBudget ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 mt-0.5">

                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>

                              Within Budget
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 mt-0.5">
                              ⚠ ₹
                              {budgetDifference.toLocaleString(
                                "en-IN"
                              )}{" "}
                              above budget
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ALTERNATIVE MESSAGE */}

                      {isAlternative && (
                        <div className="mt-5 rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-3">

                          <p className="text-xs text-amber-200/80 leading-relaxed">

                            <span className="font-semibold text-amber-300">
                              No exact match found.
                            </span>{" "}

                            This is the closest available
                            product based on your requirements.

                            {withinBudget
                              ? " It still satisfies your budget."
                              : " It does not satisfy your hard budget constraint."}
                          </p>
                        </div>
                      )}

                      <p className="mt-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                        {product.description}
                      </p>

                      {/* MATCH METER */}

                      <div className="mt-6">

                        <div className="mb-2 flex justify-between text-xs">

                          <span className="text-slate-500 font-medium">
                            Requirement Coverage
                          </span>

                          <span className="font-bold text-blue-400">
                            {matchScore}%
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
                            style={{
                              width: `${matchScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        AI EXPLANATION
                    ================================================= */}

                    {agentResult?.explanation && (
                      <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-5">

                        <div className="flex items-center gap-2 mb-4">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">

                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-6.364l-.707-.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M9 21h6m-5-4h4a4 4 0 10-4-4 4 4 0 000 4z"
                              />
                            </svg>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-white">
                              Why this recommendation?
                            </h4>

                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Evidence-based AI decision
                            </p>
                          </div>
                        </div>

                        {/* REASONS */}

                        <div className="space-y-2.5">

                          {agentResult.explanation.reasons?.map(
                            (
                              reason: string,
                              index: number
                            ) => (
                              <div
                                key={index}
                                className="flex items-start gap-2.5"
                              >
                                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[9px] text-blue-400">
                                  ✓
                                </span>

                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {reason}
                                </p>
                              </div>
                            )
                          )}
                        </div>

                        {/* DECISION */}

                        {agentResult.explanation.decision && (
                          <div className="mt-4 border-t border-blue-500/10 pt-4">

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                              AI Decision
                            </p>

                            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                              {
                                agentResult
                                  .explanation
                                  .decision
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* =================================================
                        FACTORS GRID
                    ================================================= */}

                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">

                        <p className="text-[11px] text-slate-500">
                          Budget Guardrail
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold flex items-center gap-1.5 ${withinBudget
                            ? "text-slate-200"
                            : "text-amber-400"
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${withinBudget
                              ? "bg-blue-400"
                              : "bg-amber-400"
                              }`}
                          />

                          {withinBudget
                            ? "Passed"
                            : "Exceeded"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">

                        <p className="text-[11px] text-slate-500">
                          Specs Matching
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-200 flex items-center gap-1.5">

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                          {isAlternative
                            ? "Partial"
                            : "Optimal"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">

                        <p className="text-[11px] text-slate-500">
                          Merchant Verification
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-200 flex items-center gap-1.5">

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                          Trusted
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">

                        <p className="text-[11px] text-slate-500">
                          Risk Assessment
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-200 flex items-center gap-1.5">

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                          Clear
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
    AI DECISION BREAKDOWN
================================================= */}

              {agentResult?.explanation?.breakdown && (
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-5">

                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-white">
                      AI Decision Breakdown
                    </h4>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Weighted factors used to evaluate this product
                    </p>
                  </div>

                  <div className="space-y-4">

                    {[
                      {
                        label: "Category Match",
                        value:
                          agentResult.explanation.breakdown.category ?? 0,
                        max: 20,
                      },
                      {
                        label: "Budget Match",
                        value:
                          agentResult.explanation.breakdown.budget ?? 0,
                        max: 25,
                      },
                      {
                        label: "Brand Match",
                        value:
                          agentResult.explanation.breakdown.brand ?? 0,
                        max: 10,
                      },
                      {
                        label: "Purpose Match",
                        value:
                          agentResult.explanation.breakdown.purpose ?? 0,
                        max: 15,
                      },
                      {
                        label: "Requirements",
                        value:
                          agentResult.explanation.breakdown.requirements ?? 0,
                        max: 20,
                      },
                      {
                        label: "Preferences",
                        value:
                          agentResult.explanation.breakdown.preferences ?? 0,
                        max: 10,
                      },
                    ].map((factor) => {

                      const percentage =
                        factor.max > 0
                          ? Math.round(
                            (factor.value / factor.max) * 100
                          )
                          : 0;

                      return (
                        <div key={factor.label}>

                          <div className="mb-1.5 flex items-center justify-between">

                            <span className="text-xs text-slate-400">
                              {factor.label}
                            </span>

                            <span className="text-xs font-semibold text-slate-200">
                              {factor.value}/{factor.max}
                            </span>

                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">

                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    })}

                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">

                    <span className="text-xs text-slate-500">
                      Overall Match
                    </span>

                    <span className="text-sm font-bold text-blue-400">
                      {agentResult.explanation.score ?? matchScore}%
                    </span>

                  </div>

                </div>
              )}

              {/* =================================================
                  PAYMENT SUCCESS
              ================================================= */}

              {paymentStatus ===
                "success" && (
                  <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 animate-scale-in">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">

                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>

                      <div>

                        <p className="font-semibold text-emerald-300">
                          Transaction Verified
                        </p>

                        <p className="mt-1 text-sm text-emerald-200/70 leading-relaxed">
                          Payment was successfully
                          verified by the IntentPay AI
                          security layer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* =================================================
                  PAYMENT FAILURE
              ================================================= */}

              {paymentStatus ===
                "failed" && (
                  <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 animate-scale-in">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">

                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>

                      <div>

                        <p className="font-semibold text-red-300">
                          Transaction Verification Failed
                        </p>

                        <p className="mt-1 text-sm text-red-200/70 leading-relaxed">
                          The payment could not be
                          verified. No transaction was
                          approved by IntentPay.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* =================================================
                  CHECKOUT BUTTON
              ================================================= */}

              {showResult &&
                product &&
                !isAlternative &&
                paymentStatus !==
                "success" && (
                  <button
                    onClick={() =>
                      setShowAuthorization(
                        true
                      )
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.99] transition-all"
                  >
                    Proceed to Guarded Checkout

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                )}

              {/* ALTERNATIVE BUTTON */}

              {showResult &&
                product &&
                isAlternative && (
                  <button
                    onClick={() => {
                      document
                        .getElementById(
                          "buyer"
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                        });
                    }}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/15 active:scale-[0.99] transition-all"
                  >
                    Review Alternative

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="py-28 bg-[#07090e] border-b border-slate-800/80">

        <div className="mx-auto max-w-6xl px-6">

          <div className="max-w-xl">

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
              Architecture
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              From natural intent to automated action.
            </h2>

            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Eliminate manual product sorting and rigid
              category filters with intent-based reasoning
              layers.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "01",
                "Intent Parsing",
                "Extract parameters, budgets, and constraints from natural language.",
              ],
              [
                "02",
                "Discovery",
                "Parallel search across verified merchant APIs and inventories.",
              ],
              [
                "03",
                "Verification",
                "Automated checks against security policies and spending limits.",
              ],
              [
                "04",
                "Execution",
                "Prepare controlled micro-transactions with user consent.",
              ],
            ].map(
              ([num, title, desc]) => (
                <div
                  key={num}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80"
                >

                  <span className="font-mono text-xs font-bold text-blue-500">
                    {num}
                  </span>

                  <h3 className="mt-8 text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECURITY SECTION
      ===================================================== */}

      <section
        id="security"
        className="relative overflow-hidden bg-[#070d1a] py-28 text-white"
      >

        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[150px]" />

        <div className="relative mx-auto max-w-6xl px-6">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                Guarded Agent Security
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                AI engineered with
                <br />

                <span className="text-blue-400">
                  strict safety bounds.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm text-blue-100/60 leading-relaxed">
                Untrusted merchant data cannot manipulate
                transaction constraints. IntentPay isolates
                buyer specifications inside an immutable
                security boundary.
              </p>

              <div className="mt-8 space-y-3.5">

                {[
                  "Deterministic spending limits enforced at protocol layer",
                  "Merchant payload sanitation and prompt injection defence",
                  "Immutable buyer authorization requirement before payload signature",
                  "Real-time fraud guardrails and merchant trust validation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs sm:text-sm text-blue-100/80"
                  >

                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
                      ✓
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* SECURITY GRAPHIC */}

            <div className="relative flex min-h-[360px] items-center justify-center">

              <div className="absolute h-[300px] w-[300px] rounded-full border border-blue-500/10 animate-pulse" />

              <div className="absolute h-[200px] w-[200px] rounded-full border border-blue-500/20" />

              <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-950/40 backdrop-blur-md shadow-[0_0_50px_rgba(59,130,246,0.15)]">

                <svg
                  className="w-10 h-10 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>

                <span className="mt-2 text-[10px] font-bold tracking-widest text-blue-400">
                  PROTECTED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          GUARDED CHECKOUT AUTHORIZATION MODAL
      ===================================================== */}

      {showAuthorization &&
        product &&
        !isAlternative && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Guarded Checkout
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Review your purchase before continuing.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowAuthorization(
                      false
                    )
                  }
                  disabled={
                    isProcessingPayment
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* PRODUCT */}

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  AI-selected product
                </p>

                <p className="mt-1 font-semibold text-white">
                  {product.name}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {formatPrice(
                    product.price
                  )}
                </p>
              </div>

              {/* SECURITY CHECKS */}

              <div className="mt-5 space-y-3 text-sm text-slate-300">

                <p className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  Verified catalogue product
                </p>

                <p className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  Price verified server-side
                </p>

                <p className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  Within your authorized budget
                </p>

                <p className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  AI transaction policy passed
                </p>
              </div>

              {/* AUTHORIZATION MESSAGE */}

              <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm leading-5 text-blue-200">

                <p className="font-semibold text-blue-300">
                  Human authorization required
                </p>

                <p className="mt-1 text-blue-200/70">
                  Your AI Buyer has prepared this
                  transaction, but payment cannot proceed
                  without your explicit authorization.
                </p>
              </div>

              {/* BUTTONS */}

              <div className="mt-6 grid grid-cols-2 gap-3">

                <button
                  onClick={() =>
                    setShowAuthorization(
                      false
                    )
                  }
                  disabled={
                    isProcessingPayment
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleAuthorizeAndPay
                  }
                  disabled={
                    isProcessingPayment
                  }
                  className="rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center gap-2">

                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>

                    </span>
                  ) : (
                    "Authorize & Pay"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#04060a] border-t border-slate-900 py-10 text-slate-500 text-xs">

        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 sm:flex-row items-center">

          <span>
            © 2026 IntentPay Technologies Inc.
            All rights reserved.
          </span>

          <span className="font-mono">
            Autonomous Commerce System Standard
          </span>
        </div>
      </footer>

      {/* =====================================================
          CUSTOM ANIMATION UTILITIES
      ===================================================== */}

      <style jsx global>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.35s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </main>
  );
}