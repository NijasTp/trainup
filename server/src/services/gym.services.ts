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
    @inject(TYPES.IGymRepository) private gymRepo: IGymRepository,
    @inject(TYPES.IJwtService) private jwtService: IJwtService
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

    const gym = await this.gymRepo.createGym({
      ...data,
      password: hashedPassword,
      certificate: certificateUrl,
      profileImage: profileImageUrl,
      images: imageUrls,
    });

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion?? 0
    );
    const refreshToken = this.jwtService.generateRefreshToken(
      gym._id.toString(),
      gym.role,
      gym.tokenVersion ?? 0
    );

    return { gym, accessToken, refreshToken };
  }

    async getAllGyms(page: number, limit: number, searchQuery: string) {
    return await this.gymRepo.findGyms(page, limit, searchQuery);
  }

  async updateGymStatus(id: string, updateData: Partial<IGym>) {
    return await this.gymRepo.updateStatus(id, updateData);
  }

  async getGymById(id: string) {
    return await this.gymRepo.findById(id);
  }

  async getGymData(gymId: string) {
    const gymDetails = await this.gymRepo.getGymById(gymId);
    const trainers = await this.gymRepo.getGymTrainers(gymId);
    const members = await this.gymRepo.getGymMembers(gymId);
    const announcements = await this.gymRepo.getGymAnnouncements(gymId);

    return {
      gymDetails,
      trainers,
      members,
      announcements
    };
  }
  async getGymApplication(id: string) {
  return await this.gymRepo.findApplicationById(id);
}

  async loginGym(email: string, password: string) {
    const gym = await this.gymRepo.findByEmail(email);
    if (!gym) throw new Error("Gym not found");
    if (gym.verifyStatus === 'rejected') throw new Error(`Gym verification was rejected: ${gym.rejectReason}`);
    const valid = await bcrypt.compare(password, gym.password!);
    if (!valid) throw new Error("Invalid credentials");
    const accessToken = this.jwtService.generateAccessToken(gym._id.toString(), gym.role, gym.tokenVersion?? 0);
    const refreshToken = this.jwtService.generateRefreshToken(gym._id.toString(), gym.role, gym.tokenVersion?? 0);
    return { gym, accessToken, refreshToken };
  }

  async getProfile(id: string) {
    return this.gymRepo.findById(id);
  }

  async updateProfile(id: string, data: Partial<IGym>) {
    return this.gymRepo.updateGym(id, data);
  }
}