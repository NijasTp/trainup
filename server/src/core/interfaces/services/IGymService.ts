import { UploadedFile } from "express-fileupload";
import { IGym } from "../../../models/gym.model";
import { PaginatedGyms } from "../repositories/IGymRepository";

export interface GymRegisterData {
  name: string;
  email: string;
  password: string;
  location?: string;
  certificate: string;
  trainers?: string[];
  members?: string[];
  announcements?: { title: string; message: string; date: Date }[];
  images?: Express.Multer.File[];
  profileImage?: Express.Multer.File;
}


export interface IGymService {
  registerGym(
    data: any,
    files: {
      certificate?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<{
    gym: IGym;
    accessToken: string;
    refreshToken: string;
  }>;
  loginGym(email: string, password: string): Promise<{ gym: IGym, accessToken: string, refreshToken: string }>;
  getProfile(id: string): Promise<IGym | null>;
  updateProfile(id: string, data: Partial<IGym>): Promise<IGym | null>;
  getGymData(gymId: string): Promise<{
    gymDetails: IGym | null;
    trainers: any[];
    members: any[];
    announcements: any[];
  }>;
  getAllGyms(page: number, limit: number, searchQuery: string): Promise<PaginatedGyms>;
  updateGymStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>;
  getGymApplication(id:string): Promise<IGym | null>;
  getGymById(id: string): Promise<IGym | null>;
  // more
}