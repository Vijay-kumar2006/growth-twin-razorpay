# Growth Twin for Razorpay: Code Provenance & Attribution Audit Report

**Date:** September 5, 2026  
**Audited Repository:** `E:\Razorpay\growth-twin-razorpay`  
**Auditor:** Antigravity AI Code Auditor  
**Audit Scope:** Documentation inventory, source repository detection, file-by-file code provenance classification, license compliance analysis, and ownership-safe documentation plan.

---

## 1. Executive Summary

This audit evaluated the codebase at `E:\Razorpay\growth-twin-razorpay` to establish provenance, identify inherited vs. original code, verify open-source license compliance, and provide a documentation plan presenting **Vijay Kumar** as the creator and primary contributor of **Growth Twin for Razorpay**, while strictly adhering to open-source licensing rules (MIT).

### Key Findings
1. **Base Framework (Reused / Adapted):** The project uses the TypeScript/Next.js MCP infrastructure from **RazorAgent** (`https://github.com/Piyush-Thakur7/razoragent`, MIT License, Copyright © 2026 Piyush Singh).
2. **Conceptual Inspiration:** Conceptual patterns for deterministic policy enforcement and approval gating were inspired by **Safe-Cart-AI** (`https://github.com/Jai-095/safe-cart-ai`, Python). Growth Twin re-implemented these as merchant-side revenue policies in TypeScript.
3. **Reference Schemas:** Object definitions for Razorpay payment entities were informed by standard Razorpay conventions and **Razorpay MCP Server** (`https://github.com/razorpay/razorpay-mcp-server`, MIT License, Copyright © 2025 Razorpay).
4. **Original Growth Twin Contributions (Built by Vijay Kumar):**
   - **Revenue-Aware Bundle Engine:** 100-point deterministic headroom and compatibility scoring for add-ons (`lib/revenue-bundle.ts`).
   - **Constraint Trade-off Simulator (Safe Negotiation Mode):** 3-option conflict resolution engine that strictly preserves 100% of hard constraints (`lib/revenue-bundle.ts`).
   - **Adaptive Payment Recovery Agent:** Deterministic 3-route failure recovery with versioned idempotency latching (`lib/revenue-bundle.ts`).
   - **Deterministic Merchant Policy Engine:** Server-side discount caps, unapproved order ceilings, and tag prohibitions (`lib/policy-engine.ts`).
   - **Growth Twin Evaluation Lab:** Deterministic PRNG, 8 Level 2 MCP scenarios, 10 Level 3 adversarial attack vectors, and paired Counterfactual A/B Simulator (`lib/eval/*`, `components/razoragent/EvaluationLab.tsx`, `scripts/test-eval.ts`).
   - **Pluggable Razorpay Adapter:** Safe mock simulation default with drop-in test API capability (`lib/razorpay-adapter.ts`).
   - **Append-Only Audit Ledger:** Immutable event-sourced audit logger (`lib/audit-logger.ts`).

---

## 2. Documentation Inventory

| File Path | Mentions Source Repositories? | Mentions Vijay/Project Ownership? | Contains Copied Upstream Wording? | Required Action |
|---|---|---|---|---|
| `README.md` | Yes (Credits RazorAgent, Safe-Cart-AI, Razorpay MCP Server) | Partially (Lists `Vijay-kumar2006` in clone URL; does not have explicit author header) | No (Written specifically for Growth Twin) | **Update:** Add clear creator header for Vijay Kumar; maintain attribution section. |
| `ORIGINAL_WORK.md` | Yes (Lists RazorAgent, Safe-Cart-AI, Razorpay MCP Server) | No | No | **Update / Migrate:** Consolidate into a standardized `THIRD-PARTY-NOTICES.md` and `README.md`. |
| `LICENSE` | Yes (`Copyright (c) 2026 Piyush Singh (Resence)`) | No | Yes (Inherited MIT license text) | **Keep Intact:** Must be preserved per MIT license requirements. Can be supplemented with a Dual/Joint copyright notice or `THIRD-PARTY-NOTICES.md`. |
| `CONTRIBUTING.md` | Yes (`RazorAgent by Resence`, `Piyush-Thakur7/razoragent`) | No | Yes (Unchanged upstream file from RazorAgent) | **Rewrite:** Update project name to Growth Twin for Razorpay, repo URL to `Vijay-kumar2006/growth-twin-razorpay`. |
| `CHANGELOG.md` | Yes (`RazorAgent by Resence`, versions 1.0.6–1.1.4) | No | Yes (Inherited from RazorAgent) | **Update:** Add Growth Twin v1.0.0 release log at the top, preserving past version history as upstream baseline. |
| `package.json` | Yes (Author: `Piyush Singh`, repo: `Piyush-Thakur7/razoragent`) | Yes (`homepage: Vijay-kumar2006/growth-twin-razorpay`) | Partially (Inherited author and repository fields) | **Update:** Set `author: "Vijay Kumar"`, `repository.url: "https://github.com/Vijay-kumar2006/growth-twin-razorpay.git"`. |
| `docs/api-contract.md` | No | No | No (Original Growth Twin API contract) | **Keep / Minor Polish:** Original Growth Twin specification. |
| `docs/architecture.md` | No | No | No (Original Growth Twin architecture) | **Keep / Minor Polish:** Original Growth Twin specification. |
| `docs/demo-script.md` | No | No | No (Original 4-minute demo script) | **Keep / Minor Polish:** Original Growth Twin script. |
| `public/robots.txt` | No | No | No | **Keep Intact.** |

