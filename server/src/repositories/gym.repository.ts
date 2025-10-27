import { injectable } from 'inversify'
import mongoose, { Types } from 'mongoose'
import { IGymMemberLean, IGymRepository } from '../core/interfaces/repositories/IGymRepository'
import { IGym, GymModel } from '../models/gym.model'
import {
  ISubscriptionPlan,
  SubscriptionPlanModel
} from '../models/gymSubacriptionPlan.model'
import TrainerModel, { ITrainer } from '../models/trainer.model'
import {
  IUserGymMembership,
  UserGymMembershipModel
} from '../models/userGymMembership.model'
import { IGymQRCode, GymQRCodeModel } from '../models/gymQRCode.model'
import { IGymPayment, GymPaymentModel } from '../models/gymPayment.model'
import {
  IGymAttendance,
  GymAttendanceModel
} from '../models/gymAttendence.model'
import {
  IGymAnnouncement,
  GymAnnouncementModel
} from '../models/gymAnnouncement.model'
import { IUser } from '../models/user.model'
import { GymResponseDto, AnnouncementDto } from '../dtos/gym.dto'
import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { Parser } from 'json2csv'
import PDFDocument from 'pdfkit'

@injectable()
export class GymRepository implements IGymRepository {
  async findByEmail (email: string): Promise<IGym | null> {
    return GymModel.findOne({ email })
  }

  async createGym (data: Partial<IGym>): Promise<IGym> {
    return GymModel.create(data)
  }

  async updateGym (_id: string, data: Partial<IGym>): Promise<IGym | null> {
    return GymModel.findByIdAndUpdate(_id, data, { new: true })
  }

  async findGyms (page: number, limit: number, searchQuery: string) {
    const query: any = {}
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' }
    }

