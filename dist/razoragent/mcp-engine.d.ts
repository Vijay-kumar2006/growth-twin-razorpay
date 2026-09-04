/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 *
 * Powered by a pluggable Merchant-Agnostic Catalog Architecture (Shopify, WooCommerce, Demo).
 * Extended with Growth Twin deterministic revenue, policy, and constraint trade-off simulator tools.
 */
import { CartQuote, MCPToolDefinition } from './types';
import { CatalogProvider } from './catalog-provider';
import { MerchantPolicy } from '../policy-engine';
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
export declare const GROWTH_QUOTE_STORE: Map<string, StoredGrowthQuote>;
export declare const MCP_TOOLS: MCPToolDefinition[];
export declare class MCPEngine {
    private catalogProvider;
    private growthPolicy;
    constructor(customProvider?: CatalogProvider);
    setCatalogProvider(provider: CatalogProvider): void;
    getCatalogProvider(): CatalogProvider;
    getGrowthPolicy(): MerchantPolicy;
    updateGrowthPolicy(newPolicy: Partial<MerchantPolicy>): void;
    listTools(): MCPToolDefinition[];
    executeTool(toolName: string, args: Record<string, any>): Promise<any>;
    private searchProducts;
    private getProductDetails;
    calculateCartQuote(items: {
        product_id: string;
        quantity: number;
    }[], couponCode?: string, hasExplicitApproval?: boolean): Promise<CartQuote>;
    private evaluateSpendPolicy;
    private createGuardedOrder;
    private verifyPaymentAndSettle;
    private recommendAddons;
    private evaluateGrowthPolicy;
    private getCommerceContract;
    private simulateTradeoffs;
    private recoverFailedTransaction;
}
export declare const globalMCPEngine: MCPEngine;
export declare const handleMCPRequest: (body: any) => Promise<any>;
//# sourceMappingURL=mcp-engine.d.ts.map