import { evaluatePolicy, defaultPolicy, QuoteRequest } from '../lib/policy-engine';
import { scoreAddons, simulateConstraintTradeoffs, CatalogItem, BuyerIntent } from '../lib/revenue-bundle';
import { MockRazorpayAdapter } from '../lib/razorpay-adapter';

async function runTests() {
  console.log("Running Core Tests...");

  // 1. Policy Engine Tests
  console.log("Testing Policy Engine: Hard Constraint Rejection & Approval Blocking");
  const unapprovedQuote: QuoteRequest = {
    baseValue: 25000,
    addonsValue: 0,
    discountPercentage: 20, // Exceeds 15%
    addonIds: ['invalid_addon'],
    productTags: ['perishable'],
    buyerConstraints: {},
    hasExplicitApproval: false
  };
  const policyResult = evaluatePolicy(unapprovedQuote, defaultPolicy);
  console.assert(!policyResult.isCompliant, "Should not be compliant due to discount and invalid addon");

  // High value test for approval requirement
  const highValueQuote: QuoteRequest = {
    baseValue: 25000,
    addonsValue: 0,
    discountPercentage: 10, // 25000 - 2500 = 22500 > 20000
    addonIds: ['addon_note_01'],
    productTags: ['gifting'],
    buyerConstraints: {},
    hasExplicitApproval: false
  };
  const highValueResult = evaluatePolicy(highValueQuote, defaultPolicy);
  console.assert(highValueResult.requiresApproval, "Should require approval due to value > 20000");
  
  // 2. Revenue Bundle Tests
  console.log("Testing Revenue Bundle: Scoring Model");
  const baseItems: CatalogItem[] = [{ id: 'b1', name: 'Hamper', price: 500, tags: ['gifting', 'jain'], type: 'base', inventoryConfidence: 1, merchantPriority: 1 }];
  const addons: CatalogItem[] = [
    { id: 'a1', name: 'Jain Sweets', price: 100, tags: ['jain'], type: 'addon', inventoryConfidence: 0.9, merchantPriority: 0.8 },
    { id: 'a2', name: 'Premium Note', price: 50, tags: ['note', 'custom_note'], type: 'addon', inventoryConfidence: 1, merchantPriority: 1 },
    { id: 'a3', name: 'Friday Priority Shipping', price: 120, tags: ['friday_delivery', 'priority_shipping'], type: 'addon', inventoryConfidence: 1, merchantPriority: 0.9 }
  ];
  const intent: BuyerIntent = { budget: 18000, requestedTags: ['jain', 'note'], quantity: 25 };
  
  const scored = scoreAddons(baseItems, addons, intent);
  console.assert(scored.length === 3, "Should score all addons");
  console.assert(scored[0].score > 0, "Top addon should have a positive score");

  // 3. Constraint Trade-off Simulator Tests (Safe Negotiation Mode)
  console.log("Testing Constraint Trade-off Simulator (Safe Negotiation Mode)...");
  const conflictIntent: BuyerIntent = {
    budget: 14000, // Too small for 25 * (500 + 100 + 50 + 120 = 770) = 19,250
    quantity: 25,
    requestedTags: ['jain', 'note', 'friday_delivery'],
    hardConstraints: ['jain'],
    softPreferences: ['note', 'friday_delivery']
  };

  const tradeoffResult = simulateConstraintTradeoffs(baseItems, addons, conflictIntent, 20000);
  console.assert(tradeoffResult.hasConflict === true, "Must identify genuine constraint conflict");
  console.assert(tradeoffResult.alternatives.length >= 2, "Must return at least 2 structured alternatives");

  tradeoffResult.alternatives.forEach(alt => {
    console.assert(!alt.relaxedConstraints.includes('jain'), "Hard constraint 'jain' must NEVER be relaxed");
    console.assert(alt.preservedConstraints.includes('jain'), "Hard constraint 'jain' must be preserved");
  });

  // 4. Adaptive Payment Recovery Engine Tests
  console.log("Testing Adaptive Payment Recovery Engine...");
  const { generatePaymentRecoveryOptions } = await import('../lib/revenue-bundle');
  const failedQuote = {
    quoteId: 'cart_test_failed_01',
    totalAmount: 19250,
    baseItems: [{ id: 'b1', name: 'Jain Hamper', unitPrice: 500, quantity: 25 }],
    addonItems: [
      { id: 'a1', name: 'Jain Sweets', unitPrice: 100, quantity: 25 },
      { id: 'a2', name: 'Premium Note', unitPrice: 50, quantity: 25 },
      { id: 'a3', name: 'Friday Priority Shipping', unitPrice: 120, quantity: 25 },
    ],
    productTags: ['jain', 'gifting'],
    hardConstraints: ['jain'],
  };

  const recoveryResult = generatePaymentRecoveryOptions(failedQuote, 'GATEWAY_CARD_NETWORK_TIMEOUT', 20000);
  console.assert(recoveryResult.recoveryOptions.length >= 2, "Must return at least 2 recovery options");
  console.assert(recoveryResult.failedQuoteId === 'cart_test_failed_01', "Must preserve failed quote ID");
  
  recoveryResult.recoveryOptions.forEach(opt => {
    console.assert(opt.preservedHardConstraints.includes('jain'), "Hard constraint 'jain' must be preserved in all recovery options");
    console.assert(!opt.relaxedConstraints.includes('jain'), "Hard constraint 'jain' must NEVER be relaxed");
    console.assert(opt.recoveredRevenue > 0, "Recovered revenue must be positive");
    console.assert(typeof opt.requiresApproval === 'boolean', "Approval requirement must be explicit boolean");
  });

  // 5. Razorpay Mock Adapter Tests (Idempotency and Failure Recovery)
  console.log("Testing Razorpay Adapter: Failure Recovery");
  const adapter = new MockRazorpayAdapter();
  const order = await adapter.createOrder({ amount: 1800000, currency: "INR", receipt: "rcpt_1" });
  console.assert(order.mode === "mock", "Order mode should be mock");
  
  const failedOrder = await adapter.simulateFailure(order.id);
  console.assert(failedOrder.status === 'failed', "Order status should be failed");

  console.log("All Core Tests Passed!");
}

runTests().catch(console.error);
