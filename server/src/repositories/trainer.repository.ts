import { injectable } from 'inversify'
import TrainerModel, { ITrainer } from '../models/trainer.model'
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository'
import { Types } from 'mongoose'
import { IUser, UserModel } from '../models/user.model'
import { TrainerResponseDto, ClientDto } from '../dtos/trainer.dto'
import { SlotModel } from '../models/slot.model'
import { BaseRepository } from './base.repository'

@injectable()
export class TrainerRepository extends BaseRepository<ITrainer> implements ITrainerRepository {
  constructor() {
    super(TrainerModel);
  }

  async findByEmail (email: string): Promise<ITrainer | null> {
    return await this.findOne({ email });
  }

  async findById (id: string): Promise<ITrainer | null> {
    return await super.findById(id);
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
      const priceQuery: Record<string, number> = {}
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        priceQuery.$gte = parseFloat(minPrice)
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        priceQuery.$lte = parseFloat(maxPrice)
      }
      query.price = priceQuery
    }

    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {}
      if (startDate) dateQuery.$gte = new Date(startDate)
      if (endDate) dateQuery.$lte = new Date(endDate)
      query.createdAt = dateQuery
    }

    const trainers = await this.find(query, { skip, limit });
    return trainers.map(trainer => this.mapToResponseDto(trainer))
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
      const priceQuery: Record<string, number> = {}
      if (minPrice) priceQuery.$gte = parseFloat(minPrice)
      if (maxPrice) priceQuery.$lte = parseFloat(maxPrice)
      query.price = priceQuery
    }

    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {}
      if (startDate) dateQuery.$gte = new Date(startDate)
      if (endDate) dateQuery.$lte = new Date(endDate)
      query.createdAt = dateQuery
    }

    return await this.countDocuments(query);
  }


  async findApplicationByTrainerId (
    id: string
  ): Promise<TrainerResponseDto | null> {
    const trainer = await TrainerModel.findById(id).select(
      'name email phone bio location specialization experience badges rating certificate profileImage profileStatus createdAt'
    )
    return trainer ? this.mapToResponseDto(trainer) : null
  }

  async updateStatus (
    identifier: string,
    updateData: Partial<ITrainer>
  ): Promise<ITrainer | null> {
    const query = Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { email: identifier }
    return await this.findOneAndUpdate(query, updateData)
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
  ): Promise<{ clients: ClientDto[]; total: number }> {
    const trainer = await TrainerModel.findById(trainerId)
      .select('clients')
      .exec()
    if (!trainer) {
      throw new Error('Trainer not found')
    }

    const query: Record<string, unknown> = {
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

    return {
      clients: clients.map(client => this.mapToClientDto(client as IUser)),
      total
    }
  }

  async countNewClients (
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

  async countCompletedSessions (trainerId: string): Promise<number> {
    return await SlotModel.countDocuments({
      trainerId,
      status: 'completed'
    }).exec()
  }

  mapToResponseDto (trainer: ITrainer): TrainerResponseDto {
    return {
      _id: trainer._id.toString(),
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      price: trainer.price,
      isBanned: trainer.isBanned,
      role: trainer.role,
      gymId: trainer.gymId?.toString(),
      clients: Array.isArray(trainer.clients) 
      ? trainer.clients.map(c => c.toString()) 
      : [],
      bio: trainer.bio,
      location: trainer.location,
      specialization: trainer.specialization,
      experience: trainer.experience,
      rating: trainer.rating,
      certificate: trainer.certificate,
      profileImage: trainer.profileImage,
      profileStatus: trainer.profileStatus,
      rejectReason: trainer.rejectReason,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt
    }
  }

  mapToClientDto (client: IUser): ClientDto {
    return {
      _id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      subscriptionStartDate: client.subscriptionStartDate
    }
  }
}