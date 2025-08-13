import { useState } from "react";
import OtpForm from "../../components/user/OtpForm";
import { useLocation } from "react-router-dom";
import Toast from "../../components/Toast";

const VerifyOtpPage = () => {
  const [error, setError] = useState("");
  const { state } = useLocation();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-900">
      {error && <Toast message={error} onClose={() => setError("")} />}
      
      <div className="absolute inset-0 z-0">
        <img 
          src="https://i.pinimg.com/564x/5d/05/17/5d05170e29ff9b8b9dd6d284e3a8809d.jpg" 
          alt="Gym Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80 bg-gradient-to-b from-black/90 to-black/70"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-md bg-gray-800/90 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="pt-10 px-8 pb-6">
            <h1 className="text-center text-3xl font-extrabold tracking-wider text-white">
              VERIFY <span className="text-[#176B87]">OTP</span>
            </h1>
            <p className="text-center text-gray-400 text-sm mt-1">
              Enter the verification code sent to your email
            </p>
          </div>
          
          <div className="px-8 pb-8">
            <OtpForm userState={state} setError={setError} />
          </div>
          
          <div className="bg-black/30 py-4 px-8 text-center text-xs text-gray-500">
            © 2025 TrainUp. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;