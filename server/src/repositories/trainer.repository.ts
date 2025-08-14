import { injectable } from "inversify";
import TrainerModel, { ITrainer } from "../models/trainer.model";
import { ITrainerRepository } from "../core/interfaces/repositories/ITrainerRepository";

@injectable()
export class TrainerRepository implements ITrainerRepository {

  async findByEmail(email: string) {
    return await TrainerModel.findOne({ email })
  }

  async findById(id: string) {
    return await TrainerModel.findById(id).exec();
  }

  async create(trainerData: Partial<ITrainer>) {
    return await TrainerModel.create(trainerData);
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ) {
 
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    if (isBanned === "active") query.isBanned = false;
    if (isBanned === "banned") query.isBanned = true;
    if (isVerified === "verified") query.isVerified = true;
    if (isVerified === "unverified") query.isVerified = false;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return await TrainerModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async count(search: string, isBanned?: string, isVerified?: string, startDate?: string, endDate?: string) {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    if (isBanned === "active") query.isBanned = false;
    if (isBanned === "banned") query.isBanned = true;
    if (isVerified === "verified") query.isVerified = true;
    if (isVerified === "unverified") query.isVerified = false;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }



    return await TrainerModel.countDocuments(query).exec();
  }
   async findApplicationByTrainerId(id: string) {
    return await TrainerModel.findById(id).select(
      "name email phone bio location specialization experience badges rating certificate profileImage profileStatus createdAt"
    );
  }


  async updateStatus(_id: string, updateData: Partial<ITrainer>) {
    return await TrainerModel.findOneAndUpdate(
      { _id },
      updateData,
      { new: true }
    );
  }
}
