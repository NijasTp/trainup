export class CreateOrderRequestDto {
  amount: number;
  currency: string;
  receipt?: string;
}

export class CreateOrderResponseDto {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  created_at: number;
}

export interface VerifyPaymentRequestDto {
  orderId: string;
  paymentId: string;
  signature: string;
  trainerId: string;
  months: number;
  amount: number;
}

export class VerifyPaymentResponseDto {
  success: boolean;
  message: string;
  transactionId?: string | unknown;
}