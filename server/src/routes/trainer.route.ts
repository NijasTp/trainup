import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { TrainerController } from "../controllers/trainer.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";


const router = Router();
const trainerController = container.get<TrainerController>(TYPES.TrainerController);
//auth
router.post('/login', trainerController.login.bind(trainerController));
router.post('/request-otp', trainerController.requestOtp.bind(trainerController));
router.post('/verify-otp', trainerController.verifyOtp.bind(trainerController));
router.post('/resend-otp', trainerController.resendOtp.bind(trainerController));
router.post('/forgot-password', trainerController.forgotPassword.bind(trainerController));
router.post('/forgot-password-resend-otp', trainerController.forgotPasswordResendOtp.bind(trainerController));
router.post('/reset-password', trainerController.resetPassword.bind(trainerController));
router.post('/apply', trainerController.apply.bind(trainerController));
router.post('/reapply',authMiddleware,roleMiddleware(['trainer']), trainerController.reapply.bind(trainerController));
router.post('/logout', trainerController.logout.bind(trainerController));

//general
router.get('/get-details',authMiddleware,roleMiddleware(['trainer']), trainerController.getData.bind(trainerController));
router.get('/get-clients', authMiddleware, roleMiddleware(['trainer']), trainerController.getClients.bind(trainerController));
router.get('/get-client/:id', authMiddleware, roleMiddleware(['trainer']), trainerController.getClient.bind(trainerController));
export default router;