import { injectable } from 'inversify';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import dotenv from 'dotenv';
import { CreateOrderResponseDto } from '../dtos/payment.dto';
import { MESSAGES } from '../constants/messages';

dotenv.config();

@injectable()
export class PaymentService implements IPaymentService {
  private _razorpay: Razorpay;

  constructor() {
    this._razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number, currency: string, receipt?: string): Promise<CreateOrderResponseDto> {
    const order = await this._razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });

    const response: CreateOrderResponseDto = {
      id: order.id,
      entity: order.entity,
      amount: Number(order.amount),
      amount_paid: Number(order.amount_paid),
      amount_due: Number(order.amount_due),
      currency: order.currency,
      receipt: order.receipt ?? undefined,
      status: order.status,
      created_at: order.created_at,
    };

    return response;
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generatedSignature === signature;
  }
}