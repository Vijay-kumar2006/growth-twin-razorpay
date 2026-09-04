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
}
export interface ScoredAddon {
    item: CatalogItem;
    score: number;
    reasons: string[];
}
export declare function scoreAddons(baseItems: CatalogItem[], availableAddons: CatalogItem[], intent: BuyerIntent): ScoredAddon[];
//# sourceMappingURL=revenue-bundle.d.ts.map