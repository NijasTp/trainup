export interface IPaymentService {
  createOrder(amount: number, currency: string, receipt?: string): Promise<any>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
}
