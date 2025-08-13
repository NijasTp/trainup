import { ITrainer } from "../../../models/trainer.model";

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
}
