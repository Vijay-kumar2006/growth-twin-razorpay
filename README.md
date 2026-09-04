# Growth Twin for Razorpay

**Growth Twin for Razorpay** is an original AI Growth & Agentic Commerce platform that makes merchants readable and transactable by autonomous AI buyers while enforcing deterministic revenue guardrails, approval gating, and cryptographic idempotency.

> **Core Philosophy:** *"The model recommends; deterministic policy code authorizes."*

---

## ⚡ 30-Second Pitch

> "Autonomous AI buyers are already shopping online, but merchants have no trust layer to protect their margins or approve high-value quotes. **Growth Twin** acts as an AI revenue co-pilot for merchants. It converts unstructured buyer requests into structured quotes, recommends margin-accretive add-ons based on transparent scoring, deterministically enforces discount caps, blocks unapproved payments server-side, and guarantees idempotent settlement over Razorpay without duplicate orders or revenue leakage."

---

## 🏗️ Architecture & Interaction Flow

```
+-----------------------------------------------------------------------------+
|                          Autonomous AI Buyer                                |
|  "25 Jain-friendly hampers under ₹18,000 with custom notes for Friday"      |
+-------------------------------------+---------------------------------------+
                                      |
                                      v (Structured Intent via MCP JSON-RPC 2.0)
+-----------------------------------------------------------------------------+
|                    Growth Twin Agentic Commerce Layer                       |
|                                                                             |
|  1. Semantic Catalog Search (Jain-friendly gourmet snack hamper @ ₹500/ea)  |
|  2. Revenue-Aware Add-on Engine (Evaluates budget headroom + ₹5,500)        |
|     - Custom Personalized Note: Score 100/100 (+₹1,250 revenue)             |
|     - Friday Priority Shipping: Score 88/100 (+₹3,000 revenue)              |
|     - Artisanal Mithai Box:     Score 98/100 (+₹2,500 revenue)              |
+-------------------------------------+---------------------------------------+
                                      |
                                      v (Quote Generated: Cart ₹13,750)
+-----------------------------------------------------------------------------+
|                Deterministic Merchant Policy Engine                         |
|                                                                             |
|  - Max Discount Cap: 15% (Enforced Server-Side)                             |
|  - Unapproved Order Cap: ₹20,000                                            |
|  - State: AWAITING_APPROVAL (Blocks Razorpay order creation)                |
+-------------------------------------+---------------------------------------+
                                      | (Explicit Buyer/Merchant Approval)
                                      v
+-----------------------------------------------------------------------------+
|                Razorpay Settlement & Idempotency Layer                      |
|                                                                             |
|  - SHA-256 Idempotency Lock: quoteId + approvalVersion                      |
|  - Prevents double-billing & duplicate order creation                       |
|  - Pluggable Adapter: Default Mock Simulation / Drop-in Test API            |
|  - Append-Only Audit Ledger: Immutable lifecycle event log                  |
+-----------------------------------------------------------------------------+
```

---

## 🌟 Original Contributions

1. **Merchant Policy Panel & Server-Side Enforcement (`lib/policy-engine.ts`)**:
   - Hard mathematical bounds on max automatic discounts (15%), order ceilings (₹20,000), permitted add-ons, and prohibited product tags.
   - Bypassing frontend UI requests directly to `create_guarded_order` fails safely with `HUMAN_APPROVAL_REQUIRED`.
2. **Transparent Revenue-Aware Bundle Engine (`lib/revenue-bundle.ts`)**:
   - Zero black-box AI or hallucinated prices.
   - Deterministic 100-point formula: Budget Headroom (40 pts) + Buyer Relevance (30 pts) + Compatibility (10 pts) + Merchant Priority/Inventory (20 pts).
   - Generates human-readable and machine-readable explanations for each recommendation.
3. **9-Tool MCP JSON-RPC 2.0 Server Endpoint (`lib/razoragent/mcp-engine.ts`)**:
   - Added original Growth Twin tools: `recommend_addons`, `evaluate_merchant_growth_policy`, and `get_commerce_contract`.
   - Inherited 6 tools: `search_products`, `get_product_details`, `calculate_cart_quote`, `evaluate_spend_policy`, `create_guarded_order`, and `verify_payment_and_settle`.
4. **Pluggable Razorpay Adapter with Safe Mock Default (`lib/razorpay-adapter.ts`)**:
   - Always runs safely out of the box with zero credentials required.
   - Seamless drop-in support for live test-mode credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) without code changes.
5. **Controlled Failure Recovery & Idempotency**:
   - Simulates network/gateway payment drops without destroying the underlying quote.
   - Retries cleanly reuse the existing quote ID and approval version.
