import { CreateOrderResponseDto } from '../../../dtos/payment.dto'
import { IGymTransaction } from '../../../models/gymTransaction.model'

export interface IPaymentService {
  createOrder(
    amount: number,
    currency: string,
    receipt?: string
  ): Promise<CreateOrderResponseDto>

  verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean>
  
  verifyTrainerPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    trainerId: string,
    planType: 'basic' | 'premium' | 'pro',
    amount: number
  ): Promise<boolean> 
  createGymTransaction(data: Partial<IGymTransaction>): Promise<IGymTransaction>

  updateGymTransactionStatus(
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string,
    signature?: string
  ): Promise<IGymTransaction | null>

  findGymTransactionByOrderId(orderId: string): Promise<IGymTransaction | null>

  getGymTransactions(
    gymId: string,
    page: number,
    limit: number
  ): Promise<{ transactions: IGymTransaction[]; totalPages: number }>
}
