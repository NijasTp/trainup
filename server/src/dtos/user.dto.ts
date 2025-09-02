import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class RequestOtpDto {
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyForgotPasswordOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class CheckUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UserResponseDto {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsOptional()
  isVerified?: boolean;

  @IsOptional()
  isBanned?: boolean;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  assignedTrainer?: string | null;

  @IsOptional()
  subscriptionStartDate?: Date | null;

  @IsOptional()
  phone?: string;

  @IsOptional()
  goals?: string[];

  @IsOptional()
  motivationLevel?: string;

  @IsOptional()
  equipment?: string[];

  @IsOptional()
  gymId?: string;

  @IsOptional()
  isPrivate?: boolean;

  @IsOptional()
  streak?: number;

  @IsOptional()
  xp?: number;

  @IsOptional()
  achievements?: string[];
}

export class SessionResponseDto {
  @IsNotEmpty()
  valid: boolean;

  @IsString()
  id: string;

  @IsString()
  role: string;
}

export class TokenResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

export class PaginatedUsersDto {
  @IsNotEmpty()
  users: UserResponseDto[];

  @IsNotEmpty()
  total: number;

  @IsNotEmpty()
  page: number;

  @IsNotEmpty()
  totalPages: number;
}
