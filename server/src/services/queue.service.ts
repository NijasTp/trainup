import { injectable } from "inversify";
import { Queue, QueueOptions } from "bullmq";
import { IQueueService, IQueueJob } from "../core/interfaces/services/IQueueService";
import { logger } from "../utils/logger.util";
import IORedis from "ioredis";

@injectable()
export class QueueService implements IQueueService {
    private _queues: Map<string, Queue> = new Map();
    private _redisConnection: IORedis;

    constructor() {
        this._redisConnection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                if (times % 10 === 0) {
                    logger.warn("Redis connection failing. Notification queue will be inactive.");
                }
                return Math.min(times * 100, 15000); // Retry with backoff
            }
        });

        this._redisConnection.on("error", (_err) => {
            // Silently catch to prevent process flood, logger will handle via retryStrategy warning
        });
    }

    private _getQueue(name: string): Queue {
        if (!this._queues.has(name)) {
            const queueOptions: QueueOptions = {
                connection: this._redisConnection,
            };
            this._queues.set(name, new Queue(name, queueOptions));
        }
        return this._queues.get(name)!;
    }

    async addJob(queueName: string, job: IQueueJob): Promise<void> {
        if (this._redisConnection.status !== "ready") {
            logger.warn(`Redis not ready. Skipping job ${job.id} in queue ${queueName}`);
            return;
        }
        try {
            const queue = this._getQueue(queueName);
            await queue.add(job.type, job.data, {
                jobId: job.id,
                delay: job.delay,
                removeOnComplete: true,
                removeOnFail: false,
            });
            logger.info(`Job ${job.id} added to queue ${queueName} with delay ${job.delay || 0}ms`);
        } catch (error) {
            logger.error(`Error adding job to queue ${queueName}:`, error);
        }
    }
}
