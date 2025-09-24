import { inject, injectable } from 'inversify'
import TYPES from '../core/types/types'
import {
  ITrainerService,
  TrainerApplyData
} from '../core/interfaces/services/ITrainerService'
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository'
import { v2 as cloudinary } from 'cloudinary'
import { ITrainer } from '../models/trainer.model'
import bcrypt from 'bcryptjs'
import { IOTPService } from '../core/interfaces/services/IOtpService'
import { IJwtService } from '../core/interfaces/services/IJwtService'
import { logger } from '../utils/logger.util'
import {
  TrainerLoginResponseDto,
  TrainerResponseDto,
  GetClientsResponseDto,
  ClientDto
} from '../dtos/trainer.dto'
import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { MESSAGES } from '../constants/messages'

@injectable()
export class TrainerService implements ITrainerService {
  constructor (
    @inject(TYPES.ITrainerRepository) private _trainerRepo: ITrainerRepository,
    @inject(TYPES.IOtpService) private _otpService: IOTPService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

  async loginTrainer (
    email: string,
    password: string
  ): Promise<TrainerLoginResponseDto> {
    const trainer = await this._trainerRepo.findByEmail(email)
    if (!trainer) {
      throw new AppError("Trainer doesn't exist", STATUS_CODE.NOT_FOUND)
    }

    if (trainer.isBanned) {
      throw new AppError('Your account has been banned.', STATUS_CODE.FORBIDDEN)
    }

    const isPasswordValid = await bcrypt.compare(password, trainer.password)
    if (!isPasswordValid) {
      throw new AppError('Invalid password', STATUS_CODE.UNAUTHORIZED)
    }

    const accessToken = this._jwtService.generateAccessToken(
      trainer._id.toString(),
      trainer.role,
      trainer.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      trainer._id.toString(),
      trainer.role,
      trainer.tokenVersion ?? 0
    )

    return {
      trainer: this.mapToResponseDto(trainer),
      accessToken,
      refreshToken
    }
  }

  async forgotPassword (email: string) {
    const trainer = await this._trainerRepo.findByEmail(email)
    if (!trainer) throw new AppError('Trainer not found', STATUS_CODE.NOT_FOUND)
    await this._otpService.requestForgotPasswordOtp(email, 'trainer')
  }

  async verifyOtp (email: string, otp: string) {
    const isValid = await this._otpService.verifyOtp(email, otp)
    if (!isValid) throw new AppError('Invalid or expired OTP', STATUS_CODE.BAD_REQUEST)
  }

  async resetPassword (email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10)
    await this._trainerRepo.updateStatus(email, { password: hashed })
    await this._otpService.clearOtp(email)
  }

