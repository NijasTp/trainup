import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IPaymentService } from "../core/interfaces/services/IPaymentService";
import { STATUS_CODE } from "../constants/status";
import TYPES from "../core/types/types";

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.IPaymentService) private paymentService: IPaymentService
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency, receipt } = req.body;
      const order = await this.paymentService.createOrder(amount, currency, receipt);
      res.status(STATUS_CODE.OK).json(order);
    } catch (error: any) {
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentId, signature } = req.body;
      const isValid = await this.paymentService.verifyPayment(orderId, paymentId, signature);
      if (!isValid) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "Invalid signature" });
        return;
      }
      res.status(STATUS_CODE.OK).json({ success: true });
    } catch (error: any) {
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