---

## 3. Source-Reference Search Results

### Git Status & Commit History
- **Git Origin:** `https://github.com/Vijay-kumar2006/growth-twin-razorpay.git`
- **Initial Commit (`0ec138e`):** `Author: Vijay Kumar <vijaykumar@example.com>` titled `"feat: create Growth Twin merchant revenue agent"`.
- **Subsequent Commits:** Selection readiness pass (`5f32449`), Constraint Trade-off Simulator (`4bbc243`), Adaptive Payment Recovery agent (`3a6989f`), and Evaluation Lab.

### Specific Source Mentions Found in Codebase:
1. `Piyush-Thakur7/razoragent` & `Piyush Singh`:
   - `README.md` (Line 183): Attributed as base Next.js/TypeScript architecture.
   - `ORIGINAL_WORK.md` (Line 6): Attributed as TypeScript/Next.js foundation.
   - `package.json` (Line 40 & 44): Inherited author and repository URL.
   - `LICENSE` (Line 3): Inherited MIT copyright holder.
   - `CONTRIBUTING.md` (Line 3 & 16): Inherited setup guide.
   - `components/razoragent/IntegrationDocsModal.tsx` (Line 138): Static footer string.
2. `Jai-095/safe-cart-ai`:
   - `README.md` (Line 184): Attributed for deterministic policy boundaries.
   - `ORIGINAL_WORK.md` (Line 7): Attributed for policy concepts.
3. `razorpay/razorpay-mcp-server`:
   - `README.md` (Line 185): Attributed for Razorpay API/tool schemas.
   - `ORIGINAL_WORK.md` (Line 8): Attributed for object definitions.

---

## 4. File-by-File Provenance Classification

### Classification Scheme:
- **ORIGINAL:** Created specifically for Growth Twin with original algorithms, data models, or evaluation harnesses.
- **ADAPTED:** Structure, naming, or implementation materially modified from upstream to incorporate Growth Twin capabilities.
- **REUSED UNCHANGED:** Inherited without significant modification from the base repository.
- **UNKNOWN:** Insufficient evidence (none in this audit).

### Detailed File Classification Table

