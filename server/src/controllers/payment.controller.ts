import { Request, Response } from 'express';
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

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.ITransactionService) private _transactionService: ITransactionService
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateOrderRequestDto = req.body;
      const userId = (req.user as JwtPayload).id;
      const trainerId = req.body.trainerId;
      const months = req.body.months 


      if (!trainerId) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: 'Missing trainer ID' });
        return;
      }
      if ( !userId ) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: 'Missing user ' });
        return;
      }
      if (!months) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: 'Missing months' });
        return;
      }

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
      const error = err as Error;
      logger.error('Create Order Error', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
async verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const dto: VerifyPaymentRequestDto = req.body;
    const userId = (req.user as JwtPayload).id;

    if (!dto.trainerId || !userId || !dto.months) {
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ success: false, message: 'Missing user, trainer ID, or months' });
      return;
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
      res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: 'Transaction not found for this order',
      });
      return;
    }

    if (!isValid) {
      transaction = await this._transactionService.updateTransactionStatus(
        dto.orderId,
        'failed',
        dto.paymentId
      );
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.INVALID_SIGNATURE });
      return;
    }

    const trainer = await this._trainerService.getTrainerById(dto.trainerId);
    if (!trainer) {
      transaction = await this._transactionService.updateTransactionStatus(
        dto.orderId,
        'failed',
        dto.paymentId
      );
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.TRAINER_NOT_FOUND });
      return;
    }

    const user = await this._userService.getUserById(userId);
    if (user?.assignedTrainer) {
      transaction = await this._transactionService.updateTransactionStatus(
        dto.orderId,
        'failed',
        dto.paymentId
      );
      res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: 'User already has a trainer',
      });
      return;
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
    const error = err as Error;
    logger.error('Verify Payment Error', error);
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
}

async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as JwtPayload).id;
      const { page = '1', limit = '10', search = '', status = '', sort = 'newest' } = req.query;

      const transactions = await this._transactionService.getUserTransactions(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        status as string,
        sort as string
      );

      res.status(STATUS_CODE.OK).json(transactions);
    } catch (err) {
      const error = err as Error;
      logger.error('Get Transactions Error', error);
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

}