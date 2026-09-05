# Growth Twin for Razorpay

**Built by:** Vijay Kumar ([@Vijay-kumar2006](https://github.com/Vijay-kumar2006))

> Growth Twin is a merchant-controlled AI commerce agent that creates explainable revenue opportunities, safely negotiates conflicting buyer constraints, and recovers failed payment attempts without unauthorized spending or duplicate orders.

> **Core Philosophy:** *"The model recommends; deterministic policy code authorizes."*

---

## ⚡ 30-Second Pitch

> "Autonomous AI buyers are already shopping online, but merchants have no trust layer to protect their margins, resolve constraint conflicts, or approve high-value quotes. **Growth Twin** acts as an AI revenue co-pilot for merchants. It converts unstructured buyer requests into structured quotes, recommends margin-accretive add-ons based on transparent scoring, runs a **Constraint Trade-off Simulator (Safe Negotiation Mode)** to resolve impossible requests without relaxing dietary or religious rules, deterministically enforces discount caps, blocks unapproved payments server-side, and enforces idempotent payment-action simulation, with a drop-in Razorpay test-mode adapter without duplicate orders or revenue leakage."

---

## 🌟 Original Growth Twin Contributions

Authored and implemented for this project by **Vijay Kumar**:

1. **Revenue-aware add-on scoring (`lib/revenue-bundle.ts`)**:
   - Transparent, deterministic 100-point formula evaluating Budget Headroom (40 pts) + Preference Match (30 pts) + SKU Compatibility (10 pts) + Merchant Priority/Inventory (20 pts).
2. **Deterministic merchant policy engine (`lib/policy-engine.ts`)**:
   - Strict server-side enforcement of maximum discount caps (15%), unapproved order ceilings (₹20,000), permitted add-on whitelists, and tag prohibitions.
3. **Constraint Trade-off Simulator / Safe Negotiation Mode (`lib/revenue-bundle.ts`, `simulate_constraint_tradeoffs`)**:
   - Generates 2–3 structured alternatives (Option A: Budget-Strict, Option B: Premium with explicit approval, Option C: Count-Optimized) when intent conflicts arise.
   - **Zero Hallucination Invariant**: Never relaxes hard constraints (e.g. Jain, vegan, dietary, religious specifications).
4. **Adaptive Payment Recovery Agent (`lib/revenue-bundle.ts`, `recover_failed_payment`)**:
   - Intercepts checkout and gateway failures and generates 3 constraint-preserving recovery routes (alternate rail retry, lowest add-on pruning, shipping downgrade) with quote versioning.
5. **11-tool MCP Growth Twin layer (`lib/razoragent/mcp-engine.ts`, `/api/razoragent/mcp`)**:
   - Standardized JSON-RPC 2.0 interface exposing both core commerce and Growth Twin tools (`recommend_addons`, `evaluate_merchant_growth_policy`, `simulate_constraint_tradeoffs`, `recover_failed_payment`, `get_commerce_contract`).
6. **Synthetic Evaluation Lab with Level 2 and Level 3 testing (`lib/eval/*`, UI dashboard, API)**:
   - Seedable PRNG, 8 Level 2 MCP scenarios, 10 Level 3 adversarial attack vector defenses, and paired Counterfactual A/B Simulator comparing Control A against Treatment B.
7. **Audit trail, quote versioning, approval gates, and idempotency behavior (`lib/audit-logger.ts`, `lib/razorpay-adapter.ts`)**:
   - Append-only immutable lifecycle ledger, SHA-256 idempotency locks (`quoteId + version`), deterministic mock simulation default, and drop-in Razorpay test API support.

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
- The **Adaptive Payment Recovery Agent** (`recover_failed_payment`) engages:
  - Generates 3 deterministic recovery routes (UPI rail retry, lowest add-on pruning, surface shipping downgrade).
  - Preserves 100% of hard constraints.
- Selecting a recovery route creates a new quote version with `AWAITING_APPROVAL` and derives an idempotency key to prevent duplicate orders.

### 7. Evaluation Lab & Audit Ledger (3:45 - 4:00)
- Switch to the **Evaluation Lab** tab to inspect seed controllers, 8 Level 2 scenarios, 10 Level 3 adversarial vectors, and the counterfactual A/B simulator.
- Switch to the **Audit Ledger** tab to inspect all chronological lifecycle events.

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
*Runs `test:core` (policy, revenue, trade-off, and recovery tests), `test:mcp` (11-tool MCP discovery & execution test), `test:razoragent` (concurrency & benchmark suite), and `test:eval` (Evaluation Lab suite).*

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

## 📖 Foundation and Notices

> Growth Twin includes adapted and reused open-source commerce infrastructure. Required license and attribution notices are preserved in `THIRD-PARTY-NOTICES.md`. The original Growth Twin features and product integration are authored for this project by Vijay Kumar.

See [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) for complete attribution and license details.

---

## 📄 License
MIT License. Preserves all required open-source copyright and attribution notices.
