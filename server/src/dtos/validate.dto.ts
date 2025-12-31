import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODE } from '../constants/status';

export const validateDto = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dtoInstance = plainToInstance(dtoClass, req.body, {
        excludeExtraneousValues: true,
      });

      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        res.status(STATUS_CODE.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        });
        return;
      }

      req.body = dtoInstance;
      next();
    } catch (err) {
      next(err);
    }
  };
};
