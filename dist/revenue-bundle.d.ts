export interface CatalogItem {
    id: string;
    name: string;
    price: number;
    tags: string[];
    type: 'base' | 'addon';
    inventoryConfidence: number;
    merchantPriority: number;
}
export interface BuyerIntent {
    budget: number;
    requestedTags: string[];
    quantity: number;
    hardConstraints?: string[];
    softPreferences?: string[];
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
    baseItems: {
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
    }[];
    addonItems: {
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
    }[];
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
export declare function scoreAddons(baseItems: CatalogItem[], availableAddons: CatalogItem[], intent: BuyerIntent): ScoredAddon[];
/**
 * Constraint Trade-off Simulator / Safe Negotiation Mode
 * Deterministically generates structured alternatives when hard constraints and soft preferences conflict with budget/quantity.
 * Hard constraints (e.g. 'jain', dietary) are NEVER relaxed. Only soft preferences (packaging, expedited delivery, premium note) may be relaxed.
 */
export declare function simulateConstraintTradeoffs(baseItems: CatalogItem[], availableAddons: CatalogItem[], intent: BuyerIntent, maxUnapprovedThreshold?: number): TradeoffSimulationResult;
/**
 * Adaptive Payment Recovery / Revenue Recovery Agent
 * Deterministically generates recovery pathways when a checkout or bank gateway transaction fails.
 * Never relaxes hard constraints. Preserves quote integrity while offering recovery routes.
 */
export declare function generatePaymentRecoveryOptions(failedQuote: {
    quoteId: string;
    totalAmount: number;
    baseItems: {
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
    }[];
    addonItems: {
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
    }[];
    productTags: string[];
    hardConstraints?: string[];
}, failureReason?: string, maxUnapprovedThreshold?: number): PaymentRecoveryResult;
//# sourceMappingURL=revenue-bundle.d.ts.map