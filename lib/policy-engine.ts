export interface MerchantPolicy {
  maxDiscountPercentage: number;
  maxUnapprovedOrderValue: number;
  permittedAddons: string[];
  prohibitedTagsForAddons: string[];
  requireExplicitApprovalForLink: boolean;
  quoteExpiryMinutes: number;
}

export const defaultPolicy: MerchantPolicy = {
  maxDiscountPercentage: 15,
  maxUnapprovedOrderValue: 20000,
  permittedAddons: ['custom_note', 'priority_shipping', 'premium_packaging', 'addon_note_01', 'addon_shipping_02', 'addon_sweets_03', 'addon_packaging_04'],
  prohibitedTagsForAddons: ['perishable', 'digital'],
  requireExplicitApprovalForLink: false, // Guardrails handle high-value gating by default
  quoteExpiryMinutes: 60
};

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

export function evaluatePolicy(quote: QuoteRequest, policy: MerchantPolicy = defaultPolicy): PolicyCheckResult {
  const reasons: string[] = [];
  let isCompliant = true;
  let requiresApproval = false;

  const totalValue = quote.baseValue + quote.addonsValue;
  const discountAmount = (totalValue * quote.discountPercentage) / 100;
  const finalValue = totalValue - discountAmount;

  if (quote.discountPercentage > policy.maxDiscountPercentage) {
    isCompliant = false;
    reasons.push(`Discount ${quote.discountPercentage}% exceeds maximum allowed ${policy.maxDiscountPercentage}%`);
  }

  if (finalValue > policy.maxUnapprovedOrderValue && !quote.hasExplicitApproval) {
    requiresApproval = true;
    reasons.push(`Order value ₹${finalValue} exceeds auto-approval threshold of ₹${policy.maxUnapprovedOrderValue}`);
  }

  for (const addon of quote.addonIds) {
    const isPermitted = policy.permittedAddons.some(
      p => p === addon || addon.includes(p) || p.includes(addon)
    );
    if (!isPermitted) {
      isCompliant = false;
      reasons.push(`Addon ${addon} is not permitted by merchant policy`);
    }
  }

  const hasProhibitedTag = quote.productTags.some(tag => policy.prohibitedTagsForAddons.includes(tag));
  if (hasProhibitedTag && quote.addonIds.length > 0) {
    isCompliant = false;
    reasons.push(`Addons are prohibited for products with tags: ${policy.prohibitedTagsForAddons.join(', ')}`);
  }
  
  if (policy.requireExplicitApprovalForLink && !quote.hasExplicitApproval) {
      requiresApproval = true;
      reasons.push("Merchant requires explicit approval before creating payment links");
  }

  return { isCompliant, requiresApproval, reasons };
}
