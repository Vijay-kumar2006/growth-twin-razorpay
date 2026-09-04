# 4-Minute Demo Script: Growth Twin for Razorpay

**Demo Pitch:**
> "Growth Twin turns an AI buyer’s request into a compliant, revenue-optimized Razorpay transaction with deterministic trust guardrails."

---

### Step 1: Merchant Policy Configuration (0:00 - 0:45)
- Open the **Merchant Policy Panel**.
- Review settings:
  - Max automatic discount: `15%`
  - Maximum unapproved order value: `₹20,000`
  - Permitted add-ons: `custom_note`, `priority_shipping`, `premium_packaging`
  - Require explicit approval: `Enabled`
- **Takeaway:** The merchant defines the hard boundaries before any AI interaction.

---

### Step 2: Buyer Intent Submission (0:45 - 1:30)
- In the AI Buyer interface, submit the corporate gifting prompt:
  > *"I need 25 hampers under ₹18,000, with Jain-friendly options, personalized notes, and delivery by Friday."*
- Watch the Growth Twin parse the structured intent:
  - Budget: `₹18,000`
  - Quantity: `25`
  - Hard Tags: `jain`
  - Soft Preferences: `custom_note`, `priority_shipping`

---

### Step 3: Bundle Recommendation & Policy Evaluation (1:30 - 2:15)
- Inspect the generated **Offer Card**:
  - Base Product: 25 Jain-friendly snack hampers @ ₹500/unit = ₹12,500
  - Recommended Add-on: 25 Personalized Notes @ ₹50/unit = ₹1,250
  - Total Cart Value: ₹13,750 (well within ₹18,000 budget)
- View the transparent scoring breakdown on the card (Budget Headroom +40, Relevance +30, Compatibility +10, Merchant Priority +20).
- Notice the system state: **`AWAITING_APPROVAL`**.
- Attempt to create a payment link: **Blocked by deterministic policy code.**

---

### Step 4: Approval & Razorpay Test Simulation (2:15 - 3:00)
- Grant buyer approval on the exact quote version.
- State transitions to **`APPROVED`** → **`PAYMENT_CREATED`**.
- View the Razorpay Order & Mock Payment Link:
  - Order ID: `order_mock_XXXX` (Labeled: *Demo/Test Simulation*)
  - Stable Idempotency Key: `quote_25_jain_v1`

---

### Step 5: Controlled Failure & Safe Idempotent Retry (3:00 - 3:30)
- Trigger **Simulate Payment Failure** (Network / Bank Drop simulation).
- Status changes to **`PAYMENT_FAILED`** with recovery action displayed.
- Click **Retry Payment**.
- Verify that the exact same quote ID & idempotency key is used, preventing duplicate order creation.

---

### Step 6: Append-Only Audit Trail (3:30 - 4:00)
- Switch to the **Audit Ledger / Audit JSON** tab.
- Inspect the complete chronological log:
  1. `INTENT_RECEIVED`
  2. `POLICY_CHECK`
  3. `QUOTE_CREATED`
  4. `APPROVAL_GRANTED`
  5. `PAYMENT_ATTEMPT`
  6. `PAYMENT_FAILED`
  7. `RETRY_ATTEMPT`
