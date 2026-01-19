import { Server, Socket } from 'socket.io'
import { inject, injectable } from 'inversify'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IUserPlanService } from '../core/interfaces/services/IUserPlanService'
import { IMessageService } from '../core/interfaces/services/IMessageService'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import { ITrainerRepository } from '../core/interfaces/repositories/ITrainerRepository'
import { IAdminRepository } from '../core/interfaces/repositories/IAdminRepository'
import { IGymRepository } from '../core/interfaces/repositories/IGymRepository'
import { logger } from '../utils/logger.util'
import TYPES from '../core/types/types'
import { Role } from '../constants/role'
import { JwtService } from '../utils/jwt'

@injectable()
export class SocketHandler {
  private io: Server

  constructor(
    io: Server,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IUserPlanService) private _userPlanService: IUserPlanService,
    @inject(TYPES.IMessageService) private _messageService: IMessageService,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.ITrainerRepository)
    private _trainerRepository: ITrainerRepository,
    @inject(TYPES.IAdminRepository) private _adminRepository: IAdminRepository,
    @inject(TYPES.IGymRepository) private _gymRepository: IGymRepository
  ) {
    this.io = io
    this.initialize()
  }

  private initialize() {
    logger.info('Socket server initialized')

    this.io.use(async (socket, next) => {
      try {
        const cookieHeader = socket.handshake.headers.cookie
        const token = cookieHeader?.match(/accessToken=([^;]+)/)?.[1]

        if (!token) {
          logger.error('No authentication token provided in cookies')
          return next(new Error('Authentication token required'))
        }

        const decoded = JwtService.verifyToken(token) as JwtPayload
        if (
          !decoded.id ||
          !decoded.role ||
          decoded.tokenVersion === undefined
        ) {
          logger.error('Invalid token payload')
          return next(new Error('Invalid token payload'))
        }

        let account: { tokenVersion: number; isBanned: boolean } | null = null;
        switch (decoded.role) {
          case Role.USER:
            account = (await this._userRepository.findById(decoded.id)) as unknown as { tokenVersion: number; isBanned: boolean } | null
            break
          case Role.TRAINER:
            account = (await this._trainerRepository.findById(decoded.id)) as unknown as { tokenVersion: number; isBanned: boolean } | null
            break
          case Role.ADMIN:
            account = (await this._adminRepository.findById(decoded.id)) as unknown as { tokenVersion: number; isBanned: boolean } | null
            break
          case Role.GYM:
            account = (await this._gymRepository.findById(decoded.id)) as unknown as { tokenVersion: number; isBanned: boolean } | null
            break
          default:
            logger.error(`Invalid role: ${decoded.role}`)
            return next(new Error('Invalid role'))
        }

        if (!account) {
          logger.error(`Account not found for ID: ${decoded.id}`)
          return next(new Error('User not found'))
        }

        if (decoded.tokenVersion !== account.tokenVersion) {
          logger.error(`Invalid token version for ID: ${decoded.id}`)
          return next(new Error('Invalid session'))
        }

        if (account.isBanned) {
          logger.error(`Banned account: ${decoded.id}`)
          return next(new Error('Banned'))
        }

        socket.userId = decoded.id
        socket.userRole = decoded.role
        logger.info(`Socket authenticated for user: ${socket.userId}`)
        next()
      } catch (error) {
        logger.error('Socket authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })

    this.io.on('connection', socket => {
      logger.info(`User connected: ${socket.userId}`)
      socket.join(`user_${socket.userId}`)
      this.handleConnection(socket)
    })
  }

  private handleConnection(socket: Socket) {
    socket.on('join_chat', ({ trainerId, clientId }) => {
      if (!trainerId && !clientId) {
        logger.error('Neither trainer ID nor client ID provided in join_chat')
        socket.emit('error', { message: 'Trainer ID or Client ID is required' })
        return
      }

      const otherUserId = trainerId || clientId
      const ids = [socket.userId, otherUserId].sort()
      const roomId = `chat_${ids[0]}_${ids[1]}`
      socket.join(roomId)
      logger.info(`User ${socket.userId} joined chat room: ${roomId}`)
    })

    socket.on('send_message', async data => {
      try {
        const { trainerId, message, messageType, fileUrl } = data
        logger.info(
          `Received send_message from user ${socket.userId} to trainer ${trainerId}`
        )

        if (!trainerId || (!message?.trim() && !fileUrl)) {
          logger.error('Invalid message data: missing trainerId or content')
          socket.emit('error', {
            message: 'Trainer ID and message content are required'
          })
          return
        }

        const userPlan = await this._userPlanService.getUserPlan(
          socket.userId,
          trainerId
        )
        logger.info(
          `User plan for ${socket.userId}: ${JSON.stringify(userPlan)}`
        )

        if (!userPlan || userPlan.planType === 'basic') {
          logger.error('Basic plan or no plan found')
          socket.emit('error', {
            message: 'Chat not available with Basic plan'
          })
          return
        }

        if (userPlan.planType === 'premium' && userPlan.messagesLeft <= 0) {
          logger.info(`Message limit reached for user ${socket.userId}`)
          socket.emit('message_limit_reached')
          return
        }

        if (userPlan.planType === 'premium') {
          await this._userPlanService.decrementMessages(
            socket.userId,
            trainerId
          )
          logger.info(`Messages decremented for user ${socket.userId}`)
        }

        const savedMessage = await this._messageService.createMessage({
          senderId: socket.userId,
          receiverId: trainerId,
          message: message?.trim() || '',
          senderType: 'user',
          messageType: messageType || 'text',
          fileUrl: fileUrl
        })
        logger.info(`Message saved: ${savedMessage._id}`)

        const messageToSend = {
          ...savedMessage.toObject(),
          senderId: savedMessage.senderId.toString(),
          receiverId: savedMessage.receiverId.toString()
        }

        const ids = [socket.userId, trainerId].sort()
        const roomId = `chat_${ids[0]}_${ids[1]}`
        this.io.to(roomId).emit('new_message', messageToSend)
        logger.info(`Emitted new_message to room: ${roomId}`)
      } catch (error) {
        logger.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('send_message_trainer', async data => {
      try {
        const { clientId, message, messageType, fileUrl } = data
        logger.info(
          `Received send_message_trainer from trainer ${socket.userId} to client ${clientId}`
        )

        if (!clientId || (!message?.trim() && !fileUrl)) {
          logger.error(
            'Invalid trainer message data: missing clientId or content'
          )
          socket.emit('error', {
            message: 'Client ID and message content are required'
          })
          return
        }

        const savedMessage = await this._messageService.createMessage({
          senderId: socket.userId,
          receiverId: clientId,
          message: message?.trim() || '',
          senderType: 'trainer',
          messageType: messageType || 'text',
          fileUrl: fileUrl
        })
        logger.info(`Trainer message saved: ${savedMessage._id}`)

        const messageToSend = {
          ...savedMessage.toObject(),
          senderId: savedMessage.senderId.toString(),
          receiverId: savedMessage.receiverId.toString()
        }

        const ids = [socket.userId, clientId].sort()
        const roomId = `chat_${ids[0]}_${ids[1]}`
        this.io.to(roomId).emit('new_message', messageToSend)
        logger.info(`Emitted new_message to room: ${roomId}`)
      } catch (error) {
        logger.error('Error sending message from trainer:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('typing', ({ clientId, isTyping }) => {
      try {
        const ids = [socket.userId, clientId].sort()
        const roomId = `chat_${ids[0]}_${ids[1]}`
        logger.info(
          `User ${socket.userId} ${isTyping ? 'started' : 'stopped'
          } typing in room: ${roomId}`
        )
        this.io.to(roomId).emit('typing', { userId: socket.userId, isTyping })
      } catch (error) {
        logger.error('Error handling typing event:', error)
        socket.emit('error', { message: 'Failed to process typing status' })
      }
    })

    socket.on('join_video_room', ({ roomId }) => {
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' })
        return
      }

      const videoRoomName = `video_${roomId}`
      const room = this.io.sockets.adapter.rooms.get(videoRoomName)
      const isInitiator = !room || room.size === 0

      socket.join(videoRoomName)

      // Tell the user if they are the initiator
      socket.emit('room_joined', { isInitiator })

      // Notify other users in the room that someone joined
      socket
        .to(videoRoomName)
        .emit('user_joined', { userId: socket.userId })

      logger.info(`User ${socket.userId} joined video room: ${roomId} (Initiator: ${isInitiator})`)
    })

    socket.on('webrtc_offer', ({ roomId, offer, targetUserId }) => {
      logger.info(
        `WebRTC offer from ${socket.userId} to ${targetUserId} in room ${roomId}`
      )
      socket.to(`video_${roomId}`).emit('webrtc_offer', {
        offer,
        fromUserId: socket.userId
      })
    })

    socket.on('webrtc_answer', ({ roomId, answer, targetUserId }) => {
      logger.info(
        `WebRTC answer from ${socket.userId} to ${targetUserId} in room ${roomId}`
      )
      socket.to(`video_${roomId}`).emit('webrtc_answer', {
        answer,
        fromUserId: socket.userId
      })
    })

    socket.on('webrtc_ice_candidate', ({ roomId, candidate, targetUserId }) => {
      logger.info(
        `ICE candidate from ${socket.userId} to ${targetUserId} in room ${roomId}`
      )
      socket.to(`video_${roomId}`).emit('webrtc_ice_candidate', {
        candidate,
        fromUserId: socket.userId
      })
    })

    socket.on('leave_video_room', ({ roomId }) => {
      if (!roomId) return
      socket.leave(`video_${roomId}`)
      socket.to(`video_${roomId}`).emit('user_left', { userId: socket.userId })
      logger.info(`User ${socket.userId} left video room: ${roomId}`)
    })

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`)
    })
  }
}

declare module 'socket.io' {
  interface Socket {
    userId: string
    userRole: string
  }
}
