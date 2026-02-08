import { injectable, inject } from 'inversify'
import { IGymService } from '../core/interfaces/services/IGymService'
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository'
import TYPES from '../core/types/types'
import bcrypt from 'bcryptjs'
import { IGym } from '../models/gym.model'
import { ITrainer } from '../models/trainer.model'
import { ISubscriptionPlan } from '../models/gymSubscriptionPlan.model'
import { IGymAnnouncement } from '../models/gymAnnouncement.model'
import cloudinary from '../config/cloudinary'
import { UploadedFile } from 'express-fileupload'
import { IJwtService } from '../core/interfaces/services/IJwtService'
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
  GymListingDto,
  MyGymResponseDto
} from '../dtos/gym.dto'
import { MESSAGES } from '../constants/messages.constants'
import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { logger } from '../utils/logger.util'

@injectable()
export class GymService implements IGymService {
  constructor(
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) { }

  async registerGym(
    data: Partial<IGym>,
    files: {
      certifications?: UploadedFile | UploadedFile[]
      logo?: UploadedFile
      profileImage?: UploadedFile
      images?: UploadedFile | UploadedFile[]
    }
  ): Promise<GymLoginResponseDto> {
    const certificationsUrls: string[] = []
    let profileImageUrl: string | undefined
    let logoUrl: string | undefined
    const imageUrls: string[] = []

    if (!data.password) {
      throw new AppError(
        MESSAGES.MISSING_REQUIRED_FIELDS,
        STATUS_CODE.BAD_REQUEST
      )
    }
    const hashedPassword = await bcrypt.hash(data.password, 10)

    let geoLocationObj: { type: 'Point'; coordinates: [number, number] }

    if (typeof data.geoLocation === 'string') {
      try {
        geoLocationObj = JSON.parse(data.geoLocation)
      } catch (e) {
        logger.error(e)
        throw new AppError(
          'Invalid geoLocation JSON format',
          STATUS_CODE.BAD_REQUEST
        )
      }
    } else if (data.geoLocation && typeof data.geoLocation === 'object') {
      geoLocationObj = data.geoLocation
    } else {
      throw new AppError(
        'Missing or invalid geoLocation',
        STATUS_CODE.BAD_REQUEST
      )
    }

    let openingHours: any[] = []
    if (typeof data.openingHours === 'string') {
      try {
        openingHours = JSON.parse(data.openingHours)
      } catch (e) {
        logger.error('Error parsing openingHours:', e)
      }
    } else if (Array.isArray(data.openingHours)) {
      openingHours = data.openingHours
    }

    const geoLocation = {
      type: 'Point' as const,
      coordinates: [
        geoLocationObj.coordinates[0],
        geoLocationObj.coordinates[1]
      ] as [number, number]
    }

    if (files?.certifications) {
      const certs = Array.isArray(files.certifications) ? files.certifications : [files.certifications];
      const uploadPromises = certs.map(cert =>
        cloudinary.uploader.upload(cert.tempFilePath, { folder: 'trainup/gyms/certificate' })
      );
      const results = await Promise.all(uploadPromises);
      results.forEach(res => certificationsUrls.push(res.secure_url));
    }

    if (files?.logo) {
      const logoUpload = await cloudinary.uploader.upload(files.logo.tempFilePath, { folder: 'trainup/gyms/logos' });
      logoUrl = logoUpload.secure_url;
    }

    if (files?.profileImage) {
      const profileUpload = await cloudinary.uploader.upload(
        files.profileImage.tempFilePath,
        {
          folder: 'trainup/gyms/profiles'
        }
      )
      profileImageUrl = profileUpload.secure_url
    }

    if (files?.images) {
      const imagesArr = Array.isArray(files.images) ? files.images : [files.images];
      const uploadPromises = imagesArr.map(img =>
        cloudinary.uploader.upload(img.tempFilePath, {
          folder: 'trainup/gyms/gallery'
        })
      );

      const results = await Promise.all(uploadPromises);
      results.forEach(res => imageUrls.push(res.secure_url));
    }

    const gym = await this._gymRepo.createGym({
      ...data,
      password: hashedPassword,
      geoLocation,
      openingHours,
      certifications: certificationsUrls,
      profileImage: profileImageUrl,
      logo: logoUrl,
      images: imageUrls
    })


    const accessToken = this._jwtService.generateAccessToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    )

