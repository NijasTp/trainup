import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.util'
import { AppError } from '../utils/appError.util'
import { MESSAGES } from '../constants/messages.constants'

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(`Operational Error: ${err.message}`, { stack: err.stack })
    res.status(err.statusCode).json({
      error: err.message
    })
    return
  }
  logger.error('Unexpected Error:', err)
  // logger.error('Unexpected Error:', { err })
  res.status(500).json({
    error: MESSAGES.SERVER_ERROR
  })
}
