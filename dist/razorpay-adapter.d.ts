/**
 * Growth Twin Pluggable Razorpay Adapter
 * Default: Deterministic Mock Adapter (labeled "Demo/Test Simulation")
 * Drop-in: Real Razorpay Test/Live API adapter activated seamlessly when environment variables are set.
 */
export interface RazorpayAdapter {
    createOrder(params: CreateOrderParams): Promise<RazorpayOrder>;
    fetchOrder(orderId: string): Promise<RazorpayOrder>;
    createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLink>;
    simulateFailure(orderId: string): Promise<RazorpayOrder>;
    getMode(): string;
}
export interface CreateOrderParams {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}
export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes?: Record<string, string>;
    payment_link?: string;
    short_url?: string;
    mode: "mock" | "test" | "live";
    label: "Demo/Test Simulation" | "Razorpay Test Sandbox" | "Razorpay Live";
}
export interface CreatePaymentLinkParams {
    amount: number;
    currency: string;
    description: string;
    reference_id: string;
    notes?: Record<string, string>;
}
export interface RazorpayPaymentLink {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    reference_id: string;
    short_url: string;
    mode: "mock" | "test" | "live";
    label: "Demo/Test Simulation" | "Razorpay Test Sandbox" | "Razorpay Live";
}
export declare class MockRazorpayAdapter implements RazorpayAdapter {
    private orders;
    createOrder(params: CreateOrderParams): Promise<RazorpayOrder>;
    fetchOrder(orderId: string): Promise<RazorpayOrder>;
    createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLink>;
    simulateFailure(orderId: string): Promise<RazorpayOrder>;
    getMode(): string;
}
export declare class LiveRazorpayAdapter implements RazorpayAdapter {
    private keyId;
    private keySecret;
    private isLiveProduction;
    constructor(keyId: string, keySecret: string);
    private getAuthHeader;
    createOrder(params: CreateOrderParams): Promise<RazorpayOrder>;
    fetchOrder(orderId: string): Promise<RazorpayOrder>;
    createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLink>;
    simulateFailure(orderId: string): Promise<RazorpayOrder>;
    getMode(): string;
}
/**
 * Factory to get appropriate adapter based on environment configuration.
 * Always defaults safely to Mock mode if credentials are missing or placeholders.
 */
export declare function getRazorpayAdapter(): RazorpayAdapter;
export declare const globalGrowthRazorpayAdapter: RazorpayAdapter;
//# sourceMappingURL=razorpay-adapter.d.ts.map