import { injectable } from 'inversify'
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository'
import { ITransaction, TransactionModel } from '../models/transaction.model'
import { SortOrder } from 'mongoose'
import { ITransactionDTO } from '../dtos/transaction.dto'

@injectable()
export class TransactionRepository implements ITransactionRepository {
  async createTransaction (data: Partial<ITransaction>): Promise<ITransaction> {
    return await TransactionModel.create(data)
  }

  async updateTransactionStatusByOrderId (
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string
  ): Promise<ITransaction | null> {
    return await TransactionModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status, razorpayPaymentId: paymentId },
      { new: true }
    )
  }

  async getTransactionById (id: string): Promise<ITransaction | null> {
    return await TransactionModel.findById(id)
  }

  async getUserTransactions(
  userId: string,
  page: number,
  limit: number,
  search: string,
  status: string,
  sort: string
): Promise<{ transactions: ITransactionDTO[]; totalPages: number }>{
    const query: any = { userId }
    if (status && status !== 'all') query.status = status
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ]
    }

    const sortOptions: { [key: string]: { [field: string]: SortOrder } } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount_high: { amount: -1 },
      amount_low: { amount: 1 }
    }

    const transactions = await TransactionModel.find(query)
      .populate('trainerId', 'name profileImage')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await TransactionModel.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return {
      transactions: transactions.map(transaction =>
        this.mapToTransactionDto(transaction as ITransaction)
      ),
      totalPages
    }
  }

  async findByOrderId (orderId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ razorpayOrderId: orderId })
  }

  async getUserPendingTransaction(userId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ userId, status: 'pending' }).sort({ createdAt: -1 });
  }

  async markUserPendingTransactionsAsFailed(userId: string): Promise<number> {
    const result = await TransactionModel.updateMany(
      { userId, status: 'pending' },
      { status: 'failed' }
    );
    return result.modifiedCount;
  }

  private mapToTransactionDto (transaction: ITransaction): ITransactionDTO {
    return {
      _id: transaction._id.toString(),
      userId: transaction.userId.toString(),
      trainerId: transaction.trainerId?.toString(),
      razorpayOrderId: transaction.razorpayOrderId,
      razorpayPaymentId: transaction.razorpayPaymentId,
      amount: transaction.amount,
      status: transaction.status,
      months: transaction.months,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }
  }
}