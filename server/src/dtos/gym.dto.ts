import { Types } from "mongoose";

export interface GymRequestOtpDto {
  email: string;
}

export interface GymVerifyOtpDto {
  email: string;
  otp: string;
  name: string;
  password: string;
  geoLocation: { type: "Point"; coordinates: [number, number] };
}

export interface GymLoginDto {
  email: string;
  password: string;
}


export interface AnnouncementDto {
  title: string;
  message: string;
  date: Date;
}

export interface GeoLocationDto {
  type: "Point";
  coordinates: [number, number];
}

export interface GymResponseDto {
  _id: string;
  role: string;
  name: string;
  email: string;
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  certificate: string;
  verifyStatus: "pending" | "approved" | "rejected";
  rejectReason?: string;
  isBanned: boolean;
  profileImage?: string;
  images?: string[];
  trainers?: string[];
  members?: string[];
  announcements: { title: string; message: string; date: Date }[];
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
  gymDetails: any;
  trainers: any[];
  members: any[];
  announcements: any[];
  totalRevenue: number;
  memberCount: number;
  recentMembers: any[];
}

export interface CreateSubscriptionPlanDto {
  name: string;
  duration: number;
  durationUnit: 'day' | 'month' | 'year';
  price: number;
  description?: string;
  features: string[];
}

export interface UpdateSubscriptionPlanDto extends Partial<CreateSubscriptionPlanDto> {
  isActive?: boolean;
}

export interface SubscriptionPlanResponseDto {
  _id: string;
  gymId: string;
  name: string;
  duration: number;
  durationUnit: 'day' | 'month' | 'year';
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddTrainerDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialization: string;
  experience: string;
  bio?: string;
}

export interface UpdateTrainerDto extends Partial<AddTrainerDto> {}

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

export interface UpdateMemberDto extends Partial<AddMemberDto> {}

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
  description: string;
  image?: string;
}


export interface UpdateAnnouncementDto extends Partial<CreateAnnouncementDto> {
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
  amount: number;
  currency: string;
  receipt?: string;
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

export interface GymListingDto {
  _id: string;
  name: string;
  profileImage?: string;
  images?: string[];
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  memberCount: number;
  planCount: number;
  minPrice: number;
  rating: number;
  distance?: number;
}

export interface CreateGymTransactionDto {
  gymId: string;
  subscriptionPlanId: string;
  amount: number;
  currency?: string;
  preferredTime: string;
}

export interface VerifyGymPaymentDto {
  orderId: string;
  paymentId: string;
  signature: string;
  gymId: string;
  subscriptionPlanId: string;
  amount: number;
  preferredTime: string;
}

export interface MemberSummary {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt?: Date;
}

export interface UserSubscription {
  planName: string;
  planPrice: number;
  planDuration: number;
  planDurationUnit: string;
  subscribedAt: Date;
  preferredTime: string;
}

export interface GymSummary {
  _id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  images?: string[] | null;
  certificate?: string | null;
  memberCount: number;
  rating: number;
}

export interface MyGymResponseDto {
  gym: GymSummary;
  members: MemberSummary[];
  userSubscription: UserSubscription;
}