// src/routes/workout.routes.ts
import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { WorkoutController } from "../controllers/workout.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const workoutController = container.get<WorkoutController>(TYPES.WorkoutController);

router.post("/sessions", authMiddleware, (req, res, next) => workoutController.createSession(req, res, next));
router
  .get("/sessions/:id", authMiddleware, (req, res, next) => workoutController.getSession(req, res, next))
  .patch("/sessions/:id", authMiddleware, (req, res, next) => workoutController.updateSession(req, res, next))
  .delete("/sessions/:id", authMiddleware, (req, res, next) => workoutController.deleteSession(req, res, next))
router.get("/get-sessions", authMiddleware, (req, res, next) => workoutController.getSessions(req, res, next));

router.post("/days", authMiddleware, (req, res, next) => workoutController.createOrGetDay(req, res, next));
router.post("/days/:date/sessions", authMiddleware, (req, res, next) => workoutController.addSessionToDay(req, res, next));
router.get("/days/:date", authMiddleware, (req, res, next) => workoutController.getDay(req, res, next));
router.get("/trainer-get-days/:date", authMiddleware, (req, res, next) => workoutController.trainerGetDay(req, res, next));

router.post(
  "/trainer-create-workout-session",
  authMiddleware,
  roleMiddleware(["trainer"]),
  (req, res, next) => workoutController.trainerCreateSession(req, res, next)
);

export default router;
