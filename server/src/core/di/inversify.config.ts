import { Container } from "inversify";
import TYPES from "../types/types";

import { OAuthClient } from "../../utils/OAuthClient";

// Interfaces
import { IUserService } from "../interfaces/services/IUserService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IAdminService } from "../interfaces/services/IAdminService";
import { IAdminRepository } from "../interfaces/repositories/IAdminRepository";
import { IOTPService } from "../interfaces/services/IOtpService";
import { IOtpRepository } from "../interfaces/repositories/IOtpRepository";
import { IMailService } from "../interfaces/services/IMailService";
import { ITrainerRepository } from "../interfaces/repositories/ITrainerRepository";
import { ITrainerService } from "../interfaces/services/ITrainerService";
import { IGymService } from "../interfaces/services/IGymService";
import { IGymRepository } from "../interfaces/repositories/IGymRepository";
import { IJwtService } from "../interfaces/services/IJwtService";
import { IWorkoutSessionRepository } from "../interfaces/repositories/IWorkoutSessionRepository";
import { IWorkoutDayRepository } from "../interfaces/repositories/IWorkoutDayRepository";
import { IWorkoutService } from "../interfaces/services/IWorkoutService";
import { IWorkoutTemplateRepository } from "../interfaces/repositories/IWorkoutTemplateRepository";
import { ITemplateRepository } from "../interfaces/repositories/IDietTemplateRepository";
import { IPaymentRepository } from "../interfaces/repositories/IPaymentRepository";
import { IPaymentService } from "../interfaces/services/IPaymentService";
import { IStreakService } from "../interfaces/services/IStreakService";
import { IStreakRepository } from "../interfaces/repositories/IStreakRepository";
import { IDietDayRepository } from "../interfaces/repositories/IDietRepository";
import { IDietService } from "../interfaces/services/IDietService";
import { ITemplateService } from "../interfaces/services/ITemplateService";
import { ITransactionRepository } from "../interfaces/repositories/ITransactionRepository";
import { TransactionService } from "../../services/transaction.service";
import { ITransactionService } from "../interfaces/services/ITransactionService";
import { IUserPlanRepository } from "../interfaces/repositories/IUserPlanRepository";
import { IUserPlanService } from "../interfaces/services/IUserPlanService";
import { ISlotRepository } from "../interfaces/repositories/ISlotRepository";
import { ISlotService } from "../interfaces/services/ISlotService";
import { IMessageRepository } from "../interfaces/repositories/IMessageRepository";
import { IMessageService } from "../interfaces/services/IMessageService";
import { IVideoCallService } from "../interfaces/services/IVideoCallService";
import { IVideoCallRepository } from "../interfaces/repositories/IVideoCallRepository";
import { IProgressRepository } from "../interfaces/repositories/IProgressRepository";
import { IProgressService } from "../interfaces/services/IProgressService";
import { IWalletRepository } from "../interfaces/repositories/IWalletRepository";


// Implementations

