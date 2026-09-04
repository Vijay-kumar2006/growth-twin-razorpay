export interface MerchantPolicy {
    maxDiscountPercentage: number;
    maxUnapprovedOrderValue: number;
    permittedAddons: string[];
    prohibitedTagsForAddons: string[];
    requireExplicitApprovalForLink: boolean;
    quoteExpiryMinutes: number;
}
export declare const defaultPolicy: MerchantPolicy;
export interface QuoteRequest {
    baseValue: number;
    addonsValue: number;
    discountPercentage: number;
    addonIds: string[];
    productTags: string[];
    buyerConstraints: Record<string, any>;
    hasExplicitApproval: boolean;
}
export interface PolicyCheckResult {
    isCompliant: boolean;
    requiresApproval: boolean;
    reasons: string[];
}
export declare function evaluatePolicy(quote: QuoteRequest, policy?: MerchantPolicy): PolicyCheckResult;
//# sourceMappingURL=policy-engine.d.ts.map