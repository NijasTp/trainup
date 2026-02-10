import express from "express";
import container from "../core/di/inversify.config";
import { GymController } from "../controllers/gym.controller";
import TYPES from "../core/types/types";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import fileUpload from "express-fileupload";

const router = express.Router();
const gymController = container.get<GymController>(TYPES.GymController);




// Pre-registration Auth
import { GymAuthController } from "../controllers/gym.auth.controller";
const gymAuthController = container.get<GymAuthController>(TYPES.GymAuthController);

router.post("/auth/request-otp", gymAuthController.requestOtp.bind(gymAuthController));
router.post("/auth/verify-otp", gymAuthController.verifyOtp.bind(gymAuthController));
router.post("/register", fileUpload({ useTempFiles: true }), gymController.register.bind(gymController));

// Dashboard Stats
router.get("/dashboard-stats", authMiddleware, roleMiddleware(['gym']), gymController.getDashboardStats.bind(gymController));

// Auth (Existing Accounts)
router.post("/login", gymController.login.bind(gymController));

router.get("/session", authMiddleware, roleMiddleware(['gym']), gymController.checkSession.bind(gymController));
router.post('/logout', gymController.logout.bind(gymController))
router.post('/forgot-password', gymController.forgotPassword.bind(gymController));
router.post('/reset-password', gymController.resetPassword.bind(gymController));

// Gym protected
router.get('/get-details', authMiddleware, roleMiddleware(['gym']), gymController.getData.bind(gymController))
router.put('/update-profile', authMiddleware, roleMiddleware(['gym']), fileUpload({ useTempFiles: true }), gymController.updateProfile.bind(gymController));
router.get('/members', authMiddleware, roleMiddleware(['gym']), gymController.getMembers.bind(gymController));
router.get('/attendance', authMiddleware, roleMiddleware(['gym']), gymController.getAttendance.bind(gymController));

// Products
router.get('/products', authMiddleware, roleMiddleware(['gym']), gymController.getProducts.bind(gymController));
router.post('/products', authMiddleware, roleMiddleware(['gym']), fileUpload({ useTempFiles: true }), gymController.createProduct.bind(gymController));
router.put('/products/:id', authMiddleware, roleMiddleware(['gym']), fileUpload({ useTempFiles: true }), gymController.updateProduct.bind(gymController));
router.delete('/products/:id', authMiddleware, roleMiddleware(['gym']), gymController.deleteProduct.bind(gymController));

// Jobs
router.get('/jobs', authMiddleware, roleMiddleware(['gym']), gymController.getJobs.bind(gymController));
router.post('/jobs', authMiddleware, roleMiddleware(['gym']), gymController.createJob.bind(gymController));
router.put('/jobs/:id', authMiddleware, roleMiddleware(['gym']), gymController.updateJob.bind(gymController));
router.delete('/jobs/:id', authMiddleware, roleMiddleware(['gym']), gymController.deleteJob.bind(gymController));

// Workout Templates
router.get('/workout-templates', authMiddleware, roleMiddleware(['gym']), gymController.getGymWorkoutTemplates.bind(gymController));
router.post('/workout-templates', authMiddleware, roleMiddleware(['gym']), gymController.createWorkoutTemplate.bind(gymController));
router.put('/workout-templates/:id', authMiddleware, roleMiddleware(['gym']), gymController.updateWorkoutTemplate.bind(gymController));
router.delete('/workout-templates/:id', authMiddleware, roleMiddleware(['gym']), gymController.deleteWorkoutTemplate.bind(gymController));





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
import { GymEquipmentController } from "../controllers/gymEquipment.controller";
const equipmentController = container.get<GymEquipmentController>(TYPES.GymEquipmentController);

router.post('/equipment', authMiddleware, roleMiddleware(['gym']), fileUpload({ useTempFiles: true }), equipmentController.createEquipment.bind(equipmentController));
router.get('/equipment', authMiddleware, roleMiddleware(['gym']), equipmentController.getEquipments.bind(equipmentController));
router.get('/equipment/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.getEquipmentById.bind(equipmentController));
router.put('/equipment/:id', authMiddleware, roleMiddleware(['gym']), fileUpload({ useTempFiles: true }), equipmentController.updateEquipment.bind(equipmentController));
router.delete('/equipment/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.deleteEquipment.bind(equipmentController));
router.patch('/equipment/:id/availability', authMiddleware, roleMiddleware(['gym']), equipmentController.toggleAvailability.bind(equipmentController));


// Equipment Categories
router.post('/equipment-categories', authMiddleware, roleMiddleware(['gym']), equipmentController.createCategory.bind(equipmentController));
router.get('/equipment-categories', authMiddleware, roleMiddleware(['gym']), equipmentController.getCategories.bind(equipmentController));
router.delete('/equipment-categories/:id', authMiddleware, roleMiddleware(['gym']), equipmentController.deleteCategory.bind(equipmentController));

export default router