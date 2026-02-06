import express from "express";
import container from "../core/di/inversify.config";
import { GymController } from "../controllers/gym.controller";
import TYPES from "../core/types/types";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import fileUpload from "express-fileupload";

const router = express.Router();
const gymController = container.get<GymController>(TYPES.GymController);




// Auth
router.post("/login", gymController.login.bind(gymController));
router.post("/request-otp", gymController.requestOtp.bind(gymController));
router.post("/verify-otp", gymController.verifyOtp.bind(gymController));

router.post('/logout', gymController.logout.bind(gymController))
router.post('/forgot-password', gymController.forgotPassword.bind(gymController));
router.post('/reset-password', gymController.resetPassword.bind(gymController));

// Gym protected
router.get('/get-details', authMiddleware, roleMiddleware(['gym']), gymController.getData.bind(gymController))

router.get("/announcements", authMiddleware, gymController.getAnnouncements.bind(gymController));
router.post("/announcements", authMiddleware, fileUpload({ useTempFiles: true }), gymController.createAnnouncement.bind(gymController));
router.put("/announcements/:id", authMiddleware, fileUpload({ useTempFiles: true }), gymController.updateAnnouncement.bind(gymController));
router.delete("/announcements/:id", authMiddleware, gymController.deleteAnnouncement.bind(gymController));

router.post('/subscription-plans', authMiddleware, roleMiddleware(['gym']), gymController.createSubscriptionPlan.bind(gymController))
router.post('/subscription-plan', authMiddleware, roleMiddleware(['gym']), gymController.createSubscriptionPlan.bind(gymController))
router.get('/subscription-plans', authMiddleware, roleMiddleware(['gym']), gymController.listSubscriptionPlans.bind(gymController))
router.get('/subscription-plan/:id', authMiddleware, roleMiddleware(['gym']), gymController.getSubscriptionPlan.bind(gymController))
router.put('/subscription-plan/:id', authMiddleware, roleMiddleware(['gym']), gymController.updateSubscriptionPlan.bind(gymController))
router.delete('/subscription-plan/:id', authMiddleware, roleMiddleware(['gym']), gymController.deleteSubscriptionPlan.bind(gymController))


// Reapply
router.post('/reapply', authMiddleware, roleMiddleware(['gym']), gymController.reapply.bind(gymController))

// Equipment
import { GymEquipmentController } from "../controllers/gym.equipment.controller";
const equipmentController = container.get<GymEquipmentController>(TYPES.GymEquipmentController);

router.post('/equipment', authMiddleware, roleMiddleware(['gym']), equipmentController.createEquipment.bind(equipmentController));
router.get('/equipment', authMiddleware, roleMiddleware(['gym']), equipmentController.getEquipments.bind(equipmentController));
router.get('/equipment/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.getEquipmentById.bind(equipmentController));
router.put('/equipment/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.updateEquipment.bind(equipmentController));
router.delete('/equipment/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.deleteEquipment.bind(equipmentController));
router.patch('/equipment/:id/availability', authMiddleware, roleMiddleware(['gym']), equipmentController.toggleAvailability.bind(equipmentController));

// Equipment Categories
router.post('/equipment-categories', authMiddleware, roleMiddleware(['gym']), equipmentController.createCategory.bind(equipmentController));
router.get('/equipment-categories', authMiddleware, roleMiddleware(['gym']), equipmentController.getCategories.bind(equipmentController));
router.delete('/equipment-categories/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.deleteCategory.bind(equipmentController));

export default router