  async applyAsTrainer (
    trainerData: TrainerApplyData
  ): Promise<TrainerLoginResponseDto> {
    if (
      !trainerData.name ||
      !trainerData.email ||
      !trainerData.phone ||
      !trainerData.password ||
      !trainerData.certificate ||
      !trainerData.profileImage
    ) {
      throw new AppError(
        'Missing required fields: name, email, phone, password, certificate, profileImage',
        STATUS_CODE.BAD_REQUEST
      )
    }

    const existingTrainer = await this._trainerRepo.findByEmail(
      trainerData.email
    )
    if (existingTrainer) {
      throw new AppError('Email already registered', STATUS_CODE.BAD_REQUEST)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(trainerData.password, salt)

    let certificateUrl: string
    let profileImageUrl: string

    try {
      const certificateUploadResult = await cloudinary.uploader.upload(
        trainerData.certificate.tempFilePath,
        { resource_type: 'auto', folder: 'trainer_certificates' }
      )
      certificateUrl = certificateUploadResult.secure_url
    } catch (error: any) {
      logger.error('Cloudinary certificate upload error:', {
        message: error.message,
        status: error.http_code,
        details: error,
        fileInfo: {
          name: trainerData.certificate.name,
          size: trainerData.certificate.size,
          mimetype: trainerData.certificate.mimetype
        }
      })
      throw new AppError(
        `Failed to upload certificate: ${error.message || 'Unknown error'}`,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      )
    }

    try {
      const profileImageUploadResult = await cloudinary.uploader.upload(
        trainerData.profileImage.tempFilePath,
        { resource_type: 'image', folder: 'trainer_profile_images' }
      )
      profileImageUrl = profileImageUploadResult.secure_url
    } catch (error: any) {
      logger.error('Cloudinary profile image upload error:', error)
      throw new AppError(
        `Failed to upload profile image: ${error.message || 'Unknown error'}`,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      )
    }

    const trainerToSave: Partial<ITrainer> = {
      name: trainerData.name,
      email: trainerData.email,
      password: hashedPassword,
      phone: trainerData.phone,
      price: trainerData.price,
      bio: trainerData.bio,
      location: trainerData.location,
      experience: trainerData.experience,
      specialization: trainerData.specialization,
      certificate: certificateUrl,
      profileImage: profileImageUrl,
      profileStatus: 'pending'
    }

    const trainer = await this._trainerRepo.create(trainerToSave)
    const accessToken = this._jwtService.generateAccessToken(
      trainer._id.toString(),
      trainer.role,
      trainer.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      trainer._id.toString(),
      trainer.role,
      trainer.tokenVersion ?? 0
    )

    return {
      trainer: this.mapToResponseDto(trainer),
      accessToken,
      refreshToken
    }
  }

  async reapplyAsTrainer (trainerId: string, trainerData: TrainerApplyData) {
    const existingTrainer = await this._trainerRepo.findById(trainerId)
    if (!existingTrainer) {
      throw new AppError('Trainer not found', STATUS_CODE.NOT_FOUND)
    }
    const trainerToUpdate: Partial<ITrainer> = {
      name: trainerData.name || existingTrainer.name,
      email: trainerData.email || existingTrainer.email,
      phone: trainerData.phone || existingTrainer.phone,
      price: trainerData.price || existingTrainer.price,
      bio: trainerData.bio || existingTrainer.bio,
      location: trainerData.location || existingTrainer.location,
      experience: trainerData.experience || existingTrainer.experience,
      specialization:
        trainerData.specialization || existingTrainer.specialization,
      profileStatus: 'pending'
    }

    if (trainerData.certificate) {
      try {
        const certificateUploadResult = await cloudinary.uploader.upload(
          trainerData.certificate.tempFilePath,
          { resource_type: 'auto', folder: 'trainer_certificates' }
        )
        trainerToUpdate.certificate = certificateUploadResult.secure_url
      } catch (error: any) {
        logger.error('cloudinary error:', error)
        throw new AppError(
          `Failed to upload certificate: ${error.message || 'Unknown error'}`,
          STATUS_CODE.INTERNAL_SERVER_ERROR
        )
      }
    }

    if (trainerData.profileImage) {
      try {
        const profileImageUploadResult = await cloudinary.uploader.upload(
          trainerData.profileImage.tempFilePath,
          { resource_type: 'image', folder: 'trainer_profile_images' }
        )
        trainerToUpdate.profileImage = profileImageUploadResult.secure_url
      } catch (error: any) {
        logger.error('Cloudinary profile image upload error:', error)
        throw new AppError(
          `Failed to upload profile image: ${error.message || 'Unknown error'}`,
          STATUS_CODE.INTERNAL_SERVER_ERROR
        )
      }
    }

    const updatedTrainer = await this._trainerRepo.updateStatus(
      trainerId,
      trainerToUpdate
    )
    return updatedTrainer
  }

  async getTrainerById (id: string): Promise<TrainerResponseDto> {
    const trainer = await this._trainerRepo.findById(id)
    if (!trainer) throw new AppError('Trainer not found', STATUS_CODE.NOT_FOUND)
    return this.mapToResponseDto(trainer)
  }

  async getAllTrainers (
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified: string = 'verified',
    startDate?: string,
    endDate?: string,
    specialization?: string,
    experience?: string,
    minRating?: string,
    minPrice?: string,
    maxPrice?: string
  ) {
    const skip = (page - 1) * limit
    const trainers = await this._trainerRepo.findAll(
      skip,
      limit,
      search,
      isBanned,
      isVerified,
      startDate,
      endDate,
      specialization,
      experience,
      minRating,
      minPrice,
      maxPrice
    )
    const total = await this._trainerRepo.count(
      search,
      isBanned,
      isVerified,
      startDate,
      endDate,
      specialization,
      experience,
      minRating,
      minPrice,
      maxPrice
    )

    return {
      trainers,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
  
  async getTrainerApplication (id: string) {
    const application = await this._trainerRepo.findApplicationByTrainerId(id)
    if (!application) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND)
    return application
  }

  async updateTrainerStatus (id: string, updateData: Partial<ITrainer>) {
    const trainer = await this._trainerRepo.updateStatus(id, updateData)
    if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    return trainer
  }

  async addClientToTrainer (trainerId: string, userId: string): Promise<void> {
    const trainer = await this._trainerRepo.findById(trainerId)
    if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    await this._trainerRepo.addClient(trainerId, userId)
  }

  async removeClientFromTrainer (
    trainerId: string,
    userId: string
  ): Promise<void> {
    const trainer = await this._trainerRepo.findById(trainerId)
    if (!trainer) throw new AppError(MESSAGES.TRAINER_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    await this._trainerRepo.removeClient(trainerId, userId)
  }

  async getTrainerClients (
    trainerId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<GetClientsResponseDto> {
    const skip = (page - 1) * limit
    const { clients, total } = await this._trainerRepo.findClients(
      trainerId,
      skip,
      limit,
      search
    )

    return {
      clients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  private mapToResponseDto (trainer: ITrainer): TrainerResponseDto {
    return {
      _id: trainer._id.toString(),
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      price: trainer.price,
      isBanned: trainer.isBanned,
      role: trainer.role,
      gymId: trainer.gymId?.toString(),
      clients: trainer.clients.map(c => c.toString()),
      bio: trainer.bio,
      location: trainer.location,
      specialization: trainer.specialization,
      experience: trainer.experience,
      rating: trainer.rating,
      certificate: trainer.certificate,
      profileImage: trainer.profileImage,
      profileStatus: trainer.profileStatus,
      rejectReason: trainer.rejectReason,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt
    }
  }
}