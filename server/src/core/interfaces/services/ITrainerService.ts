import { ITrainer } from "../../../models/trainer.model";
import { UploadedFile } from "express-fileupload";
import { 
  TrainerLoginResponseDto, 
  TrainerResponseDto, 
  GetClientsResponseDto 
} from '../../../dtos/trainer.dto'

export interface TrainerApplyData {
  name: string;
  email: string;
  password: string;
  phone: string;
  price: string;
  bio?: string;
  location?: string;
  experience?: string;
  specialization?: string;
  certificate: UploadedFile;
  profileImage?: UploadedFile;
}

export interface PaginatedTrainers {
  trainers: TrainerResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedClients {
  clients: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ITrainerService {
  loginTrainer(email: string, password: string): Promise<TrainerLoginResponseDto>;
  forgotPassword(email: string): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<void>;
  resetPassword(email: string, password: string): Promise<void>;
  applyAsTrainer(trainerData: TrainerApplyData): Promise<TrainerLoginResponseDto>;
  reapplyAsTrainer(trainerId: string, trainerData: TrainerApplyData): Promise<ITrainer | null>;
  getTrainerById(id: string): Promise<TrainerResponseDto>;
  getAllTrainers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string,
    specialization?: string,
    experience?: string,
    minRating?: string,
    minPrice?: string,
    maxPrice?: string
  ): Promise<PaginatedTrainers>;
  getTrainerApplication(id: string): Promise<Partial<ITrainer> | null>
  updateTrainerStatus(id: string, updateData: Partial<ITrainer>): Promise<ITrainer | null>;
  addClientToTrainer(trainerId: string, userId: string): Promise<void>;
  removeClientFromTrainer(trainerId: string, userId: string): Promise<void>;
  getTrainerClients(
    trainerId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<GetClientsResponseDto>;
}