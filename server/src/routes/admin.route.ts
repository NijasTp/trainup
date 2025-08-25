import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();

const adminController = container.get<AdminController>(TYPES.AdminController);

router.post("/login", adminController.login.bind(adminController));
router.get('/session',authMiddleware,adminController.checkSession.bind(adminController));


router.get("/trainers",authMiddleware,roleMiddleware(['admin']), adminController.getAllTrainers.bind(adminController));
router.patch("/trainers/:id/status",authMiddleware,roleMiddleware(['admin']), adminController.updateTrainer.bind(adminController));
router.get("/trainers/:id",authMiddleware,roleMiddleware(['admin']), adminController.getTrainerById.bind(adminController));
router.get("/trainers/:id/application",authMiddleware,roleMiddleware(['admin']), adminController.getTrainerApplication.bind(adminController));


router.get("/users",authMiddleware,roleMiddleware(['admin']), adminController.getAllUsers.bind(adminController));
router.get("/users/:id",authMiddleware,roleMiddleware(['admin']), adminController.getUserById.bind(adminController));
router.patch("/users/:id",authMiddleware,roleMiddleware(['admin']), adminController.updateUserStatus.bind(adminController));

router.get("/gyms",authMiddleware,roleMiddleware(['admin']), adminController.getGyms.bind(adminController));
router.get("/gyms/:id",authMiddleware,roleMiddleware(['admin']), adminController.getGymById.bind(adminController));
router.patch("/gyms/:id",authMiddleware,roleMiddleware(['admin']), adminController.updateGymStatus.bind(adminController));
router.get("/gyms/:id/application",authMiddleware,roleMiddleware(['admin']), adminController.getGymApplication.bind(adminController));

router.post('/logout',authMiddleware,roleMiddleware(['admin']), adminController.logout.bind(adminController))


export default router;
