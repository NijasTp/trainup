import { IProgress } from "../../../models/progress.model";

export interface IProgressRepository {
    create(progress: Partial<IProgress>): Promise<IProgress>;
    findByUserId(userId: string): Promise<IProgress[]>;
    findByDate(userId: string, date: Date): Promise<IProgress | null>;
    update(id: string, data: Partial<IProgress>): Promise<IProgress | null>;
    findFirstEntry(userId: string): Promise<IProgress | null>;
    findLatestEntry(userId: string): Promise<IProgress | null>;
}