| File Path | Suspected Source | Evidence | Classification | Confidence |
|---|---|---|---|---|
| **Core Growth Twin Engines** | | | | |
| `lib/revenue-bundle.ts` | Growth Twin Original | 100-pt scoring formula, Constraint Trade-off Simulator, Adaptive Payment Recovery agent | **ORIGINAL** | High |
| `lib/policy-engine.ts` | Growth Twin Original (conceptually inspired by Safe-Cart-AI) | TypeScript merchant policy evaluation, discount limits, unapproved order ceilings | **ORIGINAL** | High |
| `lib/razorpay-adapter.ts` | Growth Twin Original | Pluggable typed interface, deterministic mock mode, test API fallback | **ORIGINAL** | High |
| `lib/audit-logger.ts` | Growth Twin Original | Append-only event store, lifecycle audit trail | **ORIGINAL** | High |
| **Evaluation Lab Suite (`lib/eval/`)** | | | | |
| `lib/eval/deterministic-prng.ts` | Growth Twin Original | Mulberry32 seedable PRNG algorithm | **ORIGINAL** | High |
| `lib/eval/synthetic-generator.ts` | Growth Twin Original | Deterministic synthetic catalog, intent, and outcome generator | **ORIGINAL** | High |
| `lib/eval/level2-scenario-eval.ts` | Growth Twin Original | 8 Level 2 functional scenarios via live MCP tool interface | **ORIGINAL** | High |
| `lib/eval/level3-adversarial-eval.ts` | Growth Twin Original | 10 Level 3 adversarial vector defense tests | **ORIGINAL** | High |
| `lib/eval/counterfactual-ab-simulator.ts` | Growth Twin Original | Paired Control A vs Treatment B counterfactual simulator | **ORIGINAL** | High |
| `lib/eval/evaluation-runner.ts` | Growth Twin Original | Unified evaluation runner and report aggregator | **ORIGINAL** | High |
| `lib/eval/types.ts` | Growth Twin Original | Invariant specifications, metric definitions, sandbox formulas | **ORIGINAL** | High |
| `lib/eval/index.ts` | Growth Twin Original | Module barrel exports | **ORIGINAL** | High |
| **MCP & Gateway Engine (`lib/razoragent/`)** | | | | |
| `lib/razoragent/mcp-engine.ts` | RazorAgent + Growth Twin | Extended from 6 base tools to 11 MCP tools (added trade-offs, recovery, bundle scoring, growth policy) | **ADAPTED** | High |
| `lib/razoragent/guardrails.ts` | RazorAgent + Growth Twin | Base spend limit checks extended with positive integer quantity bounds | **ADAPTED** | High |
| `lib/razoragent/catalog-data.ts` | RazorAgent + Growth Twin | Extended from 28 tech SKUs to 39 multi-category SKUs (gourmet, hampers, add-ons) | **ADAPTED** | High |
| `lib/razoragent/types.ts` | RazorAgent + Growth Twin | Base commerce types extended with Growth Twin quote, policy, and recovery types | **ADAPTED** | High |
| `lib/razoragent/index.ts` | RazorAgent + Growth Twin | Re-exports RazorAgent and Growth Twin core functions | **ADAPTED** | High |
| `lib/razoragent/idempotency.ts` | RazorAgent | SHA-256 idempotency latch and pending promise mutex | **REUSED UNCHANGED** | High |
| `lib/razoragent/catalog-provider.ts` | RazorAgent | 3-method asynchronous catalog provider interface | **REUSED UNCHANGED** | High |
| `lib/razoragent/shopify-catalog-provider.ts` | RazorAgent | Shopify Storefront GraphQL client | **REUSED UNCHANGED** | High |
| `lib/razoragent/woocommerce-catalog-provider.ts` | RazorAgent | WooCommerce REST API client | **REUSED UNCHANGED** | High |
| `lib/razoragent/razorpay.ts` | RazorAgent | Direct Razorpay order creation and signature verifier | **REUSED UNCHANGED** | High |
| `lib/razoragent/agent-engine.ts` | RazorAgent | Baseline autonomous buyer simulation loop | **REUSED UNCHANGED** | High |
| `lib/razoragent/test-suite.ts` | RazorAgent | Baseline 6-scenario benchmark suite | **REUSED UNCHANGED** | High |
| **Web Routes (`app/`)** | | | | |
| `app/api/razoragent/eval/route.ts` | Growth Twin Original | Dedicated Evaluation Lab API route | **ORIGINAL** | High |
| `app/api/razoragent/mcp/route.ts` | RazorAgent + Growth Twin | Serves 11 MCP tools over JSON-RPC 2.0 | **ADAPTED** | High |
| `app/razoragent/page.tsx` | RazorAgent + Growth Twin | Extended with Policy Inspector, Explainable Bundle, Trade-offs, Recovery, Evaluation Lab | **ADAPTED** | High |
| `app/connect/page.tsx` | RazorAgent | Storefront onboarding wizard | **REUSED UNCHANGED** | High |
| `app/api/razoragent/*` (others) | RazorAgent | Baseline catalog, order, and simulation endpoints | **REUSED UNCHANGED** | High |
| `app/globals.css`, `app/layout.tsx` | RazorAgent + Growth Twin | Theme and styling tokens | **ADAPTED** | High |
| **Frontend Components (`components/razoragent/`)** | | | | |
| `components/razoragent/EvaluationLab.tsx` | Growth Twin Original | Full Evaluation Lab UI dashboard | **ORIGINAL** | High |
| `components/razoragent/DeveloperDrawer.tsx` | Growth Twin Original | Sliding drawer linking to Growth Twin repo and Vijay Kumar profile | **ORIGINAL** | High |
| `components/razoragent/AgentTerminal.tsx` | RazorAgent + Growth Twin | Augmented with structured quote breakdown, trade-off selectors, and recovery buttons | **ADAPTED** | High |
| `components/razoragent/Navbar.tsx` | RazorAgent + Growth Twin | Branded as Growth Twin for Razorpay with Evaluation Lab navigation | **ADAPTED** | High |
| `components/razoragent/PolicyInspector.tsx` | RazorAgent + Growth Twin | Displays merchant policy parameters and discount bounds | **ADAPTED** | High |
| `components/razoragent/WebhookStream.tsx` | RazorAgent + Growth Twin | Augmented with audit lifecycle events | **ADAPTED** | High |
| `components/razoragent/OrderReceiptCard.tsx` | RazorAgent + Growth Twin | Added quote version badges and recovery tags | **ADAPTED** | High |
| `components/razoragent/RazorpayCheckoutModal.tsx` | RazorAgent + Growth Twin | Added mock simulation mode handling | **ADAPTED** | High |
| `components/razoragent/MerchantCatalogView.tsx` | RazorAgent + Growth Twin | Added add-on tag indicators and priority badges | **ADAPTED** | High |
| `components/razoragent/MerchantAnalytics.tsx` | RazorAgent + Growth Twin | Added AOV expansion and recovered revenue stats | **ADAPTED** | High |
| `components/razoragent/BenchmarkModal.tsx` | RazorAgent | Baseline 6-scenario benchmark modal | **REUSED UNCHANGED** | High |
| `components/razoragent/ConnectStoreModal.tsx` | RazorAgent | Storefront connection modal | **REUSED UNCHANGED** | High |
| `components/razoragent/IntegrationDocsModal.tsx` | RazorAgent | Integration docs modal | **REUSED UNCHANGED** | High |
| **Scripts & Executables** | | | | |
| `scripts/test-eval.ts` | Growth Twin Original | Comprehensive test runner for Evaluation Lab | **ORIGINAL** | High |
| `scripts/test-core.ts` | Growth Twin Original | Unit tests for bundle scoring, policy engine, and payment recovery | **ORIGINAL** | High |
| `scripts/test-mcp-direct.ts` | Growth Twin Original | Direct JSON-RPC test script for all 11 MCP tools | **ORIGINAL** | High |
| `scripts/test-razoragent.ts` | RazorAgent | Verification runner for base RazorAgent test suite | **REUSED UNCHANGED** | High |
| `bin/cli.js` | RazorAgent | Standalone CLI utility (`npx razoragent`) | **REUSED UNCHANGED** | High |

