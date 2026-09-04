/**
 * RazorAgent MCP (Model Context Protocol) Server Engine
 * Exposes standardized, callable commerce tools for autonomous AI agents.
 *
 * Powered by a pluggable Merchant-Agnostic Catalog Architecture (Shopify, WooCommerce, Demo).
 * Extended with Growth Twin deterministic revenue & policy tools.
 */
import { MCPToolDefinition } from './types';
import { CatalogProvider } from './catalog-provider';
import { MerchantPolicy } from '../policy-engine';
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
    private calculateCartQuote;
    private evaluateSpendPolicy;
    private createGuardedOrder;
    private verifyPaymentAndSettle;
    private recommendAddons;
    private evaluateGrowthPolicy;
    private getCommerceContract;
}
export declare const globalMCPEngine: MCPEngine;
export declare const handleMCPRequest: (body: any) => Promise<any>;
//# sourceMappingURL=mcp-engine.d.ts.map