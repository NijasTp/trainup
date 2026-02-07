import { ROUTES } from "@/constants/routes";
import api from "@/lib/axios";
import { loginGym } from "@/redux/slices/gymAuthSlice";
import type { RootState } from "@/redux/store";
import { useEffect, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";


interface Props {
    children: JSX.Element;
}

export const GymPreventLoggedIn: React.FC<Props> = ({ children }) => {
    const { gym } = useSelector((state: RootState) => state.gymAuth);


    if (gym) {
        if (gym.verifyStatus === 'approved') {
            return <Navigate to={ROUTES.GYM_DASHBOARD} replace />;
        } else {
            return <Navigate to={ROUTES.GYM_STATUS} replace />;
        }
    }


    return children;
};

export const GymProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { gym } = useSelector((state: RootState) => state.gymAuth);
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/gym/get-details");
                dispatch(loginGym(res.data));
            } catch (err) {
                console.error("Failed to fetch gym profile", err);
            }
        };
        // Initial fetch
        if (!gym) fetchProfile();

        const interval = setInterval(fetchProfile, 30000);

        return () => clearInterval(interval);
    }, [dispatch, gym]);

    if (!gym) {
        return <Navigate to={ROUTES.GYM_LOGIN} replace />;
    }

    // Strict check for verified status
    if (gym.verifyStatus !== 'approved') {
        // Allow access to status and reapply pages
        if (location.pathname === ROUTES.GYM_STATUS || location.pathname === ROUTES.GYM_REAPPLY) {
            return children;
        }
        return <Navigate to={ROUTES.GYM_STATUS} replace />;
    }


    return children;
};
