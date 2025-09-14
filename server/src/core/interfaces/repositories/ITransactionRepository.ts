import { ITransaction } from "../../../models/transaction.model"

export interface ITransactionRepository {
  createTransaction(data: Partial<ITransaction>): Promise<ITransaction>;
  updateTransactionStatusByOrderId(
    orderId: string,
    status: "completed" | "failed",
    paymentId?: string
  ): Promise<ITransaction | null>;
  getTransactionById(id: string): Promise<ITransaction | null>;
  findByOrderId(orderId: string): Promise<ITransaction | null>;
}
