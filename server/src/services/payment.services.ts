import { injectable } from 'inversify'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { IPaymentService } from '../core/interfaces/services/IPaymentService'
import dotenv from 'dotenv'
dotenv.config()
@injectable()
export class PaymentService implements IPaymentService {
  private razorpay: Razorpay

  constructor () {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    })
  }

  async createOrder (amount: number, currency: string, receipt?: string) {
    return await this.razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    })
  }

  async verifyPayment (
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex')


    return generatedSignature === signature
  }
}
