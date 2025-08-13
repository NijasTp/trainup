
const TYPES = {
  PassportConfig: Symbol.for("PassportConfig"),

  IUserController: Symbol.for("IUserController"),
  IUserService: Symbol.for("IUserService"),
  IUserRepository: Symbol.for("IUserRepository"),
  UserController:Symbol.for("UserController"),
  
  TrainerController:Symbol.for("TrainerController"),

  IGymRepository:Symbol.for('IGymRepository'),
  IGymService:Symbol.for("IGymService"),
  GymController:Symbol.for("GymController"),

  WorkoutSessionRepository: Symbol.for("WorkoutSessionRepository"),
  WorkoutDayRepository: Symbol.for("WorkoutDayRepository"),
  WorkoutService: Symbol.for("WorkoutService"),
  WorkoutController: Symbol.for("WorkoutController"),
  
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