import { UserService } from "../../services/user.service";
import { UserRepository } from "../../repositories/user.repository";
import { AdminService } from "../../services/admin.service";
import { AdminRepository } from "../../repositories/admin.repository";
import { OtpService } from "../../services/otp.service";
import { OtpRepository } from "../../repositories/otp.repository";
import { JwtService } from "../../utils/jwt";
import { UserController } from "../../controllers/user.controller";
import { UserAuthController } from "../../controllers/user.auth.controller";
import { UserProfileController } from "../../controllers/user.profile.controller";
import { UserTrainerController } from "../../controllers/user.trainer.controller";
import { UserGymController } from "../../controllers/user.gym.controller";
import { UserReviewController } from "../../controllers/user.review.controller";
import { UserChatController } from "../../controllers/user.chat.controller";
import { AdminController } from "../../controllers/admin.controller";
import { MailService } from "../../services/mail.service";
import { TrainerRepository } from "../../repositories/trainer.repository";
import { TrainerService } from "../../services/trainer.service";
import { TrainerController } from "../../controllers/trainer.controller";
import { TrainerAuthController } from "../../controllers/trainer.auth.controller";
import { TrainerScheduleController } from "../../controllers/trainer.schedule.controller";
import { TrainerClientController } from "../../controllers/trainer.client.controller";
import { TrainerDashboardController } from "../../controllers/trainer.dashboard.controller";
import { GymController } from "../../controllers/gym.controller";
import { GymRepository } from "../../repositories/gym.repository";
import { GymService } from "../../services/gym.service";
import { PassportConfig } from "../../config/passport";
import { WorkoutController } from "../../controllers/workout.controller";
import { WorkoutService } from "../../services/workout.service";
import { WorkoutDayRepository } from "../../repositories/workoutDay.repository";
import { WorkoutTemplateRepository } from "../../repositories/workoutTemplate.repository";
import { WorkoutSessionRepository } from "../../repositories/workout.repository";
import { DietDayRepository } from "../../repositories/diet.repository";
import { DietService } from "../../services/diet.service";
import { TemplateRepository } from "../../repositories/dietTemplate.repository";
import { TemplateService } from "../../services/template.service";
import { DietController } from "../../controllers/diet.controller";
import { TemplateController } from "../../controllers/template.controller";
import { PaymentRepository } from "../../repositories/payment.repository";
import { PaymentService } from "../../services/payment.service";
import { PaymentController } from "../../controllers/payment.controller";
import { PaymentTrainerController } from "../../controllers/payment.trainer.controller";
import { PaymentGymController } from "../../controllers/payment.gym.controller";
import { StreakService } from "../../services/streak.service";
import { StreakRepository } from "../../repositories/streak.repository";
import { TransactionRepository } from "../../repositories/transaction.repository";
import { UserPlanRepository } from "../../repositories/userPlan.repository";
import { UserPlanService } from "../../services/userPlan.service";
import { SlotRepository } from "../../repositories/slot.repository";
import { SlotService } from "../../services/slot.service";
import { MessageRepository } from "../../repositories/message.repository";
import { MessageService } from "../../services/message.service";
import { VideoCallController } from "../../controllers/videoCall.controller";
import { VideoCallRepository } from "../../repositories/videoCall.repository";
import { VideoCallService } from "../../services/videoCall.service";
import { WeeklyScheduleRepository } from "../../repositories/weeklySchedule.repository";
import { IWeeklyScheduleRepository } from "../interfaces/repositories/IWeeklyScheduleRepository";
import { WeeklyScheduleService } from "../../services/weeklySchedule.service";
import { IWeeklyScheduleService } from "../interfaces/services/IWeeklyScheduleService";
import { IGymReminderService } from "../interfaces/services/IGymReminderService";
import { GymReminderService } from "../../services/gymReminder.service";
import { IGymReminderRepository } from "../interfaces/repositories/IGymReminderRepository";
import { GymReminderRepository } from "../../repositories/gymReminder.repository";
import { AttendanceRepository } from "../../repositories/gymAttendance.repository";
import { IAttendanceRepository } from "../interfaces/repositories/IAttendanceRepository";
import { AttendanceService } from "../../services/gymAttendence.service";
import { IAttendanceService } from "../interfaces/services/IAttendanceService";
import { AttendanceController } from "../../controllers/gymAttendance.controller";
import { INotificationRepository } from "../interfaces/repositories/INotificationRepository";
import { NotificationRepository } from "../../repositories/notification.repository";
import { INotificationService } from "../interfaces/services/INotificationService";
import { NotificationService } from "../../services/notification.service";
import { NotificationController } from "../../controllers/notification.controller";
import { IRatingRepository } from "../interfaces/repositories/IRatingRepository";
import { IRatingService } from "../interfaces/services/IRatingService";
import { RatingRepository } from "../../repositories/rating.repository";
import { RatingService } from "../../services/rating.service";
import { ProgressRepository } from "../../repositories/progress.repository";
import { ProgressService } from "../../services/progress.service";
import { ReviewRepository } from "../../repositories/review.repository";
import { ReviewService } from "../../services/review.service";
import { IReviewRepository } from "../interfaces/repositories/IReviewRepository";
import { IReviewService } from "../interfaces/services/IReviewService";
import { IQueueService } from "../interfaces/services/IQueueService";
import { QueueService } from "../../services/queue.service";
import { SocketHandler } from "../../utils/socketHandler.util";
import { WalletRepository } from "../../repositories/wallet.repository";



import { NotificationCron } from "../../cron/notification.cron";

// Create container 
const container = new Container();

