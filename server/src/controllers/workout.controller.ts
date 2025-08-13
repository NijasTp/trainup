// src/controllers/WorkoutController.ts
import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IWorkoutService } from "../core/interfaces/services/IWorkoutService";
import { JwtPayload } from "../core/interfaces/services/IJwtService";

@injectable()
export class WorkoutController {
  constructor(@inject(TYPES.WorkoutService) private workoutService: IWorkoutService) { }

  createSession = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined;
      const payload = req.body;

      const created = await this.workoutService.createSession({
        ...payload,
        userId: jwtUser?.role === "user" ? jwtUser.id : undefined,
        trainerId: jwtUser?.role === "trainer" ? jwtUser.id : undefined,
        givenBy:jwtUser?.role
      });

      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
  updateSession = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const updated = await this.workoutService.updateSession(id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  deleteSession = async (req: Request, res: Response) => {
    try {
      await this.workoutService.deleteSession(req.params.id);
      res.status(204).end();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  createOrGetDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined;
      const userId = jwtUser!.id;

      const { date } = req.body;
      const day = await this.workoutService.createDay(userId, date);

      res.json(day);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  addSessionToDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined;
      const userId = jwtUser!.id;

      const { date } = req.params;
      const { sessionId } = req.body;
      const day = await this.workoutService.addSessionToDay(userId, date, sessionId);

      res.json(day);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined;
      const userId = jwtUser!.id;

      const date = req.params.date;
      const day = await this.workoutService.getDay(userId, date);

      if (!day) {
        res.status(404).json({ error: "Not found" });
      }
      res.json(day);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
