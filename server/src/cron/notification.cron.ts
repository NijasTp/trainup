import cron from 'node-cron';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { INotificationService } from '../core/interfaces/services/INotificationService';
import { IDietDayRepository } from '../core/interfaces/repositories/IDietRepository';
import { IWorkoutDayRepository } from '../core/interfaces/repositories/IWorkoutDayRepository';
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { ISlotRepository } from '../core/interfaces/repositories/ISlotRepository';
import { logger } from '../utils/logger.util';

@injectable()
export class NotificationCron {
    constructor(
        @inject(TYPES.INotificationService) private _notificationService: INotificationService,
        @inject(TYPES.IDietDayRepository) private _dietRepo: IDietDayRepository,
        @inject(TYPES.WorkoutDayRepository) private _workoutDayRepo: IWorkoutDayRepository,
        @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
        @inject(TYPES.ISlotRepository) private _slotRepo: ISlotRepository
    ) {
        this.initializeCrons();
    }

    private initializeCrons() {
        // Weight Reminder - Daily at 4:00 PM
        cron.schedule('0 16 * * *', async () => {
            await this._notificationService.sendWeightReminderNotifications();
        });

        // Inactivity Checks - Daily at 9:00 AM
        cron.schedule('0 9 * * *', async () => {
            await this.checkInactivity();
        });

        // Video Call Reminders - Every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            await this.checkVideoCallReminders();
        });

        // Gym Attendance Reminders - Every Minute
        cron.schedule('* * * * *', async () => {
            await this.checkGymAttendanceReminders();
        });
    }

    private async checkMealReminders() {
        try {
            // Logic not implemented
        } catch (error) {
            logger.error('Error checking meal reminders:', error);
        }
    }



    private async checkInactivity() {
        try {
            // Logic not implemented
        } catch (error) {
            logger.error('Error checking inactivity:', error);
        }
    }

    private async checkVideoCallReminders() {
        try {
            // Check for slots starting in 10-15 mins
        } catch (error) {
            logger.error('Error checking video call reminders:', error);
        }
    }

    private async checkGymAttendanceReminders() {
        try {
            // Calculate time 10 minutes ago
            const now = new Date();
            const tenMinsAgo = new Date(now.getTime() - 10 * 60000);
            
            // Format to "HH:MM AM/PM"
            let hours = tenMinsAgo.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutes = tenMinsAgo.getMinutes();
            const strMinutes = minutes < 10 ? '0' + minutes : minutes;
            const strHours = hours < 10 ? '0' + hours : hours;
            
            const formattedTime = `${strHours}:${strMinutes} ${ampm}`;
            
            await this._notificationService.sendAttendanceReminders(formattedTime);
        } catch (error) {
            logger.error('Error checking gym attendance reminders:', error);
        }
    }
}
