import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId | string;
  recipientId: Types.ObjectId | string;
  recipientRole: 'user' | 'trainer' | 'gym' | 'admin';
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'info' | 'warning' | 'success' | 'error';
  scheduledAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, required: true },
  recipientRole: { type: String, enum: ['user', 'trainer', 'gym', 'admin'], required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  scheduledAt: { type: Date },
  expiresAt: { type: Date },
}, { timestamps: true });

NotificationSchema.index({ recipientId: 1, recipientRole: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ scheduledAt: 1 });
NotificationSchema.index({ expiresAt: 1 });

export const NotificationModel = model<INotification>('Notification', NotificationSchema);