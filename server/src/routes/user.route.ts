import express from 'express'
import container from '../core/di/inversify.config'
import { UserController } from '../controllers/user.controller'
import TYPES from '../core/types/types'
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware'
import { checkSubscriptionExpiry } from '../middlewares/checkSubscription.middleware'

const router = express.Router()

const userController = container.get<UserController>(TYPES.UserController)

router.post(
  '/refresh-token',
  userController.refreshAccessToken.bind(userController)
)

router.post('/login', userController.login.bind(userController))
router.post('/request-otp', userController.requestOtp.bind(userController))
router.post('/verify-otp', userController.verifyOtp.bind(userController))
router.post(
  '/check-username',
  userController.checkUsername.bind(userController)
)
router.post('/google-login', userController.googleLogin.bind(userController))
router.post('/resend-otp', userController.resendOtp.bind(userController))
router.post(
  '/forgot-password',
  userController.forgotPassword.bind(userController)
)
router.post(
  '/verify-forgot-password-otp',
  userController.verifyForgotPasswordOtp.bind(userController)
)
router.post(
  '/reset-password',
  userController.resetPassword.bind(userController)
)

router.use(authMiddleware)
router.use(checkSubscriptionExpiry)

router.post(
  '/logout',
  roleMiddleware(['user']),
  userController.logout.bind(userController)
)

router.get('/session', userController.checkSession.bind(userController))

router.get(
  '/get-profile',
  roleMiddleware(['user']),
  userController.getProfile.bind(userController)
)
router.put(
  '/update-profile',
  authMiddleware,
  roleMiddleware(['user']),
  userController.updateProfile.bind(userController)
)

router.post('/change-password', authMiddleware, userController.changePassword.bind(userController))

router
  .post(
    '/weight',
    roleMiddleware(['user']),
    userController.addWeight.bind(userController)
  )
  .get(
    '/weight',
    roleMiddleware(['user']),
    userController.getWeightHistory.bind(userController)
  )

router.get(
  '/trainers',
  roleMiddleware(['user']),
  userController.getTrainers.bind(userController)
)
router.get(
  '/trainers/:id',
  roleMiddleware(['user']),
  userController.getIndividualTrainer.bind(userController)
)
router.get('/my-trainer', userController.getMyTrainer.bind(userController))
router.post(
  '/cancel-subscription',
  userController.cancelSubscription.bind(userController)
)

router.get('/trainer-availability', roleMiddleware(['user']), userController.getTrainerAvailability.bind(userController))
router.post('/book-session', roleMiddleware(['user']), userController.bookSession.bind(userController))
router.get('/sessions', roleMiddleware(['user']), userController.getUserSessions.bind(userController))
router.get('/plan', roleMiddleware(['user']), userController.getUserPlan.bind(userController))
router.get('/trainer/:trainerId', roleMiddleware(['user']), userController.getTrainer.bind(userController))
router.get('/chat/messages/:trainerId', roleMiddleware(['user']), userController.getChatMessages.bind(userController))
router.get('/me', roleMiddleware(['user']), userController.getProfile.bind(userController))

router.get("/gyms", authMiddleware, userController.getGyms.bind(userController));
router.get("/gyms/:id", authMiddleware, userController.getGymById.bind(userController));
router.get("/gyms/:gymId/subscription-plans", authMiddleware, userController.getGymSubscriptionPlans.bind(userController));
router.get("/my-gym", authMiddleware, userController.getMyGym.bind(userController));
router.get("/gym-announcements", authMiddleware, userController.getGymAnnouncements.bind(userController));

router.post('/trainer/rating/:id', authMiddleware, userController.addTrainerRating.bind(userController))
router.post('/gym/rating/:id', authMiddleware, userController.addGymRating.bind(userController))
router.get('/trainer/ratings/:id', authMiddleware, userController.getTrainerRatings.bind(userController))
router.get('/gym/ratings/:id', authMiddleware, userController.getGymRatings.bind(userController))

router.put('/review/:id', authMiddleware, userController.editReview.bind(userController))
router.delete('/review/:id', authMiddleware, userController.deleteReview.bind(userController))

router.post('/chat/upload', authMiddleware, userController.uploadChatFile.bind(userController))

router.post('/progress', authMiddleware, userController.addProgress.bind(userController))
router.get('/progress', authMiddleware, userController.getProgress.bind(userController))
router.get('/progress/compare', authMiddleware, userController.compareProgress.bind(userController))

export default router