// config/payment.js - MOCK PAYMENT SYSTEM (NO RAZORPAY NEEDED)
class MockPaymentGateway {
  constructor() {
    this.orders = new Map();
  }

  // Simulate creating an order
  async createOrder(options) {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order = {
      id: orderId,
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      status: 'created',
      created_at: new Date()
    };
    
    this.orders.set(orderId, order);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return order;
  }

  // Simulate payment verification
  async verifyPayment(orderId, paymentId, signature) {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Simulate verification (always success in mock)
    return {
      verified: true,
      orderId,
      paymentId,
      signature
    };
  }

  // Get order details
  getOrder(orderId) {
    return this.orders.get(orderId);
  }
}

// Export singleton instance
module.exports = new MockPaymentGateway();
