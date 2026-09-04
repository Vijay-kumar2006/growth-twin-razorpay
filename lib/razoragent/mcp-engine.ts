/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 * 
 * Powered by a pluggable Merchant-Agnostic Catalog Architecture (Shopify, WooCommerce, Demo).
 * Extended with Growth Twin deterministic revenue, policy, and constraint trade-off simulator tools.
 */

import { CartItem, CartQuote, MCPToolDefinition, PolicyDecision, RazorpayOrderResponse } from './types';
import { AVAILABLE_COUPONS, MERCHANT_CATALOG, globalDemoCatalogProvider } from './catalog-data';
import { CatalogProvider } from './catalog-provider';
import { ShopifyCatalogProvider } from './shopify-catalog-provider';
import { WooCommerceCatalogProvider } from './woocommerce-catalog-provider';
import { globalGuardrailEngine } from './guardrails';
import { globalIdempotencyManager } from './idempotency';
import { globalRazorpayAdapter } from './razorpay';
import { defaultPolicy, evaluatePolicy, MerchantPolicy, QuoteRequest } from '../policy-engine';
import { CatalogItem, generatePaymentRecoveryOptions, scoreAddons, simulateConstraintTradeoffs, TradeoffAlternative } from '../revenue-bundle';
import { globalAuditLogger } from '../audit-logger';

// Active cart session cache
const CART_STORE: Map<string, CartQuote> = new Map();
// Pending promise map to handle exact same-tick async race conditions
const PENDING_ORDER_PROMISES: Map<string, Promise<any>> = new Map();

// Stored growth twin quotes & approval status
export interface StoredGrowthQuote {
  quoteId: string;
  cartQuote: CartQuote;
  baseItemIds: string[];
  addonItemIds: string[];
  productTags: string[];
  discountPercentage: number;
  hasExplicitApproval: boolean;
  approvalVersion: number;
  approvedAt?: string;
  expiresAt: string;
  selectedTradeoffOptionId?: string;
}

export const GROWTH_QUOTE_STORE: Map<string, StoredGrowthQuote> = new Map();

export const MCP_TOOLS: MCPToolDefinition[] = [
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
        has_explicit_approval: { type: 'boolean', description: 'Optional approval status flag' },
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
  // Growth Twin Tools (Tools 7, 8, 9)
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
  // 10th MCP Tool: Constraint Trade-off Simulator / Safe Negotiation Mode
  {
    name: 'simulate_constraint_tradeoffs',
    description: 'Constraint Trade-off Simulator (Safe Negotiation Mode). Generates 2-3 structured catalog-grounded alternatives when hard constraints & soft preferences conflict with budget or quantity limits. Never relaxes hard constraints automatically.',
    parameters: {
      type: 'object',
      properties: {
        base_product_ids: {
          type: 'array',
          description: 'Base product IDs',
          items: { type: 'string' },
        },
        budget: { type: 'number', description: 'Buyer target budget in INR' },
        quantity: { type: 'number', description: 'Target quantity' },
        hard_constraints: {
          type: 'array',
          description: 'Non-negotiable constraints (e.g. ["jain", "vegan", "halal"]) that can NEVER be relaxed',
          items: { type: 'string' },
        },
        soft_preferences: {
          type: 'array',
          description: 'Negotiable preferences (e.g. ["custom_note", "priority_shipping", "premium_packaging"])',
          items: { type: 'string' },
        },
        select_option_id: {
          type: 'string',
          description: 'Optional optionId to immediately select and materialize into a new quote version with approval gating',
        },
      },
      required: ['budget', 'quantity'],
    },
  },
  // 11th MCP Tool: Adaptive Payment Recovery / Revenue Recovery Agent
  {
    name: 'recover_failed_transaction',
    description: 'Adaptive Payment Recovery / Revenue Recovery Agent. When a payment attempt fails, preserves original quote and generates 2-3 deterministic recovery options (same quote retry, remove lowest-priority add-on, downgrade optional SKU). Never relaxes hard buyer constraints. Re-runs server-side policy engine, creates a new quote version when cart changes, preserves idempotency, and prevents duplicate orders.',
    parameters: {
      type: 'object',
      properties: {
        cart_id: { type: 'string', description: 'The failed cart quote ID' },
        failure_reason: { type: 'string', description: 'Failure reason code or message (e.g. "GATEWAY_CARD_NETWORK_TIMEOUT")' },
        select_option_id: {
          type: 'string',
          description: 'Optional recovery option ID (e.g. "rec_retry_exact", "rec_prune_lowest_addon", "rec_substitute_standard_shipping") to materialize into a new quote version with approval gating',
        },
      },
      required: ['cart_id'],
    },
  },
];

