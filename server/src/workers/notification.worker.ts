import { Worker, Job } from "bullmq";
import container from "../core/di/inversify.config";
import TYPES from "../core/types/types";
import { INotificationService } from "../core/interfaces/services/INotificationService";
import { IEventService } from "../core/interfaces/services/IEventService";
import { logger } from "../utils/logger.util";
import IORedis from "ioredis";

export class NotificationWorker {
    private _worker: Worker;
    private _redisConnection: IORedis;

    constructor() {
        this._redisConnection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                return Math.min(times * 500, 30000);
            }
        });

        this._redisConnection.on("error", () => {
            // Catching to prevent unhandled rejection/flood
        });

        this._worker = new Worker(
            "notifications",
            async (job: Job) => {
                await this._processJob(job);
            },
            {
                connection: this._redisConnection,
            }
        );

        this._worker.on("completed", (job) => {
            logger.info(`Notification job ${job.id} completed`);
        });

        this._worker.on("failed", (job, err) => {
            logger.error(`Notification job ${job?.id} failed:`, err);
        });
    }

    private async _processJob(job: Job) {
        const { recipientId, recipientRole, type, title, message, data } = job.data;

        try {
            const notificationService = container.get<INotificationService>(TYPES.INotificationService);
            const eventService = container.get<IEventService>(TYPES.IEventService);

            // Persist to DB
            const notification = await notificationService.createNotification({
                recipientId,
                recipientRole,
                type,
                title,
                message,
                data,
                priority: "medium",
                category: "info"
            });

            // Emit via Socket
            eventService.emitToUser(recipientId, "notification", notification);

            logger.info(`Notification sent to ${recipientRole} ${recipientId}`);
        } catch (error) {
            logger.error(`Error processing notification job ${job.id}:`, error);
            throw error;
        }
    }
}
