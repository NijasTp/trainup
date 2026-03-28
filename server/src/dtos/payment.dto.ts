import { ObjectId } from "mongoose";

export interface CreateOrderRequestDto {
  amount: number;
  currency: string;
  receipt?: string;
  trainerId: string;
  planType: 'basic' | 'premium' | 'pro';
  duration: number; // in months
}

export interface StripeCheckoutResponseDto {
  sessionId: string;
  url: string | null;
}

export interface VerifyPaymentRequestDto {
  sessionId: string;
  trainerId: string;
  planType: 'basic' | 'premium' | 'pro';
  amount: number;
  duration: number; // in months
}

export interface VerifyPaymentResponseDto {
  success: boolean;
  message: string;
  transactionId?: ObjectId | string;
}