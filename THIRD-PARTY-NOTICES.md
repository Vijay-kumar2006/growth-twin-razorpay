# Third-Party Notices & Open-Source Attributions

This project, **Growth Twin for Razorpay**, incorporates code, schemas, and architectural concepts from the open-source community. In accordance with open-source license obligations, the required copyright and permission notices are documented below.

---

## 1. RazorAgent

- **Project:** RazorAgent — Bounded MCP Commerce & Settlement Gateway
- **Repository:** [https://github.com/Piyush-Thakur7/razoragent](https://github.com/Piyush-Thakur7/razoragent)
- **Author:** Piyush Singh (Resence)
- **License:** MIT License
- **Copyright:** `Copyright (c) 2026 Piyush Singh (Resence)`
- **Components Adapted / Reused:** Base Next.js/TypeScript project scaffolding, core MCP JSON-RPC routing, SHA-256 idempotency manager (`lib/razoragent/idempotency.ts`), pluggable catalog provider interfaces (`ShopifyCatalogProvider`, `WooCommerceCatalogProvider`), and baseline UI components.

### License Notice (MIT):
```
MIT License

Copyright (c) 2026 Piyush Singh (Resence)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 2. Safe-Cart-AI

- **Project:** Safe-Cart-AI — A Safety and Monitoring Layer for AI-Powered Commerce
- **Repository:** [https://github.com/Jai-095/safe-cart-ai](https://github.com/Jai-095/safe-cart-ai)
- **Author:** Jai (@Jai-095)
- **Components / Concepts Referenced:** Conceptual inspiration for deterministic policy boundaries, human approval gating for high-value transactions, and safety-checking buyer requests prior to financial action.

---

## 3. Razorpay MCP Server

- **Project:** Razorpay MCP Server
- **Repository:** [https://github.com/razorpay/razorpay-mcp-server](https://github.com/razorpay/razorpay-mcp-server)
- **Author:** Razorpay Software Private Limited
- **License:** MIT License
- **Copyright:** `Copyright (c) 2025 Razorpay`
- **Components / Concepts Referenced:** Model Context Protocol (MCP) tool schema definitions for Razorpay payment and order representations.

### License Notice (MIT):
```
MIT License

Copyright (c) 2025 Razorpay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 4. Growth Twin Original Contributions

The following components are original works authored specifically for **Growth Twin for Razorpay** by **Vijay Kumar**:
- **Revenue-Aware Add-on Engine:** Transparent 100-point scoring algorithm (`lib/revenue-bundle.ts`).
- **Deterministic Merchant Policy Engine:** Hard spend limits, discount caps, and approval gating (`lib/policy-engine.ts`).
- **Constraint Trade-off Simulator:** Safe negotiation mode preserving 100% of hard constraints (`lib/revenue-bundle.ts`).
- **Adaptive Payment Recovery Agent:** 3-route failure recovery with quote versioning (`lib/revenue-bundle.ts`).
- **Synthetic Evaluation Lab:** Deterministic PRNG, Level 2 MCP scenarios, Level 3 adversarial matrix, and Counterfactual A/B simulator (`lib/eval/*`).
- **Pluggable Razorpay Adapter:** Safe mock simulation default with test API fallback (`lib/razorpay-adapter.ts`).
- **Append-Only Audit Ledger:** Immutable lifecycle ledger (`lib/audit-logger.ts`).
