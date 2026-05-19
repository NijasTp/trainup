import { useState } from "react";
import SignupForm from "../../components/user/SignupForm";
import ColorBends from "@/components/ui/ColorBends";
import { toast } from "sonner";

const SignupPage = () => {
  const [error, setError] = useState("");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 lg:p-8">
      {/* ColorBends Background Layer */}
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
          className="pointer-events-none"
          style={{ pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {error && toast.error(error)}

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
          <h1 className="text-center text-4xl font-black tracking-tighter text-white mb-2">
            TRAIN<span className="text-[#176B87]">UP</span>
          </h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest text-center mb-8">
            Begin your fitness journey today
          </p>

          <SignupForm setError={setError} />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;