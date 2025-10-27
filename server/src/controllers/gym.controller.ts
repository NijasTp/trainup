import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IGymService } from '../core/interfaces/services/IGymService';
import { IOTPService } from '../core/interfaces/services/IOtpService';
import { UploadedFile } from 'express-fileupload';
import { IJwtService, JwtPayload } from '../core/interfaces/services/IJwtService';
import { STATUS_CODE } from '../constants/status';
import { MESSAGES } from '../constants/messages';
import { Role } from '../constants/role';
import {
  GymRequestOtpDto,
  GymVerifyOtpDto,
  GymLoginDto,
  GymLoginResponseDto,
  GymDataResponseDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AddTrainerDto,
  UpdateTrainerDto,
  AddMemberDto,
  UpdateMemberDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  CreatePaymentDto,
} from '../dtos/gym.dto';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/appError.util';

@injectable()
export class GymController {
  constructor(
    @inject(TYPES.IGymService) private _gymService: IGymService,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

  // Auth methods
  async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GymRequestOtpDto = req.body;
      await this._otpService.requestOtp(dto.email, Role.GYM);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.OTP_SENT });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GymVerifyOtpDto = req.body;
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
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GymLoginDto = req.body;
      const result: GymLoginResponseDto = await this._gymService.loginGym(dto.email, dto.password);
      this._jwtService.setTokens(res, result.accessToken, result.refreshToken);
      res.status(STATUS_CODE.OK).json({ gym: result.gym });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this._jwtService.clearTokens(res);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      logger.error('Logout error:', err);
      next(err);
    }
  }

  async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload;
      const gymId = jwtUser.id;
      if (!gymId) throw new AppError(MESSAGES.INVALID_GYM_ID, STATUS_CODE.BAD_REQUEST);
      const data: GymDataResponseDto = await this._gymService.getGymData(gymId);
      res.status(STATUS_CODE.OK).json(data);
    } catch (err) {
      next(err);
    }
  }

  // Profile Management
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { profileImage } = req.files as { profileImage?: UploadedFile };
      const updatedGym = await this._gymService.updateProfile(gymId, req.body, profileImage);
      res.status(STATUS_CODE.OK).json({ gym: updatedGym, message: MESSAGES.UPDATED });
    } catch (err) {
      next(err);
    }
  }

  // Subscription Plan Management
  async createSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const dto: CreateSubscriptionPlanDto = req.body;
      const plan = await this._gymService.createSubscriptionPlan(gymId, dto);
      res.status(STATUS_CODE.CREATED).json({ plan, message: MESSAGES.CREATED });
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptionPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const search = String(req.query.search || '');
      const plans = await this._gymService.getSubscriptionPlans(gymId, page, limit, search);
      res.status(STATUS_CODE.OK).json(plans);
    } catch (err) {
      next(err);
    }
  }

  async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { planId } = req.params;
      const dto: UpdateSubscriptionPlanDto = req.body;
      const plan = await this._gymService.updateSubscriptionPlan(gymId, planId, dto);
      res.status(STATUS_CODE.OK).json({ plan, message: MESSAGES.UPDATED });
    } catch (err) {
      next(err);
    }
  }

  async deleteSubscriptionPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { planId } = req.params;
      await this._gymService.deleteSubscriptionPlan(gymId, planId);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      next(err);
    }
  }

  // Trainer Management
  async addTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const dto: AddTrainerDto = req.body;
      const trainer = await this._gymService.addTrainer(gymId, dto);
      res.status(STATUS_CODE.CREATED).json({ trainer, message: MESSAGES.CREATED });
    } catch (err) {
      next(err);
    }
  }

  async getTrainers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const search = String(req.query.search || '');
      const trainers = await this._gymService.getTrainers(gymId, page, limit, search);
      res.status(STATUS_CODE.OK).json(trainers);
    } catch (err) {
      next(err);
    }
  }

  async updateTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { trainerId } = req.params;
      const dto: UpdateTrainerDto = req.body;
      const trainer = await this._gymService.updateTrainer(gymId, trainerId, dto);
      res.status(STATUS_CODE.OK).json({ trainer, message: MESSAGES.UPDATED });
    } catch (err) {
      next(err);
    }
  }

  async removeTrainer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { trainerId } = req.params;
      await this._gymService.removeTrainer(gymId, trainerId);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      next(err);
    }
  }

  // Member Management
  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const dto: AddMemberDto = req.body;
      const member = await this._gymService.addMember(gymId, dto);
      res.status(STATUS_CODE.CREATED).json({ member, message: MESSAGES.CREATED });
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const search = String(req.query.search || '');
      const status = String(req.query.status || '');
      const paymentStatus = String(req.query.paymentStatus || '');
      const members = await this._gymService.getMembers(gymId, page, limit, search, status, paymentStatus);
      res.status(STATUS_CODE.OK).json(members);
    } catch (err) {
      next(err);
    }
  }

  async updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { memberId } = req.params;
      const dto: UpdateMemberDto = req.body;
      const member = await this._gymService.updateMember(gymId, memberId, dto);
      res.status(STATUS_CODE.OK).json({ member, message: MESSAGES.UPDATED });
    } catch (err) {
      next(err);
    }
  }

  async getMemberAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { memberId } = req.params;
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
      const attendance = await this._gymService.getMemberAttendance(gymId, memberId, startDate, endDate);
      res.status(STATUS_CODE.OK).json(attendance);
    } catch (err) {
      next(err);
    }
  }

  // Attendance Management
  async generateQRCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const qrCode = await this._gymService.generateDailyQRCode(gymId);
      res.status(STATUS_CODE.OK).json({ qrCode });
    } catch (err) {
      next(err);
    }
  }

  async getQRCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const date = req.query.date ? new Date(String(req.query.date)) : new Date();
      const qrCode = await this._gymService.getQRCodeForDate(gymId, date);
      res.status(STATUS_CODE.OK).json({ qrCode });
    } catch (err) {
      next(err);
    }
  }

  async markAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { userId, qrCodeId } = req.body;
      const markedById = (req.user as JwtPayload).id;
      const attendance = await this._gymService.markAttendance(gymId, userId, qrCodeId, 'gym', markedById);
      res.status(STATUS_CODE.OK).json({ attendance, message: 'Attendance marked successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
      const userId = String(req.query.userId || '');
      const report = await this._gymService.getAttendanceReport(gymId, page, limit, startDate, endDate, userId);
      res.status(STATUS_CODE.OK).json(report);
    } catch (err) {
      next(err);
    }
  }

  // Announcement Management
  async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const createdBy = (req.user as JwtPayload).id;
      const dto: CreateAnnouncementDto = req.body;
      const announcement = await this._gymService.createAnnouncement(gymId, dto, createdBy);
      res.status(STATUS_CODE.CREATED).json({ announcement, message: MESSAGES.CREATED });
    } catch (err) {
      next(err);
    }
  }

  async getAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const type = String(req.query.type || '');
      const announcements = await this._gymService.getAnnouncements(gymId, page, limit, type);
      res.status(STATUS_CODE.OK).json(announcements);
    } catch (err) {
      next(err);
    }
  }

  async updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { announcementId } = req.params;
      const dto: UpdateAnnouncementDto = req.body;
      const announcement = await this._gymService.updateAnnouncement(gymId, announcementId, dto);
      res.status(STATUS_CODE.OK).json({ announcement, message: MESSAGES.UPDATED });
    } catch (err) {
      next(err);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { announcementId } = req.params;
      await this._gymService.deleteAnnouncement(gymId, announcementId);
      res.status(STATUS_CODE.OK).json({ message: MESSAGES.DELETED });
    } catch (err) {
      next(err);
    }
  }

  // Payment Management
  async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const createdBy = (req.user as JwtPayload).id;
      const dto: CreatePaymentDto = req.body;
      const payment = await this._gymService.createPayment(gymId, dto, createdBy);
      res.status(STATUS_CODE.CREATED).json({ payment, message: MESSAGES.CREATED });
    } catch (err) {
      next(err);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const search = String(req.query.search || '');
      const paymentMethod = String(req.query.paymentMethod || '');
      const status = String(req.query.status || '');
      const payments = await this._gymService.getPayments(gymId, page, limit, search, paymentMethod, status);
      res.status(STATUS_CODE.OK).json(payments);
    } catch (err) {
      next(err);
    }
  }

  async createStripeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { planId, userId } = req.body;
      const session = await this._gymService.createStripeSession(gymId, planId, userId);
      res.status(STATUS_CODE.OK).json({ sessionUrl: session.url, sessionId: session.id });
    } catch (err) {
      next(err);
    }
  }

  // Reports
  async downloadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = (req.user as JwtPayload).id;
      const { type } = req.params; // 'attendance' | 'payments' | 'members'
      const format = String(req.query.format || 'pdf'); // 'pdf' | 'csv'
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
      
      const report = await this._gymService.generateReport(gymId, type, format, startDate, endDate);
      
      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report.${format}"`);
      res.send(report);
    } catch (err) {
      next(err);
    }
  }
}