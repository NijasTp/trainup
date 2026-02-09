import { injectable } from 'inversify'
import mongoose, { Types, PipelineStage } from 'mongoose'
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository'
import { IGym, GymModel } from '../models/gym.model'
import {
  ISubscriptionPlan,
  SubscriptionPlanModel
} from '../models/gymSubscriptionPlan.model'
import TrainerModel, { ITrainer } from '../models/trainer.model'
import {
  IUserGymMembership,
  UserGymMembershipModel
} from '../models/userGymMembership.model'
import {
  IGymAnnouncement,
  GymAnnouncementModel
} from '../models/gymAnnouncement.model'
import { GymResponseDto, AnnouncementDto, GymListingDto, MyGymResponseDto, UserSubscription, GymSummary, MemberSummary } from '../dtos/gym.dto'
import { GymTransactionModel } from '../models/gymTransaction.model'
import { IUser } from '../models/user.model'

@injectable()
export class GymRepository implements IGymRepository {
  async findByEmail(email: string): Promise<IGym | null> {
    return GymModel.findOne({ email })
  }

  async createGym(data: Partial<IGym>): Promise<IGym> {
    return GymModel.create(data)
  }

  async updateGym(_id: string, data: Partial<IGym>): Promise<IGym | null> {
    return GymModel.findByIdAndUpdate(_id, data, { new: true })
  }

  async findGyms(
    page: number,
    limit: number,
    searchQuery: string
  ): Promise<{
    gyms: GymResponseDto[]
    total: number
    page: number
    totalPages: number
  }> {
    const query: { name?: { $regex: string; $options: string } } = {}
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' }
    }

