import { Server } from "socket.io";

export interface IEventService {
    setIO(io: Server): void;
    emitToUser(userId: string, event: string, data: any): void;
}
