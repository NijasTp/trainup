import express from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PaymentTrainerController } from "../controllers/payment.trainer.controller";
import { PaymentGymController } from "../controllers/payment.gym.controller";

const router = express.Router();

const paymentTrainerController = container.get<PaymentTrainerController>(TYPES.PaymentTrainerController);
const paymentGymController = container.get<PaymentGymController>(TYPES.PaymentGymController);

// Stripe Trainer Routes
router.get("/transactions", authMiddleware, paymentTrainerController.getTransactions.bind(paymentTrainerController));
router.get("/check-pending", authMiddleware, paymentTrainerController.checkPendingTransaction.bind(paymentTrainerController));
router.post("/cleanup-pending", authMiddleware, paymentTrainerController.cleanupPendingTransactions.bind(paymentTrainerController));

// Stripe Trainer Routes
router.post("/create-checkout-session", authMiddleware, paymentTrainerController.createCheckoutSession.bind(paymentTrainerController));
router.get("/session-status/:sessionId", authMiddleware, paymentTrainerController.getSessionStatus.bind(paymentTrainerController));

// Gym Routes
router.post("/create-gym-checkout-session", authMiddleware, paymentGymController.createGymCheckoutSession.bind(paymentGymController));
router.get("/gym-session-status/:sessionId", authMiddleware, paymentGymController.getGymSessionStatus.bind(paymentGymController));

router.get("/check-pending-gym", authMiddleware, paymentGymController.checkPendingGymTransaction.bind(paymentGymController));
router.post("/cleanup-pending-gym", authMiddleware, paymentGymController.cleanupPendingGymTransactions.bind(paymentGymController));

export default router;