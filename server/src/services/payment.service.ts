import { injectable } from 'inversify';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import dotenv from 'dotenv';
import { CreateOrderResponseDto } from '../dtos/payment.dto';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

dotenv.config();

@injectable()
export class PaymentService implements IPaymentService {
  private _razorpay: Razorpay;

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new AppError(MESSAGES.PAYMENT_CONFIG_INCOMPLETE, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    this._razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number, currency: string, receipt?: string): Promise<CreateOrderResponseDto> {
    try {
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
    } catch (error) {
      throw new AppError(MESSAGES.PAYMENT_CREATION_FAILED, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new AppError(MESSAGES.INVALID_SIGNATURE, STATUS_CODE.BAD_REQUEST);
    }

    return true;
  }
}