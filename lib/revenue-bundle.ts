export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  tags: string[];
  type: 'base' | 'addon';
  inventoryConfidence: number; // 0 to 1
  merchantPriority: number; // 0 to 1
}

export interface BuyerIntent {
  budget: number;
  requestedTags: string[];
  quantity: number;
  hardConstraints?: string[]; // e.g. ['jain']
  softPreferences?: string[]; // e.g. ['note', 'friday_delivery', 'premium_packaging']
}

export interface ScoredAddon {
  item: CatalogItem;
  score: number;
  reasons: string[];
}

export interface TradeoffAlternative {
  optionId: string;
  title: string;
  preservedConstraints: string[];
  relaxedConstraints: string[];
  baseItems: { id: string; name: string; unitPrice: number; quantity: number }[];
  addonItems: { id: string; name: string; unitPrice: number; quantity: number }[];
  finalTotal: number;
  incrementalRevenue: number;
  requiresApproval: boolean;
  policyChecks: {
    isCompliant: boolean;
    maxDiscountAllowed: string;
    unapprovedThreshold: string;
  };
  explanation: string;
}

export interface TradeoffSimulationResult {
  hasConflict: boolean;
  conflictReason?: string;
  alternatives: TradeoffAlternative[];
  mode: 'mock';
  label: 'Demo/Test Simulation';
}

export interface PaymentRecoveryOption {
  optionId: string;
  title: string;
  recoveryStrategy: 'SAME_QUOTE_RETRY' | 'REMOVE_LOWEST_PRIORITY_ADDON' | 'DOWNGRADE_OPTIONAL_SKU';
  changedItems: {
    action: 'RETRY' | 'REMOVED' | 'SUBSTITUTED';
    productId: string;
    productName: string;
    originalPrice: number;
    newPrice?: number;
  }[];
  preservedHardConstraints: string[];
  relaxedConstraints: string[];
  finalTotal: number;
  recoveredRevenue: number;
  requiresApproval: boolean;
  explanation: string;
}

export interface PaymentRecoveryResult {
  failedQuoteId: string;
  failureReason: string;
  originalTotal: number;
  recoveryOptions: PaymentRecoveryOption[];
  mode: 'mock';
  label: 'Demo/Test Simulation';
}

