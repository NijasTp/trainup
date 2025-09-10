import { Type } from 'class-transformer';
import { IsEmail, IsString, IsNumber, MinLength, IsOptional, IsInt, Min, IsArray, IsBoolean, IsDate, MaxLength, ValidateNested } from 'class-validator';


export class RequestOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  @MinLength(6, { message: 'OTP must be exactly 6 digits' })
  @MaxLength(6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class CheckUsernameDto {
  @IsString({ message: 'Username must be a string' })
  username: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class VerifyForgotPasswordOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'OTP must be a string' })
  @MinLength(6, { message: 'OTP must be exactly 6 digits' })
  @MaxLength(6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}

export class GoogleLoginDto {
  @IsString({ message: 'idToken must be a string' })
  idToken: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class ResendOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class GetTrainersQueryDto {
  @IsOptional()
  @Type(() => Number) 
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number) 
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;
}

export class GetIndividualTrainerParamsDto {
  @IsString({ message: 'ID must be a string' })
  id: string;
}


export interface UserResponseDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  googleId?: string;
  role: string;
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  assignedTrainer?: string | null;
  subscriptionStartDate?: string | null;
  gymId?: string;
  isPrivate?: boolean;
  isBanned?: boolean;
  streak: number;
  lastActiveDate?: string;
  xp: number;
  xpLogs: { amount: number; reason: string; date: string }[];
  achievements: string[];
  todaysWeight?: number;
  goalWeight?: number;
  weightHistory: { weight: number; date: string }[];
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  createdAt: string; 
  updatedAt: string; 
}

export class TrainerResponseDto {

  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;


}

export class GetTrainersResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainerResponseDto)
  trainers: TrainerResponseDto[];
}

export class LoginResponseDto {
  @ValidateNested()
  user: UserResponseDto;

  @IsNumber()
  streak: number;
}

export class CheckSessionResponseDto {
  @IsBoolean()
  valid: boolean;

  @IsString()
  id: string;

  @IsString()
  role: string;
}

export class RefreshAccessTokenResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class SimpleMessageResponseDto {
  @IsString()
  message: string;
}

export class CheckUsernameResponseDto {
  @IsBoolean()
  isAvailable: boolean | null;
}