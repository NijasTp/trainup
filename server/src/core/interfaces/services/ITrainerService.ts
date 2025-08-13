import { ITrainer } from "../../../models/trainer.model";
import { UploadedFile } from "express-fileupload";
export interface PaginatedTrainers {
  trainers: ITrainer[];
  total: number;
  page: number;
  totalPages: number;
}

export type TrainerBasicData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  bio?: string;
  certifications?: string[]; 
};

export interface ITrainerService {
  loginTrainer(email: string, password: string): Promise<{ trainer: ITrainer, accessToken: string, refreshToken: string }>
   applyAsTrainer(trainerData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  experience: string;
  specialization: string;
  bio: string;
  certificate: UploadedFile;
  profileImage: UploadedFile;
}):Promise<{
  trainer: ITrainer;
  accessToken: string;
  refreshToken: string;
}>;
getTrainerById(id: string): Promise<ITrainer | null>;
  forgotPassword(email:string):Promise<void>
  verifyOtp(email: string, otp: string): Promise<void>
  resetPassword(email: string, password: string): Promise<void>
  getAllTrainers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>;
  getTrainerApplication(id: string): Promise<Partial<ITrainer> | null>;
  updateTrainerStatus(id: string, updateData: Partial<ITrainer>): Promise<ITrainer | null>;
}