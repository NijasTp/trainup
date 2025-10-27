import { ITrainer } from '../../../models/trainer.model'
import {
  TrainerLoginResponseDto,
  TrainerResponseDto,
  GetClientsResponseDto
} from '../../../dtos/trainer.dto'

export interface PaginatedTrainers {
  trainers: TrainerResponseDto[]
  total: number
  page: number
  totalPages: number
}

export interface TrainerApplyData {
  name: string
  email: string
  phone: string
  password: string
  price?: string
  bio?: string
  location?: string
  experience?: string
  specialization?: string
  certificate: any
  profileImage: any
}

export interface DashboardStats {
  totalClients: number
  newClientsThisMonth: number
  totalEarningsThisMonth: number
  totalEarningsLastMonth: number
  averageRating: number
  totalSessions: number
  monthlyEarnings: Array<{
    month: string
    earnings: number
    clients: number
  }>
  planDistribution: Array<{
    plan: string
    count: number
  }>
  recentActivity: Array<{
    type: string
    message: string
    date: string
  }>
}

export interface ITrainerService {
  loginTrainer(
    email: string,
    password: string
  ): Promise<TrainerLoginResponseDto>
  forgotPassword(email: string): Promise<void>
  verifyOtp(email: string, otp: string): Promise<void>
  resetPassword(email: string, password: string): Promise<void>
  applyAsTrainer(
    trainerData: TrainerApplyData
  ): Promise<TrainerLoginResponseDto>
  reapplyAsTrainer(
    trainerId: string,
    trainerData: TrainerApplyData
  ): Promise<ITrainer | null>
  getTrainerById(id: string): Promise<TrainerResponseDto>
  getAllTrainers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string,
    specialization?: string,
    experience?: string,
    minRating?: string,
    minPrice?: string,
    maxPrice?: string
  ): Promise<{
    trainers: TrainerResponseDto[]
    total: number
    page: number
    totalPages: number
  }>
  getTrainerApplication(id: string): Promise<TrainerResponseDto>
  updateTrainerStatus(
    id: string,
    updateData: Partial<ITrainer>
  ): Promise<ITrainer>
  addClientToTrainer(trainerId: string, userId: string): Promise<void>
  removeClientFromTrainer(trainerId: string, userId: string): Promise<void>
  getTrainerClients(
    trainerId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<GetClientsResponseDto>
  getDashboardStats(trainerId: string): Promise<DashboardStats>
  updateAvailability(
    trainerId: string,
    isAvailable: boolean,
    unavailableReason?: string
  ): Promise<void>
}
