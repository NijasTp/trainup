import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { STATUS_CODE } from "../constants/status";
import TYPES  from "../core/types/types";
import { IPaymentService } from "../core/interfaces/services/IPaymentService";
import { IUserService } from "../core/interfaces/services/IUserService";
import { ITrainerService } from "../core/interfaces/services/ITrainerService";
import { JwtPayload } from "../core/interfaces/services/IJwtService";

@injectable()
export class PaymentController {
    constructor(
        @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
        @inject(TYPES.IUserService) private _userService: IUserService,
        @inject(TYPES.ITrainerService) private _trainerService: ITrainerService
    ) {}

    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const { amount, currency, receipt } = req.body;
            const order = await this._paymentService.createOrder(amount, currency, receipt);
            res.status(STATUS_CODE.OK).json(order);
        } catch (error: any) {
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const { orderId, paymentId, signature, trainerId } = req.body;
            const userId = (req.user as JwtPayload).id; 
            if (!trainerId || !userId) {
                 res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json({ success: false, message: "Missing user or trainer ID" });
                    return
            }

            const isValid = await this._paymentService.verifyPayment(orderId, paymentId, signature);
            if (!isValid) {
                 res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json({ success: false, message: "Invalid signature" });
                    return
            }

            // Validate trainer exists
            const trainer = await this._trainerService.getTrainerById(trainerId);
            if (!trainer) {
                 res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json({ success: false, message: "Trainer not found" });
                    return
            }

            // Check if user has a trainer
            const user = await this._userService.getUserById(userId);
            if (user?.assignedTrainer) {
                 res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json({ success: false, message: "User already has a trainer" });
                    return
            }

            // Update user and trainer
            await this._userService.updateUserTrainerId(userId, trainerId);
            await this._trainerService.addClientToTrainer(trainerId, userId);

            res.status(STATUS_CODE.OK).json({
                success: true,
                message: "Payment verified and trainer hired successfully!",
            });
        } catch (error: any) {
            console.log("Verify Payment Error", error);
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}