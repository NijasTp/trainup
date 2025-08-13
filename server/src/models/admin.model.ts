import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin";
  tokenVersion?:number;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema: Schema<IAdmin> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AdminModel: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);
export default AdminModel;