// src/app.ts
import express from "express";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import fileUpload from 'express-fileupload';
import trainerRoutes from './routes/trainer.route'
import gymRoutes from './routes/gym.route'
import workoutRoutes from './routes/workout.routes'
import dietRoutes from './routes/diet.routes'
import paymentRoutes from './routes/payment.route'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import BASE_ROUTE from "./constants/baseRoute";
import cors from 'cors';
import { errorHandler } from "./middlewares/error.midleware";
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

// Routes
app.use(BASE_ROUTE.USER, userRoutes);
app.use(BASE_ROUTE.ADMIN, adminRoutes);
app.use(BASE_ROUTE.TRAINER, trainerRoutes)
app.use(BASE_ROUTE.GYM, gymRoutes)
app.use(BASE_ROUTE.WORKOUT, workoutRoutes)
app.use(BASE_ROUTE.DIET, dietRoutes);
app.use(BASE_ROUTE.PAYMENT, paymentRoutes);



export default app;
