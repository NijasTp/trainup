import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      navigate("/signup?error=" + error);
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } else {
      navigate("/signup?error=auth_failed");
    }
  }, [location, navigate]);

  return <div className="text-center text-gray-300">Loading...</div>;
};

export default Callback;