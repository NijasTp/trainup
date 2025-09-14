import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IGymService } from "../core/interfaces/services/IGymService";
import { IOTPService } from "../core/interfaces/services/IOtpService";
import { UploadedFile } from "express-fileupload";
import { IJwtService, JwtPayload } from "../core/interfaces/services/IJwtService";
import { STATUS_CODE } from "../constants/status";
import { MESSAGES } from "../constants/messages";
import { ROLE } from "../constants/role";
import {
  GymRequestOtpDto,
  GymVerifyOtpDto,
  GymLoginDto,
  GymLoginResponseDto,
  GymDataResponseDto
} from '../dtos/gym.dto'

@injectable()
export class GymController {
  constructor(
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) { }

  requestOtp = async (req: Request, res: Response) => {
    const dto: GymRequestOtpDto = req.body;
    try {
      await this._otpService.requestOtp(dto.email, ROLE.GYM);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message });
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    const dto: GymVerifyOtpDto = req.body;

    try {
      await this._otpService.verifyOtp(dto.email, dto.otp);

      const result: GymLoginResponseDto = await this._gymService.registerGym(
        {
          name: dto.name,
          email: dto.email,
          password: dto.password,
          location: dto.location,
        },
        req.files as {
          certificate?: UploadedFile;
          profileImage?: UploadedFile;
          images?: UploadedFile | UploadedFile[];
        }
      );

      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.CREATED).json({ gym: result.gym });
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message });
    }
  };

  async getData(req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload
      const gymId = jwtUser.id;
      if (!gymId) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Invalid gym ID" });
        return
      }

      const data: GymDataResponseDto = await this._gymService.getGymData(gymId);
      res.status(STATUS_CODE.OK).json(data)
      return
    } catch (error: any) {
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
      return
    }
  }

  login = async (req: Request, res: Response) => {
    const dto: GymLoginDto = req.body;
    try {
      const result: GymLoginResponseDto = await this._gymService.loginGym(dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ gym: result.gym });
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message });
    }
  };

  async logout(req: Request, res: Response) {
    try {
      this._jwtService.clearTokens(res);
       res.status(STATUS_CODE.OK).json({ message: "Logged out successfully" });
       return
    } catch (error) {
      console.error("Logout error:", error);
       res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: "Failed to log out" });
       return
    }
  }
}