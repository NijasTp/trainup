import express from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { authMiddleware } from "../middlewares/auth.middleware";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();

const paymentController = container.get<PaymentController>(TYPES.PaymentController);


router.post("/create-order", authMiddleware, paymentController.createOrder.bind(paymentController));
router.post("/verify-payment", authMiddleware, paymentController.verifyPayment.bind(paymentController));
router.get("/transactions", authMiddleware, paymentController.getTransactions.bind(paymentController));
export default router;
