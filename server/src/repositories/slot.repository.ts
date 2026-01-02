import { injectable } from 'inversify'
import { SlotModel, ISlot } from '../models/slot.model'
import { UserModel } from '../models/user.model'
import { ISlotRepository } from '../core/interfaces/repositories/ISlotRepository'
import { Types, UpdateQuery, QueryOptions, FilterQuery } from 'mongoose'

@injectable()
export class SlotRepository implements ISlotRepository {
  async create(slotData: Partial<ISlot>): Promise<ISlot> {
    return await SlotModel.create(slotData)
  }

  async findById(id: string): Promise<ISlot | null> {
    return await SlotModel.findById(id)
      .populate('trainerId', 'name profileImage')
      .populate('bookedBy', 'name profileImage')
      .populate('requestedBy.userId', 'name profileImage')
  }

  async findByTrainerId(trainerId: string): Promise<ISlot[]> {
    return await SlotModel.find({ trainerId })
      .populate('bookedBy', 'name profileImage')
      .populate('requestedBy.userId', 'name profileImage')
      .sort({ date: 1, startTime: 1 })
  }

  async findByUserId(userId:string){
      return SlotModel.find({bookedBy:userId})
  }

  async findAvailableSlots(userId?: string): Promise<ISlot[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const query: FilterQuery<ISlot> = {
      date: { $gte: today },
      isBooked: false
    }

    if (userId) {
      const user = await UserModel.findById(userId).select('assignedTrainer')
      if (user?.assignedTrainer) {
        query.trainerId = user.assignedTrainer
      } else {
        return []
      }
    }

    return SlotModel.find(query)
      .populate('trainerId', 'name profileImage')
      .sort({ date: 1, startTime: 1 })
  }

  async findUserSessions(userId: string): Promise<ISlot[]> {
    return await SlotModel.find({
      $or: [{ bookedBy: userId }, { 'requestedBy.userId': userId }]
    })
      .populate('trainerId', 'name profileImage')
      .sort({ date: 1, startTime: 1 })
  }

  async findTrainerSessionRequests(trainerId: string): Promise<ISlot[]> {
    return await SlotModel.find({
      trainerId,
      requestedBy: {
        $elemMatch: {
          status: { $in: ['pending', 'approved'] }
        }
      }
    })
      .populate('requestedBy.userId', 'name profileImage')
      .sort({ 'requestedBy.requestedAt': 1 })
  }

  async updateSlot(
    id: string,
    update: UpdateQuery<ISlot>,
    options?: QueryOptions
  ): Promise<ISlot | null> {
    return await SlotModel.findByIdAndUpdate(id, update, { new: true, ...options })
      .populate('trainerId', 'name profileImage')
      .populate('bookedBy', 'name profileImage')
      .populate('requestedBy.userId', 'name profileImage')
  }

  async deleteSlot(id: string): Promise<void> {
    await SlotModel.findByIdAndDelete(id)
  }

  async addBookingRequest(
    slotId: string,
    userId: string
  ): Promise<ISlot | null> {
    return await SlotModel.findByIdAndUpdate(
      slotId,
      {
        $push: {
          requestedBy: {
            userId: new Types.ObjectId(userId),
            requestedAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('trainerId', 'name profileImage')
      .populate('requestedBy.userId', 'name profileImage')
  }

  async checkSlotOverlap(
    trainerId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const existingSlot = await SlotModel.findOne({
      trainerId,
      date: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    })

    return !!existingSlot
  }
  async deleteUnbookedSlotsByWeek(trainerId: string, weekStart: Date): Promise<void> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    await SlotModel.deleteMany({
      trainerId,
      date: { $gte: weekStart, $lt: weekEnd },
      isBooked: false
    });
  }
}