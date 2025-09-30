import { IMessage } from '../../../models/message.model';

export interface IMessageRepository {
  create(messageData: Partial<IMessage>): Promise<IMessage>;
  findMessages(senderId: string, receiverId: string): Promise<IMessage[]>;
  markAsRead(messageId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}