import { injectable } from 'inversify'
import TrainerModel, { ITrainer } from '../models/trainer.model'
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository'
import { Types } from 'mongoose'
import { IUser, UserModel } from '../models/user.model'

@injectable()
export class TrainerRepository implements ITrainerRepository {
  async findByEmail (email: string) {
    return await TrainerModel.findOne({ email })
  }

  async findById (id: string) {
    return await TrainerModel.findById(id).select('-password')
  }

  async create (trainerData: Partial<ITrainer>) {
    return await TrainerModel.create(trainerData)
  }

  async findAll (
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
  ) {
    const query: any = {}

    if (isVerified === 'verified') query.profileStatus = 'approved'
    if (isVerified === 'unverified') query.profileStatus = 'pending'
    if (isVerified === 'rejected') query.profileStatus = 'rejected'

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ]
      if (specialization === 'Other') {
        query.$or.push({
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
        query.$or.push({
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
      const experienceMap: { [key: string]: { $gte?: number; $lte?: number } } =
        {
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
      query.price = {}
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        query.price.$gte = parseFloat(minPrice)
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        query.price.$lte = parseFloat(maxPrice)
      }
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    return await TrainerModel.find(query).skip(skip).limit(limit).lean().exec()
  }

  async count (
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
    const query: any = {}

    if (isVerified === 'verified') query.profileStatus = 'approved'
    if (isVerified === 'unverified') query.profileStatus = 'pending'
    if (isVerified === 'rejected') query.profileStatus = 'rejected'

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ]
      if (specialization === 'Other') {
        query.$or.push({
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
      }
    }

    if (isBanned === 'active') query.isBanned = false
    if (isBanned === 'banned') query.isBanned = true
    if (specialization && specialization !== 'Other')
      query.specialization = specialization
    if (experience) {
      const experienceMap: { [key: string]: { $gte?: number; $lte?: number } } =
        {
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
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    return await TrainerModel.countDocuments(query).exec()
  }

  async findApplicationByTrainerId (id: string) {
    return await TrainerModel.findById(id).select(
      'name email phone bio location specialization experience badges rating certificate profileImage profileStatus createdAt'
    )
  }

  async updateStatus (_id: string, updateData: Partial<ITrainer>) {
    return await TrainerModel.findOneAndUpdate({ _id }, updateData, {
      new: true
    })
  }

  async addClient (trainerId: string, userId: string): Promise<void> {
    await TrainerModel.findByIdAndUpdate(
      trainerId,
      { $push: { clients: new Types.ObjectId(userId) } },
      { new: true }
    ).exec()
  }

  async removeClient (trainerId: string, userId: string): Promise<void> {
    await TrainerModel.findByIdAndUpdate(
      trainerId,
      { $pull: { clients: new Types.ObjectId(userId) } },
      { new: true }
    ).exec()
  }

  async findClients (
    trainerId: string,
    skip: number,
    limit: number,
    search: string
  ): Promise<{ clients: IUser[]; total: number }> {
    const trainer = await TrainerModel.findById(trainerId)
      .select('clients')
      .exec()
    if (!trainer) {
      throw new Error('Trainer not found')
    }

    const query: any = {
      _id: { $in: trainer.clients }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const clients = await UserModel.find(query)
      .select('name email phone subscriptionStartDate')
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()

    const total = await UserModel.countDocuments(query).exec()

    return { clients, total }
  }
}
