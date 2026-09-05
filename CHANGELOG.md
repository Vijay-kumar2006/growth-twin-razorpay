# Changelog

All notable changes to **Growth Twin for Razorpay** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-05 (Growth Twin Initial Release)

### Added (Authored by Vijay Kumar)
* **Revenue-Aware Add-on Scoring Engine (`lib/revenue-bundle.ts`):**
  - Deterministic 100-point formula scoring budget headroom, buyer intent relevance, SKU compatibility, and merchant priority.
* **Deterministic Merchant Policy Engine (`lib/policy-engine.ts`):**
  - Server-side guardrails enforcing 15% discount caps, ₹20,000 unapproved order ceilings, permitted add-on lists, and tag prohibitions.
* **Constraint Trade-off Simulator / Safe Negotiation Mode (`lib/revenue-bundle.ts`):**
  - 3-option conflict resolution engine generating Budget-Strict, Premium, and Count-Optimized alternatives while preserving 100% of hard constraints.
* **Adaptive Payment Recovery Agent (`lib/revenue-bundle.ts`):**
  - Real-time failure interception generating 3 constraint-preserving recovery routes with quote versioning and idempotency latches.
* **11-Tool Model Context Protocol (MCP) Server (`lib/razoragent/mcp-engine.ts`):**
  - Full JSON-RPC 2.0 endpoint exposing commerce tools, trade-offs, and recovery to autonomous AI buyers.
* **Growth Twin Evaluation Lab (`lib/eval/*`, UI dashboard, API):**
  - Seedable PRNG, 8 Level 2 functional scenarios, 10 Level 3 adversarial security vectors, and Counterfactual A/B simulator.
* **Pluggable Razorpay Adapter with Safe Mock Default (`lib/razorpay-adapter.ts`):**
  - Zero-credential default simulation mode with drop-in test API key support.
* **Append-Only Audit Ledger (`lib/audit-logger.ts`):**
  - Immutable lifecycle timeline capturing full intent, policy, and recovery events.

---

## Inherited Upstream Baseline History (RazorAgent by Piyush Singh)

*The following historical changelog entries document the baseline open-source commerce infrastructure from RazorAgent upon which Growth Twin was developed:*

### [1.1.4] - 2026-08-30

#### Added
* **Live Razorpay Hosted Payment Links:**
  - Integrated with Razorpay's `/v1/payment_links` API to generate real, clickable checkout short URLs that open the live Razorpay payment overlay with cards, netbanking, and UPI QR codes.

### [1.1.3] - 2026-08-30

#### Fixed
* **Pluggable Storefront Guardrail Evaluation:**
  - Updated `GuardrailEngine` to properly validate product IDs and stock levels from live Shopify Storefront and WooCommerce APIs.

### [1.1.2] - 2026-08-30

#### Fixed
* **Accurate Status Command SKU Count Display:**
  - Fixed `DemoCatalogProvider` to return all products when query is empty/wildcard.
* **Permissive AI Agent Robots Policy:**
  - Added `public/robots.txt` and `app/robots.ts` allowing AI crawlers and MCP clients on `/` and `/api/razoragent/mcp`.

### [1.1.1] - 2026-08-30

#### Fixed
* **Strict Error Handling in `npx razoragent connect` Wizard:**
  - Added `CatalogConnectionError` across Shopify and WooCommerce providers with clear failure messages.

### [1.1.0] - 2026-08-30

#### Added
* **Pluggable Catalog Architecture (`CatalogProvider` Contract):**
  - Abstracted catalog data access behind a 3-method asynchronous interface (`searchProducts`, `getProductDetails`, `getProviderName`).
* **Shopify Storefront GraphQL Adapter & WooCommerce REST Adapter:**
  - Direct catalog synchronization from Shopify and WooCommerce stores.
* **Interactive Merchant Onboarding Wizard (`npx razoragent connect` & `/connect` UI):**
  - 3-step visual onboarding page for external merchant storefronts.

### [1.0.6] - 2026-08-30

#### Fixed
* **Compiled TypeScript Module Output:**
  - Scoped `tsconfig.build.json` compiling `lib/razoragent/*.ts` into CommonJS and `.d.ts` declaration maps in `dist/`.
* **Zero-Dependency Published Package & GitHub Actions CI:**
  - Standardized dependency layout and CI workflows.
