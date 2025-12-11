import { inject, injectable } from "inversify";
import { IProgressService } from "../core/interfaces/services/IProgressService";
import { IProgressRepository } from "../core/interfaces/repositories/IProgressRepository";
import TYPES from "../core/types/types";
import { IProgress } from "../models/progress.model";
import { UploadedFile } from "express-fileupload";
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from "../utils/appError.util";
import { STATUS_CODE } from "../constants/status";

@injectable()
export class ProgressService implements IProgressService {
    constructor(
        @inject(TYPES.IProgressRepository) private _progressRepo: IProgressRepository
    ) { }

    async addProgress(userId: string, date: Date, notes?: string, photos?: UploadedFile[]): Promise<IProgress> {
        let photoUrls: string[] = [];

        // Check if entry exists for this date
        const existingEntry = await this._progressRepo.findByDate(userId, date);
        if (existingEntry) {
            photoUrls = existingEntry.photos || [];
        }

        if (photos && photos.length > 0) {
            const uploadPromises = photos.map(photo =>
                cloudinary.uploader.upload(photo.tempFilePath, {
                    folder: "trainup/users/progress",
                    transformation: [
                        { width: 1000, crop: "limit" },
                        { quality: "auto", fetch_format: "auto" } // Optimize
                    ],
                    public_id: `progress_${userId}_${date.toISOString()}_${Date.now()}_${Math.random()}`
                })
            );

            const results = await Promise.all(uploadPromises);
            const newUrls = results.map(r => r.secure_url);
            photoUrls = [...photoUrls, ...newUrls];
        }

        if (existingEntry) {
            // Update existing
            const updateData: Partial<IProgress> = {};
            if (notes !== undefined) updateData.notes = notes;
            if (photoUrls.length > 0) updateData.photos = photoUrls;

            const updated = await this._progressRepo.update(existingEntry._id as string, updateData);
            if (!updated) throw new AppError("Failed to update progress", STATUS_CODE.INTERNAL_SERVER_ERROR);
            return updated;
        } else {
            // Create new
            return await this._progressRepo.create({
                userId: userId as any,
                date,
                notes,
                photos: photoUrls
            });
        }
    }

    async getProgress(userId: string, date: Date): Promise<IProgress | null> {
        return await this._progressRepo.findByDate(userId, date);
    }

    async getAllProgress(userId: string): Promise<IProgress[]> {
        return await this._progressRepo.findByUserId(userId);
    }

    async compareProgress(userId: string): Promise<{ first: IProgress | null, latest: IProgress | null }> {
        const [first, latest] = await Promise.all([
            this._progressRepo.findFirstEntry(userId),
            this._progressRepo.findLatestEntry(userId)
        ]);
        return { first, latest };
    }
}
