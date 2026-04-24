import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Dumbbell, 
  Target, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Star
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
  const [recentHistory, setRecentHistory] = useState<any[]>([]); // Sessions can be complex, keeping any for now but could be refined if IWorkoutSession exists
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.userAuth.user);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getWorkoutTemplates({ search, limit: 20 });
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
    } catch (err) {
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

  const oneTimeTemplates = templates.filter(t => t.type === 'one-time');
  const seriesTemplates = templates.filter(t => t.type === 'series');

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit selection:bg-primary/30">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 relative z-10 space-y-20 flex-1">
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
               className="relative rounded-[3rem] border border-white/10 shadow-3xl rotate-2 hover:rotate-0 transition-transform duration-700"
               alt="Aesthetics"
            />
          </div>
        </header>

        {/* Assigned by Trainer - Conditional */}
        {user?.assignedTrainer && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-l-4 border-yellow-500 pl-6">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Trainer Assigned</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Exclusive Routines from your Professional Coach</p>
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase animate-pulse">Elite Priority</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {templates.filter(t => t.isAssignedByTrainer).map(template => (
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] rounded-[3rem] bg-white/5 animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 text-slate-500">
              <Dumbbell className="h-10 w-10 opacity-20" />
            </div>
            <h2 className="text-2xl font-bold uppercase italic tracking-widest">Zero Intelligence Found</h2>
            <Button onClick={() => setSearch("")} variant="outline" className="border-white/10 rounded-2xl px-8 h-12">System Reset</Button>
          </div>
        ) : (
          <>
            {/* Quick Sessions */}
            {oneTimeTemplates.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-6">
                  <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Quick Hits</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">One-Time Tactical Sessions</p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">Instant Access</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {oneTimeTemplates.map(template => (
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
            {seriesTemplates.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                  <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Elite Programs</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Multi-Session Transformations</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">Series</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {seriesTemplates.map(template => (
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
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function HistoryShowcaseCard({ session, index }: { session: any, index: number }) {
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

  return (
    <Card 
      className="group relative bg-white/5 backdrop-blur-xl border-white/10 hover:border-primary/40 transition-all duration-700 overflow-hidden rounded-[3rem] flex flex-col shadow-2xl hover:-translate-y-4"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
          <Badge className={cn("uppercase text-[10px] font-black tracking-widest px-4 py-1.5 border backdrop-blur-md shadow-xl", difficultyColors[template.difficultyLevel] || difficultyColors.intermediate)}>
            {template.difficultyLevel}
          </Badge>
          {isActive && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black tracking-widest text-[10px] uppercase backdrop-blur-md shadow-xl">
              Currently Engaged
            </Badge>
          )}
        </div>

        <div className="absolute bottom-8 left-8 right-8">
           <div className="flex items-center gap-1 mb-2">
             {[1, 2, 3, 4, 5].map(i => (
               <Star key={i} className={cn("h-3 w-3 fill-current", i <= 4 ? "text-primary" : "text-slate-600")} />
             ))}
             <span className="text-[10px] font-black text-white/50 ml-1">4.8 AVERAGE</span>
           </div>
           <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none shadow-black drop-shadow-2xl">
             {template.title}
           </h3>
        </div>
      </div>

      <CardContent className="p-8 flex flex-col flex-1 space-y-8">
        <div className="flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{template.days?.length || 1} Phases</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{template.type}</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 font-light">
          {template.description || "Achieve tactical superiority with this precision engineered training protocol designed for maximum hypertrophy."}
        </p>

        <Button 
          onClick={onPreview}
          className={cn(
            "w-full h-16 rounded-2xl font-black italic tracking-widest transition-all shadow-xl uppercase text-lg group/btn relative overflow-hidden",
            isActive 
              ? "bg-white text-black hover:bg-slate-200" 
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
             {isActive ? 'Continue Session' : template.type === 'one-time' ? 'Preview Drill' : 'View Protocol'}
             <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
        </Button>
      </CardContent>
    </Card>
  );
}
