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


export class UserResponseDto {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsString()
  role: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @IsOptional()
  @IsString()
  activityLevel?: string;

  @IsOptional()
  @IsBoolean()
  equipment?: boolean;

  @IsOptional()
  @IsString()
  assignedTrainer?: string | null;

  @IsOptional()
  @IsDate()
  subscriptionStartDate?: Date | null;

  @IsOptional()
  @IsString()
  gymId?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsNumber()
  streak: number;

  @IsOptional()
  @IsDate()
  lastActiveDate?: Date;

  @IsNumber()
  xp: number;

  @IsArray()
  @IsString({ each: true })
  achievements: string[];

  @IsOptional()
  @IsNumber()
  todaysWeight?: number;

  @IsOptional()
  @IsNumber()
  goalWeight?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
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
  @Type(() => UserResponseDto)
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
  isAvailable: boolean;
}