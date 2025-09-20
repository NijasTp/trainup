import { UserModel, IUser } from '../models/user.model'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import { Types } from 'mongoose'
import { MESSAGES } from '../constants/messages'

export class UserRepository implements IUserRepository {
  async createUser (data: Partial<IUser>) {
    return await UserModel.create(data)
  }

  async findByEmail (email: string) {
    return await UserModel.findOne({ email }).exec()
  }

  async checkUsername (username: string) {
    const regex = new RegExp(`^${username}$`, 'i')
    return await UserModel.findOne({ name: regex }).exec()
  }

  async findByGoogleId (googleId: string): Promise<IUser | null> {
    return UserModel.findOne({ googleId }).exec()
  }

  async findAll (skip: number, limit: number) {
    return await UserModel.find()
      .skip(skip)
      .limit(limit)
      .select(
        'name email phone isVerified isBanned role goals motivationLevel equipment assignedTrainer gymId isPrivate streak xp achievements createdAt'
      )
  }

  async findUsers (
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ) {
    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (isBanned === 'active') query.isBanned = false
    if (isBanned === 'banned') query.isBanned = true
    if (isVerified === 'verified') query.isVerified = true
    if (isVerified === 'unverified') query.isVerified = false
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .select('name email phone role isVerified isBanned createdAt')
        .lean(),
      UserModel.countDocuments(query)
    ])

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async count () {
    return await UserModel.countDocuments()
  }

  async updateUser (id: string, data: Partial<IUser>) {
    if (data.assignedTrainer) {
      data.assignedTrainer = new Types.ObjectId(data.assignedTrainer)
    }
    return await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec()
  }

  async updateStatusAndIncrementVersion (
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData, $inc: { tokenVersion: 1 } },
      { new: true }
    )
  }

  async updateStatus (
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true })
  }

  async findById (id: string) {
    return UserModel.findById(id).select('-password')
  }

  async getWeightHistory (
    userId: string
  ): Promise<{ weight: number; date: Date }[]> {
    const user = await UserModel.findById(userId).select('weightHistory').lean()
    if (!user || !user.weightHistory?.length) {
      return []
    }
    return user.weightHistory.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )
  }

  async addWeight (
    userId: string,
    weight: number,
    date: Date
  ): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: { currentWeight: weight },
        $push: { weightHistory: { weight, date } }
      },
      { new: true }
    ).select('-password')
    if (!user) throw new Error(MESSAGES.USER_NOT_FOUND)
    return user
  }
}
;[]
