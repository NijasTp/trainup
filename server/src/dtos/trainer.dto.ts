export class TrainerLoginDto {
  email: string;
  password: string;
}

export class TrainerLoginResponseDto {
  trainer: TrainerResponseDto;
  accessToken: string;
  refreshToken: string;
}

export class TrainerResponseDto {
  _id: string;
  name: string;
  email: string;
  phone: string;
  price: string;
  isBanned: boolean;
  role: string;
  gymId?: string;
  clients: string[];
  bio: string;
  location: string;
  specialization: string;
  experience: string;
  rating: number;
  certificate: string;
  profileImage: string;
  profileStatus: string;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TrainerRequestOtpDto {
  email: string;
}

export class TrainerVerifyOtpDto {
  email: string;
  otp: string;
}

export class TrainerResendOtpDto {
  email: string;
}

export class TrainerForgotPasswordDto {
  email: string;
}

export class TrainerResetPasswordDto {
  email: string;
  password: string;
}

export class TrainerApplyDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  price: string;
  location: string;
  experience: string;
  specialization: string;
  bio: string;
}

export class TrainerReapplyDto {
  fullName: string
  email: string
  password: string
  phone: string
  price: string
  location: string
  experience: string
  specialization: string
  bio: string
}

export class GetClientsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export class GetClientsResponseDto {
  clients: ClientDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class ClientDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptionStartDate?: Date | null;
}

export class GetClientParamsDto {
  id: string;
}

export class GetClientResponseDto {
  user: ClientDto;
}