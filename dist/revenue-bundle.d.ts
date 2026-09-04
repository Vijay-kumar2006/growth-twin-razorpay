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
export declare function scoreAddons(baseItems: CatalogItem[], availableAddons: CatalogItem[], intent: BuyerIntent): ScoredAddon[];
/**
 * Constraint Trade-off Simulator / Safe Negotiation Mode
 * Deterministically generates structured alternatives when hard constraints and soft preferences conflict with budget/quantity.
 * Hard constraints (e.g. 'jain', dietary) are NEVER relaxed. Only soft preferences (packaging, expedited delivery, premium note) may be relaxed.
 */
export declare function simulateConstraintTradeoffs(baseItems: CatalogItem[], availableAddons: CatalogItem[], intent: BuyerIntent, maxUnapprovedThreshold?: number): TradeoffSimulationResult;
//# sourceMappingURL=revenue-bundle.d.ts.map