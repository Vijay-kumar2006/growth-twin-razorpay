export interface RazorpayAdapter {
  createOrder(params: CreateOrderParams): Promise<RazorpayOrder>;
  fetchOrder(orderId: string): Promise<RazorpayOrder>;
  createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLink>;
  simulateFailure(orderId: string): Promise<RazorpayOrder>;
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
  mode: "mock";
  label: "Demo/Test Simulation";
}

export interface CreatePaymentLinkParams {
  amount: number;
  currency: string;
  description: string;
  reference_id: string;
}

export interface RazorpayPaymentLink {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  reference_id: string;
  short_url: string;
  mode: "mock";
  label: "Demo/Test Simulation";
}

export class MockRazorpayAdapter implements RazorpayAdapter {
  private orders: Map<string, RazorpayOrder> = new Map();

  async createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    const id = `order_${Math.random().toString(36).substring(7)}`;
    const order: RazorpayOrder = {
      id,
      entity: 'order',
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      status: 'created',
      attempts: 0,
      notes: params.notes,
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
    const id = `plink_${Math.random().toString(36).substring(7)}`;
    return {
      id,
      entity: 'payment_link',
      amount: params.amount,
      currency: params.currency,
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
}