    const total = await GymModel.countDocuments(query)
    const gyms = await GymModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        'name email location isBanned verifyStatus profileImage createdAt'
      )
      .lean()

    return {
      gyms: gyms.map(gym => this.mapToResponseDto(gym as IGym)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async findApplicationById (id: string) {
    const gym = await GymModel.findById(id)
      .select('name email password location certificate profileImage images')
      .lean()
    return gym ? this.mapToResponseDto(gym as IGym) : null
  }

  async updateStatus (
    id: string,
    updateData: Partial<IGym>
  ): Promise<IGym | null> {
    if (updateData.verifyStatus === 'rejected') {
      return await GymModel.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          $inc: { rejectionCount: 1 }
        },
        { new: true }
      )
    }

    return await GymModel.findByIdAndUpdate(id, updateData, { new: true })
  }

  async findById (_id: string): Promise<IGym | null> {
    return GymModel.findById(_id)
  }

  async getGymById (gymId: string): Promise<GymResponseDto | null> {
    const gym = await GymModel.findById(gymId).select('-password')
    return gym ? this.mapToResponseDto(gym) : null
  }

  async getGymTrainers (gymId: string) {
    return GymModel.aggregate([
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
    ]).then(res => res[0]?.trainers || [])
  }

  async getGymMembers (gymId: string) {
    return GymModel.aggregate([
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
    ]).then(res => res[0]?.members || [])
  }

  async getGymAnnouncements (gymId: string): Promise<AnnouncementDto[]> {
    const gym = await GymModel.findById(gymId).select('announcements')
    return (
      gym?.announcements?.map(ann => ({
        title: ann.title,
        message: ann.message,
        date: ann.date
      })) || []
    )
  }

  async createSubscriptionPlan (
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan> {
    return SubscriptionPlanModel.create(data)
  }

  async getSubscriptionPlans (
    gymId: string,
    page: number,
    limit: number,
    search: string
  ) {
    const query: any = { gymId: new Types.ObjectId(gymId) }
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const total = await SubscriptionPlanModel.countDocuments(query)
    const plans = await SubscriptionPlanModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return {
      plans,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateSubscriptionPlan (
    gymId: string,
    planId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan | null> {
    return SubscriptionPlanModel.findOneAndUpdate(
      { _id: planId, gymId: new Types.ObjectId(gymId) },
      data,
      { new: true }
    )
  }

  async deleteSubscriptionPlan (gymId: string, planId: string): Promise<void> {
    const result = await SubscriptionPlanModel.deleteOne({
      _id: planId,
      gymId: new Types.ObjectId(gymId)
    })
    if (result.deletedCount === 0) {
      throw new AppError('Subscription plan not found', STATUS_CODE.NOT_FOUND)
    }
  }

  async createTrainer (data: Partial<ITrainer>): Promise<ITrainer> {
    return TrainerModel.create(data)
  }

  async addTrainerToGym (
    gymId: string,
    trainerId: Types.ObjectId
  ): Promise<void> {
    await GymModel.findByIdAndUpdate(gymId, {
      $addToSet: { trainers: trainerId }
    })
  }

  async getTrainers (
    gymId: string,
    page: number,
    limit: number,
    search: string
  ) {
    const query: any = { gymId: new Types.ObjectId(gymId) }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await TrainerModel.countDocuments(query)
    const trainers = await TrainerModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return {
      trainers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateTrainer (
    gymId: string,
    trainerId: string,
    data: Partial<ITrainer>
  ): Promise<ITrainer | null> {
    return TrainerModel.findOneAndUpdate(
      { _id: trainerId, gymId: new Types.ObjectId(gymId) },
      data,
      { new: true }
    )
  }

  async removeTrainerFromGym (gymId: string, trainerId: string): Promise<void> {
    await GymModel.findByIdAndUpdate(gymId, {
      $pull: { trainers: new Types.ObjectId(trainerId) }
    })
    await TrainerModel.deleteOne({
      _id: trainerId,
      gymId: new Types.ObjectId(gymId)
    })
  }

  async createMembership (
    data: Partial<IUserGymMembership>
  ): Promise<IUserGymMembership> {
    return UserGymMembershipModel.create(data)
  }

  async addMemberToGym (gymId: string, userId: Types.ObjectId): Promise<void> {
    await GymModel.findByIdAndUpdate(gymId, {
      $addToSet: { members: userId }
    })
  }

  async getMembers (
    gymId: string,
    page: number,
    limit: number,
    search: string,
    status: string,
    paymentStatus: string
  ) {
    const membershipQuery = {
      gymId: new Types.ObjectId(gymId),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus })
    }

    const memberships = await UserGymMembershipModel.find(membershipQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IGymMemberLean[]>()

    const userIds = memberships.map(m => m.userId)
    const userQuery = {
      _id: { $in: userIds },
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    }

    const total = await UserGymMembershipModel.countDocuments(membershipQuery)
    const users = (await mongoose
      .model<IUser>('User')
      .find(userQuery)
      .lean()) as IUser[]

    return {
      members: memberships.map(m => ({
        ...m,
        user: users.find(u => u._id.toString() === m.userId.toString())
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateMembership (
    gymId: string,
    memberId: string,
    data: Partial<IUserGymMembership>
  ): Promise<IUserGymMembership | null> {
    return UserGymMembershipModel.findOneAndUpdate(
      { userId: memberId, gymId: new Types.ObjectId(gymId) },
      data,
      { new: true }
    )
  }

  async getMemberAttendance (
    gymId: string,
    memberId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<IGymAttendance[]> {
    const query: any = {
      gymId: new Types.ObjectId(gymId),
      userId: new Types.ObjectId(memberId)
    }
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }
    return GymAttendanceModel.find(query).lean()
  }

  async createQRCode (data: Partial<IGymQRCode>): Promise<IGymQRCode> {
    return GymQRCodeModel.create(data)
  }

  async getQRCodeForDate (
    gymId: string,
    date: Date
  ): Promise<IGymQRCode | null> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    return GymQRCodeModel.findOne({
      gymId: new Types.ObjectId(gymId),
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true
    })
  }

  async getQRCodeById (qrCodeId: string): Promise<IGymQRCode | null> {
    return GymQRCodeModel.findById(qrCodeId)
  }

  async createAttendance (
    data: Partial<IGymAttendance>
  ): Promise<IGymAttendance> {
    return GymAttendanceModel.create(data)
  }

  async getAttendanceReport (
    gymId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ) {
    const query: any = { gymId: new Types.ObjectId(gymId) }
    if (userId) query.userId = new Types.ObjectId(userId)
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    }

    const total = await GymAttendanceModel.countDocuments(query)
    const attendance = await GymAttendanceModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email')
      .lean()

    return {
      attendance,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async createAnnouncement (
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement> {
    return GymAnnouncementModel.create(data)
  }

  async getAnnouncements (
    gymId: string,
    page: number,
    limit: number,
    type: string
  ) {
    const query: any = { gymId: new Types.ObjectId(gymId) }
    if (type) query.type = type

    const total = await GymAnnouncementModel.countDocuments(query)
    const announcements = await GymAnnouncementModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return {
      announcements,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateAnnouncement (
    gymId: string,
    announcementId: string,
    data: Partial<IGymAnnouncement>
  ): Promise<IGymAnnouncement | null> {
    return GymAnnouncementModel.findOneAndUpdate(
      { _id: announcementId, gymId: new Types.ObjectId(gymId) },
      data,
      { new: true }
    )
  }

  async deleteAnnouncement (
    gymId: string,
    announcementId: string
  ): Promise<void> {
    const result = await GymAnnouncementModel.deleteOne({
      _id: announcementId,
      gymId: new Types.ObjectId(gymId)
    })
    if (result.deletedCount === 0) {
      throw new AppError('Announcement not found', STATUS_CODE.NOT_FOUND)
    }
  }

  async createPayment (data: Partial<IGymPayment>): Promise<IGymPayment> {
    return GymPaymentModel.create(data)
  }

  async getPayments (
    gymId: string,
    page: number,
    limit: number,
    search: string,
    paymentMethod: string,
    status: string
  ) {
    const query: any = { gymId: new Types.ObjectId(gymId) }
    if (paymentMethod) query.paymentMethod = paymentMethod
    if (status) query.status = status

    const total = await GymPaymentModel.countDocuments(query)
    const payments = await GymPaymentModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('planId', 'name price')
      .lean()

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getSubscriptionPlanById (
    planId: string
  ): Promise<ISubscriptionPlan | null> {
    return SubscriptionPlanModel.findById(planId)
  }

  async generateReport (
    gymId: string,
    type: string,
    format: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    let data: any[] = []
    let fields: string[] = []

    switch (type) {
      case 'attendance':
        const attendanceQuery: any = { gymId: new Types.ObjectId(gymId) }
        if (startDate && endDate) {
          attendanceQuery.date = { $gte: startDate, $lte: endDate }
        }
        data = await GymAttendanceModel.find(attendanceQuery)
          .populate('userId', 'name email')
          .lean()
        fields = [
          'userId.name',
          'userId.email',
          'date',
          'checkInTime',
          'checkOutTime',
          'markedBy'
        ]
        break

      case 'payments':
        const paymentQuery: any = { gymId: new Types.ObjectId(gymId) }
        if (startDate && endDate) {
          paymentQuery.paymentDate = { $gte: startDate, $lte: endDate }
        }
        data = await GymPaymentModel.find(paymentQuery)
          .populate('userId', 'name email')
          .populate('planId', 'name price')
          .lean()
        fields = [
          'userId.name',
          'userId.email',
          'planId.name',
          'amount',
          'paymentMethod',
          'status',
          'paymentDate'
        ]
        break

      case 'members':
        const membershipQuery: any = { gymId: new Types.ObjectId(gymId) }
        if (startDate && endDate) {
          membershipQuery.joinedAt = { $gte: startDate, $lte: endDate }
        }
        const memberships = await UserGymMembershipModel.find(membershipQuery)
          .populate('userId', 'name email')
          .populate('planId', 'name price')
          .lean()
        data = memberships
        fields = [
          'userId.name',
          'userId.email',
          'planId.name',
          'status',
          'paymentStatus',
          'joinedAt'
        ]
        break

      default:
        throw new AppError('Invalid report type', STATUS_CODE.BAD_REQUEST)
    }

    if (format === 'csv') {
      const parser = new Parser({ fields })
      const csv = parser.parse(data)
      return Buffer.from(csv)
    } else {
      const doc = new PDFDocument()
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.fontSize(12)
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, {
        align: 'center'
      })
      doc.moveDown()

      data.forEach((item, index) => {
        fields.forEach(field => {
          const value =
            field.split('.').reduce((obj, key) => obj?.[key], item) || 'N/A'
          doc.text(`${field}: ${value}`)
        })
        if (index < data.length - 1) doc.moveDown()
      })

      doc.end()
      return Buffer.concat(buffers)
    }
  }

  mapToResponseDto (gym: IGym): GymResponseDto {
    return {
      _id: gym._id.toString(),
      role: gym.role,
      name: gym.name!,
      email: gym.email!,
      location: gym.location!,
      certificate: gym.certificate!,
      verifyStatus: gym.verifyStatus,
      rejectReason: gym.rejectReason || undefined,
      isBanned: gym.isBanned,
      profileImage: gym.profileImage || undefined,
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
