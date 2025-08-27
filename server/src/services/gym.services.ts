import { injectable, inject } from "inversify";
import { IGymService, GymRegisterData } from "../core/interfaces/services/IGymService";
import { IGymRepository } from "../core/interfaces/repositories/IGymRepository";
import TYPES from "../core/types/types";
import bcrypt from "bcryptjs";
import { IGym } from "../models/gym.model";
import cloudinary from "../config/cloudinary";
import { UploadedFile } from "express-fileupload";
import { IJwtService } from "../core/interfaces/services/IJwtService";

@injectable()
export class GymService implements IGymService {
  constructor(
    @inject(TYPES.IGymRepository) private _gymRepo: IGymRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) { }

  async registerGym(
    data: any,
    files: {
      certificate?: UploadedFile;
      profileImage?: UploadedFile;
      images?: UploadedFile | UploadedFile[];
    }
  ): Promise<{ gym: IGym; accessToken: string; refreshToken: string }> {
    let certificateUrl: string | undefined;
    let profileImageUrl: string | undefined;
    const imageUrls: string[] = [];

    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (files?.certificate) {
      const certUpload = await cloudinary.uploader.upload(
        files.certificate.tempFilePath,
        { folder: "trainup/gyms/certificate" }
      );
      certificateUrl = certUpload.secure_url;
    }

    if (files?.profileImage) {
      const profileUpload = await cloudinary.uploader.upload(
        files.profileImage.tempFilePath,
        { folder: "trainup/gyms/profiles" }
      );
      profileImageUrl = profileUpload.secure_url;
    }

    if (files?.images) {
      const uploadPromises = Array.isArray(files.images)
        ? files.images.map((img) =>
          cloudinary.uploader.upload(img.tempFilePath, {
            folder: "trainup/gyms/gallery",
          })
        )
        : [
          cloudinary.uploader.upload(files.images.tempFilePath, {
            folder: "trainup/gyms/gallery",
          }),
        ];

      const results = await Promise.all(uploadPromises);
      results.forEach((res) => imageUrls.push(res.secure_url));
    }

    const gym = await this._gymRepo.createGym({
      ...data,
      password: hashedPassword,
      certificate: certificateUrl,
      profileImage: profileImageUrl,
      images: imageUrls,
    });

    // Generate tokens
    const accessToken = this._jwtService.generateAccessToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion?? 0
    );
    const refreshToken = this._jwtService.generateRefreshToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    );

    return { gym, accessToken, refreshToken };
  }

    async getAllGyms(page: number, limit: number, searchQuery: string) {
    return await this._gymRepo.findGyms(page, limit, searchQuery);
  }

  async updateGymStatus(id: string, updateData: Partial<IGym>) {
    return await this._gymRepo.updateStatus(id, updateData);
  }

  async getGymById(id: string) {
    return await this._gymRepo.findById(id);
  }

  async getGymData(gymId: string) {
    const gymDetails = await this._gymRepo.getGymById(gymId);
    const trainers = await this._gymRepo.getGymTrainers(gymId);
    const members = await this._gymRepo.getGymMembers(gymId);
    const announcements = await this._gymRepo.getGymAnnouncements(gymId);

    return {
      gymDetails,
      trainers,
      members,
      announcements
    };
  }
  async getGymApplication(id: string) {
  return await this._gymRepo.findApplicationById(id);
}

  async loginGym(email: string, password: string) {
    const gym = await this._gymRepo.findByEmail(email);
    if (!gym) throw new Error("Gym not found");
    if (gym.verifyStatus === 'rejected') throw new Error(`Gym verification was rejected: ${gym.rejectReason}`);
    const valid = await bcrypt.compare(password, gym.password!);
    if (!valid) throw new Error("Invalid credentials");
    const accessToken = this._jwtService.generateAccessToken(gym._id.toString(), gym.role, gym.tokenVersion?? 0);
    const refreshToken = this._jwtService.generateRefreshToken(gym._id.toString(), gym.role, gym.tokenVersion?? 0);
    return { gym, accessToken, refreshToken };
  }

  async getProfile(id: string) {
    return this._gymRepo.findById(id);
  }

  async updateProfile(id: string, data: Partial<IGym>) {
    return this._gymRepo.updateGym(id, data);
  }
}