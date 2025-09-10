import { Request, Response, NextFunction } from 'express';

export interface IUserController {
  requestOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  checkUsername(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  googleLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  checkSession(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTrainers(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
}