---

## 5. License & Attribution Review

### 1. Licenses of Upstream Sources
- **RazorAgent:** MIT License (`Copyright (c) 2026 Piyush Singh (Resence)`).
  - *Requirement:* Must retain the copyright notice and permission notice in all copies or substantial portions of the software.
- **Razorpay MCP Server:** MIT License (`Copyright (c) 2025 Razorpay`).
  - *Requirement:* Standard MIT notice retention for referenced schemas.
- **Safe-Cart-AI:** Open-source Python repository (Jai-095). Concepts ported to TypeScript.
  - *Requirement:* Attribution in documentation/notices.

### 2. Current Compliance State
- The root `LICENSE` file currently contains the MIT License with `Copyright (c) 2026 Piyush Singh (Resence)`. This **fully satisfies** the MIT requirement for the inherited code.
- `README.md` and `ORIGINAL_WORK.md` already contain an explicit `"Built on Open Source"` / `"Foundations"` section citing RazorAgent, Safe-Cart-AI, and Razorpay MCP Server with direct hyperlinks.
- **No legal notices were stripped or violated.**

### 3. Missing or Ambiguous Elements
- `package.json` currently lists `author: "Piyush Singh (Resence)"` and `repository.url: "https://github.com/Piyush-Thakur7/razoragent.git"`. These should be updated to list **Vijay Kumar** as the project author and repository owner, while referencing upstream foundations in a dedicated `THIRD-PARTY-NOTICES.md` or `NOTICE.md`.
- `CONTRIBUTING.md` still refers to the upstream repository rather than `Vijay-kumar2006/growth-twin-razorpay`.
- The top of `README.md` should clearly present **Vijay Kumar** as the creator/lead developer of Growth Twin for Razorpay.

---

## 6. Ownership-Safe Documentation Plan

> **Important Rule:** Do not delete copyright notices or licenses. Instead, cleanly distinguish Vijay Kumar’s original Growth Twin contributions from the inherited open-source infrastructure.

