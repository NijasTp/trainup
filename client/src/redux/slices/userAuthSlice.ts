import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface XPLog {
  amount: number;
  reason: string;
  date: string;
}

interface WeightLog {
  weight: number;
  date: string;
}

interface UserType {
  _id: string;
  name: string;
  email: string;
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
  height?: number | null;           
  weight?: number | null;           
  isBanned?: boolean;
  isPrivate?: boolean;
  assignedTrainer?: string;
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
};

export const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      state.user = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
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
        height: payload.height || null, 
        weight: payload.weight || null, 
        assignedTrainer: payload.assignedTrainer,
        isBanned: payload.isBanned || false,
        isPrivate: payload.isPrivate || false,
        isVerified: payload.isVerified || false,
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

export default userAuthSlice.reducer;
