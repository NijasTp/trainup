import { injectable } from "inversify";
import { Server } from "socket.io";
import { IEventService } from "../core/interfaces/services/IEventService";

@injectable()
export class EventService implements IEventService {
    private _io: Server | null = null;

    setIO(io: Server): void {
        this._io = io;
    }

    emitToUser(userId: string, event: string, data: any): void {
        if (!this._io) {
            console.warn("Socket.io instance not set in EventService");
            return;
        }
        this._io.to(`user_${userId}`).emit(event, data);
    }
}
