import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IActivityData } from '@/interfaces/user/IUserDashboard';

interface DashboardState {
    data: any | null;
    activityData: IActivityData | null;
    lastFetched: number | null;
    loading: boolean;
}

const initialState: DashboardState = {
    data: null,
    activityData: null,
    lastFetched: null,
    loading: false,
};

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setDashboardData: (state, action: PayloadAction<any>) => {
            state.data = action.payload;
            state.lastFetched = Date.now();
        },
        setActivityData: (state, action: PayloadAction<IActivityData>) => {
            state.activityData = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        invalidateCache: (state) => {
            state.lastFetched = null;
        }
    }
});

export const { setDashboardData, setActivityData, setLoading, invalidateCache } = dashboardSlice.actions;
export default dashboardSlice.reducer;
