import { useState } from "react";
import SignupForm from "../../components/user/SignupForm";
import Toast from "../../components/Toast";
import MarketingPanel from "../../components/user/MarketingPanel";

const SignupPage = () => {
  const [error, setError] = useState("");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-900">
      {error && <Toast message={error} onClose={() => setError("")} />}
      
     
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1570829460005-c840387bb1ca?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGVtcHR5JTIwZ3ltfGVufDB8fDB8fHww" 
          alt="Gym Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/50 to-black/60"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row shadow-2xl rounded-xl overflow-hidden">
    
        <div className="w-full lg:w-1/2 rounded-s-3xl backdrop-blur-md bg-gray-900/90 p-8 lg:p-12 border-r border-gray-800">
          <div className="max-w-md  mx-auto">
            <h1 className="text-3xl text-white font-extrabold tracking-wider mb-1 text-center ">
              JOIN <span className="text-[#176B87]">TRAINUP</span>
            </h1>
            <p className="text-gray-400 text-sm mb-8 text-center ">
              Begin your fitness journey today
            </p>
            
            <SignupForm setError={setError} />
          </div>
        </div>
        
        <MarketingPanel />
      </div>
    </div>
  );
};

export default SignupPage;