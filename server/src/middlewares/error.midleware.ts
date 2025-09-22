import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.util'
import { AppError } from '../utils/appError.util'
import { MESSAGES } from '../constants/messages'

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(`Operational Error: ${err.message}`, { stack: err.stack })
    res.status(err.statusCode).json({
      error: err.message
    })
    return
  }

  logger.error('Unexpected Error:', { error: err.message, stack: err.stack })
  res.status(500).json({
    error: MESSAGES.SERVER_ERROR
  })
}
