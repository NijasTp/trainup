
import { injectable } from 'inversify';
import { Types } from 'mongoose';
import { MessageModel, IMessage } from '../models/message.model';
import { IMessageRepository } from '../core/interfaces/repositories/IMessageRepository';
import { logger } from '../utils/logger.util';

@injectable()
export class MessageRepository implements IMessageRepository {
  async create(messageData: Partial<IMessage>): Promise<IMessage> {
    try {
      return await MessageModel.create(messageData);
    } catch (err) {
      logger.error('Error creating message in repository:', err);
      throw err;
    }
  }

  async findMessages(senderId: string, receiverId: string): Promise<IMessage[]> {
    return await MessageModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean()
      .then(messages =>
        messages.map(msg => ({
          ...msg,
          senderId: msg.senderId.toString(),
          receiverId: msg.receiverId.toString()
        }))
      );
  }

  async markAsRead(messageId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, { readStatus: true });
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await MessageModel.updateMany(
      { senderId, receiverId, readStatus: false },
      { $set: { readStatus: true } }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await MessageModel.countDocuments({
      receiverId: userId,
      readStatus: false
    });
  }

  async getUnreadCountsBySender(receiverId: string): Promise<{ senderId: string; count: number }[]> {
    const result = await MessageModel.aggregate([
      {
        $match: {
          receiverId: new Types.ObjectId(receiverId),
          readStatus: false
        }
      },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 }
        }
      }
    ]);
    // The match with 'new Object(receiverId)' might fail if not imported 'mongoose'.
    // Better to rely on however mongoose acts. Usually we cast to Types.ObjectId.
    // However, let's fix imports first if needed.
    return result.map(item => ({
      senderId: item._id.toString(),
      count: item.count
    }));
  }
}