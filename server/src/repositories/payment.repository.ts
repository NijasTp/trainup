import { injectable } from "inversify";
import Razorpay from "razorpay";
import { IPaymentRepository } from "../core/interfaces/repositories/IPaymentRepository";

@injectable()
export class PaymentRepository implements IPaymentRepository {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }

  async createOrder(amount: number, currency: string): Promise<any> {
    return await this.razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency,
    });
  }
}
