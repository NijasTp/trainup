import express from "express";
import container from "../core/di/inversify.config";
import { UserController } from "../controllers/user.controller";
import TYPES from "../core/types/types";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();

const userController = container.get<UserController>(TYPES.UserController);
const paymentController = container.get<PaymentController>(TYPES.PaymentController);

//auth
router.post("/refresh-token", userController.refreshAccessToken.bind(userController));
router.post("/login", userController.login.bind(userController));
router.post("/request-otp", userController.requestOtp.bind(userController));
router.post("/verify-otp", userController.verifyOtp.bind(userController));
router.post('/check-username',userController.checkUsername.bind(userController))
router.post("/google-login", userController.googleLogin.bind(userController));
router.get("/auth/google/callback", userController.googleCallback.bind(userController))

router.post("/resend-otp", userController.resendOtp.bind(userController));
router.post('/forgot-password',userController.forgotPassword.bind(userController))
router.post('/verify-forgot-password-otp',userController.verifyForgotPasswordOtp.bind(userController))
router.post('/reset-password',userController.resetPassword.bind(userController))
router.post("/logout",authMiddleware,roleMiddleware(['user']), userController.logout.bind(userController));

router.get('/session',authMiddleware,userController.checkSession.bind(userController));

router.get('/get-profile',authMiddleware,roleMiddleware(['user']), userController.getProfile.bind(userController))

router.get('/trainers', authMiddleware, roleMiddleware(['user']), userController.getTrainers.bind(userController));
router.get('/trainers/:id', authMiddleware, roleMiddleware(['user']), userController.getIndividualTrainer.bind(userController));
router.post("/create-order", (req, res) => paymentController.createOrder(req, res));
router.post("/verify-payment", (req, res) => paymentController.verifyPayment(req, res));

export default router;
