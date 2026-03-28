import cron from 'node-cron';
import { injectable, inject } from 'inversify';
import TYPES from '../core/types/types';
import { IUserGymMembershipRepository } from '../core/interfaces/repositories/IUserGymMembershipRepository';
import { IAttendanceRepository } from '../core/interfaces/repositories/IAttendanceRepository';
import { IMailService } from '../core/interfaces/services/IMailService';
import { logger } from '../utils/logger.util';
import { format, subMinutes } from 'date-fns';

@injectable()
export class GymAttendanceCron {
    constructor(
        @inject(TYPES.IUserGymMembershipRepository) private _membershipRepo: IUserGymMembershipRepository,
        @inject(TYPES.IAttendanceRepository) private _attendanceRepo: IAttendanceRepository,
        @inject(TYPES.IMailService) private _mailService: IMailService
    ) {
        logger.info('GymAttendanceCron initialized - Monitoring attendance reminders every minute.');
        this.initializeCrons();
    }

    private initializeCrons() {
        // Attendance Reminder - Every minute
        // This will check for users whose preferred time was 10 minutes ago
        cron.schedule('* * * * *', async () => {
            await this.checkAttendanceAndRemind();
        });
    }

    private async checkAttendanceAndRemind() {
        try {
            // Get time 10 minutes ago
            const tenMinsAgo = subMinutes(new Date(), 10);
            const timeToMatch = format(tenMinsAgo, 'hh:00 a'); // We only have hourly slots in the UI: "06:00 PM"
            
            // Note: If the user selects e.g. 06:00 PM, we check at 06:10 PM.
            // But format(tenMinsAgo, 'hh:00 a') at 06:10 PM will be "06:00 PM".
            // Since our UI only allows "05:00 AM", "06:00 AM" etc., we match on these.
            
            const currentMinute = tenMinsAgo.getMinutes();
            // Only run the actual check when currentMinute is 0 (meaning it's exactly 10 mins after an hour slot)
            if (currentMinute !== 0) return;

            logger.info(`Running attendance check for preferred time: ${timeToMatch}`);

            const memberships = await this._membershipRepo.findActiveByPreferredTime(timeToMatch);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const membership of memberships) {
                const attended = await this._attendanceRepo.findTodayAttendance(
                    membership.userId.toString(),
                    membership.gymId.toString(),
                    today
                );

                if (!attended) {
                    const user = membership.userId as unknown as { name: string, email: string };
                    const gym = membership.gymId as unknown as { name: string };
                    
                    logger.info(`Sending attendance reminder to ${user.email} for ${gym.name}`);
                    
                    await this._mailService.sendReminderMail(
                        user.email,
                        `Hey ${user.name}, you haven't hit the gym today! Your preferred time was ${membership.preferredTime}. Don't miss out on your progress at ${gym.name}!`
                    );
                }
            }
        } catch (error) {
            logger.error('Error in GymAttendanceCron:', error);
        }
    }
}
