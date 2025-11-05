import { IGym } from '../../../models/gym.model';
import { ISubscriptionPlan } from '../../../models/gymSubscriptionPlan.model';
import { ITrainer } from '../../../models/trainer.model';
import { IUserGymMembership } from '../../../models/userGymMembership.model';
import { IUser } from '../../../models/user.model';
import { IGymAnnouncement } from '../../../models/gymAnnouncement.model';
import { GymResponseDto, AnnouncementDto, GymListingDto } from '../../../dtos/gym.dto';

export interface IGymRepository {
  findByEmail(email: string): Promise<IGym | null>;
  createGym(data: Partial<IGym>): Promise<IGym>;
  updateGym(_id: string, data: Partial<IGym>): Promise<IGym | null>;
  findGyms(
    page: number,
    limit: number,
    searchQuery: string
  ): Promise<{
    gyms: GymResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  findApplicationById(id: string): Promise<GymResponseDto | null>;
  updateStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>;
  findById(_id: string): Promise<IGym | null>;
  getGymById(gymId: string): Promise<GymResponseDto | null>;

  getGymTrainers(gymId: string): Promise<ITrainer[]>;
  getGymMembers(gymId: string): Promise<IUser[]>;
  getGymAnnouncements(gymId: string): Promise<AnnouncementDto[]>;

  createSubscriptionPlan(
    gymId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan>;
  listSubscriptionPlans(
    gymId: string,
    page: number,
    limit: number,
    search?: string,
    active?: string
  ): Promise<{
    items: ISubscriptionPlan[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null>;
  updateSubscriptionPlan(
    planId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan | null>;
  deleteSubscriptionPlan(planId: string): Promise<void>;

  addTrainer(gymId: string, data: Partial<ITrainer>): Promise<ITrainer>;
  updateTrainer(
    trainerId: string,
    data: Partial<ITrainer>
  ): Promise<ITrainer | null>;

  updateMember(
    membershipId: string,
    data: Partial<IUserGymMembership>
  ): Promise<IUserGymMembership | null>;

  createAnnouncement(
    gymId: string,
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement>;
  getAnnouncementsByGym(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    announcements: IGymAnnouncement[];
    totalPages: number;
    total: number;
  }>;
  updateAnnouncement(
    announcementId: string,
    gymId: string,
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement | null>;
  deleteAnnouncement(announcementId: string, gymId: string): Promise<void>;

  getGymsForUser(
    page: number,
    limit: number,
    search: string,
    userLocation?: { lat: number; lng: number }
  ): Promise<{
    gyms: GymListingDto[];
    totalPages: number;
    total: number;
  }>;
  getGymForUser(gymId: string): Promise<any>;
  getActiveSubscriptionPlans(gymId: string): Promise<ISubscriptionPlan[]>;
  getMyGymDetails(gymId: string, userId: string): Promise<any>;
  getGymAnnouncementsForUser(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ announcements: any[]; totalPages: number; total: number }>;

  getGymTotalRevenue(gymId: string): Promise<number>;
  getRecentMembers(gymId: string, limit: number): Promise<any[]>;


  mapToResponseDto(gym: IGym): GymResponseDto;
}