// Bindings
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<UserAuthController>(TYPES.UserAuthController).to(UserAuthController);
container.bind<UserProfileController>(TYPES.UserProfileController).to(UserProfileController);
container.bind<UserTrainerController>(TYPES.UserTrainerController).to(UserTrainerController);
container.bind<UserGymController>(TYPES.UserGymController).to(UserGymController);
container.bind<UserReviewController>(TYPES.UserReviewController).to(UserReviewController);
container.bind<UserChatController>(TYPES.UserChatController).to(UserChatController);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

container.bind<INotificationRepository>(TYPES.INotificationRepository).to(NotificationRepository);
container.bind<INotificationService>(TYPES.INotificationService).to(NotificationService);
container.bind<NotificationController>(TYPES.NotificationController).to(NotificationController);
container.bind<NotificationCron>(TYPES.NotificationCron).to(NotificationCron);


container.bind<IUserPlanRepository>(TYPES.IUserPlanRepository).to(UserPlanRepository);
container.bind<IUserPlanService>(TYPES.IUserPlanService).to(UserPlanService);

container.bind<ISlotRepository>(TYPES.ISlotRepository).to(SlotRepository)
container.bind<ISlotService>(TYPES.ISlotService).to(SlotService)

container.bind<IWeeklyScheduleRepository>(TYPES.IWeeklyScheduleRepository).to(WeeklyScheduleRepository)
container.bind<IWeeklyScheduleService>(TYPES.IWeeklyScheduleService).to(WeeklyScheduleService)

container.bind<IMessageRepository>(TYPES.IMessageRepository).to(MessageRepository)
container.bind<IMessageService>(TYPES.IMessageService).to(MessageService)

container.bind<IVideoCallRepository>(TYPES.IVideoCallRepository).to(VideoCallRepository)
container.bind<IVideoCallService>(TYPES.IVideoCallService).to(VideoCallService)
container.bind<VideoCallController>(TYPES.VideoCallController).to(VideoCallController)

container.bind<OAuthClient>(TYPES.OAuthClient).to(OAuthClient);
container.bind<PassportConfig>(TYPES.PassportConfig).to(PassportConfig).inSingletonScope();

container.bind<ITransactionRepository>(TYPES.ITransactionRepository).to(TransactionRepository);
container.bind<ITransactionService>(TYPES.ITransactionService).to(TransactionService);

container.bind<IStreakService>(TYPES.IStreakService).to(StreakService);
container.bind<IStreakRepository>(TYPES.IStreakRepository).to(StreakRepository);

container.bind<IPaymentRepository>(TYPES.IPaymentRepository).to(PaymentRepository);
container.bind<IPaymentService>(TYPES.IPaymentService).to(PaymentService);
container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController);
container.bind<PaymentTrainerController>(TYPES.PaymentTrainerController).to(PaymentTrainerController);
container.bind<PaymentGymController>(TYPES.PaymentGymController).to(PaymentGymController);

container.bind<TrainerController>(TYPES.TrainerController).to(TrainerController)
container.bind<TrainerAuthController>(TYPES.TrainerAuthController).to(TrainerAuthController)
container.bind<TrainerScheduleController>(TYPES.TrainerScheduleController).to(TrainerScheduleController)
container.bind<TrainerClientController>(TYPES.TrainerClientController).to(TrainerClientController)
container.bind<TrainerDashboardController>(TYPES.TrainerDashboardController).to(TrainerDashboardController)
container.bind<ITrainerRepository>(TYPES.ITrainerRepository).to(TrainerRepository);
container.bind<ITrainerService>(TYPES.ITrainerService).to(TrainerService);

container.bind<GymController>(TYPES.GymController).to(GymController)
container.bind<IGymRepository>(TYPES.IGymRepository).to(GymRepository);
container.bind<IGymService>(TYPES.IGymService).to(GymService);

container.bind<IGymReminderService>(TYPES.IGymReminderService).to(GymReminderService);
container.bind<IGymReminderRepository>(TYPES.IGymReminderRepository).to(GymReminderRepository);

container.bind<IAttendanceRepository>(TYPES.IAttendanceRepository).to(AttendanceRepository);
container.bind<IAttendanceService>(TYPES.IAttendanceService).to(AttendanceService);
container.bind<AttendanceController>(TYPES.AttendanceController).to(AttendanceController);

container.bind<AdminController>(TYPES.AdminController).to(AdminController);
container.bind<IAdminService>(TYPES.IAdminService).to(AdminService);
container.bind<IAdminRepository>(TYPES.IAdminRepository).to(AdminRepository);

