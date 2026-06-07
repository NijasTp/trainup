import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import Aurora from "@/components/ui/Aurora";
import { useSelector } from "react-redux";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";
import type { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

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
    } catch (errVal) { const err = errVal as SafeAny;
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
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit selection:bg-primary/30">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#09090b", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 relative z-10 space-y-16 flex-1">
        {/* Hero Section */}
        <header className="flex flex-col lg:flex-row gap-12 items-center justify-between">
          <div className="space-y-6 max-w-2xl text-center lg:text-left">
            <Badge variant="outline" className="px-5 py-1.5 text-primary border-primary/20 bg-primary/5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">
              Elite Training Library
            </Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
              Level Up Your <br />
              <span className="text-primary not-italic">Performance</span>
            </h1>
            <p className="text-xl text-slate-400 font-light max-w-xl mx-auto lg:mx-0">
              Expertly engineered routines for every goal. From quick sessions to professional-grade series.
            </p>
            <div className="max-w-xl relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search goals, equipment, or body focus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-16 py-8 bg-white/5 border-white/10 focus:border-primary/50 text-lg rounded-[2rem] backdrop-blur-xl transition-all shadow-2xl"
              />
            </div>
          </div>

          <div className="hidden lg:block w-[450px] relative">
            <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
            <img 
               src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
               className="relative rounded-[3rem] border border-white/10 shadow-3xl rotate-2 hover:rotate-0 transition-transform duration-700 w-full object-cover aspect-[4/3]"
               alt="Aesthetics"
            />
          </div>
        </header>

        {/* Recently Done Showcase */}
        {recentHistory.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Recently <span className="text-emerald-400">Accomplished</span></h2>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Your Hall of Fame</p>
                </div>
              </div>
              <Link to="/workouts/history">
                <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5 font-black uppercase text-xs tracking-widest flex gap-2">
                  View Full History <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentHistory.map((session, idx) => (
                <HistoryShowcaseCard key={session._id} session={session} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Premium Body Parts Filter Bar */}
        <section className="bg-zinc-950/60 border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-3xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Activity className="text-primary h-5 w-5" />
              <h3 className="font-black text-sm uppercase tracking-widest italic text-zinc-300">Target Core Areas</h3>
            </div>
            {(selectedBodyParts.length > 0 || isFullBody) && (
              <button 
                onClick={clearFilters} 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1.5 self-end md:self-auto bg-primary/10 px-3.5 py-1.5 rounded-xl border border-primary/20"
              >
                Clear Filters <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Full Body Toggle Button */}
            <button
              onClick={() => setIsFullBody(!isFullBody)}
              className={cn(
                "px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
                isFullBody
                  ? "bg-primary text-black border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)] scale-105"
                  : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
              )}
            >
              <Layers size={14} />
              Full Body Focus
            </button>

            {/* Separator */}
            <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

            {/* Body Parts Buttons */}
            {["abs", "arm", "chest", "leg", "back", "shoulder"].map((part) => {
              const isSelected = selectedBodyParts.includes(part);
              return (
                <button
                  key={part}
                  onClick={() => toggleBodyPart(part)}
                  className={cn(
                    "px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                    isSelected
                      ? "bg-zinc-100 text-black border-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
                  )}
                >
                  {part}
                </button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[480px] rounded-[3rem] bg-white/5 border border-white/10"></div>
            ))}
          </div>
        ) : (filteredOneTime.length === 0 && filteredSeries.length === 0) ? (
          <div className="text-center py-24 space-y-6 bg-zinc-950/20 border border-white/5 rounded-[3rem]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-500">
              <Dumbbell className="h-8 w-8 opacity-25" />
            </div>
            <h2 className="text-2xl font-bold uppercase italic tracking-widest text-zinc-400">No blueprints match filters</h2>
            <Button onClick={clearFilters} variant="outline" className="border-white/10 rounded-2xl px-8 h-12 hover:bg-white/5">Reset Filters</Button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Quick Sessions */}
            {filteredOneTime.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Quick Hits</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">One-Time Tactical Sessions</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3.5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider">Instant Access</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <section className="space-y-8">
                <div className="flex items-center gap-4 border-l-4 border-orange-500 pl-6">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Elite Programs</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Multi-Session Transformations</p>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3.5 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider">Series</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      className="group relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-0 font-black text-[9px] px-3 py-1 rounded-lg">
            {session.source?.toUpperCase() || 'SESSION'}
          </Badge>
          <span className="text-[10px] font-bold text-slate-500 italic">
            {formatDistanceToNow(new Date(session.completedAt || session.updatedAt), { addSuffix: true })}
          </span>
        </div>
        <h4 className="text-lg font-black italic uppercase text-white truncate group-hover:text-emerald-400 transition-colors">
          {session.name}
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                <Dumbbell className="h-3 w-3 text-emerald-400" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{session.exercises?.length || 0} Drills Finished</span>
        </div>
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
    beginner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    intermediate: "bg-primary/10 text-primary border-primary/20",
    advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  // Safe drill count extraction
  const drillCount = template.days?.[0]?.exercises?.length || 0;

  return (
    <Card 
      className="group relative bg-[#0e0e11] border border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden rounded-[2.5rem] flex flex-col shadow-2xl hover:-translate-y-3"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          <Badge className={cn("uppercase text-[9px] font-black tracking-wider px-3.5 py-1 border backdrop-blur-md shadow-xl", difficultyColors[template.difficultyLevel] || difficultyColors.intermediate)}>
            {template.difficultyLevel}
          </Badge>
          {isActive && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black tracking-wider text-[9px] uppercase backdrop-blur-md shadow-xl animate-pulse">
              Active Engaged
            </Badge>
          )}
        </div>

        {/* Drill Count badge */}
        <div className="absolute bottom-4 right-6 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{drillCount} DRILLS</span>
        </div>
      </div>

      <CardContent className="p-8 flex flex-col flex-1 space-y-6 bg-[#0e0e11]">
        {/* Body Parts Badges */}
        {template.targetBodyParts && template.targetBodyParts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {template.targetBodyParts.map((part) => (
              <span 
                key={part} 
                className="bg-white/5 border border-white/10 text-zinc-300 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider"
              >
                {part}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight group-hover:text-primary transition-colors">
            {template.title}
          </h3>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 font-light">
          {template.description || "Achieve tactical superiority with this precision engineered training protocol designed for maximum hypertrophy."}
        </p>

        <div className="pt-2">
          <Button 
            onClick={onPreview}
            className={cn(
              "w-full h-14 rounded-2xl font-black italic tracking-widest transition-all shadow-xl uppercase text-xs group/btn relative overflow-hidden",
              isActive 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-primary text-slate-950 hover:bg-primary/90"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
               {isActive ? 'Continue Session' : template.type === 'one-time' ? 'Start Session' : 'View Protocol'}
               <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1.5 transition-transform" />
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
