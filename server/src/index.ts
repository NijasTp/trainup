import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger.util";
import { httpServer } from "./app";
import container from "./core/di/inversify.config";
import TYPES from "./core/types/types";
import { NotificationCron } from "./cron/notification.cron";
import { NotificationWorker } from "./workers/notification.worker";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  // Initialize Cron Jobs
  container.get<NotificationCron>(TYPES.NotificationCron);

  // Initialize BullMQ Workers
  new NotificationWorker();

  httpServer.listen(PORT, () => {
    logger.info(` Server running on http://localhost:${PORT}`);
  });
});