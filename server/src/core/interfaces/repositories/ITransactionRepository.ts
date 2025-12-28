import { ITransaction } from '../../../models/transaction.model';
import { ITransactionDTO } from '../../../dtos/transaction.dto';


export interface ITransactionRepository {
  createTransaction(data: Partial<ITransaction>): Promise<ITransaction>;
  updateTransactionStatusByOrderId(
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string
  ): Promise<ITransaction | null>;
  getTransactionById(id: string): Promise<ITransaction | null>;
  getUserTransactions(
    userId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }>;
  getTrainerTransactions(
    trainerId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    planType: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number; totalRevenue: number; total: number }>;
  findByOrderId(orderId: string): Promise<ITransaction | null>;
  getUserPendingTransaction(userId: string): Promise<ITransaction | null>;
  markUserPendingTransactionsAsFailed(userId: string): Promise<number>;
  getTrainerEarningsStats(
    trainerId: string,
    thisMonthStart: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date
  ): Promise<{
    totalEarningsThisMonth: number;
    totalEarningsLastMonth: number;
    monthlyEarnings: Array<{ month: string; earnings: number; clients: number }>;
    planDistribution: Array<{ plan: string; count: number }>;
  }>;
  getRecentActivity(trainerId: string): Promise<Array<{ type: string; message: string; date: string }>>;
  getAllTransactions(
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransactionDTO[]; totalPages: number }>;
  getAllTransactionsForExport(): Promise<ITransactionDTO[]>;
  getGraphData(filter: 'day' | 'week' | 'month' | 'year'): Promise<unknown[]>;
}
