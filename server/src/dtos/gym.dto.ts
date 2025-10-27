import { Types } from "mongoose";

export interface GymRequestOtpDto {
  email: string;
}

export interface GymVerifyOtpDto {
  email: string;
  otp: string;
  name: string;
  password: string;
  location: string;
}

export interface GymLoginDto {
  email: string;
  password: string;
}

export interface GymResponseDto {
  _id: string;
  role: 'gym';
  name: string;
  email: string;
  location: string;
  certificate: string;
  verifyStatus: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  isBanned: boolean;
  profileImage?: string;
  images?: string[];
  trainers?: string[];
  members?: string[];
  announcements: AnnouncementDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GymLoginResponseDto {
  gym: GymResponseDto;
  accessToken: string;
  refreshToken: string;
}

export interface AnnouncementDto {
  title: string;
  message: string;
  date: Date;
}

export interface GymDataResponseDto {
  gymDetails: GymResponseDto;
  trainers: any[];
  members: any[];
  announcements: AnnouncementDto[];
}

// Subscription Plan DTOs
export interface CreateSubscriptionPlanDto {
  name: string;
  duration: number;
  durationUnit: 'days' | 'months';
  price: number;
  description?: string;
  features: string[];
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  duration?: number;
  durationUnit?: 'days' | 'months';
  price?: number;
  description?: string;
  features?: string[];
  isActive?: boolean;
}

export interface SubscriptionPlanResponseDto {
  _id: string;
  gymId: string;
  name: string;
  duration: number;
  durationUnit: 'days' | 'months';
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Trainer Management DTOs
export interface AddTrainerDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialization: string;
  experience: string;
  bio?: string;
}

export interface UpdateTrainerDto {
  name?: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  isActive?: boolean;
}

// Member Management DTOs
export interface AddMemberDto {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  planId: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
}

export interface UpdateMemberDto {
  name?: string;
  phone?: string;
  planId?: string | Types.ObjectId;
  subscriptionEndDate?: Date;
  status?: 'active' | 'expired' | 'cancelled';
}

export interface MemberResponseDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  joinedAt: Date;
  plan: {
    name: string;
    price: number;
  };
}

// Attendance DTOs
export interface AttendanceResponseDto {
  _id: string;
  userId: string;
  userName: string;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  markedBy: 'user' | 'trainer' | 'gym';
}

export interface QRCodeResponseDto {
  _id: string;
  code: string;
  date: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Announcement DTOs
export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: 'trainer' | 'user' | 'general';
  targetAudience?: string[];
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: 'trainer' | 'user' | 'general';
  targetAudience?: string[];
  isActive?: boolean;
}

export interface AnnouncementResponseDto {
  _id: string;
  title: string;
  content: string;
  type: 'trainer' | 'user' | 'general';
  targetAudience: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment DTOs
export interface CreatePaymentDto {
  userId: string;
  planId: string;
  paymentMethod: 'stripe' | 'manual';
  amount: number;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  transactionId?: string;
}

export interface PaymentResponseDto {
  _id: string;
  userId: string;
  userName: string;
  planName: string;
  amount: number;
  paymentMethod: 'stripe' | 'manual';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  transactionId?: string;
}