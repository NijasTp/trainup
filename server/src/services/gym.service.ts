import { injectable, inject } from 'inversify';
import { IGymService } from '../core/interfaces/services/IGymService';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';
import TYPES from '../core/types/types';
import bcrypt from 'bcryptjs';
import { IGym } from '../models/gym.model';
import { ITrainer } from '../models/trainer.model';
import { ISubscriptionPlan } from '../models/gymSubacriptionPlan.model';
import { IUserGymMembership } from '../models/userGymMembership.model';
import { IGymPayment } from '../models/gymPayment.model';
import { IGymAttendance } from '../models/gymAttendence.model';
import { IGymAnnouncement } from '../models/gymAnnouncement.model';
import cloudinary from '../config/cloudinary';
import { UploadedFile } from 'express-fileupload';
import { IJwtService } from '../core/interfaces/services/IJwtService';
import { 
  GymLoginResponseDto, 
  GymResponseDto, 
  GymDataResponseDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AddTrainerDto,
  UpdateTrainerDto,
  AddMemberDto,
  UpdateMemberDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  CreatePaymentDto
} from '../dtos/gym.dto';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class GymService implements IGymService {
  private stripe: Stripe;

  constructor(
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });
  }

  async registerGym(
    data: Partial<IGym>,
    files: {
      certificate?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<GymLoginResponseDto> {
    let certificateUrl: string | undefined;
    let profileImageUrl: string | undefined;
    const imageUrls: string[] = [];

    if (!data.password) throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (files?.certificate) {
      try {
        const certUpload = await cloudinary.uploader.upload(files.certificate.tempFilePath, {
          folder: 'trainup/gyms/certificate',
        });
        certificateUrl = certUpload.secure_url;
      } catch (err) {
        const error = err as Error;
        throw new AppError(`Failed to upload certificate: ${error.message || 'Unknown error'}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
      }
    }

    if (files?.profileImage) {
      try {
        const profileUpload = await cloudinary.uploader.upload(files.profileImage.tempFilePath, {
          folder: 'trainup/gyms/profiles',
        });
        profileImageUrl = profileUpload.secure_url;
      } catch (err) {
        const error = err as Error;
        throw new AppError(`Failed to upload profile image: ${error.message || 'Unknown error'}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
      }
    }

    if (files?.images) {
      const uploadPromises = Array.isArray(files.images)
        ? files.images.map((img) =>
            cloudinary.uploader.upload(img.tempFilePath, {
              folder: 'trainup/gyms/gallery',
            })
          )
        : [
            cloudinary.uploader.upload(files.images.tempFilePath, {
              folder: 'trainup/gyms/gallery',
            }),
          ];

      try {
        const results = await Promise.all(uploadPromises);
        results.forEach((res) => imageUrls.push(res.secure_url));
      } catch (err) {
        const error = err as Error;
        throw new AppError(`Failed to upload images: ${error.message || 'Unknown error'}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
      }
    }

    const gym = await this._gymRepo.createGym({
      ...data,
      password: hashedPassword,
      certificate: certificateUrl,
      profileImage: profileImageUrl,
      images: imageUrls,
    });

    const accessToken = this._jwtService.generateAccessToken(gym._id.toString(), gym.role, gym.tokenVersion ?? 0);
    const refreshToken = this._jwtService.generateRefreshToken(gym._id.toString(), gym.role, gym.tokenVersion ?? 0);

    return {
      gym: this.mapToResponseDto(gym),
      accessToken,
      refreshToken,
    };
  }

  async loginGym(email: string, password: string): Promise<GymLoginResponseDto> {
    const gym = await this._gymRepo.findByEmail(email);
    if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    if (gym.verifyStatus === 'rejected') throw new AppError(`${MESSAGES.GYM_VERIFICATION_REJECTED}: ${gym.rejectReason}`, STATUS_CODE.BAD_REQUEST);
    const valid = await bcrypt.compare(password, gym.password!);
    if (!valid) throw new AppError(MESSAGES.LOGIN_FAILED, STATUS_CODE.UNAUTHORIZED);

    const accessToken = this._jwtService.generateAccessToken(gym._id.toString(), gym.role, gym.tokenVersion ?? 0);
    const refreshToken = this._jwtService.generateRefreshToken(gym._id.toString(), gym.role, gym.tokenVersion ?? 0);

    return {
      gym: this.mapToResponseDto(gym),
      accessToken,
      refreshToken,
    };
  }

  async getAllGyms(page: number, limit: number, searchQuery: string): Promise<any> {
    return await this._gymRepo.findGyms(page, limit, searchQuery);
  }

  async updateGymStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null> {
    return await this._gymRepo.updateStatus(id, updateData);
  }

  async getGymById(id: string): Promise<IGym | null> {
    return await this._gymRepo.findById(id);
  }

  async getGymData(gymId: string): Promise<GymDataResponseDto> {
    const gymDetails = await this._gymRepo.getGymById(gymId);
    if (!gymDetails) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    const trainers = await this._gymRepo.getGymTrainers(gymId);
    const members = await this._gymRepo.getGymMembers(gymId);
    const announcements = await this._gymRepo.getGymAnnouncements(gymId);

    return {
      gymDetails,
      trainers,
      members,
      announcements,
    };
  }

  async getGymApplication(id: string): Promise<GymResponseDto | null> {
    return await this._gymRepo.findApplicationById(id);
  }

  async updateProfile(gymId: string, data: Partial<IGym>, profileImage?: UploadedFile): Promise<IGym | null> {
    let profileImageUrl: string | undefined;

    if (profileImage) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profileImage.tempFilePath, {
          folder: 'trainup/gyms/profiles',
        });
        profileImageUrl = uploadResult.secure_url;
      } catch (err) {
        const error = err as Error;
        throw new AppError(`Failed to upload profile image: ${error.message || 'Unknown error'}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
      }
    }

    return this._gymRepo.updateGym(gymId, {
      ...data,
      profileImage: profileImageUrl || data.profileImage,
    });
  }

  async createSubscriptionPlan(gymId: string, dto: CreateSubscriptionPlanDto): Promise<ISubscriptionPlan> {
    return this._gymRepo.createSubscriptionPlan({
      gymId: new Types.ObjectId(gymId),
      ...dto,
    });
  }

  async getSubscriptionPlans(gymId: string, page: number, limit: number, search: string): Promise<any> {
    return this._gymRepo.getSubscriptionPlans(gymId, page, limit, search);
  }

  async updateSubscriptionPlan(gymId: string, planId: string, dto: UpdateSubscriptionPlanDto): Promise<ISubscriptionPlan | null> {
    return this._gymRepo.updateSubscriptionPlan(gymId, planId, dto);
  }

  async deleteSubscriptionPlan(gymId: string, planId: string): Promise<void> {
    await this._gymRepo.deleteSubscriptionPlan(gymId, planId);
  }

  async addTrainer(gymId: string, dto: AddTrainerDto): Promise<ITrainer> {
    const trainer = await this._gymRepo.createTrainer({
      ...dto,
      gymId: new Types.ObjectId(gymId),
    });
    await this._gymRepo.addTrainerToGym(gymId, trainer._id);
    return trainer;
  }

  async getTrainers(gymId: string, page: number, limit: number, search: string): Promise<any> {
    return this._gymRepo.getTrainers(gymId, page, limit, search);
  }

  async updateTrainer(gymId: string, trainerId: string, dto: UpdateTrainerDto): Promise<ITrainer | null> {
    return this._gymRepo.updateTrainer(gymId, trainerId, dto);
  }

  async removeTrainer(gymId: string, trainerId: string): Promise<void> {
    await this._gymRepo.removeTrainerFromGym(gymId, trainerId);
  }

  async addMember(gymId: string, dto: AddMemberDto): Promise<IUserGymMembership> {
    const membership = await this._gymRepo.createMembership({
      userId: new Types.ObjectId(dto.userId),
      gymId: new Types.ObjectId(gymId),
      planId: new Types.ObjectId(dto.planId),
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(dto.subscriptionEndDate),
    });
    await this._gymRepo.addMemberToGym(gymId, membership.userId);
    return membership;
  }

  async getMembers(gymId: string, page: number, limit: number, search: string, status: string, paymentStatus: string): Promise<any> {
    return this._gymRepo.getMembers(gymId, page, limit, search, status, paymentStatus);
  }

  async updateMember(gymId: string, memberId: string, dto: UpdateMemberDto): Promise<IUserGymMembership | null> {
    return this._gymRepo.updateMembership(gymId, memberId, dto);
  }

  async getMemberAttendance(gymId: string, memberId: string, startDate?: Date, endDate?: Date): Promise<IGymAttendance[]> {
    return this._gymRepo.getMemberAttendance(gymId, memberId, startDate, endDate);
  }

  async generateDailyQRCode(gymId: string): Promise<string> {
    const code = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);
    
    const qrCodeData = await QRCode.toDataURL(code);
    await this._gymRepo.createQRCode({
      gymId: new Types.ObjectId(gymId),
      code,
      date: new Date(),
      expiresAt,
    });
    
    return qrCodeData;
  }

  async getQRCodeForDate(gymId: string, date: Date): Promise<string | null> {
    const qrCode = await this._gymRepo.getQRCodeForDate(gymId, date);
    if (!qrCode) return null;
    return QRCode.toDataURL(qrCode.code);
  }

  async markAttendance(gymId: string, userId: string, qrCodeId: string, markedBy: 'user' | 'trainer' | 'gym', markedById: string): Promise<IGymAttendance> {
    const qrCode = await this._gymRepo.getQRCodeById(qrCodeId);
    if (!qrCode || !qrCode.isActive || qrCode.gymId.toString() !== gymId) {
      throw new AppError('Invalid or expired QR code', STATUS_CODE.BAD_REQUEST);
    }
    
    return this._gymRepo.createAttendance({
      gymId: new Types.ObjectId(gymId),
      userId: new Types.ObjectId(userId),
      date: new Date(),
      markedBy,
      markedById: new Types.ObjectId(markedById),
      qrCodeId: new Types.ObjectId(qrCodeId),
    });
  }

  async getAttendanceReport(gymId: string, page: number, limit: number, startDate?: Date, endDate?: Date, userId?: string): Promise<any> {
    return this._gymRepo.getAttendanceReport(gymId, page, limit, startDate, endDate, userId);
  }

  async createAnnouncement(gymId: string, dto: CreateAnnouncementDto, createdBy: string): Promise<IGymAnnouncement> {
    return this._gymRepo.createAnnouncement({
      ...dto,
      gymId: new Types.ObjectId(gymId),
      createdBy: new Types.ObjectId(createdBy),
      targetAudience: dto.targetAudience ? dto.targetAudience.map(id => new Types.ObjectId(id)) : [],
    });
  }

  async getAnnouncements(gymId: string, page: number, limit: number, type: string): Promise<any> {
    return this._gymRepo.getAnnouncements(gymId, page, limit, type);
  }

  async updateAnnouncement(gymId: string, announcementId: string, dto: UpdateAnnouncementDto): Promise<IGymAnnouncement | null> {
    return this._gymRepo.updateAnnouncement(gymId, announcementId, {
      ...dto,
      targetAudience: dto.targetAudience ? dto.targetAudience.map(id => new Types.ObjectId(id)) : [],
    });
  }

  async deleteAnnouncement(gymId: string, announcementId: string): Promise<void> {
    await this._gymRepo.deleteAnnouncement(gymId, announcementId);
  }

  async createPayment(gymId: string, dto: CreatePaymentDto, createdBy: string): Promise<IGymPayment> {
    return this._gymRepo.createPayment({
      ...dto,
      gymId: new Types.ObjectId(gymId),
      userId: new Types.ObjectId(dto.userId),
      planId: new Types.ObjectId(dto.planId),
      createdBy: new Types.ObjectId(createdBy),
      subscriptionStartDate: new Date(dto.subscriptionStartDate),
      subscriptionEndDate: new Date(dto.subscriptionEndDate),
    });
  }

  async getPayments(gymId: string, page: number, limit: number, search: string, paymentMethod: string, status: string): Promise<any> {
    return this._gymRepo.getPayments(gymId, page, limit, search, paymentMethod, status);
  }

  async createStripeSession(gymId: string, planId: string, userId: string): Promise<Stripe.Checkout.Session> {
    const plan = await this._gymRepo.getSubscriptionPlanById(planId);
    if (!plan || plan.gymId.toString() !== gymId) {
      throw new AppError('Invalid subscription plan', STATUS_CODE.BAD_REQUEST);
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        gymId,
        userId,
        planId,
      },
    });

    return session;
  }

  async generateReport(gymId: string, type: string, format: string, startDate?: Date, endDate?: Date): Promise<Buffer> {
    return this._gymRepo.generateReport(gymId, type, format, startDate, endDate);
  }

  private mapToResponseDto(gym: IGym): GymResponseDto {
    return {
      _id: gym._id.toString(),
      role: gym.role,
      name: gym.name!,
      email: gym.email!,
      location: gym.location!,
      certificate: gym.certificate!,
      verifyStatus: gym.verifyStatus,
      rejectReason: gym.rejectReason || undefined,
      isBanned: gym.isBanned,
      profileImage: gym.profileImage || undefined,
      images: gym.images || undefined,
      trainers: gym.trainers?.map((t) => t.toString()) || undefined,
      members: gym.members?.map((m) => m.toString()) || undefined,
      announcements: gym.announcements?.map((ann) => ({
        title: ann.title,
        message: ann.message,
        date: ann.date,
      })) || [],
      createdAt: gym.createdAt!,
      updatedAt: gym.updatedAt!,
    };
  }
}