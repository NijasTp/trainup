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

import { ICronService } from "./core/interfaces/services/ICronService";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  // Initialize Cron Jobs
  container.get<NotificationCron>(TYPES.NotificationCron);
  container.get(TYPES.GymAttendanceCron);
  container.get(TYPES.SubscriptionExpiryCron);
  
  const cronService = container.get<ICronService>(TYPES.ICronService);
  cronService.startJobs();

  // Initialize BullMQ Workers
  new NotificationWorker();

  httpServer.listen(PORT, () => {
    logger.info(` Server running on ${process.env.PROJECT_URL_BACKEND}`);
  });
});