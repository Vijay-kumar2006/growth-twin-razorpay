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
  amount: number; // in paise
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
  amount: number; // in paise
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

export class MockRazorpayAdapter implements RazorpayAdapter {
  private orders: Map<string, RazorpayOrder> = new Map();

  async createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    const id = `order_${Math.random().toString(36).substring(2, 12)}`;
    const plinkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    const order: RazorpayOrder = {
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

  async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("Order not found");
    return order;
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLink> {
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

  async simulateFailure(orderId: string): Promise<RazorpayOrder> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("Order not found");
    order.status = 'failed';
    this.orders.set(orderId, order);
    return order;
  }

  getMode(): string {
    return 'Demo/Test Simulation (Deterministic Mock Mode)';
  }
}

export class LiveRazorpayAdapter implements RazorpayAdapter {
  private keyId: string;
  private keySecret: string;
  private isLiveProduction: boolean;

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.isLiveProduction = keyId.startsWith('rzp_live_');
  }

  private getAuthHeader(): string {
    return Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
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

  async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: `Basic ${this.getAuthHeader()}` },
    });
    if (!res.ok) throw new Error("Failed to fetch Razorpay order");
    const orderData = await res.json();
    return {
      ...orderData,
      mode: this.isLiveProduction ? "live" : "test",
      label: this.isLiveProduction ? "Razorpay Live" : "Razorpay Test Sandbox",
    };
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLink> {
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

  async simulateFailure(orderId: string): Promise<RazorpayOrder> {
    const order = await this.fetchOrder(orderId);
    order.status = 'failed';
    return order;
  }

  getMode(): string {
    return this.isLiveProduction ? 'Razorpay Live Production' : 'Razorpay Test Sandbox';
  }
}

/**
 * Factory to get appropriate adapter based on environment configuration.
 * Always defaults safely to Mock mode if credentials are missing or placeholders.
 */
export function getRazorpayAdapter(): RazorpayAdapter {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    keyId &&
    keySecret &&
    !keyId.includes('placeholder') &&
    !keyId.includes('AiBuilder')
  ) {
    return new LiveRazorpayAdapter(keyId, keySecret);
  }

  return new MockRazorpayAdapter();
}

export const globalGrowthRazorpayAdapter = getRazorpayAdapter();
