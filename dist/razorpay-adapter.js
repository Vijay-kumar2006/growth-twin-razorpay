"use strict";
/**
 * Growth Twin Pluggable Razorpay Adapter
 * Default: Deterministic Mock Adapter (labeled "Demo/Test Simulation")
 * Drop-in: Real Razorpay Test/Live API adapter activated seamlessly when environment variables are set.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalGrowthRazorpayAdapter = exports.LiveRazorpayAdapter = exports.MockRazorpayAdapter = void 0;
exports.getRazorpayAdapter = getRazorpayAdapter;
class MockRazorpayAdapter {
    constructor() {
        this.orders = new Map();
    }
    async createOrder(params) {
        const id = `order_${Math.random().toString(36).substring(2, 12)}`;
        const plinkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
        const order = {
            id,
            entity: 'order',
            amount: params.amount,
            currency: params.currency || 'INR',
            receipt: params.receipt,
            status: 'created',
            attempts: 0,
            notes: params.notes,
            payment_link: `https://test.razorpay.com/pay/${plinkId}`,
            short_url: `https://test.razorpay.com/pay/${plinkId}`,
            mode: "mock",
            label: "Demo/Test Simulation"
        };
        this.orders.set(id, order);
        return order;
    }
    async fetchOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order)
            throw new Error("Order not found");
        return order;
    }
    async createPaymentLink(params) {
        const id = `plink_${Math.random().toString(36).substring(2, 10)}`;
        return {
            id,
            entity: 'payment_link',
            amount: params.amount,
            currency: params.currency || 'INR',
            status: 'created',
            reference_id: params.reference_id,
            short_url: `https://test.razorpay.com/pay/${id}`,
            mode: "mock",
            label: "Demo/Test Simulation"
        };
    }
    async simulateFailure(orderId) {
        const order = this.orders.get(orderId);
        if (!order)
            throw new Error("Order not found");
        order.status = 'failed';
        this.orders.set(orderId, order);
        return order;
    }
    getMode() {
        return 'Demo/Test Simulation (Deterministic Mock Mode)';
    }
}
exports.MockRazorpayAdapter = MockRazorpayAdapter;
class LiveRazorpayAdapter {
    constructor(keyId, keySecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.isLiveProduction = keyId.startsWith('rzp_live_');
    }
    getAuthHeader() {
        return Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    }
    async createOrder(params) {
        const res = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.getAuthHeader()}`,
            },
            body: JSON.stringify({
                amount: params.amount,
                currency: params.currency || 'INR',
                receipt: params.receipt,
                notes: params.notes,
            }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Razorpay API error: ${err.error?.description || res.statusText}`);
        }
        const orderData = await res.json();
        return {
            id: orderData.id,
            entity: 'order',
            amount: orderData.amount,
            currency: orderData.currency,
            receipt: orderData.receipt,
            status: orderData.status,
            attempts: orderData.attempts,
            notes: orderData.notes,
            payment_link: `https://rzp.io/i/${orderData.id}`,
            short_url: `https://rzp.io/i/${orderData.id}`,
            mode: this.isLiveProduction ? "live" : "test",
            label: this.isLiveProduction ? "Razorpay Live" : "Razorpay Test Sandbox",
        };
    }
    async fetchOrder(orderId) {
        const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
            headers: { Authorization: `Basic ${this.getAuthHeader()}` },
        });
        if (!res.ok)
            throw new Error("Failed to fetch Razorpay order");
        const orderData = await res.json();
        return {
            ...orderData,
            mode: this.isLiveProduction ? "live" : "test",
            label: this.isLiveProduction ? "Razorpay Live" : "Razorpay Test Sandbox",
        };
    }
    async createPaymentLink(params) {
        const res = await fetch('https://api.razorpay.com/v1/payment_links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.getAuthHeader()}`,
            },
            body: JSON.stringify({
                amount: params.amount,
                currency: params.currency || 'INR',
                description: params.description,
                reference_id: params.reference_id,
                notes: params.notes,
            }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Razorpay Payment Link error: ${err.error?.description || res.statusText}`);
        }
        const linkData = await res.json();
        return {
            id: linkData.id,
            entity: 'payment_link',
            amount: linkData.amount,
            currency: linkData.currency,
            status: linkData.status,
            reference_id: linkData.reference_id,
            short_url: linkData.short_url,
            mode: this.isLiveProduction ? "live" : "test",
            label: this.isLiveProduction ? "Razorpay Live" : "Razorpay Test Sandbox",
        };
    }
    async simulateFailure(orderId) {
        const order = await this.fetchOrder(orderId);
        order.status = 'failed';
        return order;
    }
    getMode() {
        return this.isLiveProduction ? 'Razorpay Live Production' : 'Razorpay Test Sandbox';
    }
}
exports.LiveRazorpayAdapter = LiveRazorpayAdapter;
/**
 * Factory to get appropriate adapter based on environment configuration.
 * Always defaults safely to Mock mode if credentials are missing or placeholders.
 */
function getRazorpayAdapter() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId &&
        keySecret &&
        !keyId.includes('placeholder') &&
        !keyId.includes('AiBuilder')) {
        return new LiveRazorpayAdapter(keyId, keySecret);
    }
    return new MockRazorpayAdapter();
}
exports.globalGrowthRazorpayAdapter = getRazorpayAdapter();
//# sourceMappingURL=razorpay-adapter.js.map