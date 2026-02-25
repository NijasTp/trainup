import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { SubscriptionController } from "../controllers/userSubscription.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = container.get<SubscriptionController>(TYPES.SubscriptionController);

router.get("/", authMiddleware, (req, res, next) => controller.getSubscriptions(req, res, next));

export default router;