### A. Proposed README Updates
1. **Header & Creator Attribution:**
   Add a clear creator callout at the top of `README.md`:
   ```markdown
   # Growth Twin for Razorpay
   
   **Created by:** Vijay Kumar ([@Vijay-kumar2006](https://github.com/Vijay-kumar2006))  
   **Repository:** [https://github.com/Vijay-kumar2006/growth-twin-razorpay](https://github.com/Vijay-kumar2006/growth-twin-razorpay)
   ```
2. **Clear Architecture Division:**
   Explicitly delineate:
   - **Original Growth Twin Innovations:** Revenue-Aware Add-on Engine, Constraint Trade-off Simulator (Safe Negotiation Mode), Adaptive Payment Recovery Agent, Deterministic Merchant Policy Engine, Evaluation Lab (Level 2/3 & Counterfactual A/B), Pluggable Mock Adapter, and Append-Only Audit Trail.
   - **Reused Open-Source Foundation:** Base MCP JSON-RPC routing, Shopify/WooCommerce catalog providers, and cryptographic idempotency scaffolding from `razoragent`.

### B. Standardized Attribution File (`THIRD-PARTY-NOTICES.md`)
Create a dedicated `THIRD-PARTY-NOTICES.md` file that captures all upstream licenses and credits:
```markdown
# Third-Party Notices & Open Source Attributions

Growth Twin for Razorpay incorporates code and architectural concepts from the following open-source projects:

## 1. RazorAgent
- **Repository:** https://github.com/Piyush-Thakur7/razoragent
- **Author:** Piyush Singh (Resence)
- **License:** MIT License
- **Copyright:** Copyright (c) 2026 Piyush Singh (Resence)
- **Usage:** TypeScript MCP server baseline, catalog provider interfaces, and frontend dashboard components.

## 2. Safe-Cart-AI
- **Repository:** https://github.com/Jai-095/safe-cart-ai
- **Author:** Jai
- **Usage:** Conceptual inspiration for deterministic spend policies and human approval boundaries.

## 3. Razorpay MCP Server
- **Repository:** https://github.com/razorpay/razorpay-mcp-server
- **Copyright:** Copyright (c) 2025 Razorpay
- **License:** MIT License
- **Usage:** Reference object schemas for Razorpay payments and orders.
```

### C. Files That Must NOT Be Changed (Protected Legal Notices)
- **`LICENSE`**: Must retain the MIT text and preserve the existing copyright notice for upstream components. A joint copyright line (e.g., `Copyright (c) 2026 Vijay Kumar (Growth Twin contributions)` alongside `Copyright (c) 2026 Piyush Singh (Base infrastructure)`) may be added.

### D. Files That May Be Updated for Product Positioning
- **`package.json`**:
  - `name`: `"growth-twin-razorpay"`
  - `author`: `"Vijay Kumar <vijaykumar@example.com>"`
  - `repository`: `{"type": "git", "url": "https://github.com/Vijay-kumar2006/growth-twin-razorpay.git"}`
  - `homepage`: `"https://github.com/Vijay-kumar2006/growth-twin-razorpay"`
- **`CONTRIBUTING.md`**: Update clone URLs and contribution guidelines to reference `growth-twin-razorpay`.
- **`CHANGELOG.md`**: Prepend Growth Twin v1.0.0 release notes while preserving legacy 1.0.6–1.1.4 history.

---

## 7. Final Recommendation & Statement of Provenance

The project **can honestly and accurately be described as:**

> **“Built by Vijay Kumar, featuring original Growth Twin agentic revenue features (Revenue-Aware Add-on Engine, Constraint Trade-off Simulator, Adaptive Payment Recovery Agent, Deterministic Policy Engine, and Evaluation Lab) implemented on top of adapted open-source MCP and catalog infrastructure (RazorAgent by Piyush Singh, with concepts from Safe-Cart-AI and Razorpay MCP Server).”**

This description is:
1. **Factually accurate:** It gives full credit to Vijay Kumar for creating all Growth Twin features and architecture.
2. **Legally compliant:** It fully respects MIT license terms and preserves upstream copyright and attribution notices.
3. **Transparent to hackathon judges & merchants:** It makes clear what was built originally and what was leveraged from open-source building blocks.

> **Audit Conclusion:** No obvious attribution or documentation issues were identified in this repository audit. License obligations should be reviewed by the project owner or legal counsel where necessary.

---
*End of Provenance Audit Report.*
