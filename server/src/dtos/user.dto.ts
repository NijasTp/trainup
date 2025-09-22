import { Types } from "mongoose";

export class RequestOtpDto {
  email: string;
}

export class VerifyOtpDto {
  email: string;
  otp: string;
  name: string;
  password: string;
}

export class CheckUsernameDto {
  username: string;
}

export class CheckUsernameResponseDto {
  isAvailable: boolean;
}

export class ForgotPasswordDto {
  email: string;
}

export class VerifyForgotPasswordOtpDto {
  email: string;
  otp: string;
}

export class ResetPasswordDto {
  email: string;
  newPassword: string;
}

export class GoogleLoginDto {
  idToken: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  streak?: any;
}

export class UserResponseDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  role: string;
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  assignedTrainer?: string;
  subscriptionStartDate?: Date;
  gymId?: string;
  isPrivate?: boolean;
  isBanned: boolean;
  streak: number;
  lastActiveDate?: Date;
  xp: number;
  xpLogs: XPLogDto[];
  achievements: string[];
  currentWeight?: number;
  goalWeight?: number;
  weightHistory: WeightLogDto[];
  height?: number;
  age?: number;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class XPLogDto {
  amount: number;
  reason: string;
  date: Date;
}

export class WeightLogDto {
  weight: number;
  date: Date;
}

export class ResendOtpDto {
  email: string;
}

export class GetTrainersQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  specialization?: string;
  location?: string;
  experience?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
}
export class GetTrainersResponseDto {
  trainers: {
    trainers: TrainerPublicDto[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export class TrainerPublicDto {
  _id: string;
  name: string;
  email: string;
  phone: string;
  price: string;
  bio: string;
  location: string;
  specialization: string;
  experience: string;
  rating: number;
  profileImage: string;
  profileStatus: string;
}

export class GetIndividualTrainerParamsDto {
  id?: string ;
}

export class GetIndividualTrainerResponseDto {
  trainer: TrainerPublicDto;
}

export class GetMyTrainerResponseDto {
  trainer: TrainerPublicDto;
}

export class GetProfileResponseDto {
  user: UserResponseDto;
}

export class UpdateUserRequestDto {
  name?: string;
  email?: string;
  phone?: string;
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  isPrivate?: boolean;
  currentWeight?: number;
  goalWeight?: number;
  height?: number;
  age?: number;
  gender?: string;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export class AddWeightDto {
  weight: number;
}

export class GetWeightHistoryResponseDto {
  weightHistory: { weight: number; date: string }[];
}

export class GetLatestWeightResponseDto {
  weight?: number;
  date?: string;
}