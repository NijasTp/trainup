import { injectable } from 'inversify';
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository';
import { ITransaction, TransactionModel } from '../models/transaction.model';
import { SortOrder } from 'mongoose';
import { ITransactionDTO } from '../dtos/transaction.dto';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await TransactionModel.create(data);
  }

  async updateTransactionStatusByOrderId(
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string
  ): Promise<ITransaction | null> {
    return await TransactionModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status, razorpayPaymentId: paymentId },
      { new: true }
    );
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    return await TransactionModel.findById(id);
  }

  async getUserTransactions(
    userId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }> {
    const query: any = { userId };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions: { [key: string]: { [field: string]: SortOrder } } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount_high: { amount: -1 },
      amount_low: { amount: 1 }
    };

    const transactions = await TransactionModel.find(query)
      .populate('trainerId', 'name profileImage')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TransactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map(transaction =>
        this.mapToTransactionDto(transaction as ITransaction)
      ),
      totalPages
    };
  }

  async getTrainerTransactions(
    trainerId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    planType: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }> {
    const query: any = { trainerId };
    if (status && status !== 'all') query.status = status;
    if (planType && planType !== 'all') query.planType = planType;
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions: { [key: string]: { [field: string]: SortOrder } } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount_high: { amount: -1 },
      amount_low: { amount: 1 }
    };

    const transactions = await TransactionModel.find(query)
      .populate('userId', 'name email')
      .sort(sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TransactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      transactions: transactions.map(transaction =>
        this.mapToTransactionDto(transaction as ITransaction)
      ),
      totalPages
    };
  }

  async findByOrderId(orderId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ razorpayOrderId: orderId });
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

  async getTrainerEarningsStats(
    trainerId: string,
    thisMonthStart: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date
  ): Promise<{
    totalEarningsThisMonth: number;
    totalEarningsLastMonth: number;
    monthlyEarnings: Array<{ month: string; earnings: number; clients: number }>;
    planDistribution: Array<{ plan: string; count: number }>;
  }> {


    const thisMonthEarnings = await TransactionModel.aggregate([
      {
        $match: {
          trainerId,
          status: 'completed',
          createdAt: { $gte: thisMonthStart, $lte: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const lastMonthEarnings = await TransactionModel.aggregate([
      {
        $match: {
          trainerId,
          status: 'completed',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyEarnings = await TransactionModel.aggregate([
      {
        $match: {
          trainerId,
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$amount' },
          clients: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  { $subtract: ['$_id.month', 1] }
                ]
              },
              ' ',
              { $toString: '$_id.year' }
            ]
          },
          earnings: 1,
          clients: { $size: '$clients' },
          _id: 0
        }
      },
      { $sort: { month: -1 } },
      { $limit: 12 }
    ]);

    const planDistribution = await TransactionModel.aggregate([
      {
        $match: {
          trainerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          plan: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return {
      totalEarningsThisMonth: thisMonthEarnings[0]?.total || 0,
      totalEarningsLastMonth: lastMonthEarnings[0]?.total || 0,
      monthlyEarnings,
      planDistribution
    };
  }

  async getRecentActivity(trainerId: string) {
    const transactions = await TransactionModel.find({
      trainerId,
      status: 'completed',
    })
      .populate<{ userId: { name: string } }>('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return transactions.map(t => ({
      type: 'subscription',
      message: `New ${t.planType} subscription from ${t.userId?.name ?? 'Unknown User'
        }`,
      date: t.createdAt.toISOString(),
    }));
  }

  private mapToTransactionDto(transaction: ITransaction): ITransactionDTO {
    return {
      _id: transaction._id.toString(),
      userId: typeof transaction.userId === 'object' ? transaction.userId : transaction.userId.toString(),
      trainerId: transaction.trainerId?.toString(),
      razorpayOrderId: transaction.razorpayOrderId,
      razorpayPaymentId: transaction.razorpayPaymentId,
      amount: transaction.amount,
      status: transaction.status,
      planType: transaction.planType,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  }
}