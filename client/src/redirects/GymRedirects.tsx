import { ROUTES } from "@/constants/routes";
import api from "@/lib/axios";
import { loginGym } from "@/redux/slices/gymAuthSlice";
import type { RootState } from "@/redux/store";
import React, { useEffect, useRef, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";


interface Props {
    children: JSX.Element;
}

export const GymPreventLoggedIn: React.FC<Props> = ({ children }) => {
    const { gym } = useSelector((state: RootState) => state.gymAuth);
    const { user } = useSelector((state: RootState) => state.userAuth);
    const { admin } = useSelector((state: RootState) => state.adminAuth);
    const { trainer } = useSelector((state: RootState) => state.trainerAuth);
    const navigate = useNavigate();

    useEffect(() => {
        if (gym) {
            const gymPath = (gym.verifyStatus === 'approved') ? ROUTES.GYM_DASHBOARD : ROUTES.GYM_STATUS;
            navigate(gymPath, { replace: true });
        } else if (user) {
            toast.error("You are already logged in as User. Please logout first.");
            navigate(ROUTES.USER_HOME_ALT, { replace: true });
        } else if (admin) {
            toast.error("You are already logged in as Admin. Please logout first.");
            navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else if (trainer) {
            toast.error("You are already logged in as Trainer. Please logout first.");
            const trainerPath = (trainer.profileStatus === 'approved') ? ROUTES.TRAINER_DASHBOARD : ROUTES.TRAINER_WAITLIST;
            navigate(trainerPath, { replace: true });
        }
    }, [gym, user, admin, trainer, navigate]);

    if (gym || user || admin || trainer) return null;

    return children;
};

export const GymProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { gym } = useSelector((state: RootState) => state.gymAuth);
    const location = useLocation();
    const dispatch = useDispatch();

    const gymRef = useRef(gym);
    useEffect(() => { gymRef.current = gym; }, [gym]);

    const hasChecked = useRef(false);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/gym/session");
                dispatch(loginGym(res.data));
            } catch (err) {
                console.error("Failed to fetch gym profile", err);
            }
        };

        // Initial fetch on mount if gym exists
        if (gymRef.current && !hasChecked.current) {
            fetchProfile();
            hasChecked.current = true;
        }

        const interval = setInterval(() => { 
            if (gymRef.current) fetchProfile(); 
        }, 60000); 

        return () => clearInterval(interval);
    }, [dispatch]); 

    if (!gym) {
        return <Navigate to={ROUTES.GYM_LOGIN} replace />;
    }

    if (gym.verifyStatus !== 'approved') {
        if (location.pathname === ROUTES.GYM_STATUS || location.pathname === ROUTES.GYM_REAPPLY) {
            return children;
        }
        return <Navigate to={ROUTES.GYM_STATUS} replace />;
    }


    return children;
};