    return {
      gym: this.mapToResponseDto(gym),
      accessToken,
      refreshToken
    }
  }

  async loginGym(
    email: string,
    password: string
  ): Promise<GymLoginResponseDto> {
    const gym = await this._gymRepo.findByEmail(email)
    if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    const valid = await bcrypt.compare(password, gym.password!)
    if (!valid)
      throw new AppError(MESSAGES.LOGIN_FAILED, STATUS_CODE.UNAUTHORIZED)

    const accessToken = this._jwtService.generateAccessToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    )

    return {
      gym: this.mapToResponseDto(gym),
      accessToken,
      refreshToken
    }
  }

  async getAllGyms(
    page: number,
    limit: number,
    searchQuery: string
  ): Promise<{ gyms: GymResponseDto[]; total: number; page: number; totalPages: number }> {
    return await this._gymRepo.findGyms(page, limit, searchQuery)
  }

  async updateGymStatus(
    id: string,
    updateData: Partial<IGym>
  ): Promise<IGym | null> {
    return await this._gymRepo.updateStatus(id, updateData)
  }

  async getGymById(id: string): Promise<IGym | null> {
    return await this._gymRepo.findById(id)
  }

  async getGymData(gymId: string): Promise<GymDataResponseDto> {
    const gymDetails = await this._gymRepo.getGymById(gymId)
    if (!gymDetails)
      throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)

    const trainers = await this._gymRepo.getGymTrainers(gymId)
    const members = await this._gymRepo.getGymMembers(gymId)
    const announcements = await this._gymRepo.getGymAnnouncements(gymId)
    const totalRevenue = await this._gymRepo.getGymTotalRevenue(gymId)
    const recentMembers = await this._gymRepo.getRecentMembers(gymId, 5)

    return {
      gymDetails,
      trainers,
      members,
      announcements,
      totalRevenue,
      memberCount: members.length,
      recentMembers
    }
  }

  async getGymApplication(id: string): Promise<GymResponseDto | null> {
    return await this._gymRepo.findApplicationById(id)
  }

  async addTrainer(dto: AddTrainerDto, gymId: string): Promise<ITrainer> {
    return await this._gymRepo.addTrainer(gymId, dto)
  }

  async updateTrainer(
    dto: UpdateTrainerDto,
    trainerId: string,
    gymId: string
  ): Promise<ITrainer | null> {
    const trainer = await this._gymRepo.updateTrainer(trainerId, dto)
    if (!trainer || trainer?.gymId!.toString() !== gymId) {
      throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }
    return trainer
  }

  async getGymsForUser(
    page: number,
    limit: number,
    search: string,
    userLocation?: { lat: number; lng: number }
  ): Promise<{ gyms: GymListingDto[]; totalPages: number; total: number }> {
    return await this._gymRepo.getGymsForUser(page, limit, search, userLocation)
  }

  async getGymForUser(gymId: string): Promise<IGym | null> {
    return await this._gymRepo.getGymForUser(gymId)
  }

  async getActiveSubscriptionPlans(gymId: string): Promise<ISubscriptionPlan[]> {
    return await this._gymRepo.getActiveSubscriptionPlans(gymId)
  }

  async getMyGymDetails(
    gymId: string,
    userId: string
  ): Promise<MyGymResponseDto | null> {
    return await this._gymRepo.getMyGymDetails(gymId, userId);
  }

  async getGymAnnouncementsForUser(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ announcements: IGymAnnouncement[]; totalPages: number; total: number }> {
    return await this._gymRepo.getGymAnnouncementsForUser(gymId, page, limit, search)
  }

  async addMemberToGym(gymId: string, userId: string): Promise<void> {
    await this._gymRepo.addMemberToGym(gymId, userId);
  }

  async createAnnouncement(
    gymId: string,
    dto: CreateAnnouncementDto,
    imageFile?: UploadedFile
  ): Promise<IGymAnnouncement> {
    let imageUrl: string | undefined

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        folder: 'trainup/gyms/announcements'
      })
      imageUrl = upload.secure_url
    }

    return await this._gymRepo.createAnnouncement(gymId, {
      ...dto,
      image: imageUrl
    })
  }

  async getGymAnnouncements(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ announcements: IGymAnnouncement[]; totalPages: number; total: number }> {
    return await this._gymRepo.getAnnouncementsByGym(gymId, page, limit, search)
  }

  async updateAnnouncement(
    announcementId: string,
    gymId: string,
    dto: UpdateAnnouncementDto,
    imageFile?: UploadedFile
  ): Promise<IGymAnnouncement | null> {
    let imageUrl: string | undefined

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        folder: 'trainup/gyms/announcements'
      })
      imageUrl = upload.secure_url
    }

    return await this._gymRepo.updateAnnouncement(announcementId, gymId, {
      ...dto,
      ...(imageUrl && { image: imageUrl })
    })
  }

  async deleteAnnouncement(announcementId: string, gymId: string): Promise<void> {
    await this._gymRepo.deleteAnnouncement(announcementId, gymId)
  }

  private mapToResponseDto(gym: IGym): GymResponseDto {
    return {
      _id: gym._id.toString(),
      role: gym.role,
      name: gym.name!,
      email: gym.email!,
      address: gym.address || undefined,
      description: gym.description || undefined,
      geoLocation: gym.geoLocation!,
      certifications: gym.certifications || [],
      openingHours: gym.openingHours || [],
      verifyStatus: gym.verifyStatus,
      rejectReason: gym.rejectReason || undefined,
      isBanned: gym.isBanned,
      profileImage: gym.profileImage || undefined,
      logo: gym.logo || undefined,
      images: gym.images || undefined,
      trainers: gym.trainers?.map(t => t.toString()) || undefined,
      members: gym.members?.map(m => m.toString()) || undefined,
      announcements:
        gym.announcements?.map(ann => ({
          title: ann.title,
          message: ann.message,
          date: ann.date
        })) || [],
      createdAt: gym.createdAt!,
      updatedAt: gym.updatedAt!
    }
  }

  async createSubscriptionPlan(
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
  }> {

    if (!dto.name || !dto.duration || !dto.price) {
      throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST)
    }
    const rawCreateUnit = ((dto as { durationUnit?: string }).durationUnit as string) || 'month'
    const normalizedUnit = (rawCreateUnit === 'days'
      ? 'day'
      : rawCreateUnit === 'months'
        ? 'month'
        : (rawCreateUnit as 'day' | 'month' | 'year')) as 'day' | 'month' | 'year'
    const plan = await this._gymRepo.createSubscriptionPlan(gymId, {
      name: dto.name,
      duration: dto.duration,
      durationUnit: normalizedUnit,
      price: dto.price,
      description: dto.description,
      features: dto.features,
      trainerChat: dto.trainerChat,
      videoCall: dto.videoCall,
      isCardioIncluded: dto.isCardioIncluded
    })
    return {
      _id: plan._id.toString(),
      gymId: plan.gymId.toString(),
      name: plan.name,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      price: plan.price,
      description: plan.description,
      features: plan.features,
      trainerChat: plan.trainerChat,
      videoCall: plan.videoCall,
      isCardioIncluded: plan.isCardioIncluded,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }

  }

  async listSubscriptionPlans(
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
  }> {
    return await this._gymRepo.listSubscriptionPlans(gymId, page, limit, search, active)
  }

  async deleteSubscriptionPlan(planId: string): Promise<void> {
    await this._gymRepo.deleteSubscriptionPlan(planId)
  }

  async updateSubscriptionPlan(
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
  }> {

    const rawUpdateUnit = ((dto as { durationUnit?: string }).durationUnit as string | undefined)
    const normalizedUnit = rawUpdateUnit
      ? ((rawUpdateUnit === 'days'
        ? 'day'
        : rawUpdateUnit === 'months'
          ? 'month'
          : (rawUpdateUnit as 'day' | 'month' | 'year')) as 'day' | 'month' | 'year')
      : undefined
    const plan = await this._gymRepo.updateSubscriptionPlan(planId, { ...dto, durationUnit: normalizedUnit } as Partial<ISubscriptionPlan>)
    if (!plan) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND)
    return {
      _id: plan._id.toString(),
      gymId: plan.gymId.toString(),
      name: plan.name,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      price: plan.price,
      description: plan.description,
      features: plan.features,
      trainerChat: plan.trainerChat,
      videoCall: plan.videoCall,
      isCardioIncluded: plan.isCardioIncluded,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }

  }

  async reapplyGym(
    gymId: string,
    data: Partial<IGym>,
    files: {
      certifications?: UploadedFile | UploadedFile[]
      logo?: UploadedFile
      profileImage?: UploadedFile
      images?: UploadedFile | UploadedFile[]
    }
  ): Promise<GymLoginResponseDto> {
    const certificationsUrls: string[] = []
    let logoUrl: string | undefined
    let profileImageUrl: string | undefined
    const imageUrls: string[] = []

    // geoLocation parsing
    let geoLocationObj: { type: 'Point'; coordinates: [number, number] } | undefined
    if (typeof data.geoLocation === 'string') {
      try {
        geoLocationObj = JSON.parse(data.geoLocation)
      } catch (e) {
        logger.error(e)
        throw new AppError('Invalid geoLocation JSON format', STATUS_CODE.BAD_REQUEST)
      }
    } else if (data.geoLocation && typeof data.geoLocation === 'object') {
      geoLocationObj = data.geoLocation as { type: 'Point'; coordinates: [number, number] }
    }

    let openingHours: any[] | undefined
    if (typeof data.openingHours === 'string') {
      try {
        openingHours = JSON.parse(data.openingHours)
      } catch (e) {
        logger.error('Error parsing openingHours:', e)
      }
    } else if (Array.isArray(data.openingHours)) {
      openingHours = data.openingHours
    }

    const update: Partial<IGym> = {}
    if (data.name) update.name = data.name
    if (data.address) update.address = data.address
    if (data.description) update.description = data.description
    if (openingHours) update.openingHours = openingHours

    if (geoLocationObj) {
      update.geoLocation = {
        type: 'Point',
        coordinates: [geoLocationObj.coordinates[0], geoLocationObj.coordinates[1]]
      }
    }

    if (files?.certifications) {
      const certs = Array.isArray(files.certifications) ? files.certifications : [files.certifications];
      const uploadPromises = certs.map(cert => cloudinary.uploader.upload(cert.tempFilePath, { folder: 'trainup/gyms/certificate' }));
      const results = await Promise.all(uploadPromises);
      update.certifications = results.map(res => res.secure_url);
    }
    if (files?.logo) {
      const logoUpload = await cloudinary.uploader.upload(files.logo.tempFilePath, { folder: 'trainup/gyms/logos' });
      update.logo = logoUpload.secure_url;
    }
    if (files?.profileImage) {
      const profileUpload = await cloudinary.uploader.upload(files.profileImage.tempFilePath, { folder: 'trainup/gyms/profiles' })
      update.profileImage = profileUpload.secure_url
    }
    if (files?.images) {
      const imagesArr = Array.isArray(files.images) ? files.images : [files.images];
      const uploadPromises = imagesArr.map(img => cloudinary.uploader.upload(img.tempFilePath, { folder: 'trainup/gyms/gallery' }));
      const results = await Promise.all(uploadPromises);
      update.images = results.map(res => res.secure_url);
    }

    update.verifyStatus = 'pending'
    update.rejectReason = null

    const gym = await this._gymRepo.updateGym(gymId, update)
    if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)

    const accessToken = this._jwtService.generateAccessToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    )

    return {
      gym: this.mapToResponseDto(gym),
      accessToken,
      refreshToken
    }
  }

  async getSubscriptionPlan(planId: string): Promise<{
    _id: string;
    gymId: string;
    name: string;
    duration: number;
    durationUnit: 'day' | 'month' | 'year';
    price: number;
    description?: string;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    trainerChat: boolean;
    videoCall: boolean;
    isCardioIncluded: boolean;
  } | null> {

    const plan = await this._gymRepo.getSubscriptionPlanById(planId)
    if (!plan) return null
    return {
      _id: plan._id.toString(),
      gymId: (plan as ISubscriptionPlan & { gymId: unknown }).gymId.toString(),
      name: plan.name,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      price: plan.price,
      description: plan.description,
      features: plan.features,
      trainerChat: plan.trainerChat,
      videoCall: plan.videoCall,
      isCardioIncluded: plan.isCardioIncluded,
      isActive: plan.isActive,
      createdAt: plan.createdAt as Date,
      updatedAt: plan.updatedAt as Date
    }

  }
  async forgotPassword(email: string): Promise<void> {
    const gym = await this._gymRepo.findByEmail(email)
    if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    // The otp service will handle generation and mailing
    // dependent on role 'gym'
    // But OtpService.requestForgotPasswordOtp needs to be exposed or I need to inject logic here.
    // OtpService is not injected? It is not in constructor. I will need to inject it or use the interface method requestForgotPasswordOtp if it was exposed.
    // Wait, GymService constructor has _jwtService and _gymRepo. It does NOT have _otpService.
    // GymController has _otpService.
    // So usually Controller calls OtpService for OTP and GymService for data.
    // But for resetPassword, we need to update the password in GymService.
  }

  // Refined plan: I will handle forgotPassword in Controller using OtpService.
  // I only need resetPassword in GymService to actually update the password.

  async resetPassword(email: string, password: string): Promise<void> {
    const gym = await this._gymRepo.findByEmail(email)
    if (!gym) throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)

    const hashedPassword = await bcrypt.hash(password, 10)
    await this._gymRepo.updateGym(gym._id.toString(), { password: hashedPassword })
  }

  async updateGymProfile(

    gymId: string,
    data: Partial<IGym>,
    files?: {
      logo?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<IGym> {
    const updateData: any = { ...data };

    // Handle JSON parsing for geoLocation and openingHours if they come as strings
    if (typeof data.geoLocation === 'string') {
      try {
        updateData.geoLocation = JSON.parse(data.geoLocation);
      } catch (e) {
        logger.error('Error parsing geoLocation:', e);
      }
    }

    if (typeof data.openingHours === 'string') {
      try {
        updateData.openingHours = JSON.parse(data.openingHours);
      } catch (e) {
        logger.error('Error parsing openingHours:', e);
      }
    }

    // Handle file uploads
    if (files?.logo) {
      const logoUpload = await cloudinary.uploader.upload(files.logo.tempFilePath, {
        folder: 'trainup/gyms/logos',
      });
      updateData.logo = logoUpload.secure_url;
    }

    if (files?.profileImage) {
      const profileUpload = await cloudinary.uploader.upload(files.profileImage.tempFilePath, {
        folder: 'trainup/gyms/profiles',
      });
      updateData.profileImage = profileUpload.secure_url;
    }

    if (files?.images) {
      const imagesArr = Array.isArray(files.images) ? files.images : [files.images];
      const uploadPromises = imagesArr.map((img) =>
        cloudinary.uploader.upload(img.tempFilePath, {
          folder: 'trainup/gyms/gallery',
        })
      );
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map((res) => res.secure_url);

      // If we want to append images, we might need more logic. 
      // For now, let's assume 'images' in data might contain existing URLs.
      let existingImages: string[] = [];
      if (typeof data.images === 'string') {
        try { existingImages = JSON.parse(data.images); } catch (e) { }
      } else if (Array.isArray(data.images)) {
        existingImages = data.images;
      }

      updateData.images = [...existingImages, ...newImageUrls];
    }

    const updatedGym = await this._gymRepo.updateGym(gymId, updateData);
    if (!updatedGym) {
      throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND);
    }

    return updatedGym;
  }
}
