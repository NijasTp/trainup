// src/models/message.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  _id: string | Schema.Types.ObjectId;
  senderId: Types.ObjectId | string;
  receiverId: Types.ObjectId | string;
  message: string;
  senderType: 'user' | 'trainer';
  messageType: 'text' | 'image' | 'audio';
  fileUrl?: string;
  readStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, required: true },
  receiverId: { type: Schema.Types.ObjectId, required: true },
  message: { type: String, required: true, trim: true },
  senderType: { type: String, required: true, enum: ['user', 'trainer'] },
  messageType: { type: String, enum: ['text', 'image', 'audio'], default: 'text' },
  fileUrl: { type: String },
  readStatus: { type: Boolean, default: false },
}, { timestamps: true });

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, readStatus: 1 });

export const MessageModel = model<IMessage>('Message', MessageSchema);