import express from 'express'
import container from '../core/di/inversify.config'
import TYPES from '../core/types/types'
import { UserAuthController } from '../controllers/user.auth.controller'
import { UserProfileController } from '../controllers/user.profile.controller'
import { UserTrainerController } from '../controllers/user.trainer.controller'
import { UserGymController } from '../controllers/user.gym.controller'
import { UserReviewController } from '../controllers/user.review.controller'
import { UserChatController } from '../controllers/user.chat.controller'
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware'
import { checkSubscriptionExpiry } from '../middlewares/checkSubscription.middleware'

const router = express.Router()

const userAuthController = container.get<UserAuthController>(TYPES.UserAuthController)
const userProfileController = container.get<UserProfileController>(TYPES.UserProfileController)
const userTrainerController = container.get<UserTrainerController>(TYPES.UserTrainerController)
const userGymController = container.get<UserGymController>(TYPES.UserGymController)
const userReviewController = container.get<UserReviewController>(TYPES.UserReviewController)
const userChatController = container.get<UserChatController>(TYPES.UserChatController)

router.post(
  '/refresh-token',
  userAuthController.refreshAccessToken.bind(userAuthController)
)

router.post('/login', userAuthController.login.bind(userAuthController))
router.post('/request-otp', userAuthController.requestOtp.bind(userAuthController))
router.post('/verify-otp', userAuthController.verifyOtp.bind(userAuthController))
router.post(
  '/check-username',
  userAuthController.checkUsername.bind(userAuthController)
)
router.post('/google-login', userAuthController.googleLogin.bind(userAuthController))
router.post('/resend-otp', userAuthController.resendOtp.bind(userAuthController))
router.post(
  '/forgot-password',
  userAuthController.forgotPassword.bind(userAuthController)
)
router.post(
  '/verify-forgot-password-otp',
  userAuthController.verifyForgotPasswordOtp.bind(userAuthController)
)
router.post(
  '/reset-password',
  userAuthController.resetPassword.bind(userAuthController)
)

router.use(authMiddleware)
router.use(checkSubscriptionExpiry)

router.post(
  '/logout',
  roleMiddleware(['user']),
  userAuthController.logout.bind(userAuthController)
)

router.get('/session', userAuthController.checkSession.bind(userAuthController))

router.get(
  '/get-profile',
  roleMiddleware(['user']),
  userProfileController.getProfile.bind(userProfileController)
)

router.get('/profile-page', roleMiddleware(['user']), userProfileController.getProfilePage.bind(userProfileController))
router.put(
  '/update-profile',
  authMiddleware,
  roleMiddleware(['user']),
  userProfileController.updateProfile.bind(userProfileController)
)

router.put(
  '/workout-template/toggle',
  roleMiddleware(['user']),
  userProfileController.toggleWorkoutTemplate.bind(userProfileController)
)

router.post('/change-password', authMiddleware, userAuthController.changePassword.bind(userAuthController))

router
  .post(
    '/weight',
    roleMiddleware(['user']),
    userProfileController.addWeight.bind(userProfileController)
  )
  .get(
    '/weight',
    roleMiddleware(['user']),
    userProfileController.getWeightHistory.bind(userProfileController)
  )

router.get(
  '/trainers',
  roleMiddleware(['user']),
  userTrainerController.getTrainers.bind(userTrainerController)
)
router.get(
  '/trainers/:id',
  roleMiddleware(['user']),
  userTrainerController.getIndividualTrainer.bind(userTrainerController)
)
router.get('/my-trainer', userTrainerController.getMyTrainer.bind(userTrainerController))
router.post(
  '/cancel-subscription',
  userTrainerController.cancelSubscription.bind(userTrainerController)
)

router.get('/trainer-availability', roleMiddleware(['user']), userTrainerController.getTrainerAvailability.bind(userTrainerController))
router.post('/book-session', roleMiddleware(['user']), userTrainerController.bookSession.bind(userTrainerController))
router.get('/sessions', roleMiddleware(['user']), userTrainerController.getUserSessions.bind(userTrainerController))
router.get('/plan', roleMiddleware(['user']), userTrainerController.getUserPlan.bind(userTrainerController))
router.get('/trainer/:trainerId', roleMiddleware(['user']), userTrainerController.getTrainer.bind(userTrainerController))
router.post('/chat/session-request', roleMiddleware(['user']), userTrainerController.sendSessionRequest.bind(userTrainerController))
router.get('/chat/unread-counts', roleMiddleware(['user']), userChatController.getUnreadCounts.bind(userChatController))
router.put('/chat/read/:senderId', roleMiddleware(['user']), userChatController.markMessagesAsRead.bind(userChatController))
router.get('/chat/messages/:trainerId', roleMiddleware(['user']), userChatController.getChatMessages.bind(userChatController))
router.get('/me', roleMiddleware(['user']), userProfileController.getProfile.bind(userProfileController))

router.get("/gyms", authMiddleware, userGymController.getGyms.bind(userGymController));
router.get("/gyms/:id", authMiddleware, userGymController.getGymById.bind(userGymController));
router.get("/gyms/:gymId/subscription-plans", authMiddleware, userGymController.getGymSubscriptionPlans.bind(userGymController));
router.get("/my-gym", authMiddleware, userGymController.getMyGym.bind(userGymController));
router.get("/gym-announcements", authMiddleware, userGymController.getGymAnnouncements.bind(userGymController));
router.post("/gyms/cancel-membership", authMiddleware, roleMiddleware(['user']), userGymController.cancelMembership.bind(userGymController));


router.post('/trainer/rating/:id', authMiddleware, userReviewController.addTrainerRating.bind(userReviewController))
router.post('/gym/rating/:id', authMiddleware, userReviewController.addGymRating.bind(userReviewController))
router.get('/trainer/ratings/:id', authMiddleware, userReviewController.getTrainerRatings.bind(userReviewController))
router.get('/gym/ratings/:id', authMiddleware, userReviewController.getGymRatings.bind(userReviewController))

router.put('/review/:id', authMiddleware, userReviewController.editReview.bind(userReviewController))
router.delete('/review/:id', authMiddleware, userReviewController.deleteReview.bind(userReviewController))

router.post('/chat/upload', authMiddleware, userChatController.uploadChatFile.bind(userChatController))

router.post('/progress', authMiddleware, userProfileController.addProgress.bind(userProfileController))
router.get('/progress', authMiddleware, userProfileController.getProgress.bind(userProfileController))
router.get('/progress/compare', authMiddleware, userProfileController.compareProgress.bind(userProfileController))

export default router