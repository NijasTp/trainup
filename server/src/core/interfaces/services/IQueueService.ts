export interface IQueueJob {
    id: string;
    type: string;
    data: unknown;
    delay?: number;
}

export interface IQueueService {
    addJob(queueName: string, job: IQueueJob): Promise<void>;
}
