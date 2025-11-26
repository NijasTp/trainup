import { injectable, inject } from 'inversify'
import { ISlotService } from '../core/interfaces/services/ISlotService'
import { ISlotRepository } from '../core/interfaces/repositories/ISlotRepository'
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
import { ISlot } from '../models/slot.model'
import TYPES from '../core/types/types'

import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { MESSAGES } from '../constants/messages.constants'
import { v4 as uuidv4 } from 'uuid'
import { Types } from 'mongoose'
import { INotificationService } from '../core/interfaces/services/INotificationService'
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository'

@injectable()
export class SlotService implements ISlotService {
  constructor(
    @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ITrainerRepository) private _trainerRepository: ITrainerRepository
  ) { }

  async createSlot(
    trainerId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<ISlot> {
    const start = new Date(`${date.toISOString().split('T')[0]}T${startTime}`)
    const end = new Date(`${date.toISOString().split('T')[0]}T${endTime}`)
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    if (diffHours !== 1) {
      throw new AppError(
        'Session must be exactly 1 hour long',
        STATUS_CODE.BAD_REQUEST
      )
    }

    const hasOverlap = await this._slotRepository.checkSlotOverlap(
      trainerId,
      date,
      startTime,
      endTime
    )
    if (hasOverlap) {
      throw new AppError(MESSAGES.SLOT_OVERLAP, STATUS_CODE.BAD_REQUEST)
    }

    return await this._slotRepository.create({
      trainerId,
      date,
      startTime,
      endTime,
      requestedBy: []
    })
  }

  async getTrainerSlots(trainerId: string): Promise<ISlot[]> {
    return await this._slotRepository.findByTrainerId(trainerId)
  }

  async getAvailableSlots(userId: string): Promise<ISlot[]> {
    return await this._slotRepository.findAvailableSlots(userId)
  }

  async getUserSessions(userId: string): Promise<ISlot[]> {
    return await this._slotRepository.findUserSessions(userId)
  }

  async getTrainerSessionRequests(trainerId: string): Promise<ISlot[]> {
    return await this._slotRepository.findTrainerSessionRequests(trainerId)
  }

  async deleteSlot(slotId: string, trainerId: string): Promise<void> {
    const slot = await this._slotRepository.findById(slotId)
    if (!slot) {
      throw new AppError('Slot not found', STATUS_CODE.NOT_FOUND)
    }

    if (slot.trainerId.toString() !== trainerId) {
      throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN)
    }

    if (slot.isBooked || slot.requestedBy.length > 0) {
      throw new AppError(
        'Cannot delete a slot that has been booked or requested',
        STATUS_CODE.BAD_REQUEST
      )
    }

    await this._slotRepository.deleteSlot(slotId)
  }

  async bookSession(slotId: string, userId: string): Promise<void> {
    const slot = await this._slotRepository.findById(slotId)
    if (!slot) {
      throw new AppError('Slot not found', STATUS_CODE.NOT_FOUND)
    }

    if (slot.isBooked) {
      throw new AppError('This slot is already booked', STATUS_CODE.BAD_REQUEST)
    }

    const alreadyRequested = slot.requestedBy.some(
      req => req.userId.toString() === userId
    )

    if (alreadyRequested) {
      throw new AppError(
        'You have already requested this slot',
        STATUS_CODE.BAD_REQUEST
      )
    }

    const trainerId =
      typeof slot.trainerId === 'object' && '_id' in slot.trainerId
        ? slot.trainerId._id
        : slot.trainerId

    const userPlan = await this._userPlanService.getUserPlan(
      userId,
      trainerId.toString()
    )
    if (!userPlan || userPlan.planType !== 'pro') {
      throw new AppError(
        'Video calls are only available for Pro plan users',
        STATUS_CODE.FORBIDDEN
      )
    }

    if (userPlan.videoCallsLeft <= 0) {
      throw new AppError(
        'No video calls remaining in your plan',
        STATUS_CODE.BAD_REQUEST
      )
    }

    await this._slotRepository.addBookingRequest(slotId, userId)

    await this._notificationService.sendSessionRequestNotification(trainerId.toString(), userId)
  }

  async approveSessionRequest(
    slotId: string,
    userId: string,
    trainerId: string
  ): Promise<void> {
    const slot = await this._slotRepository.findById(slotId)
    if (!slot) {
      throw new AppError('Session request not found', STATUS_CODE.NOT_FOUND)
    }

    const slotTrainerId =
      typeof slot.trainerId === 'object' && slot.trainerId._id
        ? slot.trainerId._id.toString()
        : slot.trainerId.toString()

    if (slotTrainerId !== trainerId) {
      throw new AppError('Unauthorized', STATUS_CODE.FORBIDDEN)
    }

    if (slot.isBooked) {
      throw new AppError('This slot is already booked', STATUS_CODE.BAD_REQUEST)
    }

    const request = slot.requestedBy.find(
      req =>
        (typeof req.userId === 'object' && req.userId._id
          ? req.userId._id.toString()
          : req.userId.toString()) === userId
    )

    if (!request) {
      throw new AppError(
        'No request found from this user for this slot',
        STATUS_CODE.BAD_REQUEST
      )
    }


    const success = await this._userPlanService.decrementVideoCalls(
      userId,
      trainerId
    )
    if (!success) {
      throw new AppError(
        'Failed to process video call request',
        STATUS_CODE.BAD_REQUEST
      )
    }

    const videoCallLink = await this.generateVideoCallLink(slotId)

    const update = {
      isBooked: true,
      bookedBy: new Types.ObjectId(userId),
      videoCallLink,
      $set: {
        'requestedBy.$[selected].status': 'approved',
        'requestedBy.$[others].status': 'rejected',
        'requestedBy.$[others].rejectionReason':
          'Slot approved for another user'
      }
    }

    const arrayFilters = [
      { 'selected.userId': new Types.ObjectId(userId) },
      { 'others.userId': { $ne: new Types.ObjectId(userId) } }
    ]

    await this._slotRepository.updateSlot(slotId, update, { arrayFilters })

    const trainer = await this._trainerRepository.findById(trainerId);
    if (trainer) {
      await this._notificationService.sendSessionResponseNotification(userId, trainer.name, true);
    }
  }

  async rejectSessionRequest(
    slotId: string,
    userId: string,
    trainerId: string,
    rejectionReason: string
  ): Promise<void> {
    const slot = await this._slotRepository.findById(slotId)
    if (!slot) {
      throw new AppError('Session request not found', STATUS_CODE.NOT_FOUND)
    }

    const slotTrainerId =
      typeof slot.trainerId === 'object' && slot.trainerId._id
        ? slot.trainerId._id.toString()
        : slot.trainerId.toString()

    if (slotTrainerId !== trainerId) {
      throw new AppError('Unauthorized', STATUS_CODE.BAD_REQUEST)
    }

    const request = slot.requestedBy.find(
      req =>
        (typeof req.userId === 'object' && req.userId._id
          ? req.userId._id.toString()
          : req.userId.toString()) === userId
    )
    if (!request) {
      throw new AppError(
        'No request found from this user for this slot',
        STATUS_CODE.BAD_REQUEST
      )
    }

    if (request.status !== 'pending') {
      throw new AppError('This request is not pending', STATUS_CODE.BAD_REQUEST)
    }

    const update = {
      $set: {
        'requestedBy.$[elem].status': 'rejected',
        'requestedBy.$[elem].rejectionReason': rejectionReason
      }
    }

    const arrayFilters = [{ 'elem.userId': new Types.ObjectId(userId) }]

    await this._slotRepository.updateSlot(slotId, update, { arrayFilters })

    const trainer = await this._trainerRepository.findById(trainerId);
    if (trainer) {
      await this._notificationService.sendSessionResponseNotification(userId, trainer.name, false, rejectionReason);
    }
  }

  async generateVideoCallLink(slotId: string): Promise<string> {
    const roomId = `session_${slotId}_${uuidv4()}`
    return `${process.env.FRONTEND_URL}/video-call/${roomId}`
  }
}
