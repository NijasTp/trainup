import express from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PaymentTrainerController } from "../controllers/payment.trainer.controller";
import { PaymentGymController } from "../controllers/payment.gym.controller";

const router = express.Router();

const paymentTrainerController = container.get<PaymentTrainerController>(TYPES.PaymentTrainerController);
const paymentGymController = container.get<PaymentGymController>(TYPES.PaymentGymController);

router.post("/create-order", authMiddleware, paymentTrainerController.createOrder.bind(paymentTrainerController));
router.post("/verify-payment", authMiddleware, paymentTrainerController.verifyPayment.bind(paymentTrainerController));
router.get("/transactions", authMiddleware, paymentTrainerController.getTransactions.bind(paymentTrainerController));
router.get("/check-pending", authMiddleware, paymentTrainerController.checkPendingTransaction.bind(paymentTrainerController));
router.post("/cleanup-pending", authMiddleware, paymentTrainerController.cleanupPendingTransactions.bind(paymentTrainerController));

router.post("/gym/create-order", authMiddleware, paymentGymController.createGymOrder.bind(paymentGymController));
router.post("/gym/verify-payment", authMiddleware, paymentGymController.verifyGymPayment.bind(paymentGymController));
router.get("/check-pending-gym", authMiddleware, paymentGymController.checkPendingGymTransaction.bind(paymentGymController));
router.post("/cleanup-pending-gym", authMiddleware, paymentGymController.cleanupPendingGymTransactions.bind(paymentGymController));

export default router;