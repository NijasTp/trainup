import { injectable } from 'inversify'
import { VideoCallModel, IVideoCall } from '../models/videoCall.model'
import { IVideoCallRepository } from '../core/interfaces/repositories/IVideoCallRepository'
import { logger } from '../utils/logger.util'
import { Types } from 'mongoose'

@injectable()
export class VideoCallRepository implements IVideoCallRepository {
  async create (videoCallData: Partial<IVideoCall>): Promise<IVideoCall> {
    try {
      return await VideoCallModel.create(videoCallData)
    } catch (err) {
      logger.error('Error creating video call in repository:', err)
      throw err
    }
  }

  async findByRoomId (roomId: string): Promise<IVideoCall | null> {
    return await VideoCallModel.findOne({ roomId })
      .populate('slotId', 'trainerId date startTime endTime bookedBy')
      .lean()
  }

  async findBySlotId (slotId: string): Promise<IVideoCall | null> {
    return await VideoCallModel.findOne({ slotId })
      .populate('slotId', 'trainerId date startTime endTime bookedBy')
      .lean()
  }

  async findById (id: string): Promise<IVideoCall | null> {
    return await VideoCallModel.findById(id)
      .populate('slotId', 'trainerId date startTime endTime bookedBy')
      .lean()
  }

  async updateVideoCall (
    id: string,
    updates: Partial<IVideoCall>
  ): Promise<IVideoCall | null> {
    return await VideoCallModel.findByIdAndUpdate(id, updates, { new: true })
      .populate('slotId', 'trainerId date startTime endTime bookedBy')
      .lean()
  }

  async joinCall (
    roomId: string,
    userId: string,
    userType: 'user' | 'trainer'
  ): Promise<IVideoCall | null> {
    const videoCall = await VideoCallModel.findOne({ roomId })
    if (!videoCall) return null

    // Check if user is already in the call
    const existingParticipant = videoCall.participants.find(
      p => p.userId.toString() === userId
    )

    if (existingParticipant) {
      // Reactivate existing participant
      existingParticipant.isActive = true
      existingParticipant.joinedAt = new Date()
      existingParticipant.leftAt = undefined
    } else {
      // Add new participant
      videoCall.participants.push({
        userId: new Types.ObjectId(userId),
        userType,
        joinedAt: new Date(),
        isActive: true
      })
    }

    // Update status to active if this is the first active participant
    const activeCount = videoCall.participants.filter(p => p.isActive).length
    if (
      videoCall.status === 'scheduled' ||
      (videoCall.status === 'ended' && activeCount > 0)
    ) {
      videoCall.status = 'active'
      videoCall.actualStartTime = new Date()
    }

    await videoCall.save()
    return videoCall.populate(
      'slotId',
      'trainerId date startTime endTime bookedBy'
    )
  }

  async leaveCall (roomId: string, userId: string): Promise<IVideoCall | null> {
    const videoCall = await VideoCallModel.findOne({ roomId })
    if (!videoCall) return null

    const participant = videoCall.participants.find(
      p => p.userId.toString() === userId && p.isActive
    )

    if (participant) {
      participant.isActive = false
      participant.leftAt = new Date()
    }

    // Check if all participants have left
    const activeParticipants = videoCall.participants.filter(p => p.isActive)
    if (activeParticipants.length === 0 && videoCall.status === 'active') {
      videoCall.status = 'ended'
      videoCall.actualEndTime = new Date()
    }

    await videoCall.save()
    return videoCall.populate(
      'slotId',
      'trainerId date startTime endTime bookedBy'
    )
  }

  async endCall (roomId: string): Promise<IVideoCall | null> {
    const videoCall = await VideoCallModel.findOne({ roomId })
    if (!videoCall) return null

    videoCall.status = 'ended'
    videoCall.actualEndTime = new Date()

    // Mark all participants as inactive
    videoCall.participants.forEach(participant => {
      if (participant.isActive) {
        participant.isActive = false
        participant.leftAt = new Date()
      }
    })

    await videoCall.save()
    return videoCall.populate(
      'slotId',
      'trainerId date startTime endTime bookedBy'
    )
  }

  async getActiveParticipants (roomId: string): Promise<number> {
    const videoCall = await VideoCallModel.findOne({ roomId })
    if (!videoCall) return 0

    return videoCall.participants.filter(p => p.isActive).length
  }
}
