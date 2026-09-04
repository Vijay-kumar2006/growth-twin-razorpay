# Growth Twin Architecture

## Core Philosophy
> "The model recommends; deterministic policy code authorizes."

Growth Twin provides a merchant-side AI revenue and trust layer that makes merchants machine-readable and transactable by autonomous AI buyers while guaranteeing strict merchant-side guardrails.

## System Components

```
                +----------------------------+
                |     Autonomous AI Buyer    |
                +--------------+-------------+
                               | (Structured Intent)
                               v
                +----------------------------+
                |    Growth Twin Gateway     |
                +--------------+-------------+
                               |
       +-----------------------+-----------------------+
       |                                               |
       v                                               v
+-----------------------------+         +-----------------------------+
|  Revenue-Aware Bundle Engine|         |  Deterministic Policy Engine|
|  - Headroom evaluation      |         |  - Max discount limits      |
|  - Transparent add-on score |         |  - Unapproved order cap     |
|  - Compatibility checks     |         |  - Add-on tag restrictions  |
+--------------+--------------+         +--------------+--------------+
               |                                       |
               +-------------------+-------------------+
                                   |
                                   v
                    +-----------------------------+
                    |    Approval & Guard State   |
                    |   (Blocks unapproved links) |
                    +--------------+--------------+
                                   | (On explicit approval)
                                   v
                    +-----------------------------+
                    |  Razorpay Adapter Interface |
                    |  - Idempotent order builder |
                    |  - Mock & Test simulation   |
                    +--------------+--------------+
                                   |
                                   v
                    +-----------------------------+
                    |  Append-Only Audit Ledger   |
                    +-----------------------------+
```

### 1. Revenue-Aware Bundle Engine (`lib/revenue-bundle.ts`)
- Evaluates buyer intent against merchant catalog.
- Deterministic scoring formula:
  - Budget Headroom: Up to 40 pts
  - Buyer Preference Match: Up to 30 pts
  - Product Compatibility: Up to 10 pts
  - Merchant Priority & Inventory Confidence: Up to 20 pts
- No opaque black-box AI logic or hallucinated prices.

### 2. Deterministic Policy Engine (`lib/policy-engine.ts`)
- Enforces strict business rules server-side:
  - Max discount percentage (e.g. 15%).
  - Maximum unapproved order value (e.g. ₹20,000).
  - Explicit approval required for payment links.
  - Tag-level prohibitions (e.g., no add-ons on perishable items).

### 3. Razorpay Adapter & Settlement Gateway (`lib/razorpay-adapter.ts`)
- Clean typed adapter interface (`RazorpayAdapter`).
- Deterministic Mock Adapter implementation for test & simulation demo.
- Stable idempotency key generation: `quoteId + approvalVersion`.
- Graceful failure simulation and recovery retry without duplicate order creation.

### 4. Append-Only Audit Ledger (`lib/audit-logger.ts`)
- Complete immutable timeline tracking: Intent → Policy Check → Quote → Approval → Payment Attempt → Payment Result → Recovery.
