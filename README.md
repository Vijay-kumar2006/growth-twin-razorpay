# Growth Twin for Razorpay

**Growth Twin for Razorpay** is an original AI Growth & Agentic Commerce platform that makes merchants readable and transactable by autonomous AI buyers while enforcing strict, deterministic merchant guardrails.

> **Core Philosophy:** *"The model recommends; deterministic policy code authorizes."*

---

## 🌟 Key Capabilities
- **Merchant Policy Panel**: Set hard boundaries for maximum discounts, unapproved order thresholds, permitted add-ons, and payment-link approvals.
- **Revenue-Aware Bundle Engine**: Deterministic, transparent scoring model (budget headroom, compatibility, relevance, merchant priority) with zero hallucinated prices.
- **Explainable Offer Cards**: Clear explanations of base products and add-ons with full score breakdowns.
- **Approval-Gated Razorpay Gateway**: Strict state gating (`DRAFT_INTENT` → `QUOTE_CREATED` → `AWAITING_APPROVAL` → `APPROVED` → `PAYMENT_CREATED`).
- **Deterministic Mock Adapter**: Full test-mode simulation with failure injection and safe idempotent retries.
- **Append-Only Audit Ledger**: Complete timeline tracing every intent, policy check, recommendation, approval, and settlement event.

---

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/Vijay-kumar2006/growth-twin-razorpay.git
cd growth-twin-razorpay
npm install
```

### Running Tests
```bash
npm run test:core
```

### Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application and try the demo flow.

---

## 📖 Built on Open Source

This project builds upon and integrates ideas from the open-source community:
- **[RazorAgent](https://github.com/Piyush-Thakur7/razoragent)** (MIT): Base Next.js/TypeScript architecture, MCP tools, and catalog foundations.
- **[Safe-Cart-AI](https://github.com/Jai-095/safe-cart-ai)**: Concepts for deterministic merchant policy boundaries and approval gating.
- **[Razorpay MCP Server](https://github.com/razorpay/razorpay-mcp-server)**: Reference for Razorpay API/tool schemas.

See [ORIGINAL_WORK.md](./ORIGINAL_WORK.md) for full details on attributions and original contributions.

---

## 📄 License
MIT License. Preserves upstream open-source attributions.
