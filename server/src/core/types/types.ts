
const TYPES = {
  PassportConfig: Symbol.for("PassportConfig"),

  IUserController: Symbol.for("IUserController"),
  IUserService: Symbol.for("IUserService"),
  IUserRepository: Symbol.for("IUserRepository"),
  UserController: Symbol.for("UserController"),
  UserAuthController: Symbol.for("UserAuthController"),
  UserProfileController: Symbol.for("UserProfileController"),
  UserTrainerController: Symbol.for("UserTrainerController"),
  UserGymController: Symbol.for("UserGymController"),
  UserReviewController: Symbol.for("UserReviewController"),
  UserChatController: Symbol.for("UserChatController"),

  IUserPlanRepository: Symbol.for("IUserPlanRepository"),
  IUserPlanService: Symbol.for("IUserPlanService"),

  INotificationRepository: Symbol.for("INotificationRepository"),
  INotificationService: Symbol.for("INotificationService"),
  NotificationController: Symbol.for("NotificationController"),
  NotificationCron: Symbol.for("NotificationCron"),

  ISlotRepository: Symbol.for("ISlotRepository"),
  ISlotService: Symbol.for("ISlotService"),

  IWeeklyScheduleRepository: Symbol.for("IWeeklyScheduleRepository"),
  IWeeklyScheduleService: Symbol.for("IWeeklyScheduleService"),

  IMessageRepository: Symbol.for("IMessageRepository"),
  IMessageService: Symbol.for("IMessageService"),

  IVideoCallRepository: Symbol.for("IVideoCallRepository"),
  IVideoCallService: Symbol.for("IVideoCallService"),
  VideoCallController: Symbol.for("VideoCallController"),

  IStreakRepository: Symbol.for("IStreakRepository"),
  IStreakService: Symbol.for("IStreakService"),
  StreakController: Symbol.for("StreakController"),

  PaymentController: Symbol.for("PaymentController"),
  PaymentTrainerController: Symbol.for("PaymentTrainerController"),
  PaymentGymController: Symbol.for("PaymentGymController"),
  IPaymentRepository: Symbol.for("IPaymentRepository"),
  IPaymentService: Symbol.for("IPaymentService"),

  ITransactionRepository: Symbol.for("ITransactionRepository"),
  ITransactionService: Symbol.for("ITransactionService"),

  TrainerController: Symbol.for("TrainerController"),
  TrainerAuthController: Symbol.for("TrainerAuthController"),
  TrainerScheduleController: Symbol.for("TrainerScheduleController"),
  TrainerClientController: Symbol.for("TrainerClientController"),
  TrainerDashboardController: Symbol.for("TrainerDashboardController"),

  IGymRepository: Symbol.for('IGymRepository'),
  IGymService: Symbol.for("IGymService"),
  GymController: Symbol.for("GymController"),

  IGymReminderService: Symbol.for("IGymReminderService"),
  IGymReminderRepository: Symbol.for("IGymReminderRepository"),

  IAttendanceRepository: Symbol.for("IAttendanceRepository"),
  IAttendanceService: Symbol.for("IAttendanceService"),
  AttendanceController: Symbol.for("AttendanceController"),


  WorkoutTemplateRepository: Symbol.for("WorkoutTemplateRepository"),
  WorkoutSessionRepository: Symbol.for("WorkoutSessionRepository"),
  WorkoutDayRepository: Symbol.for("WorkoutDayRepository"),
  WorkoutService: Symbol.for("WorkoutService"),
  WorkoutController: Symbol.for("WorkoutController"),


  IDietDayRepository: Symbol.for("IDietDayRepository"),
  DietDayRepository: Symbol.for("DietDayRepository"),
  IDietService: Symbol.for("IDietService"),
  DietService: Symbol.for("DietService"),
  TemplateRepository: Symbol.for("TemplateRepository"),
  ITemplateRepository: Symbol.for("ITemplateRepository"),
  TemplateService: Symbol.for("TemplateService"),
  ITemplateService: Symbol.for("ITemplateService"),
  TemplateController: Symbol.for("TemplateController"),
  DietController: Symbol.for("DietController"),

  IAdminService: Symbol.for("IAdminService"),
  IAdminRepository: Symbol.for("IAdminRepository"),
  IAdminController: Symbol.for("IAdminController"),
  AdminController: Symbol.for('AdminController'),
  IOtpRepository: Symbol.for("IOtpRepository"),
  IOtpService: Symbol.for("IOtpService"),
  IJwtService: Symbol.for("IJwtService"),
  OAuthClient: Symbol.for('OAuthClient'),
  IMailService: Symbol.for("IMailService"),
  ITrainerRepository: Symbol.for("ITrainerRepository"),
  ITrainerService: Symbol.for("ITrainerService"),
  IRatingRepository: Symbol.for("IRatingRepository"),
  IRatingService: Symbol.for("IRatingService"),
  IReviewRepository: Symbol.for("IReviewRepository"),
  IReviewService: Symbol.for("IReviewService"),
  IEventService: Symbol.for("IEventService"),
  IProgressRepository: Symbol.for("IProgressRepository"),
  IProgressService: Symbol.for("IProgressService"),
  IQueueService: Symbol.for("IQueueService"),
  SocketHandler: Symbol.for("SocketHandler"),

  // Gym Equipment
  IGymEquipmentRepository: Symbol.for("IGymEquipmentRepository"),
  IGymEquipmentCategoryRepository: Symbol.for("IGymEquipmentCategoryRepository"),
  IGymEquipmentService: Symbol.for("IGymEquipmentService"),
  GymEquipmentController: Symbol.for("GymEquipmentController"),

  // Refund
  IRefundService: Symbol.for("IRefundService"),
};

export default TYPES;
