import { ITrainer } from '../../../models/trainer.model';
import { TrainerResponseDto, ClientDto } from '../../../dtos/trainer.dto';

export interface ITrainerRepository {
  findByEmail(email: string): Promise<ITrainer | null>;
  findById(id: string): Promise<ITrainer | null>;
  create(trainerData: Partial<ITrainer>): Promise<ITrainer>;
  findAll(
    skip: number,
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
  ): Promise<TrainerResponseDto[]>;
  count(
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
  ): Promise<number>;
  findApplicationByTrainerId(id: string): Promise<TrainerResponseDto | null>;
  updateStatus(identifier: string, updateData: Partial<ITrainer>): Promise<ITrainer | null>;
  addClient(trainerId: string, userId: string): Promise<void>;
  removeClient(trainerId: string, userId: string): Promise<void>;
  findClients(
    trainerId: string,
    skip: number,
    limit: number,
    search: string
  ): Promise<{ clients: ClientDto[]; total: number }>;
  countNewClients(trainerId: string, startDate: Date, endDate: Date): Promise<number>;
  countCompletedSessions(trainerId: string): Promise<number>;
}