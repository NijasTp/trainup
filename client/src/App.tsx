// src/App.tsx
import './App.css';
import { BrowserRouter as _, Routes, Route } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import Login from './pages/user/Login';
import Signup from './pages/user/Signup';
import VerifyOtp from './pages/user/VerifyOtp';
import { PreventLoggedIn, ProtectedRoute } from './redirects/UserRedirects';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import AdminLogin from './pages/admin/AdminLogin';
import { AdminProtectedRoute, AdminPreventLoggedIn } from './redirects/AdminRedirects';
import AdminDashboard from './pages/admin/AdminDashboard';
import TrainerManagement from './pages/admin/TrainerManagement';
import UserManagement from './pages/admin/UserManagement';
import HomePage from './pages/user/HomePage';
import ForgotPasswordPage from './components/user/ForgotPassword';
import NewPasswordPage from './components/user/NewPassword';
import TrainerLogin from './pages/trainer/TrainerLogin';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerApplyPage from './pages/trainer/TrainerApply';
import TrainerVerifyOtp from './pages/trainer/TrainerVerifyOtp';
import TrainerForgotPassword from './pages/trainer/TrainerForgotPassword';
import TrainerForgotPasswordVerifyOtp from './pages/trainer/TrainerForgotPasswordVerifyOtp';
import TrainerResetPassword from './pages/trainer/TrainerResetPassword';
import GymApply from './pages/gym/GymApply';
import GymVerifyOtp from './pages/gym/GymVerifyOtp';
import GymDashboard from './pages/gym/GymDashboard';
import GymLogin from './pages/gym/GymLogin';
import GymWaitlist from './pages/gym/GymWaitlist';
import { GymAuthRedirect, GymProtectedRoute } from './redirects/GymRedirects';
import { TrainerPreventLoggedIn, TrainerProtectedRoute } from './redirects/TrainerRedirects';
import TrainerWaitlist from './pages/trainer/TrainerWaitlist';
import TrainerApplication from './pages/admin/TrainerApplication';
import IndividualTrainer from './pages/admin/IndividualTrainer';
import IndividualUser from './pages/admin/IndividualUser';
import GymManagement from './pages/admin/GymManagement';
import GymApplication from './pages/admin/GymApplication';
import Callback from './components/Callback';
import Trainers from './pages/user/Trainers';
import Workouts from './pages/user/Workouts';
import AddWorkoutPage from './pages/user/AddWorkouts';
import AddSessionPage from './pages/user/AddWorkoutSession';
import NotFound from './pages/user/NotFound';
import EditSessionPage from './pages/user/UserWorkoutEdit';
import StartSessionPage from './pages/user/StartWorkoutPage';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path={ROUTES.USER_LOGIN} element={<PreventLoggedIn><Login /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_FORGOT_PASSWORD} element={<PreventLoggedIn><ForgotPasswordPage /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_NEW_PASSWORD} element={<PreventLoggedIn><NewPasswordPage /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_SIGNUP} element={<PreventLoggedIn><Signup /></PreventLoggedIn>} />
        <Route path={ROUTES.CALLBACK} element={<Callback />} />
        <Route path={ROUTES.USER_HOME} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_HOME_ALT} element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_VERIFY_OTP} element={<PreventLoggedIn><VerifyOtp /></PreventLoggedIn>} />
        <Route path={ROUTES.USER_TRAINER_PAGE} element={<ProtectedRoute><Trainers /></ProtectedRoute>} />
        <Route path={ROUTES.USER_WORKOUTS_PAGE} element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ADD_WORKOUT} element={<ProtectedRoute><AddWorkoutPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_ADD_WORKOUT_SESSION} element={<ProtectedRoute><AddSessionPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_EDIT_WORKOUT_SESSION} element={<ProtectedRoute><EditSessionPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_START_WORKOUT} element={<ProtectedRoute><StartSessionPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_NOT_FOUND} element={<ProtectedRoute><NotFound /></ProtectedRoute>} />

        {/* Trainer Routes */}
        <Route path={ROUTES.TRAINER_LOGIN} element={<TrainerPreventLoggedIn><TrainerLogin /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_FORGOT_PASSWORD} element={<TrainerPreventLoggedIn><TrainerForgotPassword /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_FORGOT_PASSWORD_VERIFY_OTP} element={<TrainerPreventLoggedIn><TrainerForgotPasswordVerifyOtp /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_RESET_PASSWORD} element={<TrainerPreventLoggedIn><TrainerResetPassword /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_APPLY} element={<TrainerPreventLoggedIn><TrainerApplyPage /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_VERIFY_OTP} element={<TrainerPreventLoggedIn><TrainerVerifyOtp /></TrainerPreventLoggedIn>} />
        <Route path={ROUTES.TRAINER_WAITLIST} element={<TrainerProtectedRoute><TrainerWaitlist /></TrainerProtectedRoute>} />
        <Route path={ROUTES.TRAINER_DASHBOARD} element={<TrainerProtectedRoute><TrainerDashboard /></TrainerProtectedRoute>} />

        {/* Gym Routes */}
        <Route path={ROUTES.GYM_LOGIN} element={<GymAuthRedirect><GymLogin /></GymAuthRedirect>} />
        <Route path={ROUTES.GYM_APPLY} element={<GymAuthRedirect><GymApply /></GymAuthRedirect>} />
        <Route path={ROUTES.GYM_VERIFY_OTP} element={<GymAuthRedirect><GymVerifyOtp /></GymAuthRedirect>} />
        <Route path={ROUTES.GYM_WAITLIST} element={<GymProtectedRoute><GymWaitlist /></GymProtectedRoute>} />
        <Route path={ROUTES.GYM_DASHBOARD} element={<GymProtectedRoute><GymDashboard /></GymProtectedRoute>} />

        {/* Admin Routes */}
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminPreventLoggedIn><AdminLogin /></AdminPreventLoggedIn>} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRAINERS} element={<AdminProtectedRoute><TrainerManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRAINER_DETAILS} element={<AdminProtectedRoute><IndividualTrainer /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_TRAINER_APPLICATION} element={<AdminProtectedRoute><TrainerApplication /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USER_DETAILS} element={<AdminProtectedRoute><IndividualUser /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_GYMS} element={<AdminProtectedRoute><GymManagement /></AdminProtectedRoute>} />
        <Route path={ROUTES.ADMIN_GYM_APPLICATION} element={<AdminProtectedRoute><GymApplication /></AdminProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;