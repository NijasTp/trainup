import { UploadedFile } from 'express-fileupload';
import { IGym } from '../../../models/gym.model';
import { ITrainer } from '../../../models/trainer.model';
import { IUserGymMembership } from '../../../models/userGymMembership.model';
import { IGymQRCode } from '../../../models/gymQRCode.model';
import { IGymPayment } from '../../../models/gymPayment.model';
import { IGymAttendance } from '../../../models/gymAttendence.model';
import { IGymAnnouncement } from '../../../models/gymAnnouncement.model';
import { ISubscriptionPlan } from '../../../models/gymSubacriptionPlan.model';
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
} from '../../../dtos/gym.dto';
import Stripe from 'stripe';

export interface IGymService {
  registerGym(
    data: Partial<IGym>,
    files: {
      certificate?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<GymLoginResponseDto>;

  loginGym(email: string, password: string): Promise<GymLoginResponseDto>;

  getAllGyms(page: number, limit: number, searchQuery: string): Promise<any>;

  updateGymStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>;

  getGymById(id: string): Promise<IGym | null>;

  getGymData(gymId: string): Promise<GymDataResponseDto>;

  getGymApplication(id: string): Promise<GymResponseDto | null>;

  updateProfile(gymId: string, data: Partial<IGym>, profileImage?: UploadedFile): Promise<IGym | null>;

  createSubscriptionPlan(gymId: string, dto: CreateSubscriptionPlanDto): Promise<ISubscriptionPlan>;

  getSubscriptionPlans(gymId: string, page: number, limit: number, search: string): Promise<any>;

  updateSubscriptionPlan(gymId: string, planId: string, dto: UpdateSubscriptionPlanDto): Promise<ISubscriptionPlan | null>;

  deleteSubscriptionPlan(gymId: string, planId: string): Promise<void>;

  addTrainer(gymId: string, dto: AddTrainerDto): Promise<ITrainer>;

  getTrainers(gymId: string, page: number, limit: number, search: string): Promise<any>;

  updateTrainer(gymId: string, trainerId: string, dto: UpdateTrainerDto): Promise<ITrainer | null>;

  removeTrainer(gymId: string, trainerId: string): Promise<void>;

  addMember(gymId: string, dto: AddMemberDto): Promise<IUserGymMembership>;

  getMembers(gymId: string, page: number, limit: number, search: string, status: string, paymentStatus: string): Promise<any>;

  updateMember(gymId: string, memberId: string, dto: UpdateMemberDto): Promise<IUserGymMembership | null>;

  getMemberAttendance(gymId: string, memberId: string, startDate?: Date, endDate?: Date): Promise<IGymAttendance[]>;

  generateDailyQRCode(gymId: string): Promise<string>;

  getQRCodeForDate(gymId: string, date: Date): Promise<string | null>;

  markAttendance(gymId: string, userId: string, qrCodeId: string, markedBy: 'user' | 'trainer' | 'gym', markedById: string): Promise<IGymAttendance>;

  getAttendanceReport(gymId: string, page: number, limit: number, startDate?: Date, endDate?: Date, userId?: string): Promise<any>;

  createAnnouncement(gymId: string, dto: CreateAnnouncementDto, createdBy: string): Promise<IGymAnnouncement>;

  getAnnouncements(gymId: string, page: number, limit: number, type: string): Promise<any>;

  updateAnnouncement(gymId: string, announcementId: string, dto: UpdateAnnouncementDto): Promise<IGymAnnouncement | null>;

  deleteAnnouncement(gymId: string, announcementId: string): Promise<void>;

  createPayment(gymId: string, dto: CreatePaymentDto, createdBy: string): Promise<IGymPayment>;

  getPayments(gymId: string, page: number, limit: number, search: string, paymentMethod: string, status: string): Promise<any>;

  createStripeSession(gymId: string, planId: string, userId: string): Promise<Stripe.Checkout.Session>;

  generateReport(gymId: string, type: string, format: string, startDate?: Date, endDate?: Date): Promise<Buffer>;
}