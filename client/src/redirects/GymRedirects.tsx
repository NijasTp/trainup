import React, { useEffect, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {type RootState } from "@/redux/store";
import { getGymDetails } from "@/services/gymService";
import { loginGym } from "@/redux/slices/gymAuthSlice";
import { logoutGymThunk } from "@/redux/slices/gymAuthSlice";

interface Props {
  children: JSX.Element;
}

export const GymAuthRedirect: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gym } = useSelector((state: RootState) => state.gymAuth);
  const isAuthenticated = !!gym?._id;

  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await getGymDetails();
        const details = data.gymDetails;
        if (details) {
          dispatch(loginGym(details));
          if (details.isBanned) {
            await (dispatch as any)(logoutGymThunk());
            navigate('/gym/login', { replace: true });
            return;
          }
          if (details.verifyStatus === 'rejected') {
            navigate('/gym/reapply', { replace: true, state: { rejectReason: details.rejectReason } });
            return;
          }
          if (details.verifyStatus === 'approved') {
            navigate('/gym/dashboard', { replace: true });
            return;
          }
          navigate('/gym/waitlist', { replace: true });
        }
      } catch (e) {
        // ignore and show children
      }
    };
    checkStatus();
  }, [isAuthenticated]);

  return children;
};


export const GymProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { gym } = useSelector((state: RootState) => state.gymAuth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!gym?._id) return;
      try {
        const data = await getGymDetails();
        const details = data.gymDetails;
        if (details) {
          dispatch(loginGym({ ...details, isVerified: details.verifyStatus === 'approved' }));

          if (details.isBanned) {
            await (dispatch as any)(logoutGymThunk());
          }
        }
      } catch (err) {
        // ignore error 
      }
    };
    fetchProfile();
    const interval = setInterval(fetchProfile, 30000);

    return () => clearInterval(interval);
  }, [dispatch, gym?._id]);

  
  if (!gym?._id) {
    return <Navigate to="/gym/login" replace />;
  }

  if (gym.isBanned) {
    return <Navigate to="/gym/login" replace />;
  }

  if (gym.verifyStatus === 'rejected' && location.pathname !== '/gym/reapply') {
    return (
      <Navigate
        to="/gym/reapply"
        replace
        state={{ rejectReason: gym.rejectReason }}
      />
    );
  }

  if (
    gym.verifyStatus !== "approved" &&
    location.pathname !== "/gym/waitlist" &&
    location.pathname !== "/gym/reapply"
  ) {
    return <Navigate to="/gym/waitlist" replace />;
  }

  if (
    gym.verifyStatus === "approved" &&
    ["/gym/login", "/gym/reapply", "/gym/waitlist"].includes(location.pathname)
  ) {
    return <Navigate to="/gym/dashboard" replace />;
  }

  return children;
};


