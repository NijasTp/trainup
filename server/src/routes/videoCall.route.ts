import { Router } from 'express';
import container from '../core/di/inversify.config';
import TYPES from '../core/types/types';
import { VideoCallController } from '../controllers/videoCall.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const videoCallController = container.get<VideoCallController>(TYPES.VideoCallController);

router.use(authMiddleware);

router.get('/room/:roomId', roleMiddleware(['user', 'trainer']), videoCallController.getCallInfo.bind(videoCallController));

router.post('/room/:roomId/join', roleMiddleware(['user', 'trainer']), videoCallController.joinCall.bind(videoCallController));

router.post('/room/:roomId/leave', roleMiddleware(['user', 'trainer']), videoCallController.leaveCall.bind(videoCallController));

router.post('/room/:roomId/end', roleMiddleware(['trainer']), videoCallController.endCall.bind(videoCallController));

router.get('/slot/:slotId', roleMiddleware(['user', 'trainer']), videoCallController.getCallBySlot.bind(videoCallController));

export default router;