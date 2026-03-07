import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { ITemplateService } from "../core/interfaces/services/ITemplateService";
import { STATUS_CODE } from "../constants/status";
import { JwtPayload } from "../core/interfaces/services/IJwtService";
import { CreateWorkoutTemplateRequestDto, CreateDietTemplateRequestDto, TemplateQueryDto } from "../dtos/template.dto";
import { AppError } from "../utils/appError.util";
import { MESSAGES } from "../constants/messages.constants";
import cloudinary from "../config/cloudinary";
import fs from "fs";


@injectable()
export class TemplateController {
    constructor(@inject(TYPES.ITemplateService) private _templateService: ITemplateService) { }

    // Workout Templates
    async createWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const creatorId = (req.user as JwtPayload).id;
            const creatorRole = (req.user as JwtPayload).role;
            const createdByType = creatorRole === 'admin' ? 'Admin' : creatorRole === 'trainer' ? 'Trainer' : creatorRole === 'gym' ? 'Gym' : 'Admin';
            const gymId = creatorRole === 'gym' ? creatorId : undefined;
            const body = req.body;

            // Handle file upload to Cloudinary
            let imageUrl = body.image;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'workout_templates'
                });
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(req.file.path); // Clean up temp file
            }

            if (!imageUrl) throw new AppError("Template image is mandatory", STATUS_CODE.BAD_REQUEST);

            const dto: CreateWorkoutTemplateRequestDto = {
                ...body,
                image: imageUrl,
                days: typeof body.days === 'string' ? JSON.parse(body.days) : body.days,
                requiredEquipment: typeof body.requiredEquipment === 'string' ? JSON.parse(body.requiredEquipment) : body.requiredEquipment,
                repetitions: parseInt(body.repetitions) || 1,
                isPublic: body.isPublic === 'true' || body.isPublic === true,
                createdById: creatorId,
                createdByType: createdByType as any,
                gymId: gymId
            };

            const result = await this._templateService.createWorkoutTemplate(creatorId, dto);
            res.status(STATUS_CODE.CREATED).json(result);
        } catch (err) {
            next(err);
        }
    }

    async updateWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const body = req.body;

            // Handle file upload to Cloudinary if new image provided
            let imageUrl = body.image;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'workout_templates'
                });
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(req.file.path);
            }

            const dto: Partial<CreateWorkoutTemplateRequestDto> = {
                ...body,
                image: imageUrl,
                days: body.days ? (typeof body.days === 'string' ? JSON.parse(body.days) : body.days) : undefined,
                requiredEquipment: body.requiredEquipment ? (typeof body.requiredEquipment === 'string' ? JSON.parse(body.requiredEquipment) : body.requiredEquipment) : undefined,
                repetitions: body.repetitions ? parseInt(body.repetitions) : undefined,
                isPublic: body.isPublic !== undefined ? (body.isPublic === 'true' || body.isPublic === true) : undefined
            };

            const result = await this._templateService.updateWorkoutTemplate(id, dto);
            res.status(STATUS_CODE.OK).json(result);
        } catch (err) {
            next(err);
        }
    }


    async deleteWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this._templateService.deleteWorkoutTemplate(id);
            res.status(STATUS_CODE.OK).json({ message: "Template deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async listWorkoutTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query: TemplateQueryDto = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                search: req.query.search as string,
                goal: req.query.goal as string,
                equipment: req.query.equipment === "true" ? true : req.query.equipment === "false" ? false : undefined,
                createdById: req.query.createdById as string,
            };
            const result = await this._templateService.listWorkoutTemplates(query);
            res.status(STATUS_CODE.OK).json(result);
        } catch (err) {
            next(err);
        }
    }

    async getWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this._templateService.getWorkoutTemplate(id);
            if (!result) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
            res.status(STATUS_CODE.OK).json(result);
        } catch (err) {
            next(err);
        }
    }

    async startWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const { templateId } = req.body;
            if (!templateId) throw new AppError("Template ID is required", STATUS_CODE.BAD_REQUEST);
            await this._templateService.startWorkoutTemplate(userId, templateId);
            res.status(STATUS_CODE.OK).json({ message: "Workout template started" });
        } catch (err) {
            next(err);
        }
    }

    async stopWorkoutTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            await this._templateService.stopWorkoutTemplate(userId);
            res.status(STATUS_CODE.OK).json({ message: "Workout template stopped" });
        } catch (err) {
            next(err);
        }
    }

    // Diet Templates
    async createDietTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const creatorId = (req.user as JwtPayload).id;
            const creatorRole = (req.user as JwtPayload).role;
            const createdByType = creatorRole === 'admin' ? 'Admin' : creatorRole === 'trainer' ? 'Trainer' : creatorRole === 'gym' ? 'Gym' : 'Admin';
            const gymId = creatorRole === 'gym' ? creatorId : undefined;
            const body = req.body;

            // Handle file upload to Cloudinary
            let imageUrl = body.image;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'diet_templates'
                });
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(req.file.path);
            }

            if (!imageUrl) throw new AppError("Template image is mandatory", STATUS_CODE.BAD_REQUEST);

            const dto: CreateDietTemplateRequestDto = {
                ...body,
                image: imageUrl,
                days: typeof body.days === 'string' ? JSON.parse(body.days) : body.days,
                duration: parseInt(body.duration) || 7,
                isPublic: body.isPublic === 'true' || body.isPublic === true,
                createdById: creatorId,
                createdByType: createdByType as any,
                gymId: gymId
            };

            const result = await this._templateService.createDietTemplate(creatorId, dto);
            res.status(STATUS_CODE.CREATED).json(result);
        } catch (err) {
            next(err);
        }
    }

    async updateDietTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const body = req.body;

            // Handle file upload to Cloudinary if new image provided
            let imageUrl = body.image;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'diet_templates'
                });
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(req.file.path);
            }

            const dto: Partial<CreateDietTemplateRequestDto> = {
                ...body,
                image: imageUrl,
                days: body.days ? (typeof body.days === 'string' ? JSON.parse(body.days) : body.days) : undefined,
                duration: body.duration ? parseInt(body.duration) : undefined,
                isPublic: body.isPublic !== undefined ? (body.isPublic === 'true' || body.isPublic === true) : undefined
            };

            const result = await this._templateService.updateDietTemplate(id, dto);
            res.status(STATUS_CODE.OK).json(result);
        } catch (err) {
            next(err);
        }
    }

    async deleteDietTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this._templateService.deleteDietTemplate(id);
            res.status(STATUS_CODE.OK).json({ message: "Template deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async listDietTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query: TemplateQueryDto = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                search: req.query.search as string,
                goal: req.query.goal as string,
                createdById: req.query.createdById as string,
            };
            const result = await this._templateService.listDietTemplates(query);
            res.status(STATUS_CODE.OK).json(result);
        } catch (err) {
            next(err);
        }
    }

    async getDietTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this._templateService.getDietTemplate(id);
            if (!result) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
            res.status(STATUS_CODE.OK).json(result);
        } catch (err) {
            next(err);
        }
    }

    async startDietTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            const { templateId } = req.body;
            if (!templateId) throw new AppError("Template ID is required", STATUS_CODE.BAD_REQUEST);
            await this._templateService.startDietTemplate(userId, templateId);
            res.status(STATUS_CODE.OK).json({ message: "Diet template started" });
        } catch (err) {
            next(err);
        }
    }

    async stopDietTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req.user as JwtPayload).id;
            await this._templateService.stopDietTemplate(userId);
            res.status(STATUS_CODE.OK).json({ message: "Diet template stopped" });
        } catch (err) {
            next(err);
        }
    }
}
