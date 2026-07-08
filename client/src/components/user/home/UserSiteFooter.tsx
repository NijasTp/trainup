import { Link } from "react-router-dom";
import { Activity, Github, Twitter, Instagram } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="w-full bg-[#09090a] border-t-2 border-[#1f1f1f] py-12 px-6 relative z-10 font-sans">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Activity className="w-4.5 h-4.5 text-[#22d3ee]" />
            </div>
            <span className="text-lg font-extrabold tracking-wider font-mono text-white uppercase">
              TRAINUP
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-500 text-center md:text-left max-w-xs leading-relaxed uppercase">
            Level up your consistency, build habits, and crush your fitness quests.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8 font-mono text-xs font-bold text-neutral-400">
          <Link to="/workouts" className="hover:text-white hover:translate-y-[-1px] transition-all uppercase tracking-wider">
            Workouts
          </Link>
          <Link to="/diets" className="hover:text-white hover:translate-y-[-1px] transition-all uppercase tracking-wider">
            Diet
          </Link>
          <Link to="/trainers" className="hover:text-white hover:translate-y-[-1px] transition-all uppercase tracking-wider">
            Trainers
          </Link>
          <Link to="/gyms" className="hover:text-white hover:translate-y-[-1px] transition-all uppercase tracking-wider">
            Gyms
          </Link>
        </nav>

        {/* Footer Meta Details / Socials */}
        <div className="flex flex-col items-center md:items-end space-y-2">
          <div className="flex items-center gap-3.5 text-neutral-500">
            <a href="#" className="hover:text-[#22d3ee] transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#22d3ee] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#22d3ee] transition-colors"><Github className="w-4 h-4" /></a>
          </div>
          <p className="text-[9px] font-mono text-neutral-600">
            &copy; {new Date().getFullYear()} TRAINUP. ALL QUESTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
};