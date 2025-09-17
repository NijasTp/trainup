export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface IPaymentRepository {
  createOrder(amount: number, currency: string): Promise<RazorpayOrder>;
}