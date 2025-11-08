import express from 'express';
import container from '../core/di/inversify.config';
import { AttendanceController } from '../controllers/gymAttendance.controller';
import TYPES from '../core/types/types';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const attendanceController = container.get<AttendanceController>(TYPES.AttendanceController);

router.post(
  '/mark',
  authMiddleware,
  roleMiddleware(['user']),
  attendanceController.markAttendance.bind(attendanceController)
);

router.get(
  '/history/:gymId',
  authMiddleware,
  roleMiddleware(['user']),
  attendanceController.getAttendanceHistory.bind(attendanceController)
);

router.get(
  '/gym/:date',
  authMiddleware,
  roleMiddleware(['gym']),
  attendanceController.getGymAttendance.bind(attendanceController)
);

export default router;