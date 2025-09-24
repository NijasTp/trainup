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
    private transactionRepository: ITransactionRepository
  ) {}

  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await this.transactionRepository.createTransaction(data);
  }

  async updateTransactionStatus(
    orderId: string,
    status: "completed" | "failed",
    paymentId?: string
  ): Promise<ITransaction | null> {
    return await this.transactionRepository.updateTransactionStatusByOrderId(
      orderId,
      status,
      paymentId
    );
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    return await this.transactionRepository.getTransactionById(id);
  }

  async getUserTransactions(
  userId: string,
  page: number,
  limit: number,
  search: string,
  status: string,
  sort: string
): Promise<{ transactions: ITransactionDTO[]; totalPages: number }> {
    return this.transactionRepository.getUserTransactions(userId, page, limit, search, status, sort);
  }

  async findByOrderId(orderId: string): Promise<ITransaction | null> {
    return await this.transactionRepository.findByOrderId(orderId);
  }
}