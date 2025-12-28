import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger.util";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error("DB connection failed:", err);
    process.exit(1);
  }
};
