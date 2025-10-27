import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GymType {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  location?: string; 
  verifyStatus?: 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
}

interface GymAuthState {
  gym: GymType | null;
  token: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  loading: boolean;
}


const initialState: GymAuthState = {
  gym: null,
  token: null,
  isAuthenticated: false,
  isVerified: false,
  loading: false,
};

export const gymAuthSlice = createSlice({
  name: "gymAuth",
  initialState,
  reducers: {
    loginGym: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      state.gym = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        profileImage: payload.profileImage,
        location: payload.location,
        verifyStatus: payload.verifyStatus,
        isVerified: payload.isVerified || false,
      };
      state.isAuthenticated = true;
      state.isVerified = payload.isVerified || false;
    },
    logoutGym: (state) => {
      state.gym = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isVerified = false;
    },
    setGymLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { loginGym, logoutGym, setGymLoading } = gymAuthSlice.actions;

export default gymAuthSlice.reducer;