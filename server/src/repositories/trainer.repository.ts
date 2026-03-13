import { injectable } from 'inversify'
import TrainerModel, { ITrainer } from '../models/trainer.model'
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository'
import { Types } from 'mongoose'
import { IUser, UserModel } from '../models/user.model'
import { TrainerResponseDto, ClientDto, TrainerDto } from '../dtos/trainer.dto'
import { SlotModel } from '../models/slot.model'
import { BaseRepository } from './base.repository'

@injectable()
export class TrainerRepository extends BaseRepository<ITrainer> implements ITrainerRepository {
  constructor() {
    super(TrainerModel);
  }

  async findByEmail(email: string): Promise<ITrainer | null> {
    return await this.findOne({ email });
  }

  async findById(id: string): Promise<ITrainer | null> {
    return await super.findById(id);
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string,
    specialization?: string,
    experience?: string,
    minRating?: string,
    minPrice?: string,
    maxPrice?: string
  ): Promise<TrainerResponseDto[]> {
    const query: Record<string, unknown> = {}

    if (isVerified && isVerified !== 'all') {
      if (isVerified === 'verified') query.profileStatus = 'approved'
      if (isVerified === 'unverified') query.profileStatus = 'pending'
      if (isVerified === 'rejected') query.profileStatus = 'rejected'
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ]
      if (specialization === 'Other') {
        (query.$or as Record<string, unknown>[]).push({
          specialization: {
            $regex: search,
            $options: 'i',
            $nin: [
              'Weight Training',
              'Yoga',
              'Pilates',
              'Cardio',
              'CrossFit',
              'Martial Arts',
              'Zumba'
            ]
          }
        })
      } else if (specialization) {
        (query.$or as Record<string, unknown>[]).push({
          specialization: { $regex: `^${specialization}$`, $options: 'i' }
        })
      }
    } else if (specialization && specialization !== 'Other') {
      query.specialization = { $regex: `^${specialization}$`, $options: 'i' }
    } else if (specialization === 'Other') {
      query.specialization = {
        $nin: [
          'Weight Training',
          'Yoga',
          'Pilates',
          'Cardio',
          'CrossFit',
          'Martial Arts',
          'Zumba'
        ]
      }
    }

    if (isBanned === 'active') query.isBanned = false
    if (isBanned === 'banned') query.isBanned = true

    if (experience) {
      const experienceMap: Record<string, Record<string, number>> = {
        'Less than 1 year': { $lte: 1 },
        '1–3 years': { $gte: 1, $lte: 3 },
        '3–5 years': { $gte: 3, $lte: 5 },
        '5–10 years': { $gte: 5, $lte: 10 },
        '10+ years': { $gte: 10 }
      }
      const expYears = experienceMap[experience]
      if (expYears) {
        query.experience = {
          $regex: `^\\d+`,
          $options: 'i',
          ...expYears
        }
      }
    }

