import express from "express";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import fileUpload from 'express-fileupload';
import trainerRoutes from './routes/trainer.route'
import gymRoutes from './routes/gym.route'
import workoutRoutes from './routes/workout.route'
import dietRoutes from './routes/diet.route'
import paymentRoutes from './routes/payment.route'
import videoCallRoutes from './routes/videoCall.route'
import gymAttendanceRoutes from './routes/gymAttendance.route'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import BASE_ROUTE from "./constants/baseRoute";
import cors from 'cors';
import { errorHandler } from "./middlewares/error.midleware";
import container from "./core/di/inversify.config";
import { SocketHandler } from "./utils/socketHandler.util";
import TYPES from "./core/types/types";
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
}));

const httpServer = new HttpServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const socketHandler = new SocketHandler(
  io,
  container.get(TYPES.IUserService),
  container.get(TYPES.IUserPlanService),
  container.get(TYPES.IMessageService),
  container.get(TYPES.IJwtService),
  container.get(TYPES.IUserRepository),
  container.get(TYPES.ITrainerRepository),
  container.get(TYPES.IAdminRepository),
  container.get(TYPES.IGymRepository)
);

// Routes
app.use(BASE_ROUTE.USER, userRoutes);
app.use(BASE_ROUTE.ADMIN, adminRoutes);
app.use(BASE_ROUTE.TRAINER, trainerRoutes)
app.use(BASE_ROUTE.GYM, gymRoutes)
app.use(BASE_ROUTE.WORKOUT, workoutRoutes)
app.use(BASE_ROUTE.DIET, dietRoutes);
app.use(BASE_ROUTE.PAYMENT, paymentRoutes);
app.use(BASE_ROUTE.VIDEO_CALL, videoCallRoutes);
app.use(BASE_ROUTE.ATTENDANCE,  gymAttendanceRoutes);

app.use(errorHandler);

export { httpServer, io };
export default app;