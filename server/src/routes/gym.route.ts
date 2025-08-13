import express from "express";
import container from "../core/di/inversify.config";
import { GymController } from "../controllers/gym.controller";
import TYPES from "../core/types/types";
import { authMiddleware,roleMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const gymController = container.get<GymController>(TYPES.GymController);




// Auth
router.post("/login", gymController.login.bind(gymController));
router.post("/request-otp", gymController.requestOtp.bind(gymController));
router.post("/verify-otp", gymController.verifyOtp.bind(gymController));
router.get(
  "/get-details",
  authMiddleware,
  roleMiddleware(["gym"]),
  gymController.getData.bind(gymController)
);

router.post('/logout',gymController.logout.bind(gymController))




export default router