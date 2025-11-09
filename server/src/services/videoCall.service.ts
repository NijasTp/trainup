import { injectable, inject } from 'inversify'
import { IVideoCallService } from '../core/interfaces/services/IVideoCallService'
import { IVideoCallRepository } from '../core/interfaces/repositories/IVideoCallRepository'
import { ISlotRepository } from '../core/interfaces/repositories/ISlotRepository'
import { IVideoCall } from '../models/videoCall.model'
import TYPES from '../core/types/types'
import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { MESSAGES } from '../constants/messages.constants'
import { v4 as uuidv4 } from 'uuid'

@injectable()
export class VideoCallService implements IVideoCallService {
  constructor (
    @inject(TYPES.IVideoCallRepository)
    private _videoCallRepository: IVideoCallRepository,
    @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository
  ) {}

  async createVideoCallSession (slotId: string): Promise<IVideoCall> {
    const slot = await this._slotRepository.findById(slotId)
    if (!slot) {
      throw new AppError(MESSAGES.SESSION_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }

    if (!slot.isBooked) {
      throw new AppError('Slot is not booked', STATUS_CODE.BAD_REQUEST)
    }

    // Check if video call already exists for this slot
    const existingCall = await this._videoCallRepository.findBySlotId(slotId)
    if (existingCall) {
      return existingCall
    }

    const roomId = `session_${slotId}_${uuidv4()}`
    const scheduledStartTime = new Date(
      `${slot.date.toISOString().split('T')[0]}T${slot.startTime}`
    )
    const scheduledEndTime = new Date(
      `${slot.date.toISOString().split('T')[0]}T${slot.endTime}`
    )

    const videoCallData = {
      slotId,
      roomId,
      participants: [],
      status: 'scheduled' as const,
      scheduledStartTime,
      scheduledEndTime
    }

    return await this._videoCallRepository.create(videoCallData)
  }

  async joinVideoCall (
    roomId: string,
    userId: string,
    userType: 'user' | 'trainer'
  ): Promise<IVideoCall> {
    const canJoin = await this.canJoinCall(roomId, userId)
    if (!canJoin) {
      throw new AppError(
        MESSAGES.VIDEO_CALL_ACCESS_DENIED,
        STATUS_CODE.FORBIDDEN
      )
    }

    const videoCall = await this._videoCallRepository.findByRoomId(roomId)
    if (!videoCall) {
      throw new AppError(MESSAGES.VIDEO_CALL_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }

    // Allow rejoining ended calls if within scheduled time
    if (videoCall.status === 'ended') {
      const now = new Date()
      if (now > videoCall.scheduledEndTime) {
        throw new AppError(
          MESSAGES.VIDEO_CALL_SESSION_ENDED,
          STATUS_CODE.BAD_REQUEST
        )
      }
    }

    // Check active participants (not total participants)
    const activeParticipants = videoCall.participants.filter(
      p => p.isActive
    ).length
    const isUserAlreadyActive = videoCall.participants.some(
      p => p.userId.toString() === userId && p.isActive
    )

    if (activeParticipants >= 2 && !isUserAlreadyActive) {
      throw new AppError(MESSAGES.VIDEO_CALL_ROOM_FULL, STATUS_CODE.BAD_REQUEST)
    }

    const now = new Date()
    const joinTime = new Date(
      videoCall.scheduledStartTime.getTime() - 10 * 60 * 1000
    )

    if (now < joinTime) {
      throw new AppError(MESSAGES.SESSION_JOIN_EARLY, STATUS_CODE.BAD_REQUEST)
    }

    const joinedCall = await this._videoCallRepository.joinCall(
      roomId,
      userId,
      userType
    )
    if (!joinedCall) {
      throw new AppError(MESSAGES.VIDEO_CALL_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }

    return joinedCall
  }

  async leaveVideoCall (roomId: string, userId: string): Promise<void> {
    const videoCall = await this._videoCallRepository.findByRoomId(roomId)
    if (!videoCall) {
      throw new AppError(MESSAGES.VIDEO_CALL_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }

    await this._videoCallRepository.leaveCall(roomId, userId)
  }

  async getVideoCallByRoomId (roomId: string): Promise<IVideoCall | null> {
    return await this._videoCallRepository.findByRoomId(roomId)
  }

  async getVideoCallBySlotId (slotId: string): Promise<IVideoCall | null> {
    return await this._videoCallRepository.findBySlotId(slotId)
  }

  async canJoinCall (roomId: string, userId: string): Promise<boolean> {
    const videoCall = await this._videoCallRepository.findByRoomId(roomId)
    if (!videoCall) {
      throw new AppError(
        `Video call not found for roomId: ${roomId}`,
        STATUS_CODE.NOT_FOUND
      )
    }

    // Handle populated slotId object
    const slotId =
      typeof videoCall.slotId === 'object' && videoCall.slotId._id
        ? videoCall.slotId._id.toString()
        : videoCall.slotId.toString()

    const slot = await this._slotRepository.findById(slotId)
    if (!slot) {
      throw new AppError(
        `Slot not found for slotId: ${slotId}`,
        STATUS_CODE.NOT_FOUND
      )
    }

    const trainerId =
      typeof slot.trainerId === 'object' && slot.trainerId._id
        ? slot.trainerId._id.toString()
        : slot.trainerId.toString()
    const bookedById =
      typeof slot.bookedBy === 'object' && slot.bookedBy._id
        ? slot.bookedBy._id.toString()
        : slot.bookedBy?.toString()

    return userId === trainerId || userId === bookedById
  }

  async endVideoCall (roomId: string): Promise<void> {
    const videoCall = await this._videoCallRepository.findByRoomId(roomId)
    if (!videoCall) {
      throw new AppError(MESSAGES.VIDEO_CALL_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }

    await this._videoCallRepository.endCall(roomId)
  }

  async getActiveParticipants (roomId: string): Promise<number> {
    return await this._videoCallRepository.getActiveParticipants(roomId)
  }
}