container.bind<IWorkoutSessionRepository>(TYPES.WorkoutSessionRepository).to(WorkoutSessionRepository);
container.bind<IWorkoutTemplateRepository>(TYPES.WorkoutTemplateRepository).to(WorkoutTemplateRepository);
container.bind<IWorkoutDayRepository>(TYPES.WorkoutDayRepository).to(WorkoutDayRepository);
container.bind<IWorkoutService>(TYPES.WorkoutService).to(WorkoutService);
container.bind<WorkoutController>(TYPES.WorkoutController).to(WorkoutController);

container.bind<IDietDayRepository>(TYPES.IDietDayRepository).to(DietDayRepository);
container.bind<IDietService>(TYPES.IDietService).to(DietService);
container.bind<ITemplateRepository>(TYPES.ITemplateRepository).to(TemplateRepository);
container.bind<ITemplateService>(TYPES.ITemplateService).to(TemplateService);
container.bind<TemplateController>(TYPES.TemplateController).to(TemplateController);
container.bind<DietController>(TYPES.DietController).to(DietController);

container.bind<IOTPService>(TYPES.IOtpService).to(OtpService);
container.bind<IOtpRepository>(TYPES.IOtpRepository).to(OtpRepository);
container.bind<IJwtService>(TYPES.IJwtService).to(JwtService)
container.bind<IMailService>(TYPES.IMailService).to(MailService);


container.bind<IRatingRepository>(TYPES.IRatingRepository).to(RatingRepository);
container.bind<IRatingService>(TYPES.IRatingService).to(RatingService);




import { IEventService } from "../interfaces/services/IEventService";
import { EventService } from "../../services/event.service";

container.bind<IEventService>(TYPES.IEventService).to(EventService).inSingletonScope();

container.bind<IProgressRepository>(TYPES.IProgressRepository).to(ProgressRepository);
container.bind<IProgressService>(TYPES.IProgressService).to(ProgressService);

container.bind<IReviewRepository>(TYPES.IReviewRepository).to(ReviewRepository);
container.bind<IReviewService>(TYPES.IReviewService).to(ReviewService);

container.bind<IQueueService>(TYPES.IQueueService).to(QueueService).inSingletonScope();
container.bind<SocketHandler>(TYPES.SocketHandler).to(SocketHandler).inSingletonScope();

// Gym Equipment
import { IGymEquipmentRepository } from "../interfaces/repositories/IGymEquipmentRepository";
import { IGymEquipmentCategoryRepository } from "../interfaces/repositories/IGymEquipmentCategoryRepository";
import { IGymEquipmentService } from "../interfaces/services/IGymEquipmentService";
import { GymEquipmentRepository } from "../../repositories/gymEquipment.repository";
import { GymEquipmentCategoryRepository } from "../../repositories/gymEquipmentCategory.repository";
import { GymEquipmentService } from "../../services/gymEquipment.service";
import { GymEquipmentController } from "../../controllers/gymEquipment.controller";

container.bind<IGymEquipmentRepository>(TYPES.IGymEquipmentRepository).to(GymEquipmentRepository);
container.bind<IGymEquipmentCategoryRepository>(TYPES.IGymEquipmentCategoryRepository).to(GymEquipmentCategoryRepository);
container.bind<IGymEquipmentService>(TYPES.IGymEquipmentService).to(GymEquipmentService);
container.bind<GymEquipmentController>(TYPES.GymEquipmentController).to(GymEquipmentController);

// Refund
import { IRefundService } from "../interfaces/services/IRefundService";
import { RefundService } from "../../services/refund.service";
container.bind<IRefundService>(TYPES.IRefundService).to(RefundService);

// Gym Auth (Pre-registration)
import { IGymAuthService } from "../interfaces/services/IGymAuthService";
import { GymAuthService } from "../../services/gymAuth.service";
import { GymAuthController } from "../../controllers/gym.auth.controller";

container.bind<IGymAuthService>(TYPES.IGymAuthService).to(GymAuthService).inSingletonScope();
container.bind<GymAuthController>(TYPES.GymAuthController).to(GymAuthController).inSingletonScope();

container.bind<IWalletRepository>(TYPES.IWalletRepository).to(WalletRepository).inSingletonScope();


export default container;

