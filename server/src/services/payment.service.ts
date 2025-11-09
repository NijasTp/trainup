import { injectable, inject } from 'inversify';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import dotenv from 'dotenv';
import { CreateOrderResponseDto } from '../dtos/payment.dto';
import { MESSAGES } from '../constants/messages.constants';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { IGymTransaction, GymTransactionModel } from '../models/gymTransaction.model';
import TYPES from '../core/types/types';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';

dotenv.config();

@injectable()
export class PaymentService implements IPaymentService {
  private _razorpay: Razorpay;

  constructor(
    @inject(TYPES.ITransactionService) private _transactionService: ITransactionService
  ) {
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

  async verifyTrainerPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    trainerId: string,
    planType: 'basic' | 'premium' | 'pro',
    amount: number
  ): Promise<boolean> {
    const isValid = await this.verifyPayment(orderId, paymentId, signature);
    
    if (!isValid) {
      return false;
    }

    
    const transaction = await this._transactionService.findByOrderId(orderId);
    if (!transaction || transaction.userId !== userId || transaction.trainerId !== trainerId) {
      return false;
    }

    return true;
  }

  async createGymTransaction(data: Partial<IGymTransaction>): Promise<IGymTransaction> {
    return await GymTransactionModel.create(data);
  }

  async updateGymTransactionStatus(
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string,
    signature?: string
  ): Promise<IGymTransaction | null> {
    return await GymTransactionModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { 
        status, 
        razorpayPaymentId: paymentId,
        razorpaySignature: signature 
      },
      { new: true }
    );
  }

  async findGymTransactionByOrderId(orderId: string): Promise<IGymTransaction | null> {
    return await GymTransactionModel.findOne({ razorpayOrderId: orderId });
  }

  async getGymTransactions(
    gymId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: IGymTransaction[]; totalPages: number }> {
    const query = { gymId };
    
    const transactions = await GymTransactionModel.find(query)
      .populate('userId', 'name email')
      .populate('subscriptionPlanId', 'name price duration')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await GymTransactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return { transactions: transactions as IGymTransaction[], totalPages };
  }
}