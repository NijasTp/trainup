import { ITrainer } from '../models/trainer.model';
import { IUser } from '../models/user.model';

export class TrainerDto {
  static toResponse(trainer: ITrainer): TrainerResponseDto {
    return {
      _id: trainer._id.toString(),
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      price: trainer.price,
      isBanned: trainer.isBanned,
      role: trainer.role,
      gymId: trainer.gymId?.toString(),
      clients: Array.isArray(trainer.clients)
        ? trainer.clients.map(c => c.toString())
        : [],
      bio: trainer.bio,
      location: trainer.location,
      specialization: trainer.specialization,
      experience: trainer.experience,
      rating: trainer.rating,
      certificate: trainer.certificate,
      profileImage: trainer.profileImage,
      profileStatus: trainer.profileStatus,
      rejectReason: trainer.rejectReason,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt
    };
  }

  static toClientDto(client: IUser): ClientDto {
    return {
      _id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      subscriptionStartDate: client.subscriptionStartDate
    };
  }
}

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
  price: {
    basic: number;
    premium: number;
    pro: number;
  };
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
  price: {
    basic: number;
    premium: number;
    pro: number;
  };
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
  price: {
    basic: number;
    premium: number;
    pro: number;
  };
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