import { ITrainer } from "../../../models/trainer.model";
import { IUser } from "../../../models/user.model";

export interface ITrainerRepository {
  findByEmail(email: string): Promise<ITrainer | null>
  findAll(
    skip: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]>;
  count(
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ): Promise<number>;
  findById(id: string): Promise<ITrainer | null>;
  updateStatus(id: string, updateData: Partial<ITrainer>): Promise<ITrainer | null>;
  findApplicationByTrainerId(id: string): Promise<Partial<ITrainer> | null>;
  create(trainerData: Partial<ITrainer>): Promise<ITrainer>;
  addClient(trainerId: string, userId: string): Promise<void>;
  removeClient(trainerId: string, userId: string): Promise<void>;
      findClients(
        trainerId: string,
        skip: number,
        limit: number,
        search: string
    ): Promise<{ clients: IUser[]; total: number }>;
}
