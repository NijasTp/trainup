import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ROUTES } from './constants/routes';
import { Role } from './constants/role';
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';
import VerifyOtp from './pages/user/VerifyOtp';
import { PreventLoggedIn, ProtectedRoute } from './redirects/UserRedirects';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import AdminLogin from './pages/admin/AdminLogin';
import { AdminProtectedRoute, AdminPreventLoggedIn } from './redirects/AdminRedirects';
import AdminDashboard from './pages/admin/AdminDashboard';
import TrainerManagement from './pages/admin/TrainerManagement';
import UserManagement from './pages/admin/UserManagement';
import HomePage from './pages/user/HomePage';
import ForgotPasswordPage from './components/user/ForgotPassword';
import NewPasswordPage from './components/user/NewPassword';
import TrainerApplyPage from './pages/trainer/TrainerApply';
import TrainerVerifyOtp from './pages/trainer/TrainerVerifyOtp';
import TrainerForgotPassword from './pages/trainer/TrainerForgotPassword';
import TrainerForgotPasswordVerifyOtp from './pages/trainer/TrainerForgotPasswordVerifyOtp';
import TrainerResetPassword from './pages/trainer/TrainerResetPassword';
import { TrainerPreventLoggedIn, TrainerProtectedRoute } from './redirects/TrainerRedirects';
import TrainerWaitlist from './pages/trainer/TrainerWaitlist';
import TrainerApplication from './pages/admin/TrainerApplication';
import IndividualTrainer from './pages/admin/IndividualTrainer';
import IndividualUser from './pages/admin/IndividualUser';
import Callback from './components/Callback';
import Trainers from './pages/user/Trainers';
import Workouts from './pages/user/Workouts';
import AddWorkoutPage from './pages/user/AddWorkouts';
import AddSessionPage from './pages/user/AddWorkoutSession';
import NotFound from './pages/user/NotFound';
import EditSessionPage from './pages/user/UserWorkoutEdit';
import StartSessionPage from './pages/user/StartWorkoutPage';
import SuccessPage from './pages/user/WorkoutSuccess';
import Diets from './pages/user/Diets';
import UserAddDiet from './pages/user/UserAddDiet';
import RoleSelectionPage from './pages/user/LandingPage';
import TemplateManagement from './pages/admin/TemplateManagement';
import UserProfile from './pages/user/UserProfile';
import UserDashboard from './pages/user/UserDashboard';
import TrainerPage from './pages/user/IndividualTrainer';
import TrainerPricingPage from './pages/user/TrainerPricing';
import MyTrainerProfile from './pages/user/MyTrainer';
import TrainerUserDetails from './pages/trainer/TrainerUserDetails';
import TrainerAddWorkoutPage from './pages/trainer/TrainerAddWorkoutPage';
import TrainerAddSessionPage from './pages/trainer/TrainerAddSessionPage';
import TrainerUserDietPage from './pages/trainer/TrainerUserDiet';
import TrainerTemplateManagement from "./pages/trainer/TrainerTemplateManagement";
import AdminAddWorkoutTemplate from "./pages/admin/AdminAddWorkoutTemplate";
import EditAdminTemplate from "./pages/admin/EditAdminTemplate";
import WorkoutTemplateForm from './pages/admin/AdminAddWorkoutTemplate';
import WorkoutTemplates from './pages/user/WorkoutTemplates';
import NewDietTemplate from './pages/admin/AdminAddDietTemplate';
import TrainerReapply from './pages/trainer/TrainerReapply';
import Transactions from './pages/user/UserTransactions';
import EditTemplate from './pages/admin/EditAdminTemplate';
import EditProfile from './pages/user/UserEditProfile';
import UserSessions from './pages/user/UserSessions';
import TrainerSlots from './pages/trainer/TrainerSlots';
import TrainerAvailability from './pages/user/TrainerAvailability';
import TrainerSessionRequests from './pages/trainer/TrainerSessionRequests';
import ChatPage from './pages/user/UserChatPage';
import TrainerChatPage from './pages/trainer/TrainerChatPage';
import VideoCallPage from './pages/general/VideoCallPage';
import TrainerTransactions from './pages/trainer/TrainerTransactions';
import TrainerProfile from './pages/trainer/TrainerProfile';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import WeeklySchedule from './pages/trainer/WeeklySchedule';
import TrainerClients from './pages/trainer/TrainerClientListing';
import TrainerChats from './pages/trainer/TrainerChats';
import TrainerEditProfile from './pages/trainer/TrainerEditProfile';
import TrainerJobs from './pages/trainer/TrainerJobs';
import ProfileCompletion from './pages/user/ProfileCompletion';
import OnboardingAnalysis from './pages/user/OnboardingAnalysis';
import OnboardingChallenge from './pages/user/OnboardingChallenge';
import TrainerAssignWorkouts from './pages/trainer/TrainerAssignWorkouts';
import TrainerAssignDiets from './pages/trainer/TrainerAssignDiets';
import TrainerClientProgress from './pages/trainer/TrainerClientProgress';

