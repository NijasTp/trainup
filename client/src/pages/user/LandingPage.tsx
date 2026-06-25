import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Activity, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// SVG Asset Imports
import dietSvg from "@/assets/2dAnimation/diet-original.svg";
import gymNewSvg from "@/assets/2dAnimation/gym-new.svg";
import trainerSvg from "@/assets/2dAnimation/personal-trainer.svg";
import progressSvg from "@/assets/2dAnimation/progress-tracker.svg";
import soloSvg from "@/assets/2dAnimation/solo-workout.svg";
import videoCallSvg from "@/assets/2dAnimation/video-call.svg";
import personalWorkoutSvg from "@/assets/2dAnimation/personal-workout.svg";

interface FeatureBlockProps {
  title: string;
  description: string;
  svgPath: string;
  buttonText: string;
  align?: "left" | "right";
  index: number;
}

const FeatureBlock = ({ title, description, svgPath, buttonText, align = "left", index }: FeatureBlockProps) => {
  const isReversed = align === "right";

  return (
    <section className="py-20 md:py-28 px-6 border-b border-[#1f1f1f] last:border-b-0 relative overflow-hidden bg-[#0d0d0e]">
      <div className="container mx-auto max-w-6xl">
        <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-24`}>
          
          {/* Text/Content Column */}
          <motion.div
            initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 space-y-6"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#22d3ee] font-mono text-[9px] tracking-wider uppercase font-bold bg-[#22d3ee]/10 px-2.5 py-0.5 rounded border border-[#22d3ee]/20">
                Quest Objective 0{index}
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase font-outfit">
                {title}
              </h2>
            </div>

            <p className="text-base md:text-lg text-neutral-400 font-medium leading-relaxed font-inter">
              {description}
            </p>

            <div className="pt-2">
              <Link to={ROUTES.USER_SIGNUP}>
                <button className="duo-btn-outline px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider">
                  {buttonText}
                </button>
              </Link>
            </div>
          </motion.div>

          {/* SVG Animated Illustration Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 w-full max-w-md lg:max-w-none flex justify-center relative group"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="w-full max-w-sm md:max-w-md aspect-square flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-[1.03]">
              <img 
                src={svgPath} 
                alt={title} 
                className="w-full h-auto max-h-[340px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  const { user } = useSelector((state: SafeAny) => state.userAuth);
  const { trainer } = useSelector((state: SafeAny) => state.trainerAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home");
    } else if (trainer) {
      navigate("/trainer/dashboard");
    }
  }, [user, trainer, navigate]);

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-white selection:bg-[#22d3ee]/30 overflow-x-hidden relative flex flex-col font-sans">
      
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#0d0d0e] border-b-2 border-[#1f1f1f] py-4 px-6">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] border border-[#262626] flex items-center justify-center text-[#22d3ee] shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-outfit">TRAINUP</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to={ROUTES.USER_LOGIN}>
              <button className="duo-btn-outline px-4 py-2 text-[10px] font-mono font-bold tracking-wider">
                LOG IN
              </button>
            </Link>
            <Link to={ROUTES.USER_SIGNUP}>
              <button className="duo-btn-cyan px-4 py-2 text-[10px] font-mono font-bold tracking-wider">
                GET STARTED
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-6 border-b border-[#1f1f1f] bg-[#0d0d0e]">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-[#22d3ee]/3 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Hero Left Column (Illustration - Personal Workout SVG) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 w-full max-w-md lg:max-w-none flex justify-center order-2 lg:order-1"
            >
              <img 
                src={personalWorkoutSvg} 
                alt="Gamified Fitness Training" 
                className="w-full h-auto max-h-[380px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] animate-pulse-cyan" 
              />
            </motion.div>

            {/* Hero Right Column (Headline & CTAs) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 space-y-8 order-1 lg:order-2 text-center lg:text-left flex flex-col items-center lg:items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#262626] text-[#22d3ee] font-mono text-[9px] tracking-wider uppercase font-bold">
                <Sparkles className="w-3 h-3 text-[#22d3ee]" />
                Interactive Fitness Universe
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white font-outfit uppercase">
                The gamified, motivating way to <br className="hidden md:inline" />
                <span className="text-[#22d3ee] font-outfit">master</span> your fitness.
              </h1>

              <p className="text-base md:text-xl text-neutral-400 font-medium leading-relaxed max-w-lg font-inter">
                Maintain daily training streaks, log nutrition matrices, unlock quest templates, and connect 1-on-1 with certified elite coaches.
              </p>

              <div className="w-full max-w-sm space-y-4 pt-4">
                <Link to={ROUTES.USER_SIGNUP} className="w-full block">
                  <button className="duo-btn-cyan w-full py-4 text-xs font-mono font-bold uppercase tracking-wider">
                    START YOUR QUEST
                  </button>
                </Link>
                <Link to={ROUTES.USER_LOGIN} className="w-full block">
                  <button className="duo-btn-outline w-full py-4 text-xs font-mono font-bold uppercase tracking-wider">
                    I ALREADY HAVE AN ACCOUNT
                  </button>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Feature Explainer Blocks (Alternating 2-column) */}
      <main className="flex-1">
        <FeatureBlock
          title="Construct Your Solo Workouts"
          description="Design custom training sessions or choose from hundreds of preset template blueprints. Log sets, reps, and lifted volumes in a tactile RPG-style grid that charts your personal record velocities."
          svgPath={soloSvg}
          buttonText="DEPLOY TEMPLATES"
          align="left"
          index={1}
        />

        <FeatureBlock
          title="Calibrate Your Macro Fuel"
          description="Log meals in seconds, scan calorics, and review macronutrient splits. Build nutritional ledgers coordinates to sync directly with your current active workout splits."
          svgPath={dietSvg}
          buttonText="SYNC NUTRITION"
          align="right"
          index={2}
        />

        <FeatureBlock
          title="Train With Certified Coaches"
          description="Hire professional fitness coaches who construct direct quest routines for you. They evaluate your daily biometric updates, provide form critiques, and keep your consistency streak active."
          svgPath={trainerSvg}
          buttonText="FIND COACH PROTOCOLS"
          align="left"
          index={3}
        />

        <FeatureBlock
          title="Access Premium Gym Hubs"
          description="Locate verified local gyms and subscribe to memberships. View facility schedules, explore equipped arrays, and scan into clubs seamlessly."
          svgPath={gymNewSvg}
          buttonText="DISCOVER FACILITY HUBS"
          align="right"
          index={4}
        />

        <FeatureBlock
          title="Document Physical Shifting"
          description="Upload daily progress photos to build side-by-side progression compare matrices. Watch your BMI metrics, weight vectors, and biometric history charts evolve over time."
          svgPath={progressSvg}
          buttonText="LOG SNAPSHOTS"
          align="left"
          index={5}
        />

        <FeatureBlock
          title="Live Virtual Consultations"
          description="Schedule direct video check-ins and live sessions with your coach. Get instant adjustments on execution forms, workout intensities, and biometric reports."
          svgPath={videoCallSvg}
          buttonText="START VIRTUAL SESSIONS"
          align="right"
          index={6}
        />
      </main>

      {/* CTA Section */}
      <section className="py-24 md:py-36 px-6 bg-[#09090a] border-t border-[#1f1f1f] text-center relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#22d3ee]/2 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10 space-y-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white font-outfit uppercase">
            Boost your consistency <br className="hidden md:inline" />
            <span className="text-[#22d3ee] font-outfit">starting today.</span>
          </h2>
          
          <p className="text-base md:text-lg text-neutral-400 font-medium max-w-xl mx-auto font-inter">
            Create your account today and gain immediate access to the gamified fitness tracking tools, trainers directory, and facility networks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-xl mx-auto">
            <Link to={ROUTES.USER_SIGNUP} className="w-full sm:flex-1">
              <button className="duo-btn-cyan w-full py-4 text-xs font-mono font-bold uppercase tracking-wider">
                JOIN AS MEMBER
              </button>
            </Link>
            <Link to="/trainer/login" className="w-full sm:flex-1">
              <button className="duo-btn-outline w-full py-4 text-xs font-mono font-bold uppercase tracking-wider">
                BECOME COACH
              </button>
            </Link>
            <Link to="/gym/login" className="w-full sm:flex-1">
              <button className="duo-btn-gray w-full py-4 text-xs font-mono font-bold uppercase tracking-wider">
                PARTNER GYM
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gamified Footer */}
      <footer className="py-16 px-6 border-t-2 border-[#1f1f1f] bg-[#0d0d0e] font-mono">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-6 mb-16">
            
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#171717] border border-[#262626] flex items-center justify-center text-[#22d3ee]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-lg font-black tracking-tight text-white font-outfit">TRAINUP</span>
              </div>
              <p className="text-xs text-neutral-500 max-w-xs font-mono leading-relaxed uppercase">
                Level up your training consistency, coordinate nutrition vectors, and conquer fitness objectives with real-time feedback.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded bg-[#171717] border border-[#262626] flex items-center justify-center hover:border-[#22d3ee]/40 transition-colors text-neutral-400 hover:text-[#22d3ee]">
                  <span className="text-[10px] font-bold">TW</span>
                </a>
                <a href="#" className="w-8 h-8 rounded bg-[#171717] border border-[#262626] flex items-center justify-center hover:border-[#22d3ee]/40 transition-colors text-neutral-400 hover:text-[#22d3ee]">
                  <span className="text-[10px] font-bold">IG</span>
                </a>
                <a href="#" className="w-8 h-8 rounded bg-[#171717] border border-[#262626] flex items-center justify-center hover:border-[#22d3ee]/40 transition-colors text-neutral-400 hover:text-[#22d3ee]">
                  <span className="text-[10px] font-bold">GH</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[#22d3ee] font-bold tracking-wider uppercase text-[10px]">PRODUCT</h4>
              <ul className="space-y-2 text-neutral-500 text-[10px] uppercase font-bold">
                <li><a href="#" className="hover:text-white transition-colors">QUEST NODES</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DIET MATRIX</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TRAINERS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LOCAL GYMS</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[#22d3ee] font-bold tracking-wider uppercase text-[10px]">PARTNERS</h4>
              <ul className="space-y-2 text-neutral-500 text-[10px] uppercase font-bold">
                <li><a href="#" className="hover:text-white transition-colors">FOR COACHES</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FOR GYM HUBS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API INTEGRATIONS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ENTERPRISE TIER</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[#22d3ee] font-bold tracking-wider uppercase text-[10px]">COMPANY</h4>
              <ul className="space-y-2 text-neutral-500 text-[10px] uppercase font-bold">
                <li><a href="#" className="hover:text-white transition-colors">ABOUT MISSION</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SUPPORT LOG</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TERMS INDEX</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[#1f1f1f] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px] uppercase text-neutral-600 font-bold">
            <p>
              &copy; {new Date().getFullYear()} Trainup Platform S-Labs. Locally hosted version.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM MATRIX STATUS: OPERATIONAL
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
