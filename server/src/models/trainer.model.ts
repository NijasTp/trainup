import mongoose, { Schema, Document } from 'mongoose'

export interface ITrainer extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  phone: string
  price: string
  isBanned: boolean
  role: 'trainer'
  gymId?: mongoose.Types.ObjectId
  clients: mongoose.Types.ObjectId[]
  bio: string
  location: string
  specialization: string
  tokenVersion?: number
  experience: string
  rating: number
  certificate: string
  isAvailable?: boolean
  profileImage: string
  profileStatus: 'pending' | 'approved' | 'rejected' | 'suspended'
  rejectReason: string
  createdAt: Date
  updatedAt: Date
}

const TrainerSchema: Schema<ITrainer> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    price: { type: String, required: true },
    isBanned: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    role: { type: String, default: 'trainer' },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    specialization: { type: String, default: '' },
    tokenVersion: { type: Number, default: 0 },
    experience: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    certificate: { type: String, required:true },
    profileImage: { type: String },
    profileStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'suspended'],
      default: 'pending'
    },
    rejectReason: { type: String }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ITrainer>('Trainer', TrainerSchema)
