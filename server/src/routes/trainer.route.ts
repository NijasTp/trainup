import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { TrainerController } from "../controllers/trainer.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const trainerController = container.get<TrainerController>(TYPES.TrainerController);

router.post('/login', trainerController.login.bind(trainerController));
router.post('/request-otp', trainerController.requestOtp.bind(trainerController));
router.post('/verify-otp', trainerController.verifyOtp.bind(trainerController));
router.post('/resend-otp', trainerController.resendOtp.bind(trainerController));
router.post('/forgot-password', trainerController.forgotPassword.bind(trainerController));
router.post('/forgot-password-resend-otp', trainerController.forgotPasswordResendOtp.bind(trainerController));
router.post('/reset-password', trainerController.resetPassword.bind(trainerController));
router.post('/apply', trainerController.apply.bind(trainerController));
router.post('/reapply', authMiddleware, roleMiddleware(['trainer']), trainerController.reapply.bind(trainerController));
router.post('/logout', trainerController.logout.bind(trainerController));

router.get('/application/:id', authMiddleware, roleMiddleware(['admin']), trainerController.getTrainerApplication.bind(trainerController));
router.get('/get-details', authMiddleware, roleMiddleware(['trainer']), trainerController.getData.bind(trainerController));
router.get('/get-clients', authMiddleware, roleMiddleware(['trainer']), trainerController.getClients.bind(trainerController));
router.get('/get-client/:id', authMiddleware, roleMiddleware(['trainer']), trainerController.getClient.bind(trainerController));

router.get('/dashboard-stats', authMiddleware, (req, res, next) =>
    container.get<TrainerController>(TYPES.TrainerController).getDashboardStats(req, res, next)
)
router.patch('/availability', authMiddleware, (req, res, next) =>
    container.get<TrainerController>(TYPES.TrainerController).updateAvailability(req, res, next)
)
router.put('/profile', authMiddleware, (req, res, next) =>
    container.get<TrainerController>(TYPES.TrainerController).updateProfile(req, res, next)
)
router.post('/change-password', authMiddleware, (req, res, next) =>
    container.get<TrainerController>(TYPES.TrainerController).changePassword(req, res, next)
)

router.get('/dashboard', authMiddleware, roleMiddleware(['trainer']), trainerController.getDashboard.bind(trainerController));
router.get('/transactions', authMiddleware, roleMiddleware(['trainer']), trainerController.getTransactions.bind(trainerController));

router.put('/availability', authMiddleware, roleMiddleware(['trainer']), trainerController.updateAvailability.bind(trainerController));

router.get('/weekly-schedule', authMiddleware, roleMiddleware(['trainer']), trainerController.getWeeklySchedule.bind(trainerController))
    .post('/weekly-schedule', authMiddleware, roleMiddleware(['trainer']), trainerController.saveWeeklySchedule.bind(trainerController));

router.get('/slots', authMiddleware, roleMiddleware(['trainer']), trainerController.getSlots.bind(trainerController))
    .post('/slots', authMiddleware, roleMiddleware(['trainer']), trainerController.createSlot.bind(trainerController))
    .delete('/slots/:slotId', authMiddleware, roleMiddleware(['trainer']), trainerController.deleteSlot.bind(trainerController));

router.get('/session-requests', authMiddleware, roleMiddleware(['trainer']), trainerController.getSessionRequests.bind(trainerController));
router.post('/session-requests/:requestId/approve/:userId', authMiddleware, roleMiddleware(['trainer']), trainerController.approveSessionRequest.bind(trainerController));
router.post('/session-requests/:requestId/reject/:userId', authMiddleware, roleMiddleware(['trainer']), trainerController.rejectSessionRequest.bind(trainerController));

router.get('/client/:clientId', authMiddleware, roleMiddleware(['trainer']), trainerController.getClientDetails.bind(trainerController));
router.get('/chat/messages/:clientId', authMiddleware, roleMiddleware(['trainer']), trainerController.getChatMessages.bind(trainerController));
router.get('/user-plan/:id', authMiddleware, roleMiddleware(['trainer']), trainerController.getUserPlan.bind(trainerController));
router.post('/chat/upload', authMiddleware, roleMiddleware(['trainer']), trainerController.uploadChatFile.bind(trainerController));

export default router;