    const total = await GymModel.countDocuments(query)
    const gyms = await GymModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        'name email geoLocation isBanned verifyStatus profileImage logo address description images createdAt'
      )
      .lean()

    return {
      gyms: (gyms as IGym[]).map(g => this.mapToResponseDto(g)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async findApplicationById(id: string): Promise<GymResponseDto | null> {
    const gym = await GymModel.findById(id)
      .select('name email password geoLocation certifications profileImage logo address openingHours description images')
      .lean()
    return gym ? this.mapToResponseDto(gym as IGym) : null
  }

  async updateStatus(
    id: string,
    updateData: Partial<IGym>
  ): Promise<IGym | null> {
    if (updateData.verifyStatus === 'rejected') {
      return GymModel.findByIdAndUpdate(
        id,
        { $set: updateData, $inc: { rejectionCount: 1 } },
        { new: true }
      )
    }
    return GymModel.findByIdAndUpdate(id, updateData, { new: true })
  }

  async findById(_id: string): Promise<IGym | null> {
    return GymModel.findById(_id)
  }

  async getGymById(gymId: string): Promise<GymResponseDto | null> {
    const gym = await GymModel.findById(gymId).select('-password')
    return gym ? this.mapToResponseDto(gym) : null
  }

  async getGymTrainers(gymId: string): Promise<ITrainer[]> {
    const result = await GymModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(gymId) } },
      {
        $lookup: {
          from: 'trainers',
          localField: 'trainers',
          foreignField: '_id',
          as: 'trainers'
        }
      },
      { $project: { trainers: 1 } }
    ])
    return result[0]?.trainers || []
  }

  async getGymMembers(gymId: string): Promise<IUser[]> {
    const result = await GymModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(gymId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members'
        }
      },
      { $project: { members: 1 } }
    ])
    return (result[0]?.members as IUser[]) || []
  }

  async getGymAnnouncements(gymId: string): Promise<AnnouncementDto[]> {
    const gym = await GymModel.findById(gymId).select('announcements')
    return gym
      ? gym.announcements.map(a => ({
        title: a.title,
        message: a.message,
        date: a.date
      }))
      : []
  }

  async createSubscriptionPlan(
    gymId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan> {
    return SubscriptionPlanModel.create({
      ...data,
      gymId: new mongoose.Types.ObjectId(gymId)
    })
  }

  async listSubscriptionPlans(
    gymId: string,
    page: number,
    limit: number,
    search?: string,
    active?: string
  ): Promise<{
    items: ISubscriptionPlan[]
    total: number
    page: number
    totalPages: number
  }> {
    const query: {
      gymId: mongoose.Types.ObjectId
      name?: { $regex: string; $options: string }
      isActive?: boolean
    } = { gymId: new mongoose.Types.ObjectId(gymId) }
    if (search) query.name = { $regex: search, $options: 'i' }
    if (active === 'true') query.isActive = true
    if (active === 'false') query.isActive = false

    const total = await SubscriptionPlanModel.countDocuments(query)
    const items = await SubscriptionPlanModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()

    return {
      items: items as ISubscriptionPlan[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getSubscriptionPlanById(
    planId: string
  ): Promise<ISubscriptionPlan | null> {
    return SubscriptionPlanModel.findById(planId).lean()
  }

  async updateSubscriptionPlan(
    planId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan | null> {
    return SubscriptionPlanModel.findByIdAndUpdate(planId, data, { new: true })
  }

  async deleteSubscriptionPlan(planId: string): Promise<void> {
    await SubscriptionPlanModel.findByIdAndDelete(planId)
  }

  async addTrainer(gymId: string, data: Partial<ITrainer>): Promise<ITrainer> {
    const trainer = await TrainerModel.create({
      ...data,
      gym: new Types.ObjectId(gymId)
    })
    await GymModel.findByIdAndUpdate(gymId, {
      $push: { trainers: trainer._id }
    })
    return trainer
  }

  async updateTrainer(
    trainerId: string,
    data: Partial<ITrainer>
  ): Promise<ITrainer | null> {
    return TrainerModel.findByIdAndUpdate(trainerId, data, { new: true })
  }

  async updateMember(
    membershipId: string,
    data: Partial<IUserGymMembership>
  ): Promise<IUserGymMembership | null> {
    return UserGymMembershipModel.findByIdAndUpdate(membershipId, data, {
      new: true
    })
  }

  async addMemberToGym(gymId: string, userId: string): Promise<void> {
    await GymModel.findByIdAndUpdate(gymId, {
      $addToSet: { members: new Types.ObjectId(userId) }
    })
  }

  async createAnnouncement(
    gymId: string,
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement> {
    const announcement = await GymAnnouncementModel.create({
      ...data,
      gymId: new Types.ObjectId(gymId)
    })
    await GymModel.findByIdAndUpdate(gymId, {
      $push: { announcements: announcement._id }
    })
    return announcement
  }

  async getAnnouncementsByGym(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    announcements: IGymAnnouncement[]
    total: number
    totalPages: number
  }> {
    const query: {
      gymId: mongoose.Types.ObjectId
      $or?: Array<{
        title?: { $regex: string; $options: string }
        description?: { $regex: string; $options: string }
      }>
    } = { gymId: new mongoose.Types.ObjectId(gymId) }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await GymAnnouncementModel.countDocuments(query)
    const announcements = await GymAnnouncementModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return {
      announcements: announcements as IGymAnnouncement[],
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateAnnouncement(
    announcementId: string,
    gymId: string,
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement | null> {
    return GymAnnouncementModel.findOneAndUpdate(
      { _id: announcementId, gymId: new Types.ObjectId(gymId) },
      data,
      { new: true }
    )
  }

  async deleteAnnouncement(
    announcementId: string,
    gymId: string
  ): Promise<void> {
    await GymAnnouncementModel.findOneAndDelete({
      _id: announcementId,
      gymId: new Types.ObjectId(gymId)
    })
    await GymModel.findByIdAndUpdate(gymId, {
      $pull: { announcements: announcementId }
    })
  }

  async getGymsForUser(
    page: number,
    limit: number,
    search: string,
    userLocation?: { lat: number; lng: number }
  ): Promise<{
    gyms: GymListingDto[]
    total: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const match: {
      verifyStatus: string
      isBanned: boolean
      name?: { $regex: string; $options: string }
    } = {
      verifyStatus: 'approved',
      isBanned: false
    }
    if (search) {
      match.name = { $regex: search, $options: 'i' }
    }

    let pipeline: PipelineStage[] = []
    let total = 0

    if (userLocation) {
      pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point' as const,
              coordinates: [userLocation.lng, userLocation.lat] as [
                number,
                number
              ]
            },
            distanceField: 'distance',
            spherical: true,
            query: match
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            profileImage: 1,
            images: 1,
            geoLocation: 1,
            avgRating: { $ifNull: ['$avgRating', 0] },
            memberCount: { $size: { $ifNull: ['$members', []] } },
            minPlanPrice: { $min: '$subscriptionPlans.price' },
            distance: { $divide: ['$distance', 1000] }
          }
        },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: limit }
      ]

      const gyms = await GymModel.aggregate(pipeline).exec()

      const countPipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point' as const,
              coordinates: [userLocation.lng, userLocation.lat] as [
                number,
                number
              ]
            },
            distanceField: 'distance',
            spherical: true,
            query: match
          }
        },
        { $count: 'total' }
      ]
      const countResult = await GymModel.aggregate(countPipeline).exec()
      total = countResult[0]?.total || 0

      return {
        gyms: gyms as GymListingDto[],
        total,
        totalPages: Math.ceil(total / limit)
      }
    } else {
      pipeline = [
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            name: 1,
            profileImage: 1,
            images: 1,
            geoLocation: 1,
            avgRating: { $ifNull: ['$avgRating', 0] },
            memberCount: { $size: { $ifNull: ['$members', []] } },
            minPlanPrice: { $min: '$subscriptionPlans.price' }
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]

      const gyms = await GymModel.aggregate(pipeline).exec()
      total = await GymModel.countDocuments(match)

      return {
        gyms: gyms as GymListingDto[],
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getGymForUser(gymId: string): Promise<IGym | null> {
    return GymModel.findById(gymId)
      .select('-password')
      .populate('trainers')
      .lean()
  }

  async getActiveSubscriptionPlans(
    gymId: string
  ): Promise<ISubscriptionPlan[]> {
    return SubscriptionPlanModel.find({
      gymId: new Types.ObjectId(gymId),
      isActive: true
    }).lean()
  }

  async getMyGymDetails(
    gymId: string,
    userId: string
  ): Promise<MyGymResponseDto | null> {
    const membership = await UserGymMembershipModel.findOne({
      gymId: new Types.ObjectId(gymId),
      userId: new Types.ObjectId(userId)
    })
      .populate<{ planId: ISubscriptionPlan }>('planId')
      .lean()

    if (!membership) return null

    const gym = await GymModel.findById(gymId)
      .select('name email phone profileImage images certificate members')
      .populate<{
        members: {
          _id: string
          name: string
          email: string
          profileImage?: string
          createdAt?: Date
        }[]
      }>('members', 'name email profileImage createdAt')
      .lean()

    if (!gym) return null

    const plan = membership.planId

    const userSubscription: UserSubscription = {
      planName: plan?.name ?? 'N/A',
      planPrice: plan?.price ?? 0,
      planDuration: plan?.duration ?? 0,
      planDurationUnit: plan?.durationUnit ?? 'month',
      subscribedAt: membership.subscriptionStartDate ?? membership.createdAt,
      preferredTime: membership.preferredTime ?? 'Anytime',
    }

    const gymSummary: GymSummary = {
      _id: gym._id.toString(),
      name: gym.name ?? 'Unknown Gym',
      email: gym.email ?? null,
      profileImage: gym.profileImage ?? null,
      images: gym.images ?? null,
      certifications: gym.certifications || null,
      memberCount: gym.members?.length ?? 0,
      rating: (gym as unknown as { avgRating?: number }).avgRating ?? 0
    }

    const members: MemberSummary[] =
      gym.members?.map(m => ({
        _id: m._id.toString(),
        name: m.name,
        email: m.email,
        profileImage: m.profileImage,
        createdAt: m.createdAt
      })) ?? []

    return {
      gym: gymSummary,
      members,
      userSubscription
    }
  }

  async getGymAnnouncementsForUser(
    gymId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    announcements: IGymAnnouncement[]
    total: number
    totalPages: number
  }> {
    const query: {
      gymId: Types.ObjectId
      $or?: Array<{
        title?: { $regex: string; $options: string }
        description?: { $regex: string; $options: string }
      }>
    } = { gymId: new Types.ObjectId(gymId) }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await GymAnnouncementModel.countDocuments(query)
    const announcements = await GymAnnouncementModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title description image createdAt isActive')
      .lean()

    return {
      announcements: announcements as IGymAnnouncement[],
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getGymTotalRevenue(gymId: string): Promise<number> {
    const result = await GymTransactionModel.aggregate([
      { $match: { gymId: new Types.ObjectId(gymId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    return result[0]?.total ?? 0
  }

  async getRecentMembers(
    gymId: string,
    limit: number
  ): Promise<IUserGymMembership[]> {
    return UserGymMembershipModel.find({ gymId: new Types.ObjectId(gymId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .lean() as Promise<IUserGymMembership[]>
  }

  mapToResponseDto(gym: IGym): GymResponseDto {
    return {
      _id: gym._id.toString(),
      role: gym.role,
      name: gym.name!,
      email: gym.email!,
      address: gym.address || undefined,
      description: gym.description || undefined,
      geoLocation: gym.geoLocation!,
      certifications: gym.certifications || [],
      openingHours: gym.openingHours || [],
      verifyStatus: gym.verifyStatus,
      rejectReason: gym.rejectReason || undefined,
      isBanned: gym.isBanned,
      profileImage: gym.profileImage || undefined,
      logo: gym.logo || undefined,
      images: gym.images || undefined,
      trainers: gym.trainers?.map(t => t.toString()) || undefined,
      members: gym.members?.map(m => m.toString()) || undefined,
      announcements:
        gym.announcements?.map(ann => ({
          title: ann.title,
          message: ann.message,
          date: ann.date
        })) || [],
      createdAt: gym.createdAt!,
      updatedAt: gym.updatedAt!
    }
  }
}
