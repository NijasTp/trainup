
const TYPES = {
  PassportConfig: Symbol.for("PassportConfig"),

  IUserController: Symbol.for("IUserController"),
  IUserService: Symbol.for("IUserService"),
  IUserRepository: Symbol.for("IUserRepository"),
  UserController:Symbol.for("UserController"),

  IUserPlanRepository: Symbol.for("IUserPlanRepository"),
  IUserPlanService: Symbol.for("IUserPlanService"),

  ISlotRepository: Symbol.for("ISlotRepository"),
  ISlotService: Symbol.for("ISlotService"),

  IMessageRepository: Symbol.for("IMessageRepository"),
  IMessageService: Symbol.for("IMessageService"),

  IVideoCallRepository: Symbol.for("IVideoCallRepository"),
  IVideoCallService: Symbol.for("IVideoCallService"),
  VideoCallController: Symbol.for("VideoCallController"),

  IStreakRepository: Symbol.for("IStreakRepository"),
  IStreakService: Symbol.for("IStreakService"),
  StreakController: Symbol.for("StreakController"),

  PaymentController:Symbol.for("PaymentController"),
  IPaymentRepository:Symbol.for("IPaymentRepository"),
  IPaymentService:Symbol.for("IPaymentService"),

  ITransactionRepository:Symbol.for("ITransactionRepository"),
  ITransactionService:Symbol.for("ITransactionService"),
  
  TrainerController:Symbol.for("TrainerController"),

  IGymRepository:Symbol.for('IGymRepository'),
  IGymService:Symbol.for("IGymService"),
  GymController:Symbol.for("GymController"),
  

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
};

export default TYPES;
