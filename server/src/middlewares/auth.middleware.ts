
import { Request, Response, NextFunction, RequestHandler } from "express";
import { JwtService } from "../utils/jwt";
import container from "../core/di/inversify.config";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import { ITrainerRepository } from "../core/interfaces/repositories/ITrainerRepository";
import { IAdminRepository } from "../core/interfaces/repositories/IAdminRepository";
import { IGymRepository } from "../core/interfaces/repositories/IGymRepository";
import TYPES from "../core/types/types";
import { Role } from "../constants/role";
import { MESSAGES } from "../constants/messages.constants";

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as { id: string; role: string };

      if (!user) {
        res.status(401).json({ error: "Not authenticated" });
        return
      }
      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({ error: `You've already logged in as ${user.role}` });
        return
      }

      next();
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ error: error.message || MESSAGES.SERVER_ERROR });
    }
  };
}

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
       res.status(401).json({ error: "No token" });
       return
    }

    const decoded = JwtService.verifyToken(token) as {
      id: string;
      role: string;
      tokenVersion: number;
    };

    const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
    const trainerRepo = container.get<ITrainerRepository>(TYPES.ITrainerRepository);
    const adminRepo = container.get<IAdminRepository>(TYPES.IAdminRepository);
    const gymRepo = container.get<IGymRepository>(TYPES.IGymRepository);

    let account: any;
    switch (decoded.role) {
      case Role.USER: account = await userRepo.findById(decoded.id); break;
      case Role.TRAINER: account = await trainerRepo.findById(decoded.id); break;
      case Role.ADMIN: account = await adminRepo.findById(decoded.id); break;
      case Role.GYM: account = await gymRepo.findById(decoded.id); break;
    }

    if (!account || decoded.tokenVersion !== account.tokenVersion) {
       res.status(401).json({ error: "Invalid session" });
       return
    }

    if (account.isBanned) {
       res.status(403).json({ error: "Banned" });
       return
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const error = err as Error;
    console.log("Token error:", error);
     res.status(401).json({ error: "Invalid token" });
  }
};
