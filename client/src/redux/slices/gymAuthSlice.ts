import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { gymLogout } from "@/services/authService";
import { Types } from "mongoose";

interface GymType {
  _id: string | Types.ObjectId;
  role: "gym";
  name: string | null;
  email: string | null;
  profileImage: string | null;
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  certificate: string;
  verifyStatus: "pending" | "approved" | "rejected";
  rejectReason: string | null;
  isBanned: boolean;
  tokenVersion?: number;
  announcements: { title: string; message: string; date: Date }[];
  trainers?: string[] | Types.ObjectId[];
  members?: string[] | Types.ObjectId[];
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  images: string[] | null;

  isVerified: boolean;
}

interface GymAuthState {
  gym: GymType | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: GymAuthState = {
  gym: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

export const gymAuthSlice = createSlice({
  name: "gymAuth",
  initialState,
  reducers: {
    loginGym: (state, action: PayloadAction<Partial<GymType>>) => {
      const payload = action.payload;
      const isVerified = payload.verifyStatus === "approved";

      state.gym = {
        ...payload,
        _id: payload._id?.toString() || '',
        isVerified,
        trainers: payload.trainers?.map(id => id.toString()) || [],
        members: payload.members?.map(id => id.toString()) || [],
        createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : null,
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt).toISOString() : null,
      } as GymType;

      state.isAuthenticated = true;
    },

    logoutGym: (state) => {
      state.gym = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    setGymLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Optional: Update specific fields (e.g., after reapply)
    updateGymDetails: (state, action: PayloadAction<Partial<GymType>>) => {
      if (!state.gym) return;
      state.gym = {
        ...state.gym,
        ...action.payload,
        isVerified: action.payload.verifyStatus === "approved",
      };
    },
  },
});

export const { loginGym, logoutGym, setGymLoading, updateGymDetails } = gymAuthSlice.actions;

export default gymAuthSlice.reducer;

// Async logout with server cookie clear
export const logoutGymThunk = createAsyncThunk(
  "gymAuth/logoutGymThunk",
  async (_, { dispatch }) => {
    try {
      await gymLogout();
    } finally {
      dispatch(logoutGym());
    }
  }
);