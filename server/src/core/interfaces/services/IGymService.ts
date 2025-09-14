import { IGym } from "../../../models/gym.model";
import { UploadedFile } from "express-fileupload";
import { GymLoginResponseDto, GymDataResponseDto } from '../../../dtos/gym.dto'

export interface GymRegisterData {
  name: string;
  email: string;
  password: string;
  location: string;
}

export interface IGymService {
  registerGym(
    data: GymRegisterData,
    files: {
      certificate?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<GymLoginResponseDto>;
  
  getAllGyms(page: number, limit: number, searchQuery: string): Promise<any>;
  updateGymStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>;
  getGymById(id: string): Promise<IGym | null>;
  getGymData(gymId: string): Promise<GymDataResponseDto>;
  getGymApplication(id: string): Promise<IGym | null>;
  loginGym(email: string, password: string): Promise<GymLoginResponseDto>;
  getProfile(id: string): Promise<IGym | null>;
  updateProfile(id: string, data: Partial<IGym>): Promise<IGym | null>;
}