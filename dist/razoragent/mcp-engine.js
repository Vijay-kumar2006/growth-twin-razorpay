"use strict";
/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 *
 * Powered by a pluggable Merchant-Agnostic Catalog Architecture (Shopify, WooCommerce, Demo).
 * Extended with Growth Twin deterministic revenue & policy tools.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMCPRequest = exports.globalMCPEngine = exports.MCPEngine = exports.MCP_TOOLS = void 0;
const catalog_data_1 = require("./catalog-data");
const shopify_catalog_provider_1 = require("./shopify-catalog-provider");
const woocommerce_catalog_provider_1 = require("./woocommerce-catalog-provider");
const guardrails_1 = require("./guardrails");
const idempotency_1 = require("./idempotency");
const razorpay_1 = require("./razorpay");
const policy_engine_1 = require("../policy-engine");
const revenue_bundle_1 = require("../revenue-bundle");
const audit_logger_1 = require("../audit-logger");
// Active cart session cache
const CART_STORE = new Map();
// Pending promise map to handle exact same-tick async race conditions
const PENDING_ORDER_PROMISES = new Map();
const GROWTH_QUOTE_STORE = new Map();
exports.MCP_TOOLS = [
    {
        name: 'search_products',
        description: 'Search the merchant catalog using semantic keywords, category filters, maximum price, and minimum review ratings.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search keywords (e.g., "mechanical keyboard", "espresso beans", "anc headphones")' },
                category: { type: 'string', description: 'Category filter (e.g., "electronics", "wellness", "specialty-coffee")' },
                max_price: { type: 'number', description: 'Maximum price in INR (₹)' },
                min_rating: { type: 'number', description: 'Minimum average customer rating (1.0 to 5.0)' },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_product_details',
        description: 'Retrieve full technical specs, real-time inventory count, and applicable coupon codes for a specific SKU.',
        parameters: {
            type: 'object',
            properties: {
                product_id: { type: 'string', description: 'The unique product ID (e.g. "prod_kb_01")' },
            },
            required: ['product_id'],
        },
    },
    {
        name: 'calculate_cart_quote',
        description: 'Calculates the subtotal, taxes (18% GST), shipping fees, and coupon discounts for a list of items, returning a signed CartQuote.',
        parameters: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    description: 'List of items to quote',
                    items: {
                        type: 'object',
                        properties: {
                            product_id: { type: 'string' },
                            quantity: { type: 'number' },
                        },
                        required: ['product_id', 'quantity'],
                    },
                },
                coupon_code: { type: 'string', description: 'Optional promo or discount code' },
            },
            required: ['items'],
        },
    },
    {
        name: 'evaluate_spend_policy',
        description: 'Runs deterministic merchant safety guardrails on the cart to verify compliance with spend limits, SKU caps, and whitelist rules.',
        parameters: {
            type: 'object',
            properties: {
                cart_id: { type: 'string', description: 'The unique cart ID from calculate_cart_quote' },
            },
            required: ['cart_id'],
        },
    },
    {
        name: 'create_guarded_order',
        description: 'Creates a Razorpay Order protected by cryptographic SHA-256 idempotency locks and pre-settlement spend guardrails. Strictly rejects unapproved high-value/discounted orders.',
        parameters: {
            type: 'object',
            properties: {
                cart_id: { type: 'string', description: 'The approved cart quote ID' },
                idempotency_key: { type: 'string', description: 'Unique agent session transaction token' },
                buyer_email: { type: 'string', description: 'Principal buyer email address' },
            },
            required: ['cart_id', 'idempotency_key'],
        },
    },
    {
        name: 'verify_payment_and_settle',
        description: 'Verifies the cryptographic HMAC SHA-256 signature from Razorpay checkout and transitions order to SETTLED.',
        parameters: {
            type: 'object',
            properties: {
                order_id: { type: 'string', description: 'Razorpay Order ID (e.g. order_xxx)' },
                payment_id: { type: 'string', description: 'Razorpay Payment ID (e.g. pay_xxx)' },
                signature: { type: 'string', description: 'Cryptographic HMAC signature from Razorpay checkout' },
            },
            required: ['order_id', 'payment_id', 'signature'],
        },
    },
    // Growth Twin Tools
    {
        name: 'recommend_addons',
        description: 'Calls the deterministic revenue-bundle engine to score and recommend compliant add-ons based on buyer budget headroom, compatibility, relevance, and merchant policy.',
        parameters: {
            type: 'object',
            properties: {
                base_product_ids: {
                    type: 'array',
                    description: 'List of base product IDs in cart',
                    items: { type: 'string' },
                },
                budget: { type: 'number', description: 'Total buyer budget in INR' },
                quantity: { type: 'number', description: 'Target quantity for each hamper/item' },
                requested_tags: {
                    type: 'array',
                    description: 'Buyer requested tags/preferences (e.g., ["jain", "note", "priority_shipping"])',
                    items: { type: 'string' },
                },
            },
            required: ['base_product_ids', 'budget', 'quantity'],
        },
    },
    {
        name: 'evaluate_merchant_growth_policy',
        description: 'Calls the server-side Growth Twin deterministic policy engine to verify quote compliance, maximum discount limits, high-value thresholds, and explicit approval requirements.',
        parameters: {
            type: 'object',
            properties: {
                cart_id: { type: 'string', description: 'Optional cart quote ID to evaluate' },
                base_value: { type: 'number', description: 'Base items total in INR' },
                addons_value: { type: 'number', description: 'Add-ons total in INR' },
                discount_percentage: { type: 'number', description: 'Discount percentage requested' },
                addon_ids: {
                    type: 'array',
                    description: 'Selected add-on IDs',
                    items: { type: 'string' },
                },
                product_tags: {
                    type: 'array',
                    description: 'Product tags of base items',
                    items: { type: 'string' },
                },
                has_explicit_approval: { type: 'boolean', description: 'Whether human/buyer explicitly approved the exact quote' },
            },
            required: [],
        },
    },
    {
        name: 'get_commerce_contract',
        description: 'Returns the machine-readable Growth Twin merchant commerce contract: catalog items, policy limits, allowed add-ons, quote terms, payment states, and approval rules.',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
];
class MCPEngine {
    constructor(customProvider) {
        this.growthPolicy = policy_engine_1.defaultPolicy;
        if (customProvider) {
            this.catalogProvider = customProvider;
        }
        else if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
            this.catalogProvider = new shopify_catalog_provider_1.ShopifyCatalogProvider();
        }
        else if (process.env.WOOCOMMERCE_SITE_URL && process.env.WOOCOMMERCE_CONSUMER_KEY) {
            this.catalogProvider = new woocommerce_catalog_provider_1.WooCommerceCatalogProvider();
        }
        else {
            this.catalogProvider = catalog_data_1.globalDemoCatalogProvider;
        }
    }
    setCatalogProvider(provider) {
        this.catalogProvider = provider;
    }
    getCatalogProvider() {
        return this.catalogProvider;
    }
    getGrowthPolicy() {
        return { ...this.growthPolicy };
    }
    updateGrowthPolicy(newPolicy) {
        this.growthPolicy = { ...this.growthPolicy, ...newPolicy };
    }
    listTools() {
        return exports.MCP_TOOLS;
    }
    async executeTool(toolName, args) {
        switch (toolName) {
            case 'search_products':
                return this.searchProducts(args.query, args.category, args.max_price, args.min_rating);
            case 'get_product_details':
                return this.getProductDetails(args.product_id);
            case 'calculate_cart_quote':
                return this.calculateCartQuote(args.items, args.coupon_code, args.has_explicit_approval);
            case 'evaluate_spend_policy':
                return this.evaluateSpendPolicy(args.cart_id);
            case 'create_guarded_order':
                return this.createGuardedOrder(args.cart_id, args.idempotency_key, args.buyer_email);
            case 'verify_payment_and_settle':
                return this.verifyPaymentAndSettle(args.order_id, args.payment_id, args.signature);
            // Growth Twin tools
            case 'recommend_addons':
                return this.recommendAddons(args.base_product_ids, args.budget, args.quantity, args.requested_tags || []);
            case 'evaluate_merchant_growth_policy':
                return this.evaluateGrowthPolicy(args);
            case 'get_commerce_contract':
                return this.getCommerceContract();
            default:
                throw new Error(`Unknown MCP Tool: ${toolName}`);
        }
    }
    async searchProducts(query, category, maxPrice, minRating) {
        const products = await this.catalogProvider.searchProducts(query, { category, maxPrice, minRating });
        return {
            query,
            count: products.length,
            provider: this.catalogProvider.getProviderName(),
            products: products.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price_inr: p.price,
                rating: p.rating,
                stock_available: p.stock,
                tags: p.tags,
            })),
        };
    }
    async getProductDetails(productId) {
        const item = await this.catalogProvider.getProductDetails(productId);
        if (!item) {
            return { error: 'PRODUCT_NOT_FOUND', message: `No product found matching ID: ${productId}` };
        }
        return {
            ...item,
            price_inr: item.price,
            currency: 'INR',
            provider: this.catalogProvider.getProviderName(),
        };
    }
    async calculateCartQuote(items, couponCode, hasExplicitApproval = false) {
        const cartItems = [];
        let subtotal = 0;
        const baseIds = [];
        const addonIds = [];
        const productTags = [];
        for (const reqItem of items) {
            const product = await this.catalogProvider.getProductDetails(reqItem.product_id);
            if (!product)
                continue;
            const qty = Math.max(1, reqItem.quantity || 1);
            const lineTotal = product.price * qty;
            subtotal += lineTotal;
            if (product.tags.includes('addon') || reqItem.product_id.startsWith('addon_')) {
                addonIds.push(product.id);
            }
            else {
                baseIds.push(product.id);
            }
            if (product.tags) {
                productTags.push(...product.tags);
            }
            cartItems.push({
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                quantity: qty,
                subtotal: lineTotal,
            });
        }
        // Apply coupon if valid
        let discount = 0;
        let appliedCoupon = undefined;
        if (couponCode && catalog_data_1.AVAILABLE_COUPONS[couponCode]) {
            const rule = catalog_data_1.AVAILABLE_COUPONS[couponCode];
            if (subtotal >= rule.minSpendINR) {
                if (rule.flatDiscountINR) {
                    discount = Math.min(rule.flatDiscountINR, subtotal);
                }
                else if (rule.discountPercent) {
                    discount = Math.round((subtotal * rule.discountPercent) / 100);
                }
                appliedCoupon = couponCode;
            }
        }
        const discountedSubtotal = Math.max(0, subtotal - discount);
        const tax = Math.round(discountedSubtotal * 0.18); // 18% GST
        const shipping = discountedSubtotal > 2000 ? 0 : 99; // Free shipping over ₹2000
        const totalAmount = discountedSubtotal + tax + shipping;
        const cartId = `cart_${Math.random().toString(36).substring(2, 10)}`;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const quote = {
            cartId,
            items: cartItems,
            subtotal,
            discount,
            couponApplied: appliedCoupon,
            tax,
            shipping,
            totalAmount,
            currency: 'INR',
            expiresAt,
        };
        // Cache cart quote for deterministic policy evaluation & order generation
        CART_STORE.set(cartId, quote);
        // Track Growth Twin metadata
        const discountPct = subtotal > 0 ? (discount / subtotal) * 100 : 0;
        GROWTH_QUOTE_STORE.set(cartId, {
            quoteId: cartId,
            cartQuote: quote,
            baseItemIds: baseIds,
            addonItemIds: addonIds,
            productTags,
            discountPercentage: discountPct,
            hasExplicitApproval,
            approvalVersion: hasExplicitApproval ? 1 : 0,
            approvedAt: hasExplicitApproval ? new Date().toISOString() : undefined,
            expiresAt,
        });
        audit_logger_1.globalAuditLogger.log('QUOTE_CREATED', {
            cartId,
            totalAmount,
            itemCount: cartItems.length,
            hasExplicitApproval,
        });
        return quote;
    }
    evaluateSpendPolicy(cartId) {
        const cart = CART_STORE.get(cartId);
        if (!cart) {
            return {
                allowed: false,
                reasonCode: 'CART_EXPIRED',
                message: `Cart quote "${cartId}" is invalid or has expired. Request a new quote before proceeding.`,
                evaluatedAt: new Date().toISOString(),
            };
        }
        // Step 1: Base guardrail evaluation
        const guardrailDecision = guardrails_1.globalGuardrailEngine.evaluate(cart);
        if (!guardrailDecision.allowed) {
            return guardrailDecision;
        }
        // Step 2: Growth Twin Deterministic Policy evaluation
        const growthQuote = GROWTH_QUOTE_STORE.get(cartId);
        if (growthQuote) {
            const quoteReq = {
                baseValue: cart.subtotal,
                addonsValue: 0,
                discountPercentage: growthQuote.discountPercentage,
                addonIds: growthQuote.addonItemIds,
                productTags: growthQuote.productTags,
                buyerConstraints: {},
                hasExplicitApproval: growthQuote.hasExplicitApproval,
            };
            const growthCheck = (0, policy_engine_1.evaluatePolicy)(quoteReq, this.growthPolicy);
            audit_logger_1.globalAuditLogger.log('POLICY_CHECK', {
                cartId,
                growthCheck,
            });
            if (!growthCheck.isCompliant) {
                return {
                    allowed: false,
                    reasonCode: 'CATEGORY_PROHIBITED',
                    message: `Growth policy violation: ${growthCheck.reasons.join('; ')}`,
                    evaluatedAt: new Date().toISOString(),
                    metadata: { growthCheck },
                };
            }
            if (growthCheck.requiresApproval && !growthQuote.hasExplicitApproval) {
                return {
                    allowed: false,
                    reasonCode: 'HUMAN_APPROVAL_REQUIRED',
                    message: `Approval Gating: Quote ${cartId} requires explicit merchant/buyer approval before order creation (${growthCheck.reasons.join(', ')}).`,
                    evaluatedAt: new Date().toISOString(),
                    metadata: { growthCheck },
                };
            }
        }
        return guardrailDecision;
    }
    async createGuardedOrder(cartId, idempotencyKey, buyerEmail = 'buyer.agent@resence.in') {
        const cart = CART_STORE.get(cartId);
        if (!cart) {
            const decision = {
                allowed: false,
                reasonCode: 'CART_EXPIRED',
                message: `Cart quote "${cartId}" has expired.`,
                evaluatedAt: new Date().toISOString(),
            };
            return { success: false, decision, isCached: false, mode: 'mock', label: 'Demo/Test Simulation' };
        }
        // Step 1: Pre-settlement deterministic guardrails & Growth policy approval gating
        const policyDecision = this.evaluateSpendPolicy(cartId);
        if (!policyDecision.allowed) {
            audit_logger_1.globalAuditLogger.log('PAYMENT_ATTEMPT', {
                cartId,
                success: false,
                reason: policyDecision.message,
            });
            return { success: false, decision: policyDecision, isCached: false, mode: 'mock', label: 'Demo/Test Simulation' };
        }
        // Step 2: Canonical fingerprint hash for same-tick async race-condition defense
        const fingerprint = idempotency_1.globalIdempotencyManager.generateFingerprint('agent_buyer_01', cart);
        const concurrencyKey = `lock_${fingerprint}`;
        if (PENDING_ORDER_PROMISES.has(concurrencyKey)) {
            const existingPromise = PENDING_ORDER_PROMISES.get(concurrencyKey);
            const cachedOrder = await existingPromise;
            return { success: true, decision: policyDecision, order: cachedOrder, isCached: true, mode: 'mock', label: 'Demo/Test Simulation' };
        }
        // Step 3: Check memory-cached idempotency lock
        const lockResult = idempotency_1.globalIdempotencyManager.acquireLock(idempotencyKey, 'agent_buyer_01', fingerprint);
        if (!lockResult.acquired && lockResult.record.status === 'ORDER_CREATED' && lockResult.record.responseCache) {
            return {
                success: true,
                decision: policyDecision,
                order: lockResult.record.responseCache,
                isCached: true,
                mode: 'mock',
                label: 'Demo/Test Simulation',
            };
        }
        // Step 4: Execute Razorpay order creation wrapped in promise latch
        const orderExecutionPromise = (async () => {
            const order = await razorpay_1.globalRazorpayAdapter.createOrder(cart, 'agent_buyer_01', buyerEmail);
            idempotency_1.globalIdempotencyManager.completeOrder(idempotencyKey, order.id, order);
            audit_logger_1.globalAuditLogger.log('PAYMENT_SUCCESS', {
                orderId: order.id,
                cartId,
                idempotencyKey,
                amount: cart.totalAmount,
            });
            return order;
        })();
        PENDING_ORDER_PROMISES.set(concurrencyKey, orderExecutionPromise);
        try {
            const liveOrder = await orderExecutionPromise;
            return { success: true, decision: policyDecision, order: liveOrder, isCached: false, mode: 'mock', label: 'Demo/Test Simulation' };
        }
        finally {
            setTimeout(() => {
                PENDING_ORDER_PROMISES.delete(concurrencyKey);
            }, 5000);
        }
    }
    verifyPaymentAndSettle(orderId, paymentId, signature) {
        const isValid = razorpay_1.globalRazorpayAdapter.verifySignature(orderId, paymentId, signature);
        return {
            verified: isValid,
            orderId,
            paymentId,
            settledAt: new Date().toISOString(),
            mode: 'mock',
            label: 'Demo/Test Simulation',
        };
    }
    // --- Growth Twin MCP Tool Handlers ---
    async recommendAddons(baseProductIds, budget, quantity, requestedTags) {
        const baseItems = [];
        for (const id of baseProductIds) {
            const p = await this.catalogProvider.getProductDetails(id);
            if (p) {
                baseItems.push({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    tags: p.tags,
                    type: 'base',
                    inventoryConfidence: p.stock > 10 ? 1.0 : p.stock / 10,
                    merchantPriority: 0.9,
                });
            }
        }
        // Fallback if base product ID is demo-specific (e.g. hamp_jain_01)
        if (baseItems.length === 0) {
            baseItems.push({
                id: baseProductIds[0] || 'hamp_jain_01',
                name: 'Jain-Friendly Gourmet Snack Hamper',
                price: 500,
                tags: ['jain', 'gifting', 'snacks'],
                type: 'base',
                inventoryConfidence: 1.0,
                merchantPriority: 1.0,
            });
        }
        const availableAddons = [
            {
                id: 'addon_note_01',
                name: 'Personalized Foil-Embossed Gift Note & Wax Seal',
                price: 50,
                tags: ['note', 'personalized_note', 'custom_note', 'gifting', 'universal'],
                type: 'addon',
                inventoryConfidence: 1.0,
                merchantPriority: 1.0,
            },
            {
                id: 'addon_shipping_02',
                name: 'Guaranteed Friday Express Priority Courier',
                price: 120,
                tags: ['priority_shipping', 'express_shipping', 'friday_delivery', 'shipping'],
                type: 'addon',
                inventoryConfidence: 0.95,
                merchantPriority: 0.85,
            },
            {
                id: 'addon_sweets_03',
                name: 'Artisanal Jain-Certified Dry Fruit Mithai Box (100g)',
                price: 100,
                tags: ['jain', 'sweets', 'mithai', 'snacks', 'premium'],
                type: 'addon',
                inventoryConfidence: 0.9,
                merchantPriority: 0.9,
            },
            {
                id: 'addon_packaging_04',
                name: 'Sustainable Hand-Woven Velvet Ribbon Packaging',
                price: 60,
                tags: ['premium_packaging', 'packaging', 'eco_friendly', 'universal'],
                type: 'addon',
                inventoryConfidence: 1.0,
                merchantPriority: 0.75,
            },
        ];
        const scored = (0, revenue_bundle_1.scoreAddons)(baseItems, availableAddons, {
            budget,
            quantity,
            requestedTags,
        });
        const baseCostPerUnit = baseItems.reduce((acc, b) => acc + b.price, 0);
        const baseTotal = baseCostPerUnit * quantity;
        const budgetHeadroom = budget - baseTotal;
        const recommendations = scored.map((s) => {
            const lineCost = s.item.price * quantity;
            const policyAllowed = this.growthPolicy.permittedAddons.some((p) => s.item.tags.includes(p) || p === s.item.id || s.item.tags.includes('universal'));
            return {
                sku: s.item.id,
                name: s.item.name,
                unitPrice: s.item.price,
                quantity,
                incrementalRevenue: lineCost,
                score: s.score,
                relevanceReason: s.reasons.find((r) => r.includes('preferences')) || 'General compatibility with corporate gifting',
                compatibilityReason: s.reasons.find((r) => r.includes('compatible')) || 'Universal add-on standard',
                budgetHeadroomRemainingAfter: budgetHeadroom - lineCost,
                merchantPolicyPermitted: policyAllowed,
                reasons: s.reasons,
            };
        });
        return {
            baseTotal,
            budget,
            quantity,
            budgetHeadroom,
            recommendationCount: recommendations.length,
            recommendations,
            mode: 'mock',
            label: 'Demo/Test Simulation',
        };
    }
    evaluateGrowthPolicy(args) {
        let baseValue = args.base_value || 0;
        let addonsValue = args.addons_value || 0;
        let discountPercentage = args.discount_percentage || 0;
        let addonIds = args.addon_ids || [];
        let productTags = args.product_tags || [];
        let hasExplicitApproval = args.has_explicit_approval || false;
        if (args.cart_id && CART_STORE.has(args.cart_id)) {
            const cart = CART_STORE.get(args.cart_id);
            baseValue = cart.subtotal;
            const gq = GROWTH_QUOTE_STORE.get(args.cart_id);
            if (gq) {
                discountPercentage = gq.discountPercentage;
                addonIds = gq.addonItemIds;
                productTags = gq.productTags;
                hasExplicitApproval = gq.hasExplicitApproval;
            }
        }
        const checkResult = (0, policy_engine_1.evaluatePolicy)({
            baseValue,
            addonsValue,
            discountPercentage,
            addonIds,
            productTags,
            buyerConstraints: {},
            hasExplicitApproval,
        }, this.growthPolicy);
        const total = baseValue + addonsValue;
        const finalAmount = total - (total * discountPercentage) / 100;
        let nextPermittedAction = 'PROCEED_TO_PAYMENT_CREATION';
        if (!checkResult.isCompliant) {
            nextPermittedAction = 'ADJUST_QUOTE_TO_COMPLY_WITH_POLICY';
        }
        else if (checkResult.requiresApproval && !hasExplicitApproval) {
            nextPermittedAction = 'AWAIT_BUYER_OR_MERCHANT_EXPLICIT_APPROVAL';
        }
        return {
            isCompliant: checkResult.isCompliant,
            requiresApproval: checkResult.requiresApproval,
            hasExplicitApproval,
            rejectionReasons: checkResult.reasons,
            policyChecks: {
                maxDiscountAllowed: `${this.growthPolicy.maxDiscountPercentage}%`,
                requestedDiscount: `${discountPercentage}%`,
                maxUnapprovedOrderValue: `₹${this.growthPolicy.maxUnapprovedOrderValue}`,
                finalOrderValue: `₹${finalAmount}`,
                permittedAddons: this.growthPolicy.permittedAddons,
                prohibitedTagsForAddons: this.growthPolicy.prohibitedTagsForAddons,
            },
            quoteExpiryMinutes: this.growthPolicy.quoteExpiryMinutes,
            nextPermittedAction,
            mode: 'mock',
            label: 'Demo/Test Simulation',
        };
    }
    getCommerceContract() {
        return {
            merchant: {
                name: 'Growth Twin Demo Gifting & Gourmet Store',
                protocolVersion: 'MCP_GROWTH_TWIN_v1.0',
                environment: 'TEST_SANDBOX',
                label: 'Demo/Test Simulation',
            },
            policyLimits: {
                maxDiscountPercentage: this.growthPolicy.maxDiscountPercentage,
                maxUnapprovedOrderValue: this.growthPolicy.maxUnapprovedOrderValue,
                permittedAddons: this.growthPolicy.permittedAddons,
                prohibitedTagsForAddons: this.growthPolicy.prohibitedTagsForAddons,
                requireExplicitApprovalForLink: this.growthPolicy.requireExplicitApprovalForLink,
                quoteExpiryMinutes: this.growthPolicy.quoteExpiryMinutes,
            },
            paymentStates: [
                'DRAFT_INTENT',
                'QUOTE_CREATED',
                'AWAITING_APPROVAL',
                'APPROVED',
                'PAYMENT_ACTION_STARTED',
                'PAYMENT_CREATED',
                'PAYMENT_FAILED',
                'RECOVERY_AVAILABLE',
                'COMPLETED',
            ],
            allowedPaymentRails: ['razorpay_orders_api', 'razorpay_payment_links', 'upi_intent'],
            idempotencyRule: 'quoteId + approvalVersion SHA-256 fingerprint lock',
            terms: 'The model recommends; deterministic policy code authorizes.',
        };
    }
}
exports.MCPEngine = MCPEngine;
exports.globalMCPEngine = new MCPEngine();
const handleMCPRequest = (body) => exports.globalMCPEngine.executeTool(body.method, body.params);
exports.handleMCPRequest = handleMCPRequest;
//# sourceMappingURL=mcp-engine.js.map