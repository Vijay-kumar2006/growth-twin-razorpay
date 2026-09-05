# Contributing to Growth Twin for Razorpay

Thank you for your interest in contributing to **Growth Twin for Razorpay** — the Bounded Agentic Revenue & Commerce Gateway for Autonomous AI Buyers.

---

## 🚀 1. Local Development Setup

### Prerequisites
* **Node.js**: v18.17+ or v20+ recommended
* **NPM**: v9+
* **Git**

### Clone & Install
```bash
git clone https://github.com/Vijay-kumar2006/growth-twin-razorpay.git
cd growth-twin-razorpay

# Install dependencies
npm install

# Start Next.js Development Server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the live Agent Terminal, Merchant Policy Panel, and Evaluation Lab.

---

## 🧪 2. Running Automated Tests

Before submitting any pull request or code changes, ensure all verification and evaluation test suites pass with 100% invariant compliance:

```bash
# Run full comprehensive test suite (Core + MCP + Gateway + Evaluation Lab)
npm test

# Run individual test suites
npm run test:core        # Tests revenue bundle scoring, policy engine, and trade-offs
npm run test:mcp         # Tests 11-tool MCP discovery and JSON-RPC execution
npm run test:razoragent  # Tests gateway idempotency, concurrency, and HMAC signatures
npm run test:eval        # Tests Evaluation Lab (PRNG, L2 scenarios, L3 adversarial, A/B simulator)

# Verify production build
npm run build
```

---

## 🏛️ 3. Architecture & Codebase Layout

* `lib/revenue-bundle.ts`: Revenue-aware add-on engine, Constraint Trade-off Simulator (Safe Negotiation Mode), and Adaptive Payment Recovery agent.
* `lib/policy-engine.ts`: Deterministic merchant policy engine (discount caps, unapproved order ceilings, tag prohibitions).
* `lib/razorpay-adapter.ts`: Pluggable Razorpay adapter (default Deterministic Mock Mode + live test API fallback).
* `lib/audit-logger.ts`: Append-only event store capturing immutable lifecycle timelines.
* `lib/eval/`: Synthetic Evaluation Lab (Mulberry32 PRNG, Level 2 scenarios, Level 3 adversarial matrix, Counterfactual A/B simulator).
* `lib/razoragent/`: MCP server engine (11 tools), SHA-256 idempotency manager, catalog providers, and types.
* `app/`: Next.js Web App routes and API route handlers (`/api/razoragent/mcp`, `/api/razoragent/eval`).
* `components/razoragent/`: UI Mission Control Dashboard, AI Buyer Terminal, Policy Inspector, Evaluation Lab, and Audit Ledger.

---

## 📋 4. Coding Standards & Guidelines

1. **Deterministic Guardrails**: Financial limits, discount caps, and hard constraints (e.g. Jain, dietary, religious) must never depend on non-deterministic LLM output. Always enforce mathematical invariants in policy and trade-off code.
2. **Zero-Hallucination Pricing**: Product prices and add-on calculations must always be grounded in catalog data.
3. **Cryptographic Integrity & Idempotency**: All webhook events and settlement signatures must use HMAC-SHA256 verification. Idempotency keys must lock `quoteId + version` to prevent duplicate orders.
4. **Synthetic Evaluation Isolation**: All evaluation test suites must run deterministically using seedable PRNGs with zero dependency on external network services.

---

## 🔄 5. Submitting Pull Requests

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(recovery): add alternate UPI path heuristic"
   ```
3. Push to your branch and open a Pull Request against `main`.
4. Ensure all automated tests (`npm test`) and builds (`npm run build`) pass cleanly.

---

## 📄 License & Attribution
By contributing to Growth Twin for Razorpay, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). Third-party open-source attributions and notices are documented in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
