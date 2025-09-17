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
import { IAdminController } from "../interfaces/controllers/IAdminController";
import { IGymService } from "../interfaces/services/IGymService";
import { IGymRepository } from "../interfaces/repositories/IGymRepository";
import { IJwtService } from "../interfaces/services/IJwtService";
import { IWorkoutSessionRepository } from "../interfaces/repositories/IWorkoutSessionRepository";
import { IWorkoutDayRepository } from "../interfaces/repositories/IWorkoutDayRepository";
import { IWorkoutService } from "../interfaces/services/IWorkoutService";
import { ITemplateRepository } from "../interfaces/repositories/IDietTemplateRepository";
import { IPaymentRepository } from "../interfaces/repositories/IPaymentRepository";
import { IPaymentService } from "../interfaces/services/IPaymentService";
import { IStreakService } from "../interfaces/services/IStreakService";
import { IStreakRepository } from "../interfaces/repositories/IStreakRepository";

// Implementations

import { UserService } from "../../services/user.service";
import { UserRepository } from "../../repositories/user.repository";
import { AdminService } from "../../services/admin.service";
import { AdminRepository } from "../../repositories/admin.repository";
import { OtpService } from "../../services/otp.service";
import { OtpRepository } from "../../repositories/otp.repository";
import { JwtService } from "../../utils/jwt";
import { UserController } from "../../controllers/user.controller";
import { AdminController } from "../../controllers/admin.controller";
import { MailService } from "../../services/mail.service";
import { TrainerRepository } from "../../repositories/trainer.repository";
import { TrainerService } from "../../services/trainer.service";
import { TrainerController } from "../../controllers/trainer.controller";
import { GymController } from "../../controllers/gym.controller";
import { GymRepository } from "../../repositories/gym.repository";
import { GymService } from "../../services/gym.service";
import { PassportConfig } from "../../config/passport";
import { WorkoutController } from "../../controllers/workout.controller";
import { WorkoutService } from "../../services/workout.service";
import { WorkoutDayRepository } from "../../repositories/workoutDay.repository";
import { WorkoutSessionRepository } from "../../repositories/workout.repository";
import { DietDayRepository } from "../../repositories/diet.repository";
import { DietService } from "../../services/diet.service";
import { TemplateRepository } from "../../repositories/dietTemplate.repository";
import { DietTemplateService } from "../../services/dietTemplate.service";
import { DietController } from "../../controllers/diet.controller";
import { IDietDayRepository } from "../interfaces/repositories/IDietRepository";
import { IDietService } from "../interfaces/services/IDietService";
import { IDietTemplateService } from "../interfaces/services/IDietTemplateService";
import { PaymentRepository } from "../../repositories/payment.repository";
import { PaymentService } from "../../services/payment.service";
import { PaymentController } from "../../controllers/payment.controller";
import { StreakService } from "../../services/streak.service";
import { StreakRepository } from "../../repositories/streak.repository";
import { ITransactionRepository } from "../interfaces/repositories/ITransactionRepository";
import { TransactionRepository } from "../../repositories/transaction.repository";
import { TransactionService } from "../../services/transaction.service";
import { ITransactionService } from "../interfaces/services/ITransactionService";


// Create container 
const container = new Container();

// Bindings
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<OAuthClient>(TYPES.OAuthClient).to(OAuthClient);
container.bind<PassportConfig>(TYPES.PassportConfig).to(PassportConfig).inSingletonScope();

container.bind<ITransactionRepository>(TYPES.ITransactionRepository).to(TransactionRepository);
container.bind<ITransactionService>(TYPES.ITransactionService).to(TransactionService);

container.bind<IStreakService>(TYPES.IStreakService).to(StreakService);
container.bind<IStreakRepository>(TYPES.IStreakRepository).to(StreakRepository);

container.bind<IPaymentRepository>(TYPES.IPaymentRepository).to(PaymentRepository);
container.bind<IPaymentService>(TYPES.IPaymentService).to(PaymentService);
container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController);

container.bind<TrainerController>(TYPES.TrainerController).to(TrainerController)
container.bind<ITrainerRepository>(TYPES.ITrainerRepository).to(TrainerRepository);
container.bind<ITrainerService>(TYPES.ITrainerService).to(TrainerService);

container.bind<GymController>(TYPES.GymController).to(GymController)
container.bind<IGymRepository>(TYPES.IGymRepository).to(GymRepository);
container.bind<IGymService>(TYPES.IGymService).to(GymService);

container.bind<AdminController>(TYPES.AdminController).to(AdminController);
container.bind<IAdminService>(TYPES.IAdminService).to(AdminService);
container.bind<IAdminRepository>(TYPES.IAdminRepository).to(AdminRepository);

container.bind<IWorkoutSessionRepository>(TYPES.WorkoutSessionRepository).to(WorkoutSessionRepository);
container.bind<IWorkoutDayRepository>(TYPES.WorkoutDayRepository).to(WorkoutDayRepository);
container.bind<IWorkoutService>(TYPES.WorkoutService).to(WorkoutService);
container.bind<WorkoutController>(TYPES.WorkoutController).to(WorkoutController);

container.bind<IDietDayRepository>(TYPES.IDietDayRepository).to(DietDayRepository);
container.bind<IDietService>(TYPES.IDietService).to(DietService);
container.bind<ITemplateRepository>(TYPES.ITemplateRepository).to(TemplateRepository); 
container.bind<IDietTemplateService>(TYPES.ITemplateService).to(DietTemplateService);
container.bind<DietController>(TYPES.DietController).to(DietController);

container.bind<IOTPService>(TYPES.IOtpService).to(OtpService);
container.bind<IOtpRepository>(TYPES.IOtpRepository).to(OtpRepository);
container.bind<IJwtService>(TYPES.IJwtService).to(JwtService)
container.bind<IMailService>(TYPES.IMailService).to(MailService);




export default container;
