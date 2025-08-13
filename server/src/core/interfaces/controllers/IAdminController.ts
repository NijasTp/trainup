import { Request, Response } from "express";

export interface IAdminController {
  login(req: Request, res: Response): Promise<void>;
  getAllTrainers(req: Request, res: Response): Promise<void>;
  updateTrainerStatus(req: Request, res: Response): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
  updateUserStatus(req: Request, res: Response): Promise<void>;
}