import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  History,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { fetchWorkoutHistory } from "@/services/workoutService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function WorkoutHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "TrainUp - Workout History";
    loadHistory();
  }, [page, source]);

  async function loadHistory() {
    setIsLoading(true);
    try {
      const res = await fetchWorkoutHistory(page, 10, source);
      setHistory(res.sessions || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setIsLoading(false);
    }
  }

  const sources = [
    { label: "All Sources", value: undefined, icon: <History className="h-4 w-4" /> },
    { label: "Templates", value: "template", icon: <Target className="h-4 w-4" /> },
    { label: "Admin", value: "admin", icon: <Target className="h-4 w-4" /> },
    { label: "Trainer", value: "trainer", icon: <Dumbbell className="h-4 w-4" /> },
    { label: "Gym", value: "gym", icon: <CalendarIcon className="h-4 w-4" /> },
    { label: "Direct", value: "user", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>

      <SiteHeader />

      <main className="relative z-10 container mx-auto px-4 py-12 flex-1 flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[10px] font-black">
              Performance Archives
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              Workout <span className="text-primary italic">History</span>
            </h1>
            <p className="text-slate-400 max-w-xl">
              Track your journey, analyze your performance, and see every drop of sweat translate into progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 h-11 px-6 font-bold text-sm flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-primary" />
                  {sources.find(s => s.value === source)?.label || "All Sources"}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0c0c0c] border-white/10 rounded-2xl w-56 p-2 backdrop-blur-2xl">
                {sources.map((s: any) => (
                  <DropdownMenuItem 
                    key={s.label} 
                    onClick={() => { setSource(s.value); setPage(1); }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 focus:bg-primary/20 hover:bg-white/5 cursor-pointer rounded-lg m-1",
                      source === s.value && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="text-primary">{s.icon}</span>
                    <span className="font-bold text-sm tracking-wide">{s.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-slate-500 shadow-2xl">
              <History className="h-10 w-10 opacity-20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No Records Found</h2>
              <p className="text-slate-400 max-w-xs mx-auto">
                {source ? `You haven't completed any workouts from "${source}" yet.` : "Your legends haven't been written yet. Start a session to begin your timeline."}
              </p>
            </div>
            {source && (
              <Button onClick={() => { setSource(undefined); setPage(1); }} variant="outline" className="rounded-xl border-white/10">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {history.map((session, index) => (
              <HistoryCard key={session._id} session={session} index={index} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-8">
                <Button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  variant="outline" 
                  className="rounded-full h-12 w-12 p-0 border-white/10 bg-white/5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
                  <span className="text-primary font-black">{page}</span>
                  <span className="text-slate-500">/</span>
                  <span className="font-bold text-slate-300">{totalPages}</span>
                </div>
                <Button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  variant="outline" 
                  className="rounded-full h-12 w-12 p-0 border-white/10 bg-white/5"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function HistoryCard({ session, index }: { session: any, index: number }) {
  const sourceColors: any = {
    template: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: <Target className="h-3 w-3" /> },
    admin: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: <Target className="h-3 w-3" /> },
    trainer: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: <Dumbbell className="h-3 w-3" /> },
    gym: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", icon: <CalendarIcon className="h-3 w-3" /> },
    user: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  };

  const style = sourceColors[session.source] || sourceColors.user;

  return (
    <Card 
      className="group relative bg-white/5 backdrop-blur-2xl border-white/10 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl"
      style={{ animation: `slideUp 0.6s ease-out forwards ${index * 0.1}s`, opacity: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-8">
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-3">
            <Badge className={cn("rounded-full px-3 py-1 font-bold text-[10px] uppercase flex items-center gap-1.5", style.bg, style.text, style.border)}>
              {style.icon} {session.source || 'Session'}
            </Badge>
            <span className="text-slate-500 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <CalendarIcon className="h-3 w-3" /> {
                (() => {
                  const date = new Date(session.completedAt || session.updatedAt || Date.now());
                  return isNaN(date.getTime()) ? 'Recent Session' : format(date, "MMMM d, yyyy");
                })()
              }
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">
            {session.name}
          </h3>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">{session.exercises?.length || 0} Drills</span>
            </div>
            {session.goal && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold truncate max-w-[150px]">{session.goal}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-[2rem] border border-white/10 min-w-[160px] group-hover:bg-primary group-hover:border-primary transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white/80 transition-colors">Performance</span>
          <span className="text-3xl font-black italic group-hover:text-white flex items-center gap-1">
            {session.isDone ? '100' : '0'}<span className="text-sm font-bold opacity-50group-hover:text-white/60 text-primary group-hover:text-white/60 transition-colors">%</span>
          </span>
          <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black tracking-widest text-[9px] group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 transition-all">
            COMPLETED
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
