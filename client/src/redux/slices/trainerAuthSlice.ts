import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TrainerType {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  profileStatus: 'approved' | 'rejected' | 'pending'
  specialization?: string;
  experience?: string;
  isVerified: boolean; 
}

interface TrainerAuthState {
  trainer: TrainerType | null; 
  isAuthenticated: boolean; 
  isApplicationPending: boolean; 
}

const initialState: TrainerAuthState = {
  trainer: null,
  isAuthenticated: false,
  isApplicationPending: false,
};

const trainerAuthSlice = createSlice({
  name: "trainerAuth",
  initialState,
  reducers: {
    loginTrainer: (state, action: PayloadAction<{ trainer: TrainerType }>) => {
      state.trainer = action.payload.trainer;
      state.isAuthenticated = true;
      state.isApplicationPending = !action.payload.trainer.isVerified;
    },

    logoutTrainer: (state) => {
      state.trainer = null;
      state.isAuthenticated = false;
      state.isApplicationPending = false;
    },

    updateTrainerVerificationStatus: (state, action: PayloadAction<boolean>) => {
      if (state.trainer) {
        state.trainer.isVerified = action.payload;
        state.isApplicationPending = !action.payload;
      }
    }
  },
});

export const { 
  loginTrainer, 
  logoutTrainer, 
  updateTrainerVerificationStatus
} = trainerAuthSlice.actions;

export default trainerAuthSlice.reducer;
