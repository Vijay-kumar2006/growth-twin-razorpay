# Original Work and Attributions

This repository, **Growth Twin for Razorpay**, was built as an original, working AI Growth & Agentic Commerce hackathon project. It is built upon the following open-source foundations:

## Foundations
1. **[RazorAgent](https://github.com/Piyush-Thakur7/razoragent)**: Used as the primary TypeScript/Next.js foundation for catalog, MCP, and UI architecture.
2. **[Safe-Cart-AI](https://github.com/Jai-095/safe-cart-ai)**: Inspired the deterministic policy boundaries and merchant approval gating concepts (translated from Python to TypeScript).
3. **[Razorpay MCP Server](https://github.com/razorpay/razorpay-mcp-server)**: Referenced for Razorpay API/tool object definitions.

## Original Contributions
- **Deterministic Mock Razorpay Adapter**: Created `lib/razorpay-adapter.ts` for safe test simulation, ensuring real API keys are not required during demo flows. Includes simulated failure and recovery.
- **Merchant Policy Engine**: Created `lib/policy-engine.ts` to deterministically block unapproved AI intents, enforce maximum discounts, and restrict unauthorized add-ons.
- **Revenue-Aware Bundle Engine**: Created `lib/revenue-bundle.ts` to transparently score and suggest add-ons based on budget headroom, compatibility, and merchant priority without relying on black-box AI logic (XGBoost removed).
- **Append-Only Audit Ledger**: Created `lib/audit-logger.ts` to trace all intent handling, policy evaluations, and payment state transitions.

*Built on open source.*
