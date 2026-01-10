import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { TemplateController } from "../controllers/template.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { Role } from "../constants/role";

const router = Router();
const controller = container.get<TemplateController>(TYPES.TemplateController);

// Admin Routes
router.post(
    "/workout",
    authMiddleware,
    roleMiddleware([Role.ADMIN]),
    controller.createWorkoutTemplate.bind(controller)
);

router.patch(
    "/workout/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN]),
    controller.updateWorkoutTemplate.bind(controller)
);

router.delete(
    "/workout/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN]),
    controller.deleteWorkoutTemplate.bind(controller)
);

router.post(
    "/diet",
    authMiddleware,
    roleMiddleware([Role.ADMIN]),
    controller.createDietTemplate.bind(controller)
);

router.patch(
    "/diet/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN]),
    controller.updateDietTemplate.bind(controller)
);

router.delete(
    "/diet/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN]),
    controller.deleteDietTemplate.bind(controller)
);

// Common / User Routes
router.get(
    "/workout",
    authMiddleware,
    controller.listWorkoutTemplates.bind(controller)
);

router.get(
    "/workout/:id",
    authMiddleware,
    controller.getWorkoutTemplate.bind(controller)
);

router.post(
    "/workout/start",
    authMiddleware,
    controller.startWorkoutTemplate.bind(controller)
);

router.post(
    "/workout/stop",
    authMiddleware,
    controller.stopWorkoutTemplate.bind(controller)
);

router.get(
    "/diet",
    authMiddleware,
    controller.listDietTemplates.bind(controller)
);

router.get(
    "/diet/:id",
    authMiddleware,
    controller.getDietTemplate.bind(controller)
);

router.post(
    "/diet/start",
    authMiddleware,
    controller.startDietTemplate.bind(controller)
);

router.post(
    "/diet/stop",
    authMiddleware,
    controller.stopDietTemplate.bind(controller)
);

export default router;
