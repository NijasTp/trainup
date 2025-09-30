import { ObjectId } from "mongoose";

export interface CreateOrderRequestDto {
  amount: number;
  currency: string;
  receipt?: string;
  trainerId: string;
  planType: 'basic' | 'premium' | 'pro';
}

export interface CreateOrderResponseDto {
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
  planType: 'basic' | 'premium' | 'pro';
  amount: number;
}

export interface VerifyPaymentResponseDto {
  success: boolean;
  message: string;
  transactionId?:ObjectId| string ;
}