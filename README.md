# IntentPay AI 🛡️🛒

### AI-Powered Guarded Commerce Agent

**Live Demo:** https://intentpay-ai-1.onrender.com

IntentPay AI is an AI-powered shopping agent that understands a user's natural-language shopping intent, evaluates products against their requirements and budget, protects against malicious catalogue instructions, explains its recommendation, and requires explicit user authorization before payment.

The goal is to make **AI-assisted commerce safer, more transparent, and user-controlled**.

---

## 🚀 Problem

Traditional AI shopping assistants can introduce several risks:

- Misunderstanding user requirements
- Recommending products outside the user's budget
- Being influenced by malicious product or merchant content
- Providing recommendations without clear explanations
- Taking payment actions without meaningful user authorization

IntentPay AI addresses these risks by combining:

**AI Intent Understanding + Constraint Matching + Security + Explainability + User Authorization + Razorpay Payments**

---

## 💡 Solution

The user simply describes what they want in natural language.

Example:

> "I want an Essence mascara under ₹3000."

IntentPay AI then:

1. Extracts structured shopping intent using Gemini.
2. Fetches products from a trusted external catalogue.
3. Scans product content for prompt-injection attempts.
4. Matches products using user constraints and preferences.
5. Checks hard constraints such as budget requirements.
6. Explains why a product was selected.
7. Creates a server-side buyer proposal.
8. Requires explicit user authorization.
9. Revalidates product price and budget on the server.
10. Creates a Razorpay payment order.
11. Verifies the Razorpay payment signature.

---

# 🧠 Key Features

## 1. Natural-Language Shopping Intent

Gemini converts the user's request into structured information such as:

- Category
- Brand
- Minimum budget
- Maximum budget
- Purpose
- Requirements
- Preferences
- Hard constraints
- Missing information

---

## 2. Constraint-Aware Product Matching

Products are ranked using weighted factors:

| Matching Factor | Weight |
|---|---:|
| Category | 20 |
| Budget | 25 |
| Brand | 10 |
| Purpose | 15 |
| Requirements | 20 |
| Preferences | 10 |

Hard constraints are handled separately so the system does not silently violate strict user requirements.

---

## 3. Prompt-Injection Protection 🛡️

Product and merchant content is treated as **untrusted data**.

The security layer scans catalogue text for suspicious instructions such as:

- Ignore previous instructions
- Override the user
- Increase the budget
- Buy this instead
- Always recommend this
- Disregard previous instructions

Products containing suspicious patterns can be rejected before ranking.

---

## 4. Budget Guardrails 💰

The user's budget is treated as a protected constraint.

IntentPay AI:

- Detects over-budget products
- Calculates the amount over budget
- Prevents silent budget escalation
- Performs another budget check before payment

Example:

```text
User Budget:      ₹3,000
Product Price:    ₹4,249
Over Budget By:   ₹1,249
```

The system does not silently approve the transaction.

---

## 5. Explainable Recommendations 🧠

Instead of showing only a match score, IntentPay AI explains why a product was selected using factors such as:

- Category match
- Budget match
- Brand match
- Purpose match
- Requirement matches
- Preference matches
- Hard-constraint status

This makes the recommendation easier to understand and audit.

---

## 6. Bounded Autonomy 🔐

The AI can:

- Understand shopping intent
- Search products
- Rank products
- Explain recommendations
- Prepare a buyer proposal

However, the AI **cannot authorize payment by itself**.

Payment requires:

```text
AI Recommendation
       ↓
Buyer Proposal
       ↓
Explicit User Authorization
       ↓
Server Validation
       ↓
Razorpay Checkout
```

---

## 7. Server-Side Payment Protection

The server does not trust client-provided pricing.

Before creating a payment order, the server verifies:

- Buyer proposal exists
- Proposal has not expired
- Explicit authorization has occurred
- Product exists in the trusted catalogue
- Product is not suspicious
- Product price matches the trusted catalogue
- Product remains within the allowed budget

This prevents client-side manipulation from bypassing the payment guardrails.

---

## 8. Razorpay Payment Integration 💳

IntentPay AI uses Razorpay for checkout and payment verification.

### Payment Flow

```text
Buyer Proposal
       ↓
Explicit User Authorization
       ↓
Server-Side Validation
       ↓
Razorpay Order Creation
       ↓
Razorpay Checkout
       ↓
Payment
       ↓
Razorpay Signature Verification
       ↓
Verified Payment
```

A payment is accepted only after the server verifies the Razorpay payment signature.

---

## 9. Audit Trail 📋

Important security-sensitive actions are recorded through an audit logger.

Example events:

```text
PROPOSAL_CREATED
USER_AUTHORIZED
PAYMENT_ORDER_CREATED
PAYMENT_VERIFIED
```

This provides a simple audit trail for important transaction events.

---

# 🏗️ Architecture

