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
}

export interface ScoredAddon {
  item: CatalogItem;
  score: number;
  reasons: string[];
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
