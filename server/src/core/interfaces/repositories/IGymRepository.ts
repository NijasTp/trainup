import { IGym } from "../../../models/gym.model";

export interface PaginatedGyms {
  gyms: IGym[]; 
  total: number;
  page: number;
  totalPages: number;
}

export interface IGymRepository {
  findByEmail(email: string): Promise<IGym | null>;
  createGym(data: Partial<IGym>): Promise<IGym>;
  updateGym(id: string, data: Partial<IGym>): Promise<IGym | null>;
  findById(id: string): Promise<IGym | null>;
  getGymById(gymId: string): Promise<IGym | null>;
  getGymTrainers(gymId: string): Promise<any[]>;
  getGymMembers(gymId: string): Promise<any[]>;
  findApplicationById(id: string): Promise<IGym | null>;
  getGymAnnouncements(gymId: string): Promise<any[]>;
  findGyms(page: number, limit: number, searchQuery: string): Promise<PaginatedGyms>;
  updateStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>;
}