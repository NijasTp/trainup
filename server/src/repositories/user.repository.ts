import { injectable } from 'inversify'
import { UserModel, IUser } from '../models/user.model'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import { Types } from 'mongoose'
import { MESSAGES } from '../constants/messages'
import { UserResponseDto, UserUpdateProfileDto } from '../dtos/user.dto'
import {
  IUserGymMembership,
  UserGymMembershipModel
} from '../models/userGymMembership.model'
import { GymModel } from '../models/gym.model'

@injectable()
export class UserRepository implements IUserRepository {
  async createUser (data: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(data)
  }

  async findByEmail (email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).exec()
  }

  async checkUsername (username: string): Promise<IUser | null> {
    const regex = new RegExp(`^${username}$`, 'i')
    return await UserModel.findOne({ name: regex }).exec()
  }

  async findByGoogleId (googleId: string): Promise<IUser | null> {
    return UserModel.findOne({ googleId }).exec()
  }

  async findAll (skip: number, limit: number): Promise<UserResponseDto[]> {
    const users = await UserModel.find()
      .skip(skip)
      .limit(limit)
      .select(
        'name email phone isVerified isBanned role goals motivationLevel equipment assignedTrainer gymId isPrivate streak xp achievements createdAt'
      )
    return users.map(user => this.mapToResponseDto(user))
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
      users: users.map(user => this.mapToResponseDto(user as IUser)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async count (): Promise<number> {
    return await UserModel.countDocuments()
  }

  async updateUser (id: string, data: Partial<IUser>): Promise<IUser | null> {
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

  async findById (id: string): Promise<IUser | null> {
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

  // New methods from the first UserRepository
  async updateProfile (
    userId: string,
    updates: UserUpdateProfileDto
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(userId, updates, {
      new: true
    }).lean()
  }

  async updateTrainer (userId: string, trainerId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      assignedTrainer: trainerId,
      subscriptionStartDate: new Date()
    })
  }

  async updatePlan (
    userId: string,
    planType: 'basic' | 'premium' | 'pro'
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { trainerPlan: planType })
  }

  async updateUserGymMembership (
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

  async removeTrainer (userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      assignedTrainer: null,
      subscriptionStartDate: null,
      trainerPlan: null
    })
  }

  async updatePassword (email: string, hashedPassword: string): Promise<void> {
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword })
  }

  mapToResponseDto (user: IUser): UserResponseDto {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified || false,
      role: user.role,
      goals: user.goals,
      activityLevel: user.activityLevel,
      equipment: user.equipment,
      assignedTrainer: user.assignedTrainer?.toString(),
      subscriptionStartDate: user.subscriptionStartDate || undefined,
      gymId: user.gymId?.toString(),
      isPrivate: user.isPrivate,
      isBanned: user.isBanned,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      xp: user.xp,
      xpLogs:
        user.xpLogs?.map(log => ({
          amount: log.amount,
          reason: log.reason,
          date: log.date
        })) || [],
      achievements: user.achievements || [],
      currentWeight: user.todaysWeight,
      goalWeight: user.goalWeight,
      weightHistory:
        user.weightHistory?.map(weight => ({
          weight: weight.weight,
          date: weight.date
        })) || [],
      height: user.height,
      age: user.age,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
