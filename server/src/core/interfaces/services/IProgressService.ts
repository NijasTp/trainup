
import { IProgress } from "../../../models/progress.model";

export interface IProgressService {
    addProgress(userId: string, date: Date, notes?: string, photos?: Express.Multer.File[]): Promise<IProgress>;
    getProgress(userId: string, date: Date): Promise<IProgress | null>;
    getAllProgress(userId: string): Promise<IProgress[]>;
    compareProgress(userId: string): Promise<{ first: IProgress | null, latest: IProgress | null }>;
}
