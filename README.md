# Growth Twin for Razorpay

**Growth Twin for Razorpay** is an original AI Growth & Agentic Commerce platform that makes merchants readable and transactable by autonomous AI buyers while enforcing deterministic revenue guardrails, safe negotiation constraint trade-offs, approval gating, and cryptographic idempotency.

> **Core Philosophy:** *"The model recommends; deterministic policy code authorizes."*

---

## ⚡ 30-Second Pitch

> "Autonomous AI buyers are already shopping online, but merchants have no trust layer to protect their margins, resolve constraint conflicts, or approve high-value quotes. **Growth Twin** acts as an AI revenue co-pilot for merchants. It converts unstructured buyer requests into structured quotes, recommends margin-accretive add-ons based on transparent scoring, runs a **Constraint Trade-off Simulator (Safe Negotiation Mode)** to resolve impossible requests without relaxing dietary or religious rules, deterministically enforces discount caps, blocks unapproved payments server-side, and guarantees idempotent settlement over Razorpay without duplicate orders or revenue leakage."

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
|  3. Constraint Trade-off Simulator (Safe Negotiation Mode)                  |
|     - Generates 2-3 catalog-grounded options when conflicts arise           |
|     - NEVER relaxes hard constraints (e.g. Jain dietary stays 100% strict)  |
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

1. **Adaptive Payment Recovery / Revenue Recovery Agent (`lib/revenue-bundle.ts`, `recover_failed_transaction`)**:
   - Deterministically detects checkout and banking gateway failures and rescues transactions.
   - Generates 2–3 structured recovery routes: (1) Instant UPI rail retry on same quote, (2) Prune lowest-priority optional add-on, (3) Downgrade optional courier SKU.
   - **Hard Constraint Invariance**: Preserves 100% of hard constraints (dietary, religious, specifications).
   - Re-runs server-side policy engine, creates a new quote version upon cart alterations, preserves idempotency, and prevents duplicate orders.
   - Logs audit events: `PAYMENT_FAILURE_DETECTED`, `RECOVERY_OPTIONS_GENERATED`, and `RECOVERY_OPTION_SELECTED`.
2. **Constraint Trade-off Simulator (Safe Negotiation Mode, `lib/revenue-bundle.ts`, `simulate_constraint_tradeoffs`)**:
   - Deterministic mathematical negotiation when budget, quantity, and preferences conflict.
   - Generates 2-3 structured options: (Option A: Budget-Strict, Option B: Uncompromised Premium with approval, Option C: Optimized Count).
   - **Zero Hallucination Rule**: Never relaxes hard constraints (dietary, safety, religious). Only negotiable soft preferences (packaging, courier) may be relaxed.
3. **Merchant Policy Panel & Server-Side Enforcement (`lib/policy-engine.ts`)**:
   - Hard mathematical bounds on max automatic discounts (15%), order ceilings (₹20,000), permitted add-ons, and prohibited product tags.
   - Bypassing frontend UI requests directly to `create_guarded_order` fails safely with `HUMAN_APPROVAL_REQUIRED`.
4. **Transparent Revenue-Aware Bundle Engine (`lib/revenue-bundle.ts`)**:
   - Zero black-box AI or hallucinated prices.
   - Deterministic 100-point formula: Budget Headroom (40 pts) + Buyer Relevance (30 pts) + Compatibility (10 pts) + Merchant Priority/Inventory (20 pts).
5. **11-Tool MCP JSON-RPC 2.0 Server Endpoint (`lib/razoragent/mcp-engine.ts`)**:
   - Added original Growth Twin tools: `recover_failed_transaction`, `simulate_constraint_tradeoffs`, `recommend_addons`, `evaluate_merchant_growth_policy`, and `get_commerce_contract`.
   - Inherited 6 tools: `search_products`, `get_product_details`, `calculate_cart_quote`, `evaluate_spend_policy`, `create_guarded_order`, and `verify_payment_and_settle`.
6. **Pluggable Razorpay Adapter with Safe Mock Default (`lib/razorpay-adapter.ts`)**:
   - Always runs safely out of the box with zero credentials required.
   - Seamless drop-in support for live test-mode credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) without code changes.
7. **Append-Only Audit Ledger (`lib/audit-logger.ts`)**:
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

### 2. Autonomous AI Buyer Request (0:45 - 1:15)
- Switch to the **AI Buyer Terminal**.
- Send an agentic prompt:
  ```
  "Purchase 25 corporate gift hampers under ₹18,000 budget with Jain-friendly snacks, personalized embossed note, and Friday delivery."
  ```

### 3. Constraint Trade-off Simulator / Safe Negotiation (1:15 - 1:45)
- The engine calculates that 25 hampers + all add-ons = ₹20,750 (exceeds ₹18,000 budget).
- The **Trade-off Simulator** generates 3 structured alternatives:
  - **Option A (Budget-Strict)**: Keep Jain snacks + custom note, switch to standard delivery → ₹13,750.
  - **Option B (Uncompromised)**: Keep everything, request budget expansion to ₹20,750 (Requires Approval).
  - **Option C (Optimized Count)**: Deliver 21 full-spec hampers → ₹17,430.
- Notice that **Jain dietary restrictions are NEVER relaxed**.
- Select Option A → creates a new quote version with approval gating.

### 4. Explainable Bundle & Server-Side Gate (1:45 - 2:30)
- Inspect the **Explainable Offer Card** showing exact revenue impact and score breakdown.
- Attempt to dispatch payment link: **Blocked by deterministic code (`AWAITING_APPROVAL`).**

### 5. Buyer Approval & Mock Settlement (2:30 - 3:15)
- Click **Approve Quote**. State moves to **`APPROVED`** → **`PAYMENT_CREATED`**.
- Generated Order ID: `order_mock_xxx` (Labeled: *Demo/Test Simulation*).
- Idempotency key locked: `quoteId + v1`.

### 6. Adaptive Payment Recovery & Safe Idempotent Retry (3:15 - 3:45)
- Click **Simulate Payment Failure** (simulating bank/card drop).
- Status moves to **`PAYMENT_FAILED`**.
- The **Adaptive Payment Recovery Agent** (`recover_failed_transaction`) engages:
  - Generates 3 deterministic recovery routes (UPI rail retry, lowest add-on pruning, surface shipping downgrade).
  - Preserves 100% of hard constraints.
- Selecting a recovery route creates a new quote version with `AWAITING_APPROVAL` and derives an idempotency key to prevent duplicate orders.

### 7. Append-Only Audit Ledger & MCP Inspection (3:45 - 4:00)
- Switch to the **Audit Ledger** tab to inspect all chronological events (`INTENT_RECEIVED` → `CONSTRAINT_CONFLICT_DETECTED` → `TRADEOFF_ALTERNATIVE_SELECTED` → `POLICY_CHECK` → `APPROVAL_GRANTED` → `PAYMENT_SUCCESS` → `PAYMENT_FAILURE_DETECTED` → `RECOVERY_OPTIONS_GENERATED` → `RECOVERY_OPTION_SELECTED`).
- Query the `/api/razoragent/mcp` endpoint to view all 11 tools and the raw agent-readable commerce contract.

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
*Runs `test:core` (policy, revenue, trade-off, and recovery tests), `test:mcp` (11-tool MCP discovery & execution test), and `test:razoragent` (concurrency & benchmark suite).*

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
