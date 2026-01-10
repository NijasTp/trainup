// src/routes/workout.routes.ts
import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { WorkoutController } from "../controllers/workout.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const workoutController = container.get<WorkoutController>(TYPES.WorkoutController);

router.post("/sessions", authMiddleware, workoutController.createSession.bind(workoutController));
router
  .get("/sessions/:id", authMiddleware, workoutController.getSession.bind(workoutController))
  .patch("/sessions/:id", authMiddleware, workoutController.updateSession.bind(workoutController))
  .delete("/sessions/:id", authMiddleware, workoutController.deleteSession.bind(workoutController))
router.get("/get-sessions", authMiddleware, workoutController.getSessions.bind(workoutController));

router.post("/days", authMiddleware, workoutController.createOrGetDay.bind(workoutController));
router.post("/days/:date/sessions", authMiddleware, workoutController.addSessionToDay.bind(workoutController));
router.get("/days/:date", authMiddleware, workoutController.getDay.bind(workoutController));
router.get("/trainer-get-days/:date", authMiddleware, workoutController.trainerGetDay.bind(workoutController));

router.post(
  "/trainer-create-workout-session", authMiddleware, roleMiddleware(["trainer"]), workoutController.trainerCreateSession.bind(workoutController)
);

export default router;