6. **Append-Only Audit Ledger (`lib/audit-logger.ts`)**:
   - Immutable log capturing the full lifecycle for merchants and compliance officers.

---

## 🔒 Mock Mode vs. Live Disclosure

| Mode | Environment | Behavior | UI Label |
| :--- | :--- | :--- | :--- |
| **Deterministic Mock Mode (Default)** | Default / No API keys | Generates deterministic orders and payment links locally without calling external APIs. | `Demo/Test Simulation` |
| **Razorpay Test Sandbox** | `RAZORPAY_KEY_ID=rzp_test_...` | Dispatches real orders and hosted payment links to Razorpay Test API. | `Razorpay Test Sandbox` |
| **Razorpay Live Production** | `RAZORPAY_KEY_ID=rzp_live_...` | Live card, UPI, and netbanking charges. | `Razorpay Live` |

> *All hackathon demos run strictly in Deterministic Mock Mode with `Demo/Test Simulation` clearly labeled.*

---

## ⏱️ Exact 4-Minute Demo Script

Follow this step-by-step flow for judging and live evaluation:

### 1. Merchant Policy Configuration (0:00 - 0:45)
- Open the **Merchant Policy Panel**.
- Configure:
  - Max discount: `15%`
  - Max unapproved order: `₹20,000`
  - Permitted add-ons: `custom_note`, `priority_shipping`, `premium_packaging`
  - Require explicit approval: `Enabled`
- **Key Takeaway:** The merchant defines boundaries before any AI buyer connects.

### 2. Autonomous AI Buyer Request (0:45 - 1:30)
- In the buyer chat interface, submit:
  > *"I need 25 hampers under ₹18,000, with Jain-friendly options, personalized notes, and delivery by Friday."*
- Growth Twin parses: Quantity: 25, Budget: ₹18,000, Constraints: Jain, Preferences: Note + Friday delivery.

### 3. Explainable Bundle & Server-Side Gate (1:30 - 2:15)
- Growth Twin generates the offer:
  - Base: 25 Jain Hampers @ ₹500 = ₹12,500
  - Recommended Add-on: 25 Custom Foil Notes @ ₹50 = ₹1,250 (Score: 100/100, Budget Headroom: ₹5,500)
  - Total: ₹13,750
- Inspect the **Explainable Offer Card** showing exact revenue impact and score breakdown.
- Attempt to dispatch payment link: **Blocked by deterministic code (`AWAITING_APPROVAL`).**

### 4. Buyer Approval & Mock Settlement (2:15 - 3:00)
- Click **Approve Quote**. State moves to **`APPROVED`** → **`PAYMENT_CREATED`**.
- Generated Order ID: `order_mock_xxx` (Labeled: *Demo/Test Simulation*).
- Idempotency key locked: `quoteId + v1`.

### 5. Controlled Failure & Safe Idempotent Retry (3:00 - 3:30)
- Click **Simulate Payment Failure** (simulating bank drop).
- Status moves to **`PAYMENT_FAILED`**.
- Click **Retry Payment**: The engine retrieves the same order using the cached idempotency lock without creating a duplicate charge.

### 6. Append-Only Audit Ledger & MCP Inspection (3:30 - 4:00)
- Switch to the **Audit Ledger** tab to inspect all chronological events (`INTENT_RECEIVED` → `POLICY_CHECK` → `QUOTE_CREATED` → `APPROVAL_GRANTED` → `PAYMENT_SUCCESS` → `PAYMENT_FAILED` → `RETRY_ATTEMPT`).
- Query the `/api/razoragent/mcp` endpoint to view the raw agent-readable commerce contract.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Vijay-kumar2006/growth-twin-razorpay.git
cd growth-twin-razorpay
npm install
```

### 2. Run All Automated Tests
```bash
npm test
```
*Runs `test:core` (policy & revenue tests), `test:mcp` (9-tool MCP discovery & execution test), and `test:razoragent` (concurrency & benchmark suite).*

### 3. Run Production Build
```bash
npm run build
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Growth Twin interface.

---

## 📖 Built on Open Source

This project builds upon and integrates ideas from the open-source community:
- **[RazorAgent](https://github.com/Piyush-Thakur7/razoragent)** (MIT): Base Next.js/TypeScript architecture, MCP tools, and catalog foundations.
- **[Safe-Cart-AI](https://github.com/Jai-095/safe-cart-ai)**: Concepts for deterministic merchant policy boundaries and approval gating.
- **[Razorpay MCP Server](https://github.com/razorpay/razorpay-mcp-server)**: Reference for Razorpay API/tool schemas.

See [ORIGINAL_WORK.md](./ORIGINAL_WORK.md) for full details on attributions and original contributions.

---

## 📄 License
MIT License. Preserves all required open-source copyright and attribution notices.