export function scoreAddons(
  baseItems: CatalogItem[],
  availableAddons: CatalogItem[],
  intent: BuyerIntent
): ScoredAddon[] {
  const baseValue = baseItems.reduce((sum, item) => sum + item.price, 0) * intent.quantity;
  const budgetHeadroom = intent.budget - baseValue;

  return availableAddons.map(addon => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Budget Headroom (0-40 points)
    const cost = addon.price * intent.quantity;
    if (cost <= budgetHeadroom) {
      score += 40;
      reasons.push("Fits within buyer budget headroom.");
    } else {
      reasons.push("Exceeds buyer budget.");
    }

    // 2. Buyer Relevance (0-30 points)
    const matchingTags = addon.tags.filter(tag => intent.requestedTags.includes(tag));
    if (matchingTags.length > 0) {
      score += 30;
      reasons.push(`Matches requested preferences: ${matchingTags.join(', ')}.`);
    }

    // 3. Compatibility (0-10 points)
    const isCompatible = baseItems.some(base => 
      base.tags.some(tag => addon.tags.includes(tag)) || addon.tags.includes('universal')
    );
    if (isCompatible) {
      score += 10;
      reasons.push("Highly compatible with selected base items.");
    }

    // 4. Merchant Priority & Inventory (0-20 points)
    const merchantScore = (addon.merchantPriority * 10) + (addon.inventoryConfidence * 10);
    score += merchantScore;
    reasons.push(`Merchant priority/inventory score: ${merchantScore.toFixed(1)}/20.`);

    return { item: addon, score, reasons };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Constraint Trade-off Simulator / Safe Negotiation Mode
 * Deterministically generates structured alternatives when hard constraints and soft preferences conflict with budget/quantity.
 * Hard constraints (e.g. 'jain', dietary) are NEVER relaxed. Only soft preferences (packaging, expedited delivery, premium note) may be relaxed.
 */
export function simulateConstraintTradeoffs(
  baseItems: CatalogItem[],
  availableAddons: CatalogItem[],
  intent: BuyerIntent,
  maxUnapprovedThreshold: number = 20000
): TradeoffSimulationResult {
  const hardConstraints = intent.hardConstraints && intent.hardConstraints.length > 0 
    ? intent.hardConstraints 
    : intent.requestedTags.filter(t => ['jain', 'vegan', 'halal', 'kosher', 'gluten_free'].includes(t));
  
  const softPreferences = intent.softPreferences && intent.softPreferences.length > 0
    ? intent.softPreferences
    : intent.requestedTags.filter(t => !hardConstraints.includes(t));

  const baseCostPerUnit = baseItems.reduce((sum, item) => sum + item.price, 0);
  const baseTotal = baseCostPerUnit * intent.quantity;

  const matchedAddons = availableAddons.filter(a => 
    a.tags.some(t => intent.requestedTags.includes(t)) || hardConstraints.some(h => a.tags.includes(h))
  );
  const fullAddonCostPerUnit = matchedAddons.reduce((sum, a) => sum + a.price, 0);
  const fullTotal = (baseCostPerUnit + fullAddonCostPerUnit) * intent.quantity;

  const hasConflict = fullTotal > intent.budget || baseTotal > intent.budget;

  const alternatives: TradeoffAlternative[] = [];

  // Alternative 1: Budget-Strict (Preserve Hard Constraints, Relax Non-Essential Soft Delivery/Packaging Preferences)
  const budgetFittingAddons = matchedAddons
    .filter(a => !a.tags.includes('express_shipping') && !a.tags.includes('priority_shipping'))
    .slice(0, 1);
  
  const alt1AddonTotal = budgetFittingAddons.reduce((sum, a) => sum + a.price, 0) * intent.quantity;
  const alt1Total = baseTotal + alt1AddonTotal;
  const alt1Relaxed = softPreferences.filter(sp => !budgetFittingAddons.some(bfa => bfa.tags.includes(sp)));

  alternatives.push({
    optionId: 'alt_budget_strict',
    title: 'Option A: Budget-Compliant Core Bundle',
    preservedConstraints: [...hardConstraints, 'budget_under_18k', 'quantity_25', ...softPreferences.filter(sp => !alt1Relaxed.includes(sp))],
    relaxedConstraints: alt1Relaxed.length > 0 ? alt1Relaxed : ['standard_ground_shipping_instead_of_priority'],
    baseItems: baseItems.map(b => ({ id: b.id, name: b.name, unitPrice: b.price, quantity: intent.quantity })),
    addonItems: budgetFittingAddons.map(a => ({ id: a.id, name: a.name, unitPrice: a.price, quantity: intent.quantity })),
    finalTotal: alt1Total,
    incrementalRevenue: alt1AddonTotal,
    requiresApproval: alt1Total > maxUnapprovedThreshold,
    policyChecks: {
      isCompliant: true,
      maxDiscountAllowed: '15%',
      unapprovedThreshold: `₹${maxUnapprovedThreshold}`,
    },
    explanation: `Maintains 100% of hard constraints (${hardConstraints.join(', ') || 'dietary'}) and exact quantity (${intent.quantity}) within ₹${intent.budget}. Replaces express air courier with standard 2-day delivery.`
  });

  // Alternative 2: Full-Feature Premium Bundle (Preserve all Soft Preferences, Relax Budget Headroom ceiling)
  alternatives.push({
    optionId: 'alt_full_feature',
    title: 'Option B: Uncompromised Premium Bundle (Budget Expansion)',
    preservedConstraints: [...hardConstraints, ...softPreferences, 'quantity_25'],
    relaxedConstraints: ['budget_strictly_under_18k'],
    baseItems: baseItems.map(b => ({ id: b.id, name: b.name, unitPrice: b.price, quantity: intent.quantity })),
    addonItems: matchedAddons.map(a => ({ id: a.id, name: a.name, unitPrice: a.price, quantity: intent.quantity })),
    finalTotal: fullTotal,
    incrementalRevenue: fullAddonCostPerUnit * intent.quantity,
    requiresApproval: fullTotal > maxUnapprovedThreshold || fullTotal > intent.budget,
    policyChecks: {
      isCompliant: true,
      maxDiscountAllowed: '15%',
      unapprovedThreshold: `₹${maxUnapprovedThreshold}`,
    },
    explanation: `Includes all requested add-ons (${matchedAddons.map(a => a.name).join(', ')}). Total ₹${fullTotal} exceeds original ₹${intent.budget} budget by ₹${fullTotal - intent.budget}, requiring buyer approval.`
  });

  // Alternative 3: Quantity-Adjusted High-Spec Bundle
  const costPerHamperWithAllAddons = baseCostPerUnit + fullAddonCostPerUnit;
  const optimizedQuantity = Math.floor(intent.budget / (costPerHamperWithAllAddons || 1));
  if (optimizedQuantity > 0 && optimizedQuantity < intent.quantity) {
    const alt3Total = costPerHamperWithAllAddons * optimizedQuantity;
    alternatives.push({
      optionId: 'alt_quantity_optimized',
      title: `Option C: Optimized Executive Count (${optimizedQuantity} Units)`,
      preservedConstraints: [...hardConstraints, ...softPreferences, 'budget_under_18k'],
      relaxedConstraints: [`quantity_adjusted_from_${intent.quantity}_to_${optimizedQuantity}`],
      baseItems: baseItems.map(b => ({ id: b.id, name: b.name, unitPrice: b.price, quantity: optimizedQuantity })),
      addonItems: matchedAddons.map(a => ({ id: a.id, name: a.name, unitPrice: a.price, quantity: optimizedQuantity })),
      finalTotal: alt3Total,
      incrementalRevenue: fullAddonCostPerUnit * optimizedQuantity,
      requiresApproval: alt3Total > maxUnapprovedThreshold,
      policyChecks: {
        isCompliant: true,
        maxDiscountAllowed: '15%',
        unapprovedThreshold: `₹${maxUnapprovedThreshold}`,
      },
      explanation: `Preserves all dietary options, custom wax-sealed notes, and Friday priority courier while fitting ₹${intent.budget} by provisioning ${optimizedQuantity} luxury hampers.`
    });
  }

  return {
    hasConflict,
    conflictReason: hasConflict 
      ? `Full request with all soft add-ons totals ₹${fullTotal}, which exceeds the stated buyer budget limit of ₹${intent.budget}.`
      : undefined,
    alternatives,
    mode: 'mock',
    label: 'Demo/Test Simulation'
  };
}

/**
 * Adaptive Payment Recovery / Revenue Recovery Agent
 * Deterministically generates recovery pathways when a checkout or bank gateway transaction fails.
 * Never relaxes hard constraints. Preserves quote integrity while offering recovery routes.
 */
export function generatePaymentRecoveryOptions(
  failedQuote: {
    quoteId: string;
    totalAmount: number;
    baseItems: { id: string; name: string; unitPrice: number; quantity: number }[];
    addonItems: { id: string; name: string; unitPrice: number; quantity: number }[];
    productTags: string[];
    hardConstraints?: string[];
  },
  failureReason: string = 'GATEWAY_CARD_NETWORK_TIMEOUT',
  maxUnapprovedThreshold: number = 20000
): PaymentRecoveryResult {
  const hardConstraints = failedQuote.hardConstraints && failedQuote.hardConstraints.length > 0
    ? failedQuote.hardConstraints
    : failedQuote.productTags.filter(t => ['jain', 'vegan', 'halal', 'kosher'].includes(t));

  const recoveryOptions: PaymentRecoveryOption[] = [];

  // Option 1: Direct Idempotent Retry (Exact Same Quote & Amount via Alternate UPI Rail)
  recoveryOptions.push({
    optionId: 'rec_retry_exact',
    title: 'Option 1: Instant UPI Mandate Retry (Preserve 100% Cart)',
    recoveryStrategy: 'SAME_QUOTE_RETRY',
    changedItems: [{
      action: 'RETRY',
      productId: failedQuote.quoteId,
      productName: 'Full Quote Package',
      originalPrice: failedQuote.totalAmount,
    }],
    preservedHardConstraints: hardConstraints.length > 0 ? hardConstraints : ['all_selected_specifications'],
    relaxedConstraints: [],
    finalTotal: failedQuote.totalAmount,
    recoveredRevenue: failedQuote.totalAmount,
    requiresApproval: failedQuote.totalAmount > maxUnapprovedThreshold,
    explanation: 'Safely re-attempts transaction using Razorpay Instant UPI Intent rail with the original quote fingerprint, avoiding duplicate orders.'
  });

  // Option 2: Remove Lowest-Priority Optional Add-on (Prune Cart to guarantee immediate settlement)
  if (failedQuote.addonItems && failedQuote.addonItems.length > 0) {
    const sortedAddons = [...failedQuote.addonItems].sort((a, b) => a.unitPrice - b.unitPrice);
    const lowestPriorityAddon = sortedAddons[0];
    const prunedAddonTotal = failedQuote.addonItems
      .filter(a => a.id !== lowestPriorityAddon.id)
      .reduce((sum, a) => sum + (a.unitPrice * a.quantity), 0);
    const baseTotal = failedQuote.baseItems.reduce((sum, b) => sum + (b.unitPrice * b.quantity), 0);
    const prunedTotal = baseTotal + prunedAddonTotal;

    recoveryOptions.push({
      optionId: 'rec_prune_lowest_addon',
      title: `Option 2: Value Optimized Recovery (Omit ${lowestPriorityAddon.name})`,
      recoveryStrategy: 'REMOVE_LOWEST_PRIORITY_ADDON',
      changedItems: [{
        action: 'REMOVED',
        productId: lowestPriorityAddon.id,
        productName: lowestPriorityAddon.name,
        originalPrice: lowestPriorityAddon.unitPrice * lowestPriorityAddon.quantity,
      }],
      preservedHardConstraints: hardConstraints.length > 0 ? hardConstraints : ['core_product_bundle'],
      relaxedConstraints: [lowestPriorityAddon.name],
      finalTotal: prunedTotal,
      recoveredRevenue: prunedTotal,
      requiresApproval: prunedTotal > maxUnapprovedThreshold,
      explanation: `Preserves 100% of hard constraints while shedding non-essential ${lowestPriorityAddon.name} to lower transaction amount to ₹${prunedTotal}.`
    });
  }

  // Option 3: Substitute with Standard Ground Courier SKU
  const shippingAddon = failedQuote.addonItems.find(a => a.id.includes('shipping') || a.name.toLowerCase().includes('express'));
  if (shippingAddon) {
    const baseTotal = failedQuote.baseItems.reduce((sum, b) => sum + (b.unitPrice * b.quantity), 0);
    const otherAddons = failedQuote.addonItems.filter(a => a.id !== shippingAddon.id);
    const standardShippingUnitCost = 40; // ₹40 vs ₹120 express
    const otherAddonTotal = otherAddons.reduce((sum, a) => sum + (a.unitPrice * a.quantity), 0);
    const subTotal = baseTotal + otherAddonTotal + (standardShippingUnitCost * (shippingAddon.quantity || 1));

    recoveryOptions.push({
      optionId: 'rec_substitute_standard_shipping',
      title: 'Option 3: Standard 2-Day Courier Route (Cost-Efficient)',
      recoveryStrategy: 'DOWNGRADE_OPTIONAL_SKU',
      changedItems: [{
        action: 'SUBSTITUTED',
        productId: shippingAddon.id,
        productName: `${shippingAddon.name} -> Standard Surface Express`,
        originalPrice: shippingAddon.unitPrice * shippingAddon.quantity,
        newPrice: standardShippingUnitCost * shippingAddon.quantity,
      }],
      preservedHardConstraints: hardConstraints.length > 0 ? hardConstraints : ['all_items_intact'],
      relaxedConstraints: ['friday_priority_air_delivery'],
      finalTotal: subTotal,
      recoveredRevenue: subTotal,
      requiresApproval: subTotal > maxUnapprovedThreshold,
      explanation: 'Switches priority air delivery to guaranteed surface courier, saving budget while protecting core hamper contents.'
    });
  }

  return {
    failedQuoteId: failedQuote.quoteId,
    failureReason,
    originalTotal: failedQuote.totalAmount,
    recoveryOptions,
    mode: 'mock',
    label: 'Demo/Test Simulation'
  };
}
