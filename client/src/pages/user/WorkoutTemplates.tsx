import { useCallback, useEffect, useState } from "react";
import { 
  Search, 
  Dumbbell, 
  ChevronRight,
  TrendingUp,
  Layers,
  Activity,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { getWorkoutTemplates } from "@/services/templateService";
import { fetchWorkoutHistory } from "@/services/workoutService";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";
import type { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

type SafeAny = any;

export default function WorkoutTemplates() {
  const [templates, setTemplates] = useState<IWorkoutTemplate[]>([]);
  const [recentHistory, setRecentHistory] = useState<SafeAny[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Filters State
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [isFullBody, setIsFullBody] = useState(false);

  const user = useSelector((state: RootState) => state.userAuth.user);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getWorkoutTemplates({ search, limit: 40 });
      setTemplates(response?.templates || []);
    } catch (_err) {
      toast.error("Failed to fetch workout templates");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetchWorkoutHistory(1, 4);
      setRecentHistory(res.sessions || []);
    } catch (errVal) {
      const err = errVal as SafeAny;
      console.error("Failed to fetch history", err);
    }
  }, []);

  useEffect(() => {
    document.title = "TrainUp - Workout Library";
    fetchTemplates();
    fetchHistory();
  }, [fetchTemplates, fetchHistory]);

  const isTemplateActive = (templateId: string) => {
    return user?.activeWorkoutTemplates?.some(t => t.templateId === templateId) || user?.activeWorkoutTemplate === templateId;
  };

  const toggleBodyPart = (part: string) => {
    setSelectedBodyParts(prev => 
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  };

  const clearFilters = () => {
    setSelectedBodyParts([]);
    setIsFullBody(false);
  };

  const applyFilters = (list: IWorkoutTemplate[]) => {
    return list.filter(template => {
      // Full Body filter: targets 3 or more body parts
      if (isFullBody) {
        if (!template.targetBodyParts || template.targetBodyParts.length < 3) {
          return false;
        }
      }
      // Selected body parts filter: must target at least one of the selected parts
      if (selectedBodyParts.length > 0) {
        if (!template.targetBodyParts || !template.targetBodyParts.some(part => selectedBodyParts.includes(part))) {
          return false;
        }
      }
      return true;
    });
  };

  const oneTimeTemplates = templates.filter(t => t.type === 'one-time');
  const seriesTemplates = templates.filter(t => t.type === 'series');

  const filteredOneTime = applyFilters(oneTimeTemplates);
  const filteredSeries = applyFilters(seriesTemplates);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-6 py-12 space-y-10 flex-1 z-10 max-w-5xl w-full">
        {/* Header Section */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-8 md:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <span className="bg-cyan-500/5 text-[#22d3ee] border border-[#22d3ee]/20 py-0.5 px-2.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              TACTICAL BLUEPRINTS
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-mono text-white uppercase tracking-tight leading-none">
              WORKOUT BLUEPRINTS
            </h1>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
              Select a specialized template below to load your daily quest log. Optimized for maximum hypertrophy and performance.
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-[#22d3ee] transition-colors" />
            <input
              type="text"
              placeholder="Search blueprints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white font-mono text-xs uppercase tracking-wider outline-none transition-colors"
            />
          </div>
        </section>

        {/* Recently Done Showcase */}
        {recentHistory.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#171717] border border-[#262626] rounded-lg text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">RECENT ACCOMPLISHMENTS</h2>
              </div>
              <Link to="/workouts/history">
                <button className="text-[#22d3ee] hover:text-[#67e8f9] font-mono font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer border-0 bg-transparent p-0 flex items-center">
                  VIEW FULL HISTORY <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentHistory.map((session, idx) => (
                <HistoryShowcaseCard key={session._id} session={session} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Premium Body Parts Filter Bar */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#0d0d0e] border border-[#262626] rounded-lg text-[#22d3ee]">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-extrabold font-mono uppercase text-white tracking-wider">TARGET MATRIX FOCUS</h3>
            </div>
            {(selectedBodyParts.length > 0 || isFullBody) && (
              <button 
                onClick={clearFilters} 
                className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#22d3ee] hover:text-[#67e8f9] transition-colors flex items-center gap-1 bg-[#0d0d0e] px-3 py-1.5 rounded-lg border border-[#262626]"
              >
                Clear Filters <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Full Body Toggle Button */}
            <button
              onClick={() => setIsFullBody(!isFullBody)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border-2",
                isFullBody
                  ? "bg-cyan-500/5 text-[#22d3ee] border-[#22d3ee]"
                  : "bg-[#0d0d0e] text-neutral-400 border-[#262626] hover:border-neutral-700 hover:text-white"
              )}
            >
              <Layers size={12} />
              Full Body Focus
            </button>

            {/* Separator */}
            <div className="hidden sm:block w-px h-6 bg-[#262626] mx-1" />

            {/* Body Parts Buttons */}
            {["abs", "arm", "chest", "leg", "back", "shoulder"].map((part) => {
              const isSelected = selectedBodyParts.includes(part);
              return (
                <button
                  key={part}
                  onClick={() => toggleBodyPart(part)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all border-2",
                    isSelected
                      ? "bg-white text-black border-white"
                      : "bg-[#0d0d0e] text-neutral-400 border-[#262626] hover:border-neutral-700 hover:text-white"
                  )}
                >
                  {part}
                </button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
            <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing blueprints...</p>
          </div>
        ) : (filteredOneTime.length === 0 && filteredSeries.length === 0) ? (
          <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 bg-[#0d0d0e] border border-[#262626] rounded-full flex items-center justify-center text-neutral-600">
              <Dumbbell className="h-8 w-8 opacity-20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold font-mono text-white uppercase tracking-tight">No Blueprints Match Filters</h2>
              <button 
                onClick={clearFilters} 
                className="duo-btn-outline h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Quick Sessions */}
            {filteredOneTime.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#22d3ee] rounded-full" />
                  <h2 className="text-base font-extrabold font-mono uppercase text-white tracking-wide">QUICK HITS (ONE-TIME SESSIONS)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOneTime.map(template => (
                    <TemplateCard 
                      key={template._id} 
                      template={template} 
                      isActive={isTemplateActive(template._id)}
                      onPreview={() => navigate(`/workouts/preview/${template._id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Training Series */}
            {filteredSeries.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                  <h2 className="text-base font-extrabold font-mono uppercase text-white tracking-wide">ELITE PROGRAMS (SERIES)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSeries.map(template => (
                    <TemplateCard 
                      key={template._id} 
                      template={template} 
                      isActive={isTemplateActive(template._id)}
                      onPreview={() => navigate(`/workouts/preview/${template._id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function HistoryShowcaseCard({ session, index }: { session: SafeAny, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group relative duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] hover:border-[#404040] hover:border-b-[7px] hover:border-b-[#262626] rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-36"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase">
            {session.source?.toUpperCase() || 'SESSION'}
          </span>
          <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
            {formatDistanceToNow(new Date(session.completedAt || session.updatedAt), { addSuffix: true })}
          </span>
        </div>
        <h4 className="text-xs font-extrabold font-mono uppercase text-white truncate group-hover:text-[#22d3ee] transition-colors mt-2">
          {session.name}
        </h4>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <div className="p-1 bg-[#0d0d0e] border border-[#262626] rounded text-[#22d3ee]">
          <Dumbbell className="h-3 w-3" />
        </div>
        <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">{session.exercises?.length || 0} drills logged</span>
      </div>
    </motion.div>
  );
}

function TemplateCard({ template, isActive, onPreview }: { 
  template: IWorkoutTemplate; 
  isActive: boolean; 
  onPreview: () => void;
}) {
  const difficultyColors = {
    beginner: "bg-cyan-950/20 text-[#22d3ee] border-[#22d3ee]/20",
    intermediate: "bg-amber-950/20 text-amber-400 border-amber-900/30",
    advanced: "bg-red-950/20 text-red-400 border-red-900/30"
  };

  const drillCount = template.days?.[0]?.exercises?.length || 0;

  return (
    <div 
      className="group relative duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] hover:border-[#404040] hover:border-b-[7px] hover:border-b-[#262626] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[#262626] bg-[#0d0d0e]">
        <img
          src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
          alt={template.title}
          className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <span className={cn("uppercase text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 border rounded backdrop-blur-md shadow-md", difficultyColors[template.difficultyLevel] || difficultyColors.intermediate)}>
            {template.difficultyLevel}
          </span>
          {isActive && (
            <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-900/40 font-mono text-[8px] font-bold tracking-wider px-2 py-0.5 rounded shadow-md animate-pulse uppercase">
              Active Engaged
            </span>
          )}
        </div>

        {/* Drill Count badge */}
        <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-md border border-[#262626] px-2 py-0.5 rounded text-[8px] font-mono font-bold text-[#22d3ee] uppercase tracking-wider">
          {drillCount} DRILLS
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Body Parts Badges */}
        {template.targetBodyParts && template.targetBodyParts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {template.targetBodyParts.map((part) => (
              <span 
                key={part} 
                className="bg-[#0d0d0e] border border-[#262626] text-neutral-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
              >
                {part}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1 flex-1">
          <h3 className="text-base font-extrabold font-mono uppercase text-white leading-tight group-hover:text-[#22d3ee] transition-colors line-clamp-2">
            {template.title}
          </h3>
          <p className="text-neutral-400 font-mono text-[10px] leading-relaxed line-clamp-3 uppercase mt-2">
            {template.description || "Achieve tactical superiority with this precision engineered training protocol designed for maximum hypertrophy."}
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={onPreview}
            className={cn(
              "w-full h-11 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5",
              isActive 
                ? "duo-btn-outline" 
                : "duo-btn-cyan"
            )}
          >
            <span>
              {isActive ? 'Continue Session' : template.type === 'one-time' ? 'Start Session' : 'View Protocol'}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
