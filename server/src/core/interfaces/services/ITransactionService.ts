import { ITransaction } from "../../../models/transaction.model"

export interface ITransactionService {
  createTransaction(data: Partial<ITransaction>): Promise<ITransaction>;
  updateTransactionStatus(
    orderId: string,
    status: "completed" | "failed",
    paymentId?: string
  ): Promise<ITransaction | null>;
  getTransactionById(id: string): Promise<ITransaction | null>;
  findByOrderId(orderId: string): Promise<ITransaction | null>;
  getUserTransactions(
    userId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    sort: string
  ): Promise<{ transactions: ITransaction[]; totalPages: number }>;
}