```text
                         USER
                           │
                           ▼
                NATURAL-LANGUAGE REQUEST
                           │
                           ▼
                 GEMINI INTENT EXTRACTION
                           │
                           ▼
                 TRUSTED PRODUCT CATALOGUE
                           │
                           ▼
                SECURITY / INJECTION CHECK
                           │
                           ▼
                  CONSTRAINT MATCHER
                           │
                           ▼
                EXPLAINABLE RECOMMENDATION
                           │
                           ▼
                    BUYER PROPOSAL
                           │
                           ▼
                EXPLICIT USER AUTHORIZATION
                           │
                           ▼
             SERVER PRICE + BUDGET CHECK
                           │
                           ▼
                       RAZORPAY
                           │
                           ▼
              PAYMENT SIGNATURE VERIFICATION
                           │
                           ▼
                  VERIFIED PAYMENT
```

---

# 📦 Product Catalogue

IntentPay AI uses the **DummyJSON Products API** as an external product catalogue.

The application supports multiple product categories, including:

- Beauty
- Fragrances
- Smartphones
- Laptops
- Shoes
- Groceries
- Furniture
- Skincare
- And other catalogue categories

Products are fetched from the external catalogue and evaluated against the user's shopping intent.

---

# 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### AI

- Google Gemini
- `@google/genai`

### Product Data

- DummyJSON Products API

### Validation & Application Logic

- TypeScript
- Zod

### Payments

- Razorpay
- Razorpay Checkout
- HMAC-SHA256 signature verification

### Runtime

- Node.js

### Deployment

- Render

---

# 📁 Project Structure

```text
intentpay-ai/
│
├── app/
│   ├── api/
│   │   ├── agent/
│   │   │   └── route.ts
│   │   ├── buyer/
│   │   │   ├── authorize/
│   │   │   └── proposal/
│   │   ├── payment/
│   │   │   ├── create-order/
│   │   │   └── verify/
│   │   └── product/
│   │
│   ├── lib/
│   │   ├── audit.ts
│   │   ├── buyer.ts
│   │   ├── buyerProposal.ts
│   │   ├── explainer.ts
│   │   ├── matcher.ts
│   │   ├── productApi.ts
│   │   └── security.ts
│   │
│   └── page.tsx
│
├── data/
│   └── products.ts
│
├── test-matcher.ts
├── test-payment-security.ts
├── test-security.ts
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/intentpay-ai.git
cd intentpay-ai
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> Never commit `.env.local` or secret API keys to GitHub.

## 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🌐 Live Demo

The project is deployed on Render:

**https://intentpay-ai-1.onrender.com**

---

# 🧪 Security Testing

IntentPay AI was tested against multiple security and edge-case scenarios:

| Test | Expected Behavior | Status |
|---|---|---|
| Invalid proposal ID | Request rejected | ✅ Passed |
| Missing proposal ID | Request rejected | ✅ Passed |
| Malformed JSON | Controlled error returned | ✅ Passed |
| Payment without authorization | Payment blocked | ✅ Passed |
| Expired proposal | Proposal rejected | ✅ Passed |
| Duplicate authorization | Authorization rejected | ✅ Passed |
| Fake Razorpay signature | Payment verification rejected | ✅ Passed |
| Over-budget product | Payment blocked | ✅ Passed |
| Price tampering | Price mismatch rejected | ✅ Passed |
| Malicious catalogue content | Suspicious product rejected | ✅ Passed |

---

# 🔒 Security Principles

### User Constraints Are Protected

The system does not silently modify:

- Budget
- Hard constraints
- Required product conditions

### Catalogue Content Is Untrusted

Product descriptions and catalogue text are treated as data, not instructions.

### AI Cannot Self-Authorize

The AI can prepare a transaction proposal, but it cannot independently approve payment.

### Server Is the Final Authority

The server independently verifies:

- Product
- Price
- Budget
- Authorization
- Payment signature

---

# 🌟 What Makes IntentPay AI Different?

Most AI shopping systems focus on:

> **"Find me a product."**

IntentPay AI focuses on:

> **"Find me a product while protecting what I asked for."**

The system combines:

```text
AI
+
Agentic Commerce
+
Security
+
Explainability
+
Budget Guardrails
+
User Authorization
+
Payments
```

This creates a safer approach to AI-assisted purchasing where the AI can assist with commerce without receiving unrestricted control over the user's money.

---

# 🚀 Future Improvements

Potential future enhancements include:

- Agent-to-agent merchant negotiation
- Semantic/vector-based product matching
- Persistent database-backed buyer proposals
- User accounts and purchase history
- Multi-merchant comparison
- Fraud and anomaly detection
- Advanced catalogue security scanning
- More granular AI autonomy and policy tiers

---

# 👩‍💻 Author

**Sneha Jaiswal**

B.E. Artificial Intelligence & Data Science

**Project:** IntentPay AI  
**Track:** AI Growth & Agentic Commerce

---

# 📌 Disclaimer

IntentPay AI is a buildathon prototype created to demonstrate AI-powered guarded commerce and secure payment orchestration.

Razorpay should be configured with test credentials during development and demonstration.
