import { injectable } from 'inversify'
import { UserModel, IUser } from '../models/user.model'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import { Types, FilterQuery } from 'mongoose'
import { MESSAGES } from '../constants/messages.constants'
import { UserResponseDto, UserUpdateProfileDto, UserDto } from '../dtos/user.dto'
import {
  IUserGymMembership,
  UserGymMembershipModel
} from '../models/userGymMembership.model'
import { GymModel } from '../models/gym.model'

@injectable()
export class UserRepository implements IUserRepository {
  async createUser(data: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(data)
  }

  async checkUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ name: username }).exec()
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await UserModel.findOne({ googleId }).exec()
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).exec()
  }
  async findAll(skip: number, limit: number): Promise<UserResponseDto[]> {
    const users = await UserModel.find()
      .skip(skip)
      .limit(limit)
      .select(
        'name email phone isVerified isBanned role goals motivationLevel equipment assignedTrainer gymId isPrivate streak xp achievements createdAt'
      )
    return users.map(user => UserDto.toResponse(user))
  }

  async findUsers(
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ) {
    const query: FilterQuery<IUser> = {}
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
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id name email phone role isVerified isBanned createdAt')
        .lean(),
      UserModel.countDocuments(query)
    ])

    return {
      users: users.map(user => UserDto.toResponse(user as IUser)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async count(): Promise<number> {
    return await UserModel.countDocuments()
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.assignedTrainer) {
      data.assignedTrainer = new Types.ObjectId(data.assignedTrainer)
    }
    return await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec()
  }

  async updateStatusAndIncrementVersion(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData, $inc: { tokenVersion: 1 } },
      { new: true }
    )
  }

  async updateStatus(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true })
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).select('-password')
  }

  async findProfileById(id: string): Promise<IUser | null> {
    return UserModel.findById(id)
      .select('-password')
      .populate('assignedTrainer', 'name')
      .populate('gymId', 'name')
      .exec();
  }

  async getWeightHistory(
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

  async addWeight(
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

  async updateProfile(
    userId: string,
    updates: UserUpdateProfileDto
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(userId, updates, {
      new: true
    }).lean()
  }

  async findByIdWithPassword(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId).select('+password').exec()
  }

  async updatePasswordWithId(userId: string, hashedPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    ).exec()
  }

  async updateTrainer(userId: string, trainerId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      assignedTrainer: trainerId,
      subscriptionStartDate: new Date()
    })
  }

  async updatePlan(
    userId: string,
    planType: 'basic' | 'premium' | 'pro'
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { trainerPlan: planType })
  }

  async updateUserGymMembership(
    userId: string,
    gymId: string,
    planId: string,
    startDate: Date,
    endDate: Date,
    preferredTime?: string
  ): Promise<IUserGymMembership> {
    const update = {
      planId: new Types.ObjectId(planId),
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      preferredTime: preferredTime ?? 'Anytime',
      status: 'active'
    }

    const membership = await UserGymMembershipModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), gymId: new Types.ObjectId(gymId) },
      { $set: update },
      { new: true, upsert: true }
    )

    if (!membership) throw new Error('Failed to update user gym membership')

    await UserModel.findByIdAndUpdate(userId, {
      $set: { gymId: new Types.ObjectId(gymId) }
    })
    await GymModel.findByIdAndUpdate(gymId, {
      $addToSet: { members: new Types.ObjectId(userId) }
    })

    return membership
  }

  async removeTrainer(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      assignedTrainer: null,
      subscriptionStartDate: null,
      trainerPlan: null
    })
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword })
  }
}


