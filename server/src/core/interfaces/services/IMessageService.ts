import { IMessage } from '../../../models/message.model';

export interface IMessageService {
  createMessage(messageData: Partial<IMessage>): Promise<IMessage>;
  getMessages(senderId: string, receiverId: string): Promise<IMessage[]>;
  markAsRead(messageId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}