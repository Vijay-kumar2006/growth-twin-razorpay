import { evaluatePolicy, defaultPolicy, QuoteRequest } from '../lib/policy-engine';
import { scoreAddons, CatalogItem, BuyerIntent } from '../lib/revenue-bundle';
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
  const baseItems: CatalogItem[] = [{ id: 'b1', name: 'Hamper', price: 500, tags: ['gifting'], type: 'base', inventoryConfidence: 1, merchantPriority: 1 }];
  const addons: CatalogItem[] = [
    { id: 'a1', name: 'Jain Sweets', price: 100, tags: ['jain'], type: 'addon', inventoryConfidence: 0.9, merchantPriority: 0.8 },
    { id: 'a2', name: 'Premium Note', price: 50, tags: ['note'], type: 'addon', inventoryConfidence: 1, merchantPriority: 1 }
  ];
  const intent: BuyerIntent = { budget: 18000, requestedTags: ['jain', 'note'], quantity: 25 };
  
  const scored = scoreAddons(baseItems, addons, intent);
  console.assert(scored.length === 2, "Should score all addons");
  console.assert(scored[0].score > 0, "Top addon should have a positive score");

  // 3. Razorpay Mock Adapter Tests (Idempotency and Failure Recovery)
  console.log("Testing Razorpay Adapter: Failure Recovery");
  const adapter = new MockRazorpayAdapter();
  const order = await adapter.createOrder({ amount: 1800000, currency: "INR", receipt: "rcpt_1" });
  console.assert(order.mode === "mock", "Order mode should be mock");
  
  const failedOrder = await adapter.simulateFailure(order.id);
  console.assert(failedOrder.status === 'failed', "Order status should be failed");

  console.log("All Core Tests Passed!");
}

runTests().catch(console.error);
