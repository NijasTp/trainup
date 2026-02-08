import { IGym } from '../../../models/gym.model';
import { ITrainer } from '../../../models/trainer.model';
import { ISubscriptionPlan } from '../../../models/gymSubscriptionPlan.model';
import { IGymAnnouncement } from '../../../models/gymAnnouncement.model';
import { UploadedFile } from 'express-fileupload';
import {
  GymLoginResponseDto,
  GymResponseDto,
  GymDataResponseDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  AddTrainerDto,
  UpdateTrainerDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  GymListingDto
} from '../../../dtos/gym.dto';

export interface IGymService {
  registerGym(
    data: Partial<IGym>,
    files: {
      certifications?: UploadedFile | UploadedFile[];
      logo?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<GymLoginResponseDto>;

  loginGym(email: string, password: string): Promise<GymLoginResponseDto>;

  reapplyGym(
    gymId: string,
    data: Partial<IGym>,
    files: {
      certifications?: UploadedFile | UploadedFile[];
      logo?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[]
    }
  ): Promise<GymLoginResponseDto>;

  getAllGyms(page: number, limit: number, searchQuery: string): Promise<unknown>;

  updateGymStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>;

  getGymApplication(id: string): Promise<GymResponseDto | null>;

  getGymById(id: string): Promise<IGym | null>;

  getGymData(gymId: string): Promise<GymDataResponseDto>;

  addTrainer(dto: AddTrainerDto, gymId: string): Promise<ITrainer>;

  addMemberToGym(gymId: string, userId: string): Promise<void>;

  updateTrainer(dto: UpdateTrainerDto, trainerId: string, gymId: string): Promise<ITrainer | null>;

  createSubscriptionPlan(
    gymId: string,
    dto: CreateSubscriptionPlanDto
  ): Promise<{
    _id: string;
    gymId: string;
    name: string;
    duration: number;
    durationUnit: 'day' | 'month' | 'year';
    price: number;
    description?: string;
    features: string[];
    trainerChat: boolean;
    videoCall: boolean;
    isCardioIncluded: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;


  listSubscriptionPlans(
    gymId: string,
    page: number,
    limit: number,
    search?: string,
    active?: string
  ): Promise<{ items: unknown[]; total: number; page: number; totalPages: number }>;


  getSubscriptionPlan(planId: string): Promise<{
    _id: string;
    gymId: string;
    name: string;
    duration: number;
    durationUnit: 'day' | 'month' | 'year';
    price: number;
    description?: string;
    features: string[];
    trainerChat: boolean;
    videoCall: boolean;
    isCardioIncluded: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>


  updateSubscriptionPlan(
    planId: string,
    dto: Partial<UpdateSubscriptionPlanDto & { isActive: boolean }>
  ): Promise<{
    _id: string;
    gymId: string;
    name: string;
    duration: number;
    durationUnit: 'day' | 'month' | 'year';
    price: number;
    description?: string;
    features: string[];
    trainerChat: boolean;
    videoCall: boolean;
    isCardioIncluded: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;


  deleteSubscriptionPlan(planId: string): Promise<void>;

  getGymsForUser(
    page: number,
    limit: number,
    search: string,
    userLocation?: { lat: number; lng: number }
  ): Promise<{ gyms: GymListingDto[]; totalPages: number; total: number }>;

  getGymForUser(gymId: string): Promise<unknown>;

  getActiveSubscriptionPlans(gymId: string): Promise<ISubscriptionPlan[]>;

  getMyGymDetails(gymId: string, userId: string): Promise<unknown>;

  createAnnouncement(
    gymId: string,
    dto: CreateAnnouncementDto,
    imageFile?: UploadedFile
  ): Promise<IGymAnnouncement>;

  getGymAnnouncements(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ announcements: IGymAnnouncement[]; totalPages: number; total: number }>;

  updateAnnouncement(
    announcementId: string,
    gymId: string,
    dto: UpdateAnnouncementDto,
    imageFile?: UploadedFile
  ): Promise<IGymAnnouncement | null>;

  deleteAnnouncement(announcementId: string, gymId: string): Promise<void>;


  getGymAnnouncementsForUser(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ announcements: unknown[]; totalPages: number; total: number }>;

  resetPassword(email: string, password: string): Promise<void>;

  getGymMembers(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ members: any[]; total: number; totalPages: number }>;

  getGymAttendance(
    gymId: string,
    date: string
  ): Promise<{ records: any[]; stats: any }>;

  updateGymProfile(


    gymId: string,
    data: Partial<IGym>,
    files?: {
      logo?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<IGym>;

  // Products
  createProduct(
    gymId: string,
    data: any,
    files?: UploadedFile[]
  ): Promise<any>;

  getGymProducts(
    gymId: string,
    page: number,
    limit: number,
    search: string,
    category: string
  ): Promise<{ products: any[]; total: number; totalPages: number }>;

  updateProduct(
    productId: string,
    gymId: string,
    data: any,
    files?: UploadedFile[]
  ): Promise<any>;

  deleteProduct(productId: string, gymId: string): Promise<void>;

  // Jobs
  createJob(
    gymId: string,
    data: any
  ): Promise<any>;

  getGymJobs(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ jobs: any[]; total: number; totalPages: number }>;

  updateJob(
    jobId: string,
    gymId: string,
    data: any
  ): Promise<any>;

  deleteJob(jobId: string, gymId: string): Promise<void>;

  // Workout Templates
  createWorkoutTemplate(
    gymId: string,
    data: any
  ): Promise<any>;

  getGymWorkoutTemplates(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ templates: any[]; total: number; totalPages: number }>;

  updateWorkoutTemplate(
    templateId: string,
    gymId: string,
    data: any
  ): Promise<any>;

  deleteWorkoutTemplate(templateId: string, gymId: string): Promise<void>;

  getGymDashboardStats(gymId: string): Promise<any>;
}

