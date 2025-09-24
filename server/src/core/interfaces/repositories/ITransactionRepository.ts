import { ITransaction } from "../../../models/transaction.model";
import { ITransactionDTO } from "../../../dtos/transaction.dto";

export interface ITransactionRepository {
  createTransaction(data: Partial<ITransaction>): Promise<ITransaction>;
  updateTransactionStatusByOrderId(orderId: string, status: "completed" | "failed", paymentId?: string): Promise<ITransaction | null>;
  getTransactionById(id: string): Promise<ITransaction | null>;
  getUserTransactions(userId: string, page: number, limit: number, search: string, status: string, sort: string): Promise<{ transactions: ITransactionDTO[]; totalPages: number }>;
  findByOrderId(orderId: string): Promise<ITransaction | null>;
  getUserPendingTransaction(userId: string): Promise<ITransaction | null>;
  markUserPendingTransactionsAsFailed(userId: string): Promise<number>;
}