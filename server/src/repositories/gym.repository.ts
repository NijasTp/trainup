import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { IGymRepository, PaginatedGyms } from '../core/interfaces/repositories/IGymRepository';
import { IGym, GymModel } from '../models/gym.model';

@injectable()
export class GymRepository implements IGymRepository {
  async findByEmail(email: string): Promise<IGym | null> {
    return GymModel.findOne({ email }).exec();
  }

  async createGym(data: Partial<IGym>): Promise<IGym> {
    return GymModel.create(data);
  }

  async updateGym(_id: string, data: Partial<IGym>): Promise<IGym | null> {
    return GymModel.findByIdAndUpdate(_id, data, { new: true }).exec();
  }

  async findGyms(page: number, limit: number, searchQuery: string): Promise<PaginatedGyms> {
    const query: any = {};
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' };
    }

    const total = await GymModel.countDocuments(query).exec();
    const gyms = await GymModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email location isBanned verifyStatus profileImage createdAt')
      .exec(); 

    return {
      gyms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findApplicationById(id: string): Promise<IGym | null> {
    return await GymModel.findById(id)
      .select('name email password location certificate profileImage images')
      .exec(); // Removed .lean() to return full IGym
  }

  async updateStatus(id: string, updateData: Partial<IGym>): Promise<IGym | null> {
    if (updateData.verifyStatus === 'rejected') {
      return await GymModel.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $inc: { rejectionCount: 1 },
        },
        { new: true }
      ).exec();
    }

    return await GymModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findById(_id: string): Promise<IGym | null> {
    return GymModel.findById(_id).exec();
  }

  async getGymById(gymId: string): Promise<IGym | null> {
    return GymModel.findById(gymId).select('-password').exec();
  }

  async getGymTrainers(gymId: string): Promise<any[]> {
    return GymModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(gymId) } },
      {
        $lookup: {
          from: 'trainers',
          localField: 'trainers',
          foreignField: '_id',
          as: 'trainers',
        },
      },
      { $project: { trainers: 1 } },
    ]).then(res => res[0]?.trainers || []);
  }

  async getGymMembers(gymId: string): Promise<any[]> {
    return GymModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(gymId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
        },
      },
      { $project: { members: 1 } },
    ]).then(res => res[0]?.members || []);
  }

  async getGymAnnouncements(gymId: string): Promise<any[]> {
    const gym = await GymModel.findById(gymId).select('announcements').exec();
    return gym?.announcements || [];
  }
}