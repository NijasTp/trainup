import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { STATUS_CODE } from '../constants/status';
import TYPES from '../core/types/types';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService';
import { IGymService } from '../core/interfaces/services/IGymService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { CreateOrderRequestDto, CreateOrderResponseDto, VerifyPaymentRequestDto, VerifyPaymentResponseDto } from '../dtos/payment.dto';
import { CreateGymTransactionDto, VerifyGymPaymentDto } from '../dtos/gym.dto';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger.util';
import { ITransaction } from '../models/transaction.model';
import { AppError } from '../utils/appError.util';
import { addDays, addMonths, addYears } from 'date-fns';
import { IMailService } from '../core/interfaces/services/IMailService';
import { IGymReminderService } from '../core/interfaces/services/IGymReminderService';

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.ITransactionService) private _transactionService: ITransactionService,
    @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IMailService) private _emailService: IMailService,
    @inject(TYPES.IGymReminderService) private _gymReminderService: IGymReminderService
  ) {}

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateOrderRequestDto = req.body;
      const userId = (req.user as JwtPayload).id;
      const { trainerId, planType } = req.body;

      if (!trainerId) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      if (!userId) throw new AppError(MESSAGES.INVALID_USER_ID, STATUS_CODE.BAD_REQUEST);
      if (!planType) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);

      if (!['basic', 'premium', 'pro'].includes(planType)) {
        throw new AppError('Invalid plan type', STATUS_CODE.BAD_REQUEST);
      }

      const existingPendingTransaction = await this._transactionService.getUserPendingTransaction(userId);
      if (existingPendingTransaction) {
        throw new AppError('You have a pending transaction. Please complete or cancel it first.', STATUS_CODE.BAD_REQUEST);
      }

      const user = await this._userService.getUserById(userId);
      if (user?.assignedTrainer) {
        throw new AppError('You already have a trainer assigned.', STATUS_CODE.BAD_REQUEST);
      }

      const order: CreateOrderResponseDto = await this._paymentService.createOrder(dto.amount, dto.currency, dto.receipt);

      const transactionData: Partial<ITransaction> = {
        userId,
        trainerId,
        amount: dto.amount,
        planType,
        razorpayOrderId: order.id,
        razorpayPaymentId: '',
        status: 'pending',
        createdAt: new Date(),
      };

      await this._transactionService.createTransaction(transactionData);
      res.status(STATUS_CODE.OK).json(order);
    } catch (err) {
      logger.error('Create Order Error', err);
      next(err);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: VerifyPaymentRequestDto = req.body;
      const userId = (req.user as JwtPayload).id;

      if (!dto.trainerId || !userId || !dto.planType) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }

      if (!['basic', 'premium', 'pro'].includes(dto.planType)) {
        throw new AppError('Invalid plan type', STATUS_CODE.BAD_REQUEST);
      }

      const isValid = await this._paymentService.verifyTrainerPayment(
        dto.orderId,
        dto.paymentId,
        dto.signature,
        userId,
        dto.trainerId,
        dto.planType,
        dto.amount
      );

      let transaction = await this._transactionService.findByOrderId(dto.orderId);
      if (!transaction) {
        throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.BAD_REQUEST);
      }

      if (!isValid) {
        transaction = await this._transactionService.updateTransactionStatus(
          dto.orderId,
          'failed',
          dto.paymentId
        );
        throw new AppError(MESSAGES.INVALID_SIGNATURE, STATUS_CODE.BAD_REQUEST);
      }

      const trainer = await this._trainerService.getTrainerById(dto.trainerId);
      if (!trainer) {
        transaction = await this._transactionService.updateTransactionStatus(
          dto.orderId,
          'failed',
          dto.paymentId
        );
        throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.BAD_REQUEST);
      }

      const user = await this._userService.getUserById(userId);
      if (user?.assignedTrainer) {
        transaction = await this._transactionService.updateTransactionStatus(
          dto.orderId,
          'failed',
          dto.paymentId
        );
        throw new AppError('User already has a trainer', STATUS_CODE.BAD_REQUEST);
      }

      transaction = await this._transactionService.updateTransactionStatus(
        dto.orderId,
        'completed',
        dto.paymentId
      );

      await this._userService.updateUserTrainerId(userId, dto.trainerId);
      await this._userService.updateUserPlan(userId, dto.planType);
      await this._trainerService.addClientToTrainer(dto.trainerId, userId);

      const expiryDate = addMonths(new Date(), 1);
      let messagesLeft = 0;
      let videoCallsLeft = 0;

      switch (dto.planType) {
        case 'premium':
          messagesLeft = 200;
          break;
        case 'pro':
          messagesLeft = -1;
          videoCallsLeft = 5;
          break;
      }

      await this._userPlanService.createUserPlan({
        userId,
        trainerId: dto.trainerId,
        planType: dto.planType,
        messagesLeft,
        videoCallsLeft,
        expiryDate
      });

      const response: VerifyPaymentResponseDto = {
        success: true,
        message: 'Payment verified and trainer hired successfully!',
        transactionId: transaction?._id,
      };

      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      logger.error('Verify Payment Error', err);
      next(err);
    }
  }

  async createGymOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateGymTransactionDto = req.body;
      const userId = (req.user as JwtPayload).id;

      if (!dto.gymId || !dto.subscriptionPlanId || !dto.amount || !dto.preferredTime) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }

      const user = await this._userService.getUserById(userId);
      if (user?.gymId) {
        throw new AppError('You already have a gym membership', STATUS_CODE.BAD_REQUEST);
      }

      const order: CreateOrderResponseDto = await this._paymentService.createOrder(
        dto.amount, 
        dto.currency || 'INR', 
        `gym_${Date.now()}`
      );

      await this._paymentService.createGymTransaction({
        userId,
        gymId: dto.gymId,
        subscriptionPlanId: dto.subscriptionPlanId,
        razorpayOrderId: order.id,
        amount: dto.amount,
        status: 'pending',
        preferredTime: dto.preferredTime
      });

      res.status(STATUS_CODE.OK).json(order);
    } catch (err) {
      logger.error('Create Gym Order Error', err);
      next(err);
    }
  }

  async verifyGymPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: VerifyGymPaymentDto = req.body;
      const userId = (req.user as JwtPayload).id;

      if (!dto.gymId || !dto.subscriptionPlanId || !userId || !dto.preferredTime) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }

      const isValid = await this._paymentService.verifyPayment(
        dto.orderId,
        dto.paymentId,
        dto.signature
      );

      let transaction = await this._paymentService.findGymTransactionByOrderId(dto.orderId);
      if (!transaction) {
        throw new AppError('Transaction not found', STATUS_CODE.BAD_REQUEST);
      }

      if (!isValid) {
        await this._paymentService.updateGymTransactionStatus(
          dto.orderId,
          'failed',
          dto.paymentId,
          dto.signature
        );
        throw new AppError(MESSAGES.INVALID_SIGNATURE, STATUS_CODE.BAD_REQUEST);
      }

      const user = await this._userService.getUserById(userId);
      if (user?.gymId) {
        await this._paymentService.updateGymTransactionStatus(
          dto.orderId,
          'failed',
          dto.paymentId,
          dto.signature
        );
        throw new AppError('User already has a gym membership', STATUS_CODE.BAD_REQUEST);
      }

      const subscriptionPlan = await this._gymService.getSubscriptionPlan(dto.subscriptionPlanId);
      if (!subscriptionPlan) {
        throw new AppError('Subscription plan not found', STATUS_CODE.NOT_FOUND);
      }

      const startDate = new Date();
      let endDate: Date;

      switch (subscriptionPlan.durationUnit) {
        case 'day':
          endDate = addDays(startDate, subscriptionPlan.duration);
          break;
        case 'month':
          endDate = addMonths(startDate, subscriptionPlan.duration);
          break;
        case 'year':
          endDate = addYears(startDate, subscriptionPlan.duration);
          break;
        default:
          endDate = addMonths(startDate, subscriptionPlan.duration);
      }

      transaction = await this._paymentService.updateGymTransactionStatus(
        dto.orderId,
        'completed',
        dto.paymentId,
        dto.signature
      );


      await this._userService.updateUserGymMembership(
        userId,
        dto.gymId,
        dto.subscriptionPlanId,
        startDate,
        endDate,
        dto.preferredTime
      );

      await this._gymService.addMemberToGym(dto.gymId, userId);

      
      await this._gymReminderService.saveReminderPreference(
        userId,
        dto.gymId,
        dto.preferredTime
      );

      // Send confirmation email
      const gymDetails = await this._gymService.getGymById(dto.gymId);
      
      if (user && gymDetails && subscriptionPlan) {
        await this._emailService.sendGymSubscriptionEmail(
          user.email,
          user.name,
          gymDetails.name!,
          subscriptionPlan.name,
          dto.preferredTime
        );
      }

      const response = {
        success: true,
        message: 'Payment verified and gym membership confirmed!',
        transactionId: transaction?._id,
      };

      res.status(STATUS_CODE.OK).json(response);
    } catch (err) {
      logger.error('Verify Gym Payment Error', err);
      next(err);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const { page = '1', limit = '10', search = '', status = '', sort = 'newest' } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
        sort?: string;
      };

      const transactions = await this._transactionService.getUserTransactions(
        userId,
        parseInt(page, 10),
        parseInt(limit, 10),
        search,
        status,
        sort
      );

      res.status(STATUS_CODE.OK).json(transactions);
    } catch (err) {
      logger.error('Get Transactions Error', err);
      next(err);
    }
  }

  async checkPendingTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      
      const pendingTransaction = await this._transactionService.getUserPendingTransaction(userId);
      
      res.status(STATUS_CODE.OK).json({
        hasPending: !!pendingTransaction,
        transaction: pendingTransaction
      });
    } catch (err) {
      logger.error('Check Pending Transaction Error', err);
      next(err);
    }
  }

  async cleanupPendingTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      
      const updatedCount = await this._transactionService.markUserPendingTransactionsAsFailed(userId);
      
      res.status(STATUS_CODE.OK).json({
        success: true,
        message: `${updatedCount} pending transactions cancelled`,
        updatedCount
      });
    } catch (err) {
      logger.error('Cleanup Pending Transactions Error', err);
      next(err);
    }
  }
}