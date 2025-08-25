export interface IPaymentRepository {
  createOrder(amount: number, currency: string): Promise<any>;
}
