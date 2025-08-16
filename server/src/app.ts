// src/app.ts
import express from "express";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import fileUpload from 'express-fileupload';
import trainerRoutes from './routes/trainer.route'
import gymRoutes from './routes/gym.route'
import workoutRoutes from './routes/workout.routes'
import dietRoutes from './routes/diet.routes'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();

app.use(cors({
  origin:'http://localhost:5173',
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
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trainer", trainerRoutes)
app.use("/api/gym", gymRoutes)
app.use("/api/workout", workoutRoutes)
app.use("/api/diet", dietRoutes);


export default app;