    if (minRating && parseFloat(minRating) >= 0) {
      query.rating = { $gte: parseFloat(minRating) }
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        priceFilter.$gte = parseFloat(minPrice)
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        priceFilter.$lte = parseFloat(maxPrice)
      }
      query['price.basic'] = priceFilter
    }

    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {}
      if (startDate) dateQuery.$gte = new Date(startDate)
      if (endDate) dateQuery.$lte = new Date(endDate)
      query.createdAt = dateQuery
    }
    const trainers = await TrainerModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return trainers.map(trainer => TrainerDto.toResponse(trainer as ITrainer))
  }

  async count(
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string,
    specialization?: string,
    experience?: string,
    minRating?: string,
    minPrice?: string,
    maxPrice?: string
  ) {
    const query: Record<string, unknown> = {}

    if (isVerified && isVerified !== 'all') {
      if (isVerified === 'verified') query.profileStatus = 'approved'
      if (isVerified === 'unverified') query.profileStatus = 'pending'
      if (isVerified === 'rejected') query.profileStatus = 'rejected'
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ]
      if (specialization === 'Other') {
        (query.$or as Record<string, unknown>[]).push({
          specialization: {
            $regex: search,
            $options: 'i',
            $nin: [
              'Weight Training',
              'Yoga',
              'Pilates',
              'Cardio',
              'CrossFit',
              'Martial Arts',
              'Zumba'
            ]
          }
        })
      } else if (specialization) {
        (query.$or as Record<string, unknown>[]).push({
          specialization: { $regex: `^${specialization}$`, $options: 'i' }
        })
      }
    } else if (specialization && specialization !== 'Other') {
      query.specialization = { $regex: `^${specialization}$`, $options: 'i' }
    } else if (specialization === 'Other') {
      query.specialization = {
        $nin: [
          'Weight Training',
          'Yoga',
          'Pilates',
          'Cardio',
          'CrossFit',
          'Martial Arts',
          'Zumba'
        ]
      }
    }

    if (isBanned === 'active') query.isBanned = false
    if (isBanned === 'banned') query.isBanned = true

    if (experience) {
      const experienceMap: Record<string, Record<string, number>> = {
        'Less than 1 year': { $lte: 1 },
        '1–3 years': { $gte: 1, $lte: 3 },
        '3–5 years': { $gte: 3, $lte: 5 },
        '5–10 years': { $gte: 5, $lte: 10 },
        '10+ years': { $gte: 10 }
      }
      const expYears = experienceMap[experience]
      if (expYears) {
        query.experience = {
          $regex: `^\\d+`,
          $options: 'i',
          ...expYears
        }
      }
    }

    if (minRating) query.rating = { $gte: parseFloat(minRating) }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        priceFilter.$gte = parseFloat(minPrice)
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        priceFilter.$lte = parseFloat(maxPrice)
      }
      query['price.basic'] = priceFilter
    }

    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {}
      if (startDate) dateQuery.$gte = new Date(startDate)
      if (endDate) dateQuery.$lte = new Date(endDate)
      query.createdAt = dateQuery
    }

    return await this.countDocuments(query);
  }


  async findApplicationByTrainerId(
    id: string
  ): Promise<TrainerResponseDto | null> {
    const trainer = await TrainerModel.findById(id).select(
      'name email phone price bio location specialization experience badges rating certificate profileImage profileStatus createdAt'
    )
    return trainer ? TrainerDto.toResponse(trainer) : null
  }

  async updateStatus(
    identifier: string,
    updateData: Partial<ITrainer>
  ): Promise<ITrainer | null> {
    const query = Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { email: identifier }
    return await this.findOneAndUpdate(query, updateData)
  }

  async addClient(trainerId: string, userId: string): Promise<void> {
    await TrainerModel.findByIdAndUpdate(
      trainerId,
      { $push: { clients: new Types.ObjectId(userId) } },
      { new: true }
    ).exec()
  }

  async removeClient(trainerId: string, userId: string): Promise<void> {
    await TrainerModel.findByIdAndUpdate(
      trainerId,
      { $pull: { clients: new Types.ObjectId(userId) } },
      { new: true }
    ).exec()
  }

  async findClients(
    trainerId: string,
    skip: number,
    limit: number,
    search: string
  ): Promise<{ clients: ClientDto[]; total: number }> {
    const trainer = await TrainerModel.findById(trainerId)
      .select('clients')
      .exec()
    if (!trainer) {
      throw new Error('Trainer not found')
    }

    const matchQuery: any = {
      _id: { $in: trainer.clients }
    }

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const clientsAgg = await UserModel.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          planPriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$trainerPlan', 'pro'] }, then: 3 },
                { case: { $eq: ['$trainerPlan', 'premium'] }, then: 2 },
                { case: { $eq: ['$trainerPlan', 'basic'] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { planPriority: -1, name: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          subscriptionStartDate: 1,
          trainerPlan: 1,
          activeWorkoutTemplates: 1,
          activeDietTemplate: 1
        }
      }
    ]).exec()

    const total = await UserModel.countDocuments(matchQuery).exec()

    return {
      clients: clientsAgg.map(client => TrainerDto.toClientDto(client as any)),
      total
    }
  }

  async countNewClients(
    trainerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const trainer = await TrainerModel.findById(trainerId)
      .select('clients')
      .exec()
    if (!trainer) {
      throw new Error('Trainer not found')
    }

    const query: Record<string, unknown> = {
      _id: { $in: trainer.clients },
      subscriptionStartDate: { $gte: startDate, $lte: endDate }
    }

    return await UserModel.countDocuments(query).exec()
  }

  async countCompletedSessions(trainerId: string): Promise<number> {
    return await SlotModel.countDocuments({
      trainerId,
      status: 'completed'
    }).exec()
  }

  async getPlanDistribution(trainerId: string): Promise<Array<{ plan: string; count: number }>> {
    const distribution = await UserModel.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          trainerPlan: { $in: ['basic', 'premium', 'pro'] }
        }
      },
      {
        $group: {
          _id: '$trainerPlan',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    // Ensure all plans are present
    const plans = ['basic', 'premium', 'pro'];
    return plans.map(plan => ({
      plan,
      count: distribution.find(d => d._id === plan)?.count || 0
    }));
  }

  async getGrowthStats(days: number): Promise<{ date: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await TrainerModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return stats.map(g => ({ date: g._id, count: g.count }));
  }

  async countUnassignedClients(trainerId: string): Promise<number> {
    const trainer = await TrainerModel.findById(trainerId).select('clients').exec();
    if (!trainer) return 0;

    return await UserModel.countDocuments({
      _id: { $in: trainer.clients },
      $or: [
        { activeWorkoutTemplates: { $size: 0 } },
        { activeDietTemplate: { $exists: false } },
        { activeDietTemplate: null }
      ]
    }).exec();
  }
}
