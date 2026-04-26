import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { checkUserSession } from '@/services/authService';

interface XPLog {
  amount: number;
  reason: string;
  date: string;
}

interface WeightLog {
  weight: number;
  date: string;
}

export interface ActiveTemplate {
  templateId: string;
  startDate: string;
}

export interface AssignedTrainerDetails {
  _id: string;
  name: string;
  profileImage?: string;
  specialization?: string;
  specialty?: string;
}

export interface ActiveGymDetails {
  _id: string;
  name: string;
  profileImage?: string;
  address?: string;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'user' | null;
  streak: number;
  xp: number;
  xpLogs: XPLog[];
  weightHistory: WeightLog[];
  achievements: string[];
  activityLevel?: string | null;
  equipment?: boolean;
  equipmentAvailability?: boolean;
  goals?: string[];
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  goalWeight?: number | null;
  isBanned?: boolean;
  isPrivate?: boolean;
  assignedTrainer?: string;
  trainerPlan?: 'basic' | 'premium' | 'pro' | null;
  gymId?: string | null;
  activeWorkoutTemplate?: string | null;
  activeWorkoutTemplates?: ActiveTemplate[];
  activeDietTemplate?: string | null;
  assignedTrainerDetails?: AssignedTrainerDetails | null;
  activeGymDetails?: ActiveGymDetails | null;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserAuthState {
  user: UserType | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserAuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
}

export const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserType & { todaysWeight?: number }>) => {
      const payload = action.payload;
      state.user = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        profileImage: payload.profileImage,
        role: payload.role || 'user',
        streak: payload.streak || 0,
        xp: payload.xp || 0,
        xpLogs: payload.xpLogs || [],
        weightHistory: payload.weightHistory || [],
        achievements: payload.achievements || [],
        activityLevel: payload.activityLevel || null,
        equipment: payload.equipment || false,
        equipmentAvailability: payload.equipmentAvailability || false,
        goals: payload.goals || [],
        age: payload.age || null,
        height: payload.height || null,
        weight: payload.todaysWeight || null,
        goalWeight: payload.goalWeight || null,
        isBanned: payload.isBanned || false,
        isPrivate: payload.isPrivate || false,
        isVerified: payload.isVerified || false,
        activeWorkoutTemplate: payload.activeWorkoutTemplate || null,
        activeWorkoutTemplates: payload.activeWorkoutTemplates || [],
        activeDietTemplate: payload.activeDietTemplate || null,
        assignedTrainerDetails: payload.assignedTrainerDetails || null,
        activeGymDetails: payload.activeGymDetails || null,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserType>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, setLoading, updateUser } = userAuthSlice.actions;

export const syncSubscriptionStatus = createAsyncThunk(
  'userAuth/syncSubscriptionStatus',
  async (_, { dispatch }) => {
    try {
      const response = await checkUserSession();
      if (response && response.valid && response.user) {
        dispatch(updateUser({
          activeGymDetails: response.user.activeGymDetails || null,
          assignedTrainerDetails: response.user.assignedTrainerDetails || null,
          assignedTrainer: response.user.assignedTrainer || null,
        }));
      }
    } catch (error) {
      console.error('Failed to sync subscription status', error);
    }
  }
);

export default userAuthSlice.reducer;