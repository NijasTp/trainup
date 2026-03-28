import { injectable, inject } from 'inversify';
import Stripe from 'stripe';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import TYPES from '../core/types/types';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';
import { IGymTransactionRepository } from '../core/interfaces/repositories/IGymTransactionRepository';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { logger } from '../utils/logger.util';
import dotenv from 'dotenv';

dotenv.config();

@injectable()
export class PaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor(
    @inject(TYPES.ITransactionService) private _transactionService: ITransactionService,
    @inject(TYPES.IGymTransactionRepository) private _gymTransactionRepo: IGymTransactionRepository
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError('Stripe secret key is missing', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    if (!process.env.STRIPE_SUCCESS_URL || !process.env.STRIPE_CANCEL_URL) {
      throw new AppError('Stripe success or cancel URL is missing in environment', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createTrainerCheckoutSession(params: {
    userId: string;
    trainerId: string;
    planType: 'basic' | 'premium' | 'pro';
    amount: number;
    userName: string;
    trainerName: string;
    duration: number;
  }): Promise<{ sessionId: string; url: string | null }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `TrainUp: ${params.planType.toUpperCase()} Plan with ${params.trainerName}`,
                description: `${params.duration} month(s) of personal training services.`,
              },
              unit_amount: Math.round(params.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
        client_reference_id: params.userId,
        metadata: {
          type: 'trainer_subscription',
          userId: params.userId,
          trainerId: params.trainerId,
          planType: params.planType,
          amount: params.amount.toString(),
          duration: params.duration.toString(),
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      logger.error('Stripe Trainer Checkout Error:', error);
      throw new AppError('Failed to create checkout session', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async createGymCheckoutSession(params: {
    userId: string;
    gymId: string;
    subscriptionPlanId: string;
    amount: number;
    userName: string;
    gymName: string;
    planName: string;
    preferredTime: string;
  }): Promise<{ sessionId: string; url: string | null }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `TrainUp: ${params.planName} Membership at ${params.gymName}`,
                description: `Preferred training time: ${params.preferredTime}`,
              },
              unit_amount: Math.round(params.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
        client_reference_id: params.userId,
        metadata: {
          type: 'gym_subscription',
          userId: params.userId,
          gymId: params.gymId,
          subscriptionPlanId: params.subscriptionPlanId,
          preferredTime: params.preferredTime,
          amount: params.amount.toString(),
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      logger.error('Stripe Gym Checkout Error:', error);
      throw new AppError('Failed to create checkout session', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<any> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      logger.error(`Webhook Signature Verification Failed: ${err.message}`);
      throw new AppError(`Webhook Error: ${err.message}`, STATUS_CODE.BAD_REQUEST);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      return { 
        type: 'payment_success',
        metadata: session.metadata,
        paymentIntentId: session.payment_intent as string,
        sessionId: session.id
      };
    }

    return { received: true };
  }

  async markUserPendingGymTransactionsAsFailed(userId: string): Promise<number> {
    const result = await this._gymTransactionRepo.updateMany(
      { userId, status: 'pending' }, 
      { status: 'failed' }
    );
    return result.modifiedCount;
  }

  async getGymTransactions(gymId: string, page: number, limit: number): Promise<any> {
    const { transactions, totalPages } = await this._gymTransactionRepo.find({ gymId }, page, limit);
    return { transactions, totalPages };
  }

  async createGymTransaction(data: any): Promise<any> {
    return await this._gymTransactionRepo.create(data);
  }

  async findPendingGymTransactionByUser(userId: string): Promise<any> {
    const transactions = await this._gymTransactionRepo.find({ userId, status: 'pending' }, 1, 1);
    return transactions.transactions[0] || null;
  }

  async getCheckoutSession(sessionId: string): Promise<any> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      logger.error('Stripe Session Retrieve Error:', error);
      throw new AppError('Failed to retrieve checkout session', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  }
}