import UserNotifications from './pages/user/UserNotifications';
import SubscriptionDetails from './pages/user/SubscriptionDetails';
import TrainerNotifications from './pages/trainer/TrainerNotifications';

import ProgressPage from './pages/user/Progress';
import TemplateDetails from './pages/user/TemplateDetails';
import GymListing from './pages/user/GymListing';
import IndividualGym from './pages/user/IndividualGym';
import MyGym from './pages/user/MyGym';
import WishlistPage from './pages/user/WishlistPage';
import UserGymStore from './pages/user/GymStore';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminRatingManagement from './pages/admin/AdminRatingManagement';
import AdminGymManagement from './pages/admin/AdminGymManagement';


import GymLayout from './pages/gym/layouts/GymLayout';
import GymRegister from './pages/gym/register/Register';
import GymDashboardPage from './pages/gym/dashboard/Dashboard';
import GymProfilePage from './pages/gym/profile/Profile';
import GymEquipmentPage from './pages/gym/equipment/Equipment';
import GymPlansPage from './pages/gym/plans/Plans';
import AddPlanPage from './pages/gym/plans/AddPlanPage';
import GymMembersPage from './pages/gym/members/Members';
import GymAttendancePage from './pages/gym/attendance/Attendance';
import GymStorePage from './pages/gym/store/Store';
import GymAnnouncementsPage from './pages/gym/announcements/Announcements';
import GymJobsPage from './pages/gym/jobs/Jobs';
import GymOtpVerification from './pages/gym/register/GymOtpVerification';
import GymStatus from './pages/gym/register/GymStatus';
import GymReapply from './pages/gym/register/GymReapply';
import { GymProtectedRoute, GymPreventLoggedIn } from "./redirects/GymRedirects";
import GymForgotPassword from './pages/gym/register/GymForgotPassword';
import GymResetPassword from './pages/gym/register/GymResetPassword';
import GymPlanSelection from './pages/user/GymPlanSelection';
import PaymentSuccessPage from './pages/user/PaymentSuccess';
import PaymentCancelPage from './pages/user/PaymentCancel';
import GymPaymentSuccess from './pages/user/GymPaymentSuccess';
import GymPaymentCancel from './pages/user/GymPaymentCancel';
import AttendancePage from './pages/user/AttendancePage';
import UserGymEquipment from './pages/user/UserGymEquipment';
import WorkoutHistoryPage from './pages/user/WorkoutHistoryPage';
import WorkoutPreviewPage from './pages/user/WorkoutPreviewPage';
import UserGymAnnouncements from './pages/user/UserGymAnnouncements';
import BundlePaymentSuccess from './pages/user/BundlePaymentSuccess';
import BundlePaymentCancel from './pages/user/BundlePaymentCancel';
import ActiveProtocolPage from './pages/user/ActiveProtocolPage';


