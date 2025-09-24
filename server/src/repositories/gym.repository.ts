import { injectable } from "inversify";
import mongoose from 'mongoose'
import { IGymRepository } from "../core/interfaces/repositories/IGymRepository";
import { IGym, GymModel } from "../models/gym.model";
import { GymResponseDto, GymDataResponseDto, AnnouncementDto } from '../dtos/gym.dto';

@injectable()
export class GymRepository implements IGymRepository {
  async findByEmail(email: string): Promise<IGym | null> {
    return GymModel.findOne({ email });
  }

  async createGym(data: Partial<IGym>): Promise<IGym> {
    return GymModel.create(data);
  }

  async updateGym(_id: string, data: Partial<IGym>): Promise<IGym | null> {
    return GymModel.findByIdAndUpdate(_id, data, { new: true });
  }

  async findGyms(page: number, limit: number, searchQuery: string) {
    const query: any = {};
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: "i" };
    }

    const total = await GymModel.countDocuments(query);
    const gyms = await GymModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email location isBanned verifyStatus profileImage createdAt")
      .lean();

    return {
      gyms: gyms.map(gym => this.mapToResponseDto(gym as IGym)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
  
  async findApplicationById(id: string) {
    const gym = await GymModel.findById(id)
      .select("name email password location certificate profileImage images")
      .lean();
    return gym ? this.mapToResponseDto(gym as IGym) : null;
  }

  async updateStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null> {
    if (updateData.verifyStatus === "rejected") {
      return await GymModel.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $inc: { rejectionCount: 1 },
        },
        { new: true }
      );
    }

    return await GymModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findById(_id: string): Promise<IGym | null> {
    return GymModel.findById(_id);
  }
  
  async getGymById(gymId: string): Promise<GymResponseDto | null> {
    const gym = await GymModel.findById(gymId).select("-password");
    return gym ? this.mapToResponseDto(gym) : null;
  }

  async getGymTrainers(gymId: string) {
    return GymModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(gymId) } },
      {
        $lookup: {
          from: "trainers",
          localField: "trainers",
          foreignField: "_id",
          as: "trainers"
        }
      },
      { $project: { trainers: 1 } }
    ]).then(res => res[0]?.trainers || []);
  }

  async getGymMembers(gymId: string) {
    return GymModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(gymId) } },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },
      { $project: { members: 1 } }
    ]).then(res => res[0]?.members || []);
  }

  async getGymAnnouncements(gymId: string): Promise<AnnouncementDto[]> {
    const gym = await GymModel.findById(gymId).select("announcements");
    return gym?.announcements?.map(ann => ({
      title: ann.title,
      message: ann.message,
      date: ann.date,
    })) || [];
  }

  // Mapping function to convert IGym to response DTO
  mapToResponseDto(gym: IGym): GymResponseDto {
    return {
      _id: gym._id.toString(),
      role: gym.role,
      name: gym.name!,
      email: gym.email!,
      location: gym.location!,
      certificate: gym.certificate!,
      verifyStatus: gym.verifyStatus,
      rejectReason: gym.rejectReason || undefined,
      isBanned: gym.isBanned,
      profileImage: gym.profileImage || undefined,
      images: gym.images || undefined,
      trainers: gym.trainers?.map((t) => t.toString()) || undefined,
      members: gym.members?.map((m) => m.toString()) || undefined,
      announcements: gym.announcements?.map((ann) => ({
        title: ann.title,
        message: ann.message,
        date: ann.date,
      })) || [],
      createdAt: gym.createdAt!,
      updatedAt: gym.updatedAt!,
    };
  }
}