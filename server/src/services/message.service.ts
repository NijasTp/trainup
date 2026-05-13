import { injectable, inject } from 'inversify';
import { IMessageService } from '../core/interfaces/services/IMessageService';
import { IMessageRepository } from '../core/interfaces/repositories/IMessageRepository';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { IMessage } from '../models/message.model';
import TYPES from '../core/types/types';

@injectable()
export class MessageService implements IMessageService {
  constructor(
    @inject(TYPES.IMessageRepository) private _messageRepository: IMessageRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService
  ) { }

  async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
    return await this._messageRepository.create(messageData);
  }

  async getMessages(senderId: string, receiverId: string): Promise<IMessage[]> {
    return await this._messageRepository.findMessages(senderId, receiverId);
  }

  async markAsRead(messageId: string): Promise<void> {
    await this._messageRepository.markAsRead(messageId);
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await this._messageRepository.markMessagesAsRead(senderId, receiverId);
    
    // Also clear unread_chat notifications for the receiver (who is now reading the messages)
    // Actually, receiverId in this context is the one who SENT the messages being read? 
    // Wait, let's check the call site. Usually markMessagesAsRead(senderId, receiverId) means marks messages FROM sender TO receiver as read.
    // So the 'receiver' is the one reading.
    await this._notificationService.markNotificationsByTypeAsRead(receiverId, 'user', 'unread_chat');
    await this._notificationService.markNotificationsByTypeAsRead(receiverId, 'trainer', 'unread_chat');
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this._messageRepository.getUnreadCount(userId);
  }

  async getUnreadCountsBySender(receiverId: string): Promise<{ senderId: string; count: number }[]> {
    return await this._messageRepository.getUnreadCountsBySender(receiverId);
  }

  async getConversations(userId: string): Promise<unknown[]> {
    return await this._messageRepository.getConversations(userId);
  }

  async getRecipientsWithUnreadMessages(): Promise<{ recipientId: string; recipientRole: 'user' | 'trainer' }[]> {
    return await this._messageRepository.getRecipientsWithUnreadMessages();
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this._messageRepository.deleteMessage(messageId);
  }
}