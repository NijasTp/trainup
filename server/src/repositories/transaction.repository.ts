import { injectable } from "inversify";
import { ITransactionRepository } from "../core/interfaces/repositories/ITransactionRepository";
import { ITransaction, TransactionModel } from "../models/transaction.model";

@injectable()
export class TransactionRepository implements ITransactionRepository {
  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await TransactionModel.create(data);
  }

  async updateTransactionStatusByOrderId(
    orderId: string,
    status: "completed" | "failed",
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

  async findByOrderId(orderId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ razorpayOrderId: orderId });
  }
}
