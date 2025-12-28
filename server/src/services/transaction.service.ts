import { injectable, inject } from 'inversify';
import { ITransactionService } from '../core/interfaces/services/ITransactionService';
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository';
import { ITransaction } from '../models/transaction.model';
import TYPES from '../core/types/types';
import { ITransactionDTO } from '../dtos/transaction.dto';

@injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @inject(TYPES.ITransactionRepository)
    private _transactionRepository: ITransactionRepository
  ) { }

  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await this._transactionRepository.createTransaction(data);
  }

  async updateTransactionStatus(
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string
  ): Promise<ITransaction | null> {
    return await this._transactionRepository.updateTransactionStatusByOrderId(
      orderId,
      status,
      paymentId
    );
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    return await this._transactionRepository.getTransactionById(id);
  }

  async getUserTransactions(
    userId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }> {
    return this._transactionRepository.getUserTransactions(userId, page, limit, search, status, sort);
  }

  async getTrainerTransactions(
    trainerId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    planType: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number; totalRevenue: number; total: number }> {
    return this._transactionRepository.getTrainerTransactions(trainerId, page, limit, search, status, planType);
  }

  async findByOrderId(orderId: string): Promise<ITransaction | null> {
    return await this._transactionRepository.findByOrderId(orderId);
  }

  async getUserPendingTransaction(userId: string): Promise<ITransaction | null> {
    return await this._transactionRepository.getUserPendingTransaction(userId);
  }

  async markUserPendingTransactionsAsFailed(userId: string): Promise<number> {
    return await this._transactionRepository.markUserPendingTransactionsAsFailed(userId);
  }
}
