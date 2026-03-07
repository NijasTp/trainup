import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { STATUS_CODE } from '../constants/status';
import { AppError } from '../utils/appError.util';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await schema.parseAsync(req.body);
            req.body = data;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
                return next(new AppError(errorMessage, STATUS_CODE.BAD_REQUEST));
            }
            next(error);
        }
    };
};
