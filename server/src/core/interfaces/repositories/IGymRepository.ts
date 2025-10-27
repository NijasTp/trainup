import { Types } from 'mongoose'
import { IGym } from '../../../models/gym.model'
import { ISubscriptionPlan } from '../../../models/gymSubacriptionPlan.model'
import { ITrainer } from '../../../models/trainer.model'
import { IUserGymMembership } from '../../../models/userGymMembership.model'
import { IGymQRCode } from '../../../models/gymQRCode.model'
import { IGymPayment } from '../../../models/gymPayment.model'
import { IGymAttendance } from '../../../models/gymAttendence.model'
import { IGymAnnouncement } from '../../../models/gymAnnouncement.model'
import { GymResponseDto, AnnouncementDto } from '../../../dtos/gym.dto'

import { IUser } from '../../../models/user.model'

export interface PaginatedGyms {
  gyms: Partial<GymResponseDto>[]
  total: number
  page: number
  totalPages: number
}

export type IGymMemberLean = Omit<IUserGymMembership, keyof Document> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  user?: IUser;
};

export interface IGymRepository {
  findByEmail(email: string): Promise<IGym | null>

  createGym(data: Partial<IGym>): Promise<IGym>

  updateGym(id: string, data: Partial<IGym>): Promise<IGym | null>

  findGyms(
    page: number,
    limit: number,
    searchQuery: string
  ): Promise<PaginatedGyms>

  findApplicationById(id: string): Promise<GymResponseDto | null>

  updateStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null>

  findById(id: string): Promise<IGym | null>

  getGymById(gymId: string): Promise<GymResponseDto | null>

  getGymTrainers(gymId: string): Promise<ITrainer[]>

  getGymMembers(gymId: string): Promise<IUser[]>

getMembers(
  gymId: string,
  page: number,
  limit: number,
  search: string,
  status: string,
  paymentStatus: string
): Promise<{
  members: IGymMemberLean[];
  total: number;
  page: number;
  totalPages: number;
}>;

  getGymAnnouncements(gymId: string): Promise<AnnouncementDto[]>

  createSubscriptionPlan(
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan>

  getSubscriptionPlans(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    plans: ISubscriptionPlan[]
    total: number
    page: number
    totalPages: number
  }>

  updateSubscriptionPlan(
    gymId: string,
    planId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan | null>

  deleteSubscriptionPlan(gymId: string, planId: string): Promise<void>

  createTrainer(data: Partial<ITrainer>): Promise<ITrainer>

  addTrainerToGym(gymId: string, trainerId: Types.ObjectId): Promise<void>

  getTrainers(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    trainers: ITrainer[]
    total: number
    page: number
    totalPages: number
  }>

  updateTrainer(
    gymId: string,
    trainerId: string,
    data: Partial<ITrainer>
  ): Promise<ITrainer | null>

  removeTrainerFromGym(gymId: string, trainerId: string): Promise<void>

  createMembership(
    data: Partial<IUserGymMembership>
  ): Promise<IUserGymMembership>

  addMemberToGym(gymId: string, userId: Types.ObjectId): Promise<void>


  updateMembership(
    gymId: string,
    memberId: string,
    data: Partial<IUserGymMembership>
  ): Promise<IUserGymMembership | null>

  getMemberAttendance(
    gymId: string,
    memberId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<IGymAttendance[]>

  createQRCode(data: Partial<IGymQRCode>): Promise<IGymQRCode>

  getQRCodeForDate(gymId: string, date: Date): Promise<IGymQRCode | null>

  getQRCodeById(qrCodeId: string): Promise<IGymQRCode | null>

  createAttendance(data: Partial<IGymAttendance>): Promise<IGymAttendance>

  getAttendanceReport(
    gymId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<{
    attendance: IGymAttendance[]
    total: number
    page: number
    totalPages: number
  }>

  createAnnouncement(data: Partial<IGymAnnouncement>): Promise<IGymAnnouncement>

  getAnnouncements(
    gymId: string,
    page: number,
    limit: number,
    type: string
  ): Promise<{
    announcements: IGymAnnouncement[]
    total: number
    page: number
    totalPages: number
  }>

  updateAnnouncement(
    gymId: string,
    announcementId: string,
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement | null>

  deleteAnnouncement(gymId: string, announcementId: string): Promise<void>

  createPayment(data: Partial<IGymPayment>): Promise<IGymPayment>

  getPayments(
    gymId: string,
    page: number,
    limit: number,
    search: string,
    paymentMethod: string,
    status: string
  ): Promise<{
    payments: IGymPayment[]
    total: number
    page: number
    totalPages: number
  }>

  getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null>

  generateReport(
    gymId: string,
    type: string,
    format: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer>
}
