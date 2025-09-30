import { injectable, inject } from 'inversify';
import { IMessageService } from '../core/interfaces/services/IMessageService';
import { IMessageRepository } from '../core/interfaces/repositories/IMessageRepository';
import { IMessage } from '../models/message.model';
import TYPES from '../core/types/types';

@injectable()
export class MessageService implements IMessageService {
  constructor(
    @inject(TYPES.IMessageRepository) private _messageRepository: IMessageRepository
  ) {}

  async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
    return await this._messageRepository.create(messageData);
  }

  async getMessages(senderId: string, receiverId: string): Promise<IMessage[]> {
    return await this._messageRepository.findMessages(senderId, receiverId);
  }

  async markAsRead(messageId: string): Promise<void> {
    await this._messageRepository.markAsRead(messageId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this._messageRepository.getUnreadCount(userId);
  }
}