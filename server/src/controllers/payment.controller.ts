import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { STATUS_CODE } from '../constants/status';
import TYPES from '../core/types/types';
import { IPaymentService } from '../core/interfaces/services/IPaymentService';
import { IUserService } from '../core/interfaces/services/IUserService';
import { ITrainerService } from '../core/interfaces/services/ITrainerService';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';
import { JwtPayload } from '../core/interfaces/services/IJwtService';
import { CreateOrderRequestDto, CreateOrderResponseDto, VerifyPaymentRequestDto, VerifyPaymentResponseDto } from '../dtos/payment.dto';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger.util';
import { ITransaction } from '../models/transaction.model';
import { AppError } from '../utils/appError.util';

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.ITransactionService) private _transactionService: ITransactionService
  ) {}

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateOrderRequestDto = req.body;
      const userId = (req.user as JwtPayload).id;
      const { trainerId, months } = req.body;

      if (!trainerId) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      if (!userId) throw new AppError(MESSAGES.INVALID_USER_ID, STATUS_CODE.BAD_REQUEST);
      if (!months) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);

      const order: CreateOrderResponseDto = await this._paymentService.createOrder(dto.amount, dto.currency, dto.receipt);

      const transactionData: Partial<ITransaction> = {
        userId,
        trainerId,
        amount: dto.amount,
        months,
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

      if (!dto.trainerId || !userId || !dto.months) {
        throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
      }

      const isValid = await this._paymentService.verifyPayment(
        dto.orderId,
        dto.paymentId,
        dto.signature,
        userId,
        dto.trainerId,
        dto.months,
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
      await this._trainerService.addClientToTrainer(dto.trainerId, userId);

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
}