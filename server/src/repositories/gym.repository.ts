import { injectable } from "inversify";
import mongoose from 'mongoose'
import { IGymRepository } from "../core/interfaces/repositories/IGymRepository";
import { IGym, GymModel } from "../models/gym.model";

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
      .select("name email location isBanned isVerified profileImage createdAt")
      .lean();

    return {
      gyms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findApplicationById(id: string) {
  return await GymModel.findById(id)
    .select("name email password location certificate profileImage images")
    .lean();
}

  async updateStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null> {
    return await GymModel.findByIdAndUpdate(id, updateData, { new: true });
  }


  async findById(_id: string): Promise<IGym | null> {
    return GymModel.findById(_id);
  }
  async getGymById(gymId: string) {
    return GymModel.findById(gymId).select("-password");
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

  async getGymAnnouncements(gymId: string) {
    const gym = await GymModel.findById(gymId).select("announcements");
    return gym?.announcements || [];
  }
}