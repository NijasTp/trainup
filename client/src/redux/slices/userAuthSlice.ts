import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

//interfaces

interface UserType {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role:'user'|null;
  experiences?: any[];
}

interface UserAuthState {
  user: UserType | null;
  isAuthenticated: boolean;
  loading: boolean;
}
//initial state



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
        role: 'user',
        experiences: payload.experiences || [],
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
  },
});

export const { login, logout, setLoading } = userAuthSlice.actions;

export default userAuthSlice.reducer;
