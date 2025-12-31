   import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { TrainerAuthController } from "../controllers/trainer.auth.controller";
import { TrainerScheduleController } from "../controllers/trainer.schedule.controller";
import { TrainerClientController } from "../controllers/trainer.client.controller";
import { TrainerDashboardController } from "../controllers/trainer.dashboard.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const trainerAuthController = container.get<TrainerAuthController>(TYPES.TrainerAuthController);
const trainerScheduleController = container.get<TrainerScheduleController>(TYPES.TrainerScheduleController);
const trainerClientController = container.get<TrainerClientController>(TYPES.TrainerClientController);
const trainerDashboardController = container.get<TrainerDashboardController>(TYPES.TrainerDashboardController);

router.post('/login', trainerAuthController.login.bind(trainerAuthController));
router.post('/request-otp', trainerAuthController.requestOtp.bind(trainerAuthController));
router.post('/verify-otp', trainerAuthController.verifyOtp.bind(trainerAuthController));
router.post('/resend-otp', trainerAuthController.resendOtp.bind(trainerAuthController));
router.post('/forgot-password', trainerAuthController.forgotPassword.bind(trainerAuthController));
router.post('/forgot-password-resend-otp', trainerAuthController.forgotPasswordResendOtp.bind(trainerAuthController));
router.post('/reset-password', trainerAuthController.resetPassword.bind(trainerAuthController));
router.post('/apply', trainerAuthController.apply.bind(trainerAuthController));
router.post('/reapply', authMiddleware, roleMiddleware(['trainer']), trainerAuthController.reapply.bind(trainerAuthController));
router.post('/logout', trainerAuthController.logout.bind(trainerAuthController));

router.get('/application/:id', authMiddleware, roleMiddleware(['admin']), trainerDashboardController.getTrainerApplication.bind(trainerDashboardController));
router.get('/get-details', authMiddleware, roleMiddleware(['trainer']), trainerAuthController.getData.bind(trainerAuthController));
router.get('/get-clients', authMiddleware, roleMiddleware(['trainer']), trainerClientController.getClients.bind(trainerClientController));
router.get('/get-client/:id', authMiddleware, roleMiddleware(['trainer']), trainerClientController.getClient.bind(trainerClientController));

router.get('/dashboard-stats', authMiddleware, (req, res, next) =>
    trainerDashboardController.getDashboard(req, res, next)
)
router.patch('/availability', authMiddleware, (req, res, next) =>
    trainerScheduleController.updateAvailability(req, res, next)
)
router.put('/profile', authMiddleware, (req, res, next) =>
    trainerAuthController.updateProfile(req, res, next)
)
router.post('/change-password', authMiddleware, (req, res, next) =>
    trainerAuthController.changePassword(req, res, next)
)

router.get('/dashboard', authMiddleware, roleMiddleware(['trainer']), trainerDashboardController.getDashboard.bind(trainerDashboardController));
router.get('/transactions', authMiddleware, roleMiddleware(['trainer']), trainerDashboardController.getTransactions.bind(trainerDashboardController));

router.put('/availability', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.updateAvailability.bind(trainerScheduleController));

router.get('/weekly-schedule', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.getWeeklySchedule.bind(trainerScheduleController))
    .post('/weekly-schedule', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.saveWeeklySchedule.bind(trainerScheduleController));

router.get('/slots', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.getSlots.bind(trainerScheduleController))
    .post('/slots', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.createSlot.bind(trainerScheduleController))
    .delete('/slots/:slotId', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.deleteSlot.bind(trainerScheduleController));

router.get('/session-requests', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.getSessionRequests.bind(trainerScheduleController));
router.post('/session-requests/:requestId/approve/:userId', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.approveSessionRequest.bind(trainerScheduleController));
router.post('/session-requests/:requestId/reject/:userId', authMiddleware, roleMiddleware(['trainer']), trainerScheduleController.rejectSessionRequest.bind(trainerScheduleController));

router.get('/client/:clientId', authMiddleware, roleMiddleware(['trainer']), trainerClientController.getClientDetails.bind(trainerClientController));
router.get('/chat/messages/:clientId', authMiddleware, roleMiddleware(['trainer']), trainerClientController.getChatMessages.bind(trainerClientController));
router.get('/chat/unread-counts', authMiddleware, roleMiddleware(['trainer']), trainerClientController.getUnreadCounts.bind(trainerClientController));
router.put('/chat/read/:clientId', authMiddleware, roleMiddleware(['trainer']), trainerClientController.markMessagesAsRead.bind(trainerClientController));
router.get('/user-plan/:id', authMiddleware, roleMiddleware(['trainer']), trainerClientController.getUserPlan.bind(trainerClientController));
router.post('/chat/upload', authMiddleware, roleMiddleware(['trainer']), trainerClientController.uploadChatFile.bind(trainerClientController));

export default router;
