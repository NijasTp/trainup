import { injectable, inject } from 'inversify';
import { IGymService } from '../core/interfaces/services/IGymService';
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository';
import TYPES from '../core/types/types';
import bcrypt from 'bcryptjs';
import { IGym } from '../models/gym.model';
import cloudinary from '../config/cloudinary';
import { UploadedFile } from 'express-fileupload';
import { IJwtService } from '../core/interfaces/services/IJwtService';
import { GymLoginResponseDto, GymResponseDto, GymDataResponseDto } from '../dtos/gym.dto';
import { MESSAGES } from '../constants/messages';
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status';

@injectable()
export class GymService implements IGymService {
  constructor(
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {}

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
      gymDetails: this.mapToResponseDto(gymDetails),
      trainers,
      members,
      announcements: announcements.map((ann) => ({
        title: ann.title,
        message: ann.message,
        date: ann.date,
      })),
    };
  }

  async getGymApplication(id: string): Promise<IGym | null> {
    return await this._gymRepo.findApplicationById(id);
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

  async getProfile(id: string): Promise<IGym | null> {
    return this._gymRepo.findById(id);
  }

  async updateProfile(id: string, data: Partial<IGym>): Promise<IGym | null> {
    return this._gymRepo.updateGym(id, data);
  }

  private mapToResponseDto(gym: IGym): GymResponseDto {
    return {
      _id: gym._id.toString(),
      role: gym.role,
      name: gym.name!,
      email: gym.email!,
      location: gym.location!,
      certificate: gym.certificate,
      verifyStatus: gym.verifyStatus,
      rejectReason: gym.rejectReason || undefined,
      isBanned: gym.isBanned,
      profileImage: gym.profileImage || undefined,
      images: gym.images || undefined,
      trainers: gym.trainers?.map((t) => t.toString()) || undefined,
      members: gym.members?.map((m) => m.toString()) || undefined,
      announcements: gym.announcements.map((ann) => ({
        title: ann.title,
        message: ann.message,
        date: ann.date,
      })),
      createdAt: gym.createdAt!,
      updatedAt: gym.updatedAt!,
    };
  }
}