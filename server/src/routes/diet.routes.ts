import { Router } from "express";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { authMiddleware } from "../middlewares/auth.middleware";
import { DietController } from "../controllers/diet.controller";

const router = Router();
const dietController = container.get<DietController>(TYPES.DietController);

router.get("/:date", authMiddleware, dietController.getDay.bind(dietController));
router.post("/", authMiddleware, dietController.createOrGetDay.bind(dietController));

router.post("/:date/meals", authMiddleware, dietController.addMeal.bind(dietController));
router.patch("/:date/meals/:mealId", authMiddleware, dietController.updateMeal.bind(dietController));
router.delete("/:date/meals/:mealId", authMiddleware, dietController.removeMeal.bind(dietController));
router.patch("/:date/meals/:mealId/eaten", authMiddleware, dietController.markEaten.bind(dietController));

export default router;
