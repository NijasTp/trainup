import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { TemplateController } from "../controllers/template.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { Role } from "../constants/role";
import { upload } from "../utils/multer.util";
import { validateRequest } from "../middlewares/zodValidation.middleware";
import {
    CreateWorkoutTemplateSchema,
    UpdateWorkoutTemplateSchema,
    CreateDietTemplateSchema,
    UpdateDietTemplateSchema
} from "../dtos/template.schema";


const router = Router();
const controller = container.get<TemplateController>(TYPES.TemplateController);

// Admin Routes
router.post(
    "/workout",
    authMiddleware,
    roleMiddleware([Role.ADMIN, Role.TRAINER, Role.GYM]),
    upload.single('image'),
    validateRequest(CreateWorkoutTemplateSchema),
    controller.createWorkoutTemplate.bind(controller)
);


router.patch(
    "/workout/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN, Role.TRAINER, Role.GYM]),
    upload.single('image'),
    validateRequest(UpdateWorkoutTemplateSchema),
    controller.updateWorkoutTemplate.bind(controller)
);


router.delete(
    "/workout/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN, Role.TRAINER, Role.GYM]),
    controller.deleteWorkoutTemplate.bind(controller)
);

router.post(
    "/diet",
    authMiddleware,
    roleMiddleware([Role.ADMIN, Role.TRAINER, Role.GYM]),
    upload.single('image'),
    validateRequest(CreateDietTemplateSchema),
    controller.createDietTemplate.bind(controller)
);

router.patch(
    "/diet/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN, Role.TRAINER, Role.GYM]),
    upload.single('image'),
    validateRequest(UpdateDietTemplateSchema),
    controller.updateDietTemplate.bind(controller)
);

router.delete(
    "/diet/:id",
    authMiddleware,
    roleMiddleware([Role.ADMIN, Role.TRAINER, Role.GYM]),
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

router.post(
    "/workout/assign",
    authMiddleware,
    roleMiddleware([Role.TRAINER]),
    controller.assignWorkoutToUser.bind(controller)
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

router.post(
    "/diet/assign",
    authMiddleware,
    roleMiddleware([Role.TRAINER]),
    controller.assignDietToUser.bind(controller)
);

export default router;
