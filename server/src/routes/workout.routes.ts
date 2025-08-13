// src/routes/workout.routes.ts
import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { WorkoutController } from "../controllers/workout.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const workoutController = container.get<WorkoutController>(TYPES.WorkoutController);

// Sessions
router.post("/sessions", authMiddleware, workoutController.createSession.bind(workoutController));
router.patch("/sessions/:id", authMiddleware, workoutController.updateSession.bind(workoutController));
router.delete("/sessions/:id", authMiddleware, workoutController.deleteSession.bind(workoutController));

// Workout days
router.post("/days", authMiddleware, workoutController.createOrGetDay.bind(workoutController)); 
router.post("/days/:date/sessions", authMiddleware, workoutController.addSessionToDay.bind(workoutController)); 
router.get("/days/:date", authMiddleware, workoutController.getDay.bind(workoutController));

export default router;