export class MCPEngine {
  private catalogProvider: CatalogProvider;
  private growthPolicy: MerchantPolicy = defaultPolicy;

  constructor(customProvider?: CatalogProvider) {
    if (customProvider) {
      this.catalogProvider = customProvider;
    } else if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      this.catalogProvider = new ShopifyCatalogProvider();
    } else if (process.env.WOOCOMMERCE_SITE_URL && process.env.WOOCOMMERCE_CONSUMER_KEY) {
      this.catalogProvider = new WooCommerceCatalogProvider();
    } else {
      this.catalogProvider = globalDemoCatalogProvider;
    }
  }

  public setCatalogProvider(provider: CatalogProvider): void {
    this.catalogProvider = provider;
  }

  public getCatalogProvider(): CatalogProvider {
    return this.catalogProvider;
  }

  public getGrowthPolicy(): MerchantPolicy {
    return { ...this.growthPolicy };
  }

  public updateGrowthPolicy(newPolicy: Partial<MerchantPolicy>): void {
    this.growthPolicy = { ...this.growthPolicy, ...newPolicy };
  }

  public listTools(): MCPToolDefinition[] {
    return MCP_TOOLS;
  }

  public async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
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
        return this.recommendAddons(args.base_product_ids || [], args.budget, args.quantity, args.requested_tags || []);

      case 'evaluate_merchant_growth_policy':
        return this.evaluateGrowthPolicy(args);

      case 'get_commerce_contract':
        return this.getCommerceContract();

      case 'simulate_constraint_tradeoffs':
        return this.simulateTradeoffs(args);

      case 'recover_failed_transaction':
        return this.recoverFailedTransaction(args);

      default:
        throw new Error(`Unknown MCP Tool: ${toolName}`);
    }
  }

  private async searchProducts(query: string, category?: string, maxPrice?: number, minRating?: number) {
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

  private async getProductDetails(productId: string) {
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

  public async calculateCartQuote(
    items: { product_id: string; quantity: number }[],
    couponCode?: string,
    hasExplicitApproval: boolean = false
  ): Promise<CartQuote> {
    const cartItems: CartItem[] = [];
    let subtotal = 0;
    const baseIds: string[] = [];
    const addonIds: string[] = [];
    const productTags: string[] = [];

    for (const reqItem of items) {
      const product = await this.catalogProvider.getProductDetails(reqItem.product_id);
      if (!product) {
        // Fallback demo hamper for corporate gifting scenarios
        if (reqItem.product_id === 'hamp_jain_01' || reqItem.product_id.startsWith('hamp_')) {
          const qty = Math.max(1, reqItem.quantity || 1);
          const lineTotal = 500 * qty;
          subtotal += lineTotal;
          baseIds.push(reqItem.product_id);
          productTags.push('jain', 'gifting', 'snacks');
          cartItems.push({
            productId: reqItem.product_id,
            name: 'Jain-Friendly Gourmet Snack Hamper',
            unitPrice: 500,
            quantity: qty,
            subtotal: lineTotal,
          });
        } else if (reqItem.product_id.startsWith('addon_')) {
          const qty = Math.max(1, reqItem.quantity || 1);
          const price = reqItem.product_id.includes('shipping') ? 120 : reqItem.product_id.includes('note') ? 50 : 100;
          const lineTotal = price * qty;
          subtotal += lineTotal;
          addonIds.push(reqItem.product_id);
          productTags.push('gifting', 'addon');
          cartItems.push({
            productId: reqItem.product_id,
            name: reqItem.product_id.replace('addon_', 'Add-on: '),
            unitPrice: price,
            quantity: qty,
            subtotal: lineTotal,
          });
        }
        continue;
      }

      const qty = Math.max(1, reqItem.quantity || 1);
      const lineTotal = product.price * qty;
      subtotal += lineTotal;

      if (product.tags.includes('addon') || reqItem.product_id.startsWith('addon_')) {
        addonIds.push(product.id);
      } else {
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
    let appliedCoupon: string | undefined = undefined;

    if (couponCode && AVAILABLE_COUPONS[couponCode]) {
      const rule = AVAILABLE_COUPONS[couponCode];
      if (subtotal >= rule.minSpendINR) {
        if (rule.flatDiscountINR) {
          discount = Math.min(rule.flatDiscountINR, subtotal);
        } else if (rule.discountPercent) {
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

    const quote: CartQuote = {
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

    globalAuditLogger.log('QUOTE_CREATED', {
      cartId,
      totalAmount,
      itemCount: cartItems.length,
      hasExplicitApproval,
    });

    return quote;
  }

  private evaluateSpendPolicy(cartId: string): PolicyDecision {
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
    const guardrailDecision = globalGuardrailEngine.evaluate(cart);
    if (!guardrailDecision.allowed) {
      return guardrailDecision;
    }

    // Step 2: Growth Twin Deterministic Policy evaluation
    const growthQuote = GROWTH_QUOTE_STORE.get(cartId);
    if (growthQuote) {
      const quoteReq: QuoteRequest = {
        baseValue: cart.subtotal,
        addonsValue: 0,
        discountPercentage: growthQuote.discountPercentage,
        addonIds: growthQuote.addonItemIds,
        productTags: growthQuote.productTags,
        buyerConstraints: {},
        hasExplicitApproval: growthQuote.hasExplicitApproval,
      };

      const growthCheck = evaluatePolicy(quoteReq, this.growthPolicy);
      globalAuditLogger.log('POLICY_CHECK', {
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

  private async createGuardedOrder(
    cartId: string,
    idempotencyKey: string,
    buyerEmail: string = 'buyer.agent@resence.in'
  ): Promise<{ success: boolean; decision: PolicyDecision; order?: RazorpayOrderResponse; isCached: boolean; mode: 'mock'; label: 'Demo/Test Simulation' }> {
    const cart = CART_STORE.get(cartId);
    if (!cart) {
      const decision: PolicyDecision = {
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
      globalAuditLogger.log('PAYMENT_ATTEMPT', {
        cartId,
        success: false,
        reason: policyDecision.message,
      });
      return { success: false, decision: policyDecision, isCached: false, mode: 'mock', label: 'Demo/Test Simulation' };
    }

    // Step 2: Canonical fingerprint hash for same-tick async race-condition defense
    const fingerprint = globalIdempotencyManager.generateFingerprint('agent_buyer_01', cart);
    const concurrencyKey = `lock_${fingerprint}`;

    if (PENDING_ORDER_PROMISES.has(concurrencyKey)) {
      const existingPromise = PENDING_ORDER_PROMISES.get(concurrencyKey)!;
      const cachedOrder = await existingPromise;
      return { success: true, decision: policyDecision, order: cachedOrder, isCached: true, mode: 'mock', label: 'Demo/Test Simulation' };
    }

    // Step 3: Check memory-cached idempotency lock
    const lockResult = globalIdempotencyManager.acquireLock(idempotencyKey, 'agent_buyer_01', fingerprint);
    if (!lockResult.acquired && lockResult.record.status === 'ORDER_CREATED' && lockResult.record.responseCache) {
      return {
        success: true,
        decision: policyDecision,
        order: lockResult.record.responseCache as RazorpayOrderResponse,
        isCached: true,
        mode: 'mock',
        label: 'Demo/Test Simulation',
      };
    }

    // Step 4: Execute Razorpay order creation wrapped in promise latch
    const orderExecutionPromise = (async () => {
      const order = await globalRazorpayAdapter.createOrder(cart, 'agent_buyer_01', buyerEmail);
      globalIdempotencyManager.completeOrder(idempotencyKey, order.id, order);
      globalAuditLogger.log('PAYMENT_SUCCESS', {
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
    } finally {
      setTimeout(() => {
        PENDING_ORDER_PROMISES.delete(concurrencyKey);
      }, 5000);
    }
  }

  private verifyPaymentAndSettle(orderId: string, paymentId: string, signature: string): { verified: boolean; orderId: string; paymentId: string; settledAt: string; mode: 'mock'; label: 'Demo/Test Simulation' } {
    const isValid = globalRazorpayAdapter.verifySignature(orderId, paymentId, signature);

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

  private async recommendAddons(
    baseProductIds: string[],
    budget: number,
    quantity: number,
    requestedTags: string[]
  ) {
    const baseItems: CatalogItem[] = [];
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

    const availableAddons: CatalogItem[] = [
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

    const scored = scoreAddons(baseItems, availableAddons, {
      budget,
      quantity,
      requestedTags,
    });

    const baseCostPerUnit = baseItems.reduce((acc, b) => acc + b.price, 0);
    const baseTotal = baseCostPerUnit * quantity;
    const budgetHeadroom = budget - baseTotal;

    const recommendations = scored.map((s) => {
      const lineCost = s.item.price * quantity;
      const policyAllowed = this.growthPolicy.permittedAddons.some(
        (p) => s.item.tags.includes(p) || p === s.item.id || s.item.tags.includes('universal')
      );

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

  private evaluateGrowthPolicy(args: Record<string, any>) {
    let baseValue = args.base_value || 0;
    let addonsValue = args.addons_value || 0;
    let discountPercentage = args.discount_percentage || 0;
    let addonIds = args.addon_ids || [];
    let productTags = args.product_tags || [];
    let hasExplicitApproval = args.has_explicit_approval || false;

    if (args.cart_id && CART_STORE.has(args.cart_id)) {
      const cart = CART_STORE.get(args.cart_id)!;
      baseValue = cart.subtotal;
      const gq = GROWTH_QUOTE_STORE.get(args.cart_id);
      if (gq) {
        discountPercentage = gq.discountPercentage;
        addonIds = gq.addonItemIds;
        productTags = gq.productTags;
        hasExplicitApproval = gq.hasExplicitApproval;
      }
    }

    const checkResult = evaluatePolicy(
      {
        baseValue,
        addonsValue,
        discountPercentage,
        addonIds,
        productTags,
        buyerConstraints: {},
        hasExplicitApproval,
      },
      this.growthPolicy
    );

    const total = baseValue + addonsValue;
    const finalAmount = total - (total * discountPercentage) / 100;

    let nextPermittedAction = 'PROCEED_TO_PAYMENT_CREATION';
    if (!checkResult.isCompliant) {
      nextPermittedAction = 'ADJUST_QUOTE_TO_COMPLY_WITH_POLICY';
    } else if (checkResult.requiresApproval && !hasExplicitApproval) {
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

  private getCommerceContract() {
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

  private async simulateTradeoffs(args: Record<string, any>) {
    const baseProductIds = args.base_product_ids || ['hamp_jain_01'];
    const budget = args.budget || 18000;
    const quantity = args.quantity || 25;
    const hardConstraints = args.hard_constraints || ['jain'];
    const softPreferences = args.soft_preferences || ['custom_note', 'friday_delivery', 'premium_packaging'];

    const baseItems: CatalogItem[] = [{
      id: baseProductIds[0] || 'hamp_jain_01',
      name: 'Jain-Friendly Gourmet Snack Hamper',
      price: 500,
      tags: ['jain', 'gifting', 'snacks'],
      type: 'base',
      inventoryConfidence: 1.0,
      merchantPriority: 1.0,
    }];

    const availableAddons: CatalogItem[] = [
      {
        id: 'addon_note_01',
        name: 'Personalized Foil-Embossed Gift Note & Wax Seal',
        price: 50,
        tags: ['custom_note', 'note', 'gifting'],
        type: 'addon',
        inventoryConfidence: 1.0,
        merchantPriority: 1.0,
      },
      {
        id: 'addon_shipping_02',
        name: 'Guaranteed Friday Express Priority Courier',
        price: 120,
        tags: ['friday_delivery', 'priority_shipping', 'shipping'],
        type: 'addon',
        inventoryConfidence: 0.95,
        merchantPriority: 0.85,
      },
      {
        id: 'addon_sweets_03',
        name: 'Artisanal Jain-Certified Dry Fruit Mithai Box (100g)',
        price: 100,
        tags: ['jain', 'sweets', 'mithai', 'snacks'],
        type: 'addon',
        inventoryConfidence: 0.9,
        merchantPriority: 0.9,
      },
      {
        id: 'addon_packaging_04',
        name: 'Sustainable Hand-Woven Velvet Ribbon Packaging',
        price: 60,
        tags: ['premium_packaging', 'packaging', 'eco_friendly'],
        type: 'addon',
        inventoryConfidence: 1.0,
        merchantPriority: 0.75,
      },
    ];

    const simulation = simulateConstraintTradeoffs(
      baseItems,
      availableAddons,
      {
        budget,
        quantity,
        requestedTags: [...hardConstraints, ...softPreferences],
        hardConstraints,
        softPreferences,
      },
      this.growthPolicy.maxUnapprovedOrderValue
    );

    if (simulation.hasConflict) {
      globalAuditLogger.log('CONSTRAINT_CONFLICT_DETECTED', {
        budget,
        quantity,
        hardConstraints,
        softPreferences,
        conflictReason: simulation.conflictReason,
      });
    }

    // If an alternative option was selected, materialize it as a new quote version with approval gating
    let selectedQuote: any = undefined;
    if (args.select_option_id) {
      const selectedAlt = simulation.alternatives.find(a => a.optionId === args.select_option_id);
      if (selectedAlt) {
        const quoteItems = [
          ...selectedAlt.baseItems.map(b => ({ product_id: b.id, quantity: b.quantity })),
          ...selectedAlt.addonItems.map(a => ({ product_id: a.id, quantity: a.quantity })),
        ];

        const newCartQuote = await this.calculateCartQuote(quoteItems, undefined, false);
        
        // Re-evaluate server-side policy on newly materialized quote
        const policyCheck = evaluatePolicy({
          baseValue: newCartQuote.subtotal,
          addonsValue: 0,
          discountPercentage: 0,
          addonIds: selectedAlt.addonItems.map(a => a.id),
          productTags: ['jain', 'gifting'],
          buyerConstraints: { hardConstraints, selectedOption: selectedAlt.optionId },
          hasExplicitApproval: false,
        }, this.growthPolicy);

        // Update stored quote with trade-off metadata
        const stored = GROWTH_QUOTE_STORE.get(newCartQuote.cartId);
        if (stored) {
          stored.selectedTradeoffOptionId = selectedAlt.optionId;
          stored.approvalVersion = 1;
        }

        globalAuditLogger.log('TRADEOFF_ALTERNATIVE_SELECTED', {
          optionId: selectedAlt.optionId,
          title: selectedAlt.title,
          newQuoteId: newCartQuote.cartId,
          version: 1,
          finalTotal: selectedAlt.finalTotal,
          requiresApproval: policyCheck.requiresApproval,
          idempotencyKeyBase: `${newCartQuote.cartId}_v1`,
        });

        selectedQuote = {
          quoteId: newCartQuote.cartId,
          version: 1,
          status: 'AWAITING_APPROVAL',
          totalAmount: newCartQuote.totalAmount,
          selectedAlternative: selectedAlt,
          policyCheck,
          idempotencyKey: `${newCartQuote.cartId}_v1`,
        };
      }
    }

    return {
      ...simulation,
      selectedQuote,
    };
  }

  private async recoverFailedTransaction(args: Record<string, any>) {
    const cartId = args.cart_id || args.quote_id;
    const failureReason = args.failure_reason || 'GATEWAY_CARD_NETWORK_TIMEOUT';
    const selectOptionId = args.select_option_id;

    let cart = cartId ? CART_STORE.get(cartId) : undefined;
    const growthQuote = cartId ? GROWTH_QUOTE_STORE.get(cartId) : undefined;

    // Fallback simulation representation if cart not in ephemeral memory
    if (!cart) {
      const demoItems: CartItem[] = [
        { productId: 'hamp_jain_01', name: 'Jain-Friendly Gourmet Snack Hamper', unitPrice: 500, quantity: 25, subtotal: 12500 },
        { productId: 'addon_shipping_02', name: 'Guaranteed Friday Express Priority Courier', unitPrice: 120, quantity: 25, subtotal: 3000 },
        { productId: 'addon_note_01', name: 'Personalized Foil-Embossed Gift Note & Wax Seal', unitPrice: 50, quantity: 25, subtotal: 1250 },
      ];
      cart = {
        cartId: cartId || 'cart_demo_failed',
        items: demoItems,
        subtotal: 16750,
        discount: 0,
        tax: 3015,
        shipping: 0,
        totalAmount: 19765,
        currency: 'INR',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
      CART_STORE.set(cart.cartId, cart);
    }

    const baseItems = cart.items
      .filter(i => !i.productId.startsWith('addon_'))
      .map(i => ({ id: i.productId, name: i.name, unitPrice: i.unitPrice, quantity: i.quantity }));
    
    const addonItems = cart.items
      .filter(i => i.productId.startsWith('addon_'))
      .map(i => ({ id: i.productId, name: i.name, unitPrice: i.unitPrice, quantity: i.quantity }));

    // Hard constraints are strictly extracted and never relaxed
    const productTags = growthQuote?.productTags || ['jain', 'gifting'];
    const hardConstraints = productTags.filter(t => ['jain', 'vegan', 'halal', 'kosher'].includes(t));

    // Audit Event 1: PAYMENT_FAILURE_DETECTED
    globalAuditLogger.log('PAYMENT_FAILURE_DETECTED', {
      failedQuoteId: cart.cartId,
      failureReason,
      originalTotal: cart.totalAmount,
      hardConstraints: hardConstraints.length > 0 ? hardConstraints : ['jain'],
      timestamp: new Date().toISOString(),
    });

    const recoveryResult = generatePaymentRecoveryOptions(
      {
        quoteId: cart.cartId,
        totalAmount: cart.totalAmount,
        baseItems: baseItems.length > 0 ? baseItems : [{ id: 'hamp_jain_01', name: 'Jain-Friendly Gourmet Snack Hamper', unitPrice: 500, quantity: 25 }],
        addonItems,
        productTags,
        hardConstraints: hardConstraints.length > 0 ? hardConstraints : ['jain'],
      },
      failureReason,
      this.growthPolicy.maxUnapprovedOrderValue
    );

    // Audit Event 2: RECOVERY_OPTIONS_GENERATED
    globalAuditLogger.log('RECOVERY_OPTIONS_GENERATED', {
      failedQuoteId: cart.cartId,
      optionsCount: recoveryResult.recoveryOptions.length,
      options: recoveryResult.recoveryOptions.map(o => ({
        optionId: o.optionId,
        title: o.title,
        strategy: o.recoveryStrategy,
        finalTotal: o.finalTotal,
        recoveredRevenue: o.recoveredRevenue,
        preservedHardConstraints: o.preservedHardConstraints,
      })),
    });

    let selectedQuote: any = undefined;

    // If an option is selected, materialize new quote version, re-evaluate server-side policy, preserve idempotency
    if (selectOptionId) {
      const selectedOpt = recoveryResult.recoveryOptions.find(o => o.optionId === selectOptionId);
      if (selectedOpt) {
        let newCartQuote: CartQuote;
        let newVersion = 1;
        let targetQuoteId = cart.cartId;

        if (selectedOpt.recoveryStrategy === 'SAME_QUOTE_RETRY') {
          // Preserve the original quote; bump approval version to prevent duplicate order
          newCartQuote = cart;
          newVersion = (growthQuote?.approvalVersion || 1) + 1;
          targetQuoteId = `${cart.cartId}_rec_v${newVersion}`;
        } else if (selectedOpt.recoveryStrategy === 'REMOVE_LOWEST_PRIORITY_ADDON') {
          // Remove the lowest-priority add-on and create a new quote version
          const removedItem = selectedOpt.changedItems.find(c => c.action === 'REMOVED');
          const remainingItems = cart.items
            .filter(i => i.productId !== removedItem?.productId)
            .map(i => ({ product_id: i.productId, quantity: i.quantity }));
          
          newCartQuote = await this.calculateCartQuote(remainingItems, undefined, false);
          targetQuoteId = newCartQuote.cartId;
        } else {
          // DOWNGRADE_OPTIONAL_SKU (e.g. standard surface shipping instead of priority air)
          const substitutedItems = cart.items.map(i => {
            if (i.productId.includes('shipping')) {
              return { product_id: 'addon_shipping_standard', quantity: i.quantity };
            }
            return { product_id: i.productId, quantity: i.quantity };
          });
          newCartQuote = await this.calculateCartQuote(substitutedItems, undefined, false);
          targetQuoteId = newCartQuote.cartId;
        }

        // Re-run the server-side policy engine for every changed option
        const policyCheck = evaluatePolicy({
          baseValue: newCartQuote.subtotal,
          addonsValue: 0,
          discountPercentage: 0,
          addonIds: newCartQuote.items.filter(i => i.productId.startsWith('addon_')).map(i => i.productId),
          productTags: hardConstraints.length > 0 ? hardConstraints : ['jain'],
          buyerConstraints: { hardConstraints, recoveryStrategy: selectedOpt.recoveryStrategy, selectedOption: selectedOpt.optionId },
          hasExplicitApproval: false,
        }, this.growthPolicy);

        const idempotencyKey = `${targetQuoteId}_v${newVersion}`;

        // Audit Event 3: RECOVERY_OPTION_SELECTED
        globalAuditLogger.log('RECOVERY_OPTION_SELECTED', {
          failedQuoteId: cart.cartId,
          selectedOptionId: selectedOpt.optionId,
          recoveryStrategy: selectedOpt.recoveryStrategy,
          newQuoteId: targetQuoteId,
          version: newVersion,
          finalTotal: selectedOpt.finalTotal,
          recoveredRevenue: selectedOpt.recoveredRevenue,
          preservedHardConstraints: selectedOpt.preservedHardConstraints,
          requiresApproval: policyCheck.requiresApproval,
          idempotencyKey,
        });

        selectedQuote = {
          quoteId: targetQuoteId,
          version: newVersion,
          status: 'AWAITING_APPROVAL',
          originalQuoteId: cart.cartId,
          finalTotal: selectedOpt.finalTotal,
          recoveredRevenue: selectedOpt.recoveredRevenue,
          preservedHardConstraints: selectedOpt.preservedHardConstraints,
          selectedOption: selectedOpt,
          policyCheck,
          idempotencyKey,
          mode: 'mock',
          label: 'Demo/Test Simulation',
        };
      }
    }

    return {
      ...recoveryResult,
      selectedQuote,
    };
  }
}

export const globalMCPEngine = new MCPEngine();
export const handleMCPRequest = (body: any) => globalMCPEngine.executeTool(body.method, body.params);
