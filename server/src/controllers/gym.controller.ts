import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IGymService } from "../core/interfaces/services/IGymService";
import { IOTPService } from "../core/interfaces/services/IOtpService";
import { JwtService } from "../utils/jwt";
import { UploadedFile } from "express-fileupload";
import { IJwtService } from "../core/interfaces/services/IJwtService";
import { STATUS_CODE } from "../constants/status";

@injectable()
export class GymController {
  constructor(
    @inject(TYPES.IGymService) private gymService: IGymService,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IJwtService) private jwtService: IJwtService
  ) { }

  requestOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      await this.otpService.requestOtp(email, 'gym');
      res.status(STATUS_CODE.OK).json({ message: "OTP sent to email" });
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message });
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    const { email, otp, name, password, location } = req.body;

    try {
      await this.otpService.verifyOtp(email, otp);

      const { gym, accessToken, refreshToken } = await this.gymService.registerGym(
        {
          name,
          email,
          password,
          location,
        },
        req.files as {
          certificate?: UploadedFile;
          profileImage?: UploadedFile;
          images?: UploadedFile | UploadedFile[];
        }
      );

      this.jwtService.setTokens(res, accessToken, refreshToken);
      res.status(STATUS_CODE.CREATED).json({ gym });
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message });
    }
  };

  async getData(req: Request, res: Response) {
    try {
      const gymId = req.user?.id;
      if (!gymId) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: "Invalid gym ID" });
        return
      }

      const data = await this.gymService.getGymData(gymId);
      res.status(STATUS_CODE.OK).json(data)
      return
    } catch (error: any) {
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.message });
      return
    }
  }


  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const { gym, accessToken, refreshToken } = await this.gymService.loginGym(email, password);
      this.jwtService.setTokens(res, accessToken, refreshToken);
      res.status(STATUS_CODE.OK).json({ gym });
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message });
    }
  };

  

    async logout(req: Request, res: Response) {
    try {
      this.jwtService.clearTokens(res);
       res.status(STATUS_CODE.OK).json({ message: "Logged out successfully" });
       return
    } catch (error) {
      console.error("Logout error:", error);
       res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: "Failed to log out" });
       return
    }
  }
} 