import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import API from './lib/axios';
import { updateUser } from './redux/slices/userAuthSlice';
import type { RootState } from './redux/store';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.userAuth.isAuthenticated);
  const refreshProfile = useCallback(async () => {
    try {
      const res = await API.get('/user/get-profile');
      if (res.data.user) {
        dispatch(updateUser(res.data.user));
      }
    } catch (eVal) { const e = eVal as SafeAny;
      console.error("Auto-refresh profile failed", e);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, [isAuthenticated, refreshProfile]);

  return (
    <ThemeProvider>
      <ToastContainer />
      <Toaster position='bottom-right' theme='dark' richColors duration={6000}/>
      <HotToaster position='top-center' reverseOrder={false} />
      <Routes>
        <Route path={ROUTES.CHOOSE_LOGIN} element={<RoleSelectionPage />} />
        <Route path={ROUTES.GLOBAL_LOGIN} element={<RoleSelectionPage />} />

        {/* Payment Success/Cancel Routes moved up */}
        <Route path={ROUTES.PAYMENT_TRAINER_SUCCESS} element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path={ROUTES.PAYMENT_TRAINER_CANCEL} element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />
        <Route path={ROUTES.PAYMENT_GYM_SUCCESS} element={<ProtectedRoute><GymPaymentSuccess /></ProtectedRoute>} />
        <Route path={ROUTES.PAYMENT_GYM_CANCEL} element={<ProtectedRoute><GymPaymentCancel /></ProtectedRoute>} />
        <Route path={ROUTES.PAYMENT_BUNDLE_SUCCESS} element={<ProtectedRoute><BundlePaymentSuccess /></ProtectedRoute>} />
        <Route path={ROUTES.PAYMENT_BUNDLE_CANCEL} element={<ProtectedRoute><BundlePaymentCancel /></ProtectedRoute>} />
        <Route path={ROUTES.USER_LOGIN} element={<PreventLoggedIn><Login initialRole={Role.USER} /></PreventLoggedIn>} />
        <Route path="/user/login" element={<PreventLoggedIn><Login initialRole={Role.USER} /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_FORGOT_PASSWORD} element={<PreventLoggedIn><ForgotPasswordPage /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_NEW_PASSWORD} element={<PreventLoggedIn><NewPasswordPage /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_SIGNUP} element={<PreventLoggedIn><Signup /></PreventLoggedIn>} />
        <Route path={ROUTES.CALLBACK} element={<Callback />} />
        <Route path={ROUTES.USER_HOME_ALT} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_NOTIFICATIONS} element={<ProtectedRoute><UserNotifications /></ProtectedRoute>} />

        <Route path={ROUTES.USER_PROFILE} element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path={ROUTES.USER_EDIT_PROFILE} element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path={ROUTES.USER_TRANSACTIONS} element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path={ROUTES.USER_DASHBOARD} element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path={ROUTES.USER_VERIFY_OTP} element={<PreventLoggedIn><VerifyOtp /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_COMPLETE_PROFILE} element={<ProtectedRoute><ProfileCompletion /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ONBOARDING_ANALYSIS} element={<ProtectedRoute><OnboardingAnalysis /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ONBOARDING_CHALLENGE} element={<ProtectedRoute><OnboardingChallenge /></ProtectedRoute>} />
        <Route path={ROUTES.USER_TRAINER_PAGE} element={<ProtectedRoute><Trainers /></ProtectedRoute>} />
        <Route path={ROUTES.USER_INDIVIDUAL_TRAINER} element={<ProtectedRoute><TrainerPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_INDIVIDUAL_GYM} element={<ProtectedRoute><IndividualGym /></ProtectedRoute>} />
        <Route path="/my-trainer" element={<Navigate to={ROUTES.MY_TRAINER_PROFILE} replace />} />
        <Route path={ROUTES.MY_TRAINER_PROFILE} element={<ProtectedRoute><MyTrainerProfile /></ProtectedRoute>} />
        <Route path={ROUTES.MY_TRAINER_SESSIONS} element={<ProtectedRoute><UserSessions /></ProtectedRoute>} />
        <Route path={ROUTES.MY_TRAINER_CHAT} element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path={ROUTES.MY_TRAINER_AVAILABILITY} element={<ProtectedRoute><TrainerAvailability /></ProtectedRoute>} />
        <Route path={ROUTES.VIDEO_CALL} element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />


        <Route path={ROUTES.USER_WORKOUTS_PAGE} element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ADMIN_WORKOUT_TEMPLATES} element={<ProtectedRoute><WorkoutTemplates /></ProtectedRoute>} />
        <Route path={ROUTES.USER_TEMPLATE_DETAILS} element={<ProtectedRoute><TemplateDetails /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ADD_WORKOUT} element={<ProtectedRoute><AddWorkoutPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ADD_WORKOUT_SESSION} element={<ProtectedRoute><AddSessionPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_EDIT_WORKOUT_SESSION} element={<ProtectedRoute><EditSessionPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_START_WORKOUT} element={<ProtectedRoute><StartSessionPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_WORKOUT_SUCCESS} element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_DIET} element={<ProtectedRoute><Diets /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ADD_DIET} element={<ProtectedRoute><UserAddDiet /></ProtectedRoute>} />
        <Route path={ROUTES.USER_PROGRESS} element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_WORKOUT_HISTORY} element={<ProtectedRoute><WorkoutHistoryPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_WORKOUT_PREVIEW} element={<ProtectedRoute><WorkoutPreviewPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ACTIVE_PROTOCOL} element={<ProtectedRoute><ActiveProtocolPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYMS} element={<ProtectedRoute><GymListing /></ProtectedRoute>} />
        <Route path={ROUTES.USER_TRAINER_PRICING} element={<ProtectedRoute><TrainerPricingPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYM_PLAN_SELECTION} element={<ProtectedRoute><GymPlanSelection /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYM_DASHBOARD} element={<ProtectedRoute><MyGym /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYM_ATTENDANCE} element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYM_EQUIPMENT} element={<ProtectedRoute><UserGymEquipment /></ProtectedRoute>} />
        <Route path={ROUTES.USER_SUBSCRIPTIONS} element={<ProtectedRoute><SubscriptionDetails /></ProtectedRoute>} />
        <Route path={ROUTES.USER_WISHLIST} element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYM_SHOP} element={<ProtectedRoute><UserGymStore /></ProtectedRoute>} />
        <Route path={ROUTES.USER_GYM_ANNOUNCEMENTS} element={<ProtectedRoute><UserGymAnnouncements /></ProtectedRoute>} />



        {/* Trainer Routes */}
        <Route path={ROUTES.TRAINER_LOGIN} element={<TrainerPreventLoggedIn><Login initialRole={Role.TRAINER} /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_FORGOT_PASSWORD} element={<TrainerPreventLoggedIn><TrainerForgotPassword /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_FORGOT_PASSWORD_VERIFY_OTP} element={<TrainerPreventLoggedIn><TrainerForgotPasswordVerifyOtp /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_RESET_PASSWORD} element={<TrainerPreventLoggedIn><TrainerResetPassword /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_APPLY} element={<TrainerPreventLoggedIn><TrainerApplyPage /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_VERIFY_OTP} element={<TrainerPreventLoggedIn><TrainerVerifyOtp /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_WAITLIST} element={<TrainerProtectedRoute><TrainerWaitlist /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_REJECTED} element={<TrainerProtectedRoute><TrainerReapply /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_DASHBOARD} element={<TrainerProtectedRoute><TrainerDashboard /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_NOTIFICATIONS} element={<TrainerProtectedRoute><TrainerNotifications /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENTS} element={<TrainerProtectedRoute><TrainerClients /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_TRANSACTIONS} element={<TrainerProtectedRoute><TrainerTransactions /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_PROFILE} element={<TrainerProtectedRoute><TrainerProfile /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_EDIT_PROFILE} element={<TrainerProtectedRoute><TrainerEditProfile /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_SLOTS} element={<TrainerProtectedRoute><TrainerSlots /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_WEEKLY_SCHEDULE} element={<TrainerProtectedRoute><WeeklySchedule /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_SESSION_REQUESTS} element={<TrainerProtectedRoute><TrainerSessionRequests /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_INDIVIDUAL_CLIENT} element={<TrainerProtectedRoute><TrainerUserDetails /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENT_PROGRESS} element={<TrainerProtectedRoute><TrainerClientProgress /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENT_CHAT} element={<TrainerProtectedRoute><TrainerChatPage /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENT_VIDEO_CALL} element={<TrainerProtectedRoute><VideoCallPage /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENT_WORKOUT} element={<TrainerProtectedRoute><TrainerAddWorkoutPage /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENT_SESSION} element={<TrainerProtectedRoute><TrainerAddSessionPage /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CLIENT_DIET} element={<TrainerProtectedRoute><TrainerUserDietPage /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_CHATS} element={<TrainerProtectedRoute><TrainerChats /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_ASSIGN_WORKOUT} element={<TrainerProtectedRoute><TrainerAssignWorkouts /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_ASSIGN_DIET} element={<TrainerProtectedRoute><TrainerAssignDiets /></TrainerProtectedRoute>} />

        {/* Trainer Template Management */}
        <Route path={ROUTES.TRAINER_JOBS} element={<TrainerProtectedRoute><TrainerJobs /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_TEMPLATES} element={<TrainerProtectedRoute><TrainerTemplateManagement /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_NEW_WORKOUT_TEMPLATE} element={<TrainerProtectedRoute><AdminAddWorkoutTemplate mode="trainer" /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_NEW_DIET_TEMPLATE} element={<TrainerProtectedRoute><NewDietTemplate mode="trainer" /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_EDIT_TEMPLATE} element={<TrainerProtectedRoute><EditAdminTemplate mode="trainer" /></TrainerProtectedRoute>} />

        {/* Admin Routes */}
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminPreventLoggedIn><AdminLogin /></AdminPreventLoggedIn>} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRAINERS} element={<AdminProtectedRoute><TrainerManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRANSACTIONS} element={<AdminProtectedRoute><AdminTransactions /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRAINER_DETAILS} element={<AdminProtectedRoute><IndividualTrainer /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRAINER_APPLICATION} element={<AdminProtectedRoute><TrainerApplication /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USER_DETAILS} element={<AdminProtectedRoute><IndividualUser /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TEMPLATE_MANAGEMENT} element={<AdminProtectedRoute><TemplateManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_RATINGS} element={<AdminProtectedRoute><AdminRatingManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_GYMS} element={<AdminProtectedRoute><AdminGymManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_ADD_WORKOUT_TEMPLATE} element={<AdminProtectedRoute><WorkoutTemplateForm /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_ADD_DIET_TEMPLATE} element={<AdminProtectedRoute><NewDietTemplate /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_EDIT_TEMPLATE} element={<AdminProtectedRoute><EditTemplate /></AdminProtectedRoute>} />

        {/* Gym Management Routes */}
        <Route path={ROUTES.GYM_LOGIN} element={<GymPreventLoggedIn><Login initialRole={Role.GYM} /></GymPreventLoggedIn>} />
        <Route path={ROUTES.GYM_REGISTER} element={<GymOtpVerification />} />
        <Route path={ROUTES.GYM_ONBOARDING} element={<GymRegister />} />
        <Route path={ROUTES.GYM_STATUS} element={<GymProtectedRoute><GymStatus /></GymProtectedRoute>} />
        <Route path={ROUTES.GYM_REAPPLY} element={<GymProtectedRoute><GymReapply /></GymProtectedRoute>} />
        <Route path={ROUTES.GYM_FORGOT_PASSWORD} element={<GymPreventLoggedIn><GymForgotPassword /></GymPreventLoggedIn>} />
        <Route path={ROUTES.GYM_RESET_PASSWORD} element={<GymPreventLoggedIn><GymResetPassword /></GymPreventLoggedIn>} />

        <Route path={ROUTES.GYM_ROOT} element={<GymProtectedRoute><GymLayout><Routes>
          <Route path="dashboard" element={<GymDashboardPage />} />
          <Route path="profile" element={<GymProfilePage />} />
          <Route path="plans" element={<GymPlansPage />} />
          <Route path="plans/create" element={<AddPlanPage />} />
          <Route path="plans/edit/:id" element={<AddPlanPage />} />
          <Route path="equipment" element={<GymEquipmentPage />} />
          <Route path="members" element={<GymMembersPage />} />
          <Route path="attendance" element={<GymAttendancePage />} />
          <Route path="store" element={<GymStorePage />} />
          <Route path="store/create" element={<GymStorePage />} />
          <Route path="store/edit/:id" element={<GymStorePage />} />
          <Route path="announcements" element={<GymAnnouncementsPage />} />
          <Route path="announcements/create" element={<GymAnnouncementsPage />} />
          <Route path="announcements/edit/:id" element={<GymAnnouncementsPage />} />
          <Route path="jobs" element={<GymJobsPage />} />
          <Route path="jobs/create" element={<GymJobsPage />} />
          <Route path="jobs/edit/:id" element={<GymJobsPage />} />
        </Routes></GymLayout></GymProtectedRoute>} />

        <Route path={ROUTES.USER_NOT_FOUND} element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;