import { CreateOrderResponseDto } from "../../../dtos/payment.dto";

export interface IPaymentService {
  createOrder(
    amount: number,
    currency: string,
    receipt?: string
  ): Promise<CreateOrderResponseDto>;

  verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    trainerId: string,
    planType: 'basic' | 'premium' | 'pro',
    amount: number
  ): Promise<boolean>;
}
