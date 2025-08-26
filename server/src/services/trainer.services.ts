import { inject, injectable } from "inversify";
import TYPES from "../core/types/types";
import { ITrainerService, PaginatedClients } from "../core/interfaces/services/ITrainerService";
import { ITrainerRepository } from "../core/interfaces/repositories/ITrainerRepository";
import { PaginatedTrainers } from "../core/interfaces/services/ITrainerService";
import { v2 as cloudinary } from "cloudinary";
import { ITrainer } from "../models/trainer.model";
import { UploadedFile } from 'express-fileupload';
import bcrypt from 'bcryptjs'
import { IOTPService } from "../core/interfaces/services/IOtpService";
import { IJwtService } from "../core/interfaces/services/IJwtService";


interface TrainerApplyData {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  experience: string;
  specialization: string;
  bio: string;
  certificate: UploadedFile;
  profileImage: UploadedFile,

}



@injectable()
export class TrainerService implements ITrainerService {
  constructor(
    @inject(TYPES.ITrainerRepository) private trainerRepo: ITrainerRepository,
    @inject(TYPES.IOtpService) private otpService: IOTPService,
    @inject(TYPES.IJwtService) private jwtService: IJwtService,
  ) { }

  async loginTrainer(email: string, password: string) {
    const trainer = await this.trainerRepo.findByEmail(email);
    if (!trainer) {
      throw new Error("Trainer doesn't exist");
    }

    if (trainer.isBanned) {
      throw new Error("Your account has been banned.");
    }

    const isPasswordValid = await bcrypt.compare(password, trainer.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const accessToken = this.jwtService.generateAccessToken(trainer._id.toString(), trainer.role, trainer.tokenVersion ?? 0);
    const refreshToken = this.jwtService.generateRefreshToken(trainer._id.toString(), trainer.role, trainer.tokenVersion ?? 0);

    return { trainer, accessToken, refreshToken };
  }

  async forgotPassword(email: string) {
    const trainer = await this.trainerRepo.findByEmail(email);
    if (!trainer) throw new Error("Trainer not found");
    await this.otpService.requestForgotPasswordOtp(email, 'trainer');
  }

  async verifyOtp(email: string, otp: string) {
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) throw new Error("Invalid or expired OTP");
  }

  async resetPassword(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    await this.trainerRepo.updateStatus(email, { password: hashed });
    await this.otpService.clearOtp(email);
  }

  async applyAsTrainer(trainerData: TrainerApplyData) {
    if (!trainerData.name || !trainerData.email || !trainerData.phone || !trainerData.password || !trainerData.certificate || !trainerData.profileImage) {
      throw new Error('Missing required fields: name, email, phone, password, certificate, profileImage');
    }

    const existingTrainer = await this.trainerRepo.findByEmail(trainerData.email);
    if (existingTrainer) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trainerData.password, salt);

    let certificateUrl: string;
    let profileImageUrl: string;

    try {

      const certificateUploadResult = await cloudinary.uploader.upload(
        trainerData.certificate.tempFilePath,
        { resource_type: 'auto', folder: 'trainer_certificates' }
      );
      certificateUrl = certificateUploadResult.secure_url;
    } catch (error: any) {
      console.error('Cloudinary certificate upload error:', {
        message: error.message,
        status: error.http_code,
        details: error,
        fileInfo: {
          name: trainerData.certificate.name,
          size: trainerData.certificate.size,
          mimetype: trainerData.certificate.mimetype,
        },
      });
      throw new Error(`Failed to upload certificate: ${error.message || 'Unknown error'}`);
    }

    try {
      const profileImageUploadResult = await cloudinary.uploader.upload(
        trainerData.profileImage.tempFilePath,
        { resource_type: 'image', folder: 'trainer_profile_images' }
      );
      profileImageUrl = profileImageUploadResult.secure_url;
    } catch (error: any) {
      console.error('Cloudinary profile image upload error:', {
        message: error.message,
        status: error.http_code,
        details: error,
        fileInfo: {
          name: trainerData.profileImage.name,
          size: trainerData.profileImage.size,
          mimetype: trainerData.profileImage.mimetype,
        },
      });
      throw new Error(`Failed to upload profile image: ${error.message || 'Unknown error'}`);
    }

    const trainerToSave: Partial<ITrainer> = {
      name: trainerData.name,
      email: trainerData.email,
      password: hashedPassword,
      phone: trainerData.phone,
      bio: trainerData.bio ,
      location: trainerData.location,
      experience: trainerData.experience,
      specialization: trainerData.specialization,
      certificate: certificateUrl,
      profileImage: profileImageUrl,
      profileStatus: 'pending',
    };

    const trainer = await this.trainerRepo.create(trainerToSave);
    const accessToken = this.jwtService.generateAccessToken(trainer._id.toString(), trainer.role, trainer.tokenVersion ?? 0);
    const refreshToken = this.jwtService.generateRefreshToken(trainer._id.toString(), trainer.role, trainer.tokenVersion ?? 0);

    return { trainer, accessToken, refreshToken };
  }

  async getTrainerById(id: string) {
      const trainer=await this.trainerRepo.findById(id);
      if (!trainer) throw new Error('Trainer not found');
      return trainer; 
  }


 async getAllTrainers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ) {
    const skip = (page - 1) * limit;
    const trainers = await this.trainerRepo.findAll(skip, limit, search, isBanned, isVerified, startDate, endDate);
    const total = await this.trainerRepo.count(search, isBanned, isVerified, startDate, endDate);

    return {
      trainers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
   async getTrainerApplication(id: string) {
    return await this.trainerRepo.findApplicationByTrainerId(id);
  }

  async updateTrainerStatus(id: string, updateData: Partial<ITrainer>) {
    return await this.trainerRepo.updateStatus(id, updateData);
  }

   async addClientToTrainer(trainerId: string, userId: string): Promise<void> {
    await this.trainerRepo.addClient(trainerId, userId);
  }
      async removeClientFromTrainer(trainerId: string, userId: string): Promise<void> {
        await this.trainerRepo.removeClient(trainerId, userId);
    }

        async getTrainerClients(
        trainerId: string,
        page: number,
        limit: number,
        search: string
    ): Promise<PaginatedClients> {
        const skip = (page - 1) * limit;
        const { clients, total } = await this.trainerRepo.findClients(trainerId, skip, limit, search);
        return {
            clients,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

}
