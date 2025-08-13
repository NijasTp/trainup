import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionButton from "./ActionButton";
import { toast } from "react-toastify";
import { FaLock, FaRedo } from "react-icons/fa";
import { resendOtp as resendOtpApi } from "../../services/authService";
import { login } from "../../redux/slices/userAuthSlice";
import { useDispatch } from "react-redux";
import { signup as signupApi } from "../../services/authService";

interface OtpFormProps {
  userState: {
    email: string;
    name: string;
    password: string;
  };
  setError: (error: string) => void;
}

const OtpForm = ({ userState, setError }: OtpFormProps) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

const dispatch = useDispatch();

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  try {
    const res =await signupApi(userState.name,userState.email,userState.password,otp)

    // dispatch user data to redux
   dispatch(login(res.data.user));

    toast.success("OTP verified successfully");
    navigate("/home");
  } catch (err: any) {
    setError(err.response?.data?.message || "OTP verification failed");
  }
}


  const handleResend = async () => {
    try {
      const res = await resendOtpApi(userState.email)
      toast.success(res.data.message);
      setCountdown(60);
      setResendDisabled(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to resend OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative group">
        <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden group-focus-within:border-[#176B87] group-focus-within:ring-1 group-focus-within:ring-[#176B87] transition-all duration-300">
          <div className="flex items-center justify-center w-12 text-gray-400">
            <FaLock />
          </div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white p-4 placeholder-gray-500 tracking-widest text-center font-mono"
            placeholder="Enter OTP"
            maxLength={6}
          />
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#176B87] to-[#64CCC5] group-focus-within:w-full transition-all duration-300"></div>
      </div>

      <div className="pt-2">
        <ActionButton 
          type="submit" 
          text="VERIFY & CONTINUE" 
          icon={<FaLock className="mr-2" />} 
        />
      </div>


      <div className="text-center pt-4">
        <p className="text-gray-400 text-sm">
          Didn't receive the code?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendDisabled}
          className={`mt-2 flex items-center justify-center mx-auto text-[#176B87] hover:text-[#64CCC5] transition-colors ${
            resendDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <FaRedo className="mr-2" />
          Resend {resendDisabled && <span className="ml-1">in {countdown}s</span>}
        </button>
      </div>

      {/* Security Note */}
      <div className="mt-6 bg-gray-900/30 p-3 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          For your security, the verification code will expire in 10 minutes.
          Please do not share this code with anyone.
        </p>
      </div>
    </form>
  );
};

export default OtpForm;