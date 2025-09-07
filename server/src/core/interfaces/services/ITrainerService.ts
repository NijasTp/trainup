import { ITrainer } from "../../../models/trainer.model";
import { UploadedFile } from "express-fileupload";
import { IUser } from "../../../models/user.model";
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

export interface PaginatedClients {
    clients: IUser[];
    total: number;
    page: number;
    totalPages: number;
}
export interface TrainerApplyData {
  name: string;
  email: string;
  password: string;
  phone: string;
  price: string;
  location: string;
  experience: string;
  specialization: string;
  bio: string;
  certificate: UploadedFile;
  profileImage: UploadedFile,

}



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
reapplyAsTrainer(trainerId: string, trainerData: TrainerApplyData): Promise<ITrainer | null>
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
  addClientToTrainer(trainerId: string, userId: string): Promise<void>;
  removeClientFromTrainer(trainerId: string, userId: string): Promise<void>;
      getTrainerClients(
        trainerId: string,
        page: number,
        limit: number,
        search: string
    ): Promise<PaginatedClients>;
}