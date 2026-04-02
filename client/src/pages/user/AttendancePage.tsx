import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Target,
  AlertCircle
} from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { getAttendanceHistoryForUser, getMyGym } from "@/services/gymService";
import { getAllSessions } from "@/services/workoutService";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isFuture,
  isToday,
  startOfDay
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [gymAttendance, setGymAttendance] = useState<any[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joinDate, setJoinDate] = useState<Date | null>(null);

  const calculateActiveDays = () => {
    const activeDates = new Set<string>();
    gymAttendance.forEach(a => activeDates.add(format(new Date(a.date), "yyyy-MM-dd")));
    workoutSessions.forEach(s => {
      if (s.isDone) activeDates.add(format(new Date(s.date), "yyyy-MM-dd"));
    });
    return activeDates.size;
  };

  useEffect(() => {
    document.title = "TrainUp | Attendance History";
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const gymData = await getMyGym();
      const [history, sessions] = await Promise.all([
        getAttendanceHistoryForUser(gymData.gym._id, 1, 1000),
        getAllSessions()
      ]);
      setGymAttendance(history.attendance || []);
      setWorkoutSessions(sessions.workoutSessions || sessions.sessions || []);
      setJoinDate(gymData.userSubscription?.subscribedAt ? new Date(gymData.userSubscription.subscribedAt) : null);
    } catch (error) {
      console.error("Fetch logs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayStatus = (day: Date) => {
    if (isFuture(day)) return 'future';
    
    // Check if before join date
    if (joinDate && day < startOfDay(joinDate)) return 'preJoin';
    
    // Check for Sundays
    if (day.getDay() === 0) return 'sunday';

    const attendedGym = gymAttendance.some(a => isSameDay(new Date(a.date), day));
    const sessions = workoutSessions.filter(s => isSameDay(new Date(s.date), day));
    
    const hasWorkout = sessions.length > 0;
    const allWorkoutDone = hasWorkout && sessions.every(s => s.isDone);
    const anyWorkoutDone = hasWorkout && sessions.some(s => s.isDone);

    if (allWorkoutDone && attendedGym) return 'perfect'; // Green + Glow
    if (anyWorkoutDone || attendedGym) return 'active'; // Cyan/Green
    if (hasWorkout && !anyWorkoutDone && !isToday(day)) return 'missed'; // Red
    
    return 'neutral'; // Yellow (Rest)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] border-emerald-400';
      case 'active': return 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)] border-cyan-400';
      case 'missed': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-400';
      case 'sunday': 
      case 'preJoin': return 'bg-white/5 border-white/5 text-zinc-700';
      case 'future': return 'bg-transparent border-white/5 opacity-20';
      default: return 'bg-yellow-500/10 border-yellow-500/10 text-yellow-500/20';
    }
  };

  const getDayData = (day: Date) => {
    const gym = gymAttendance.find(a => isSameDay(new Date(a.date), day));
    const sessions = workoutSessions.filter(s => isSameDay(new Date(s.date), day));
    return { gym, sessions };
  };

  const renderHeader = () => (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b border-white/5 relative z-20">
      <div className="space-y-4">
        <Link to={ROUTES.USER_GYM_DASHBOARD} className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-cyan-400 transition-all">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> GYM DASHBOARD / ATTENDANCE HISTORY
        </Link>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2.5rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
            <CalendarDays className="h-10 w-10 text-cyan-400" />
          </div>
          <div className="space-y-1">
             <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black tracking-[0.3em] uppercase px-4 py-1 rounded-full mb-2">GYM DATA</Badge>
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white">
               Attendance <span className="text-zinc-500">History</span>
             </h1>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-12 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl">
        <div className="text-center">
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Total Active Days</p>
          <p className="text-5xl font-black text-cyan-400 italic tabular-nums">{calculateActiveDays()}</p>
        </div>
      </div>
    </header>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button onClick={prevMonth} variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-black transition-all">
                <ChevronLeft size={24} />
              </Button>
              <h2 className="text-3xl font-black uppercase italic tracking-widest text-white">
                {format(currentMonth, "MMMM / yyyy")}
              </h2>
              <Button onClick={nextMonth} variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-black transition-all">
                <ChevronRight size={24} />
              </Button>
           </div>
           
           <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Perfect', color: 'bg-emerald-500' },
                { label: 'Active', color: 'bg-cyan-500' },
                { label: 'Missed', color: 'bg-red-500' },
                { label: 'Rest', color: 'bg-yellow-500/20 border-yellow-500/20' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                   <div className={cn("w-3 h-3 rounded-full", item.color)} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-black/60 border border-white/10 rounded-[3.5rem] p-4 md:p-8 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
           <div className="grid grid-cols-7 gap-2 md:gap-4">
              {weekDays.map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-normal text-zinc-600 italic">
                  {day}
                </div>
              ))}
              
              {days.map((day, i) => {
                const status = getDayStatus(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDayToday = isToday(day);
                
                return (
                  <motion.div
                    key={i}
                    whileHover={status !== 'future' ? { scale: 1.05, y: -5 } : {}}
                    onClick={() => {
                       if (status !== 'future') {
                         setSelectedDay(day);
                         setIsModalOpen(true);
                       }
                    }}
                    className={cn(
                      "relative aspect-square w-full rounded-2xl md:rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all border-2 group/day overflow-hidden",
                      !isCurrentMonth && "opacity-10 pointer-events-none",
                      getStatusColor(status)
                    )}
                  >
                    {/* Interior Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/day:opacity-100 transition-opacity" />
                    
                    {/* Deployment Markings */}
                    <span className={cn(
                      "text-xl md:text-3xl font-black italic tabular-nums relative z-10",
                      status === 'neutral' ? "text-white/20" : "text-black"
                    )}>
                      {format(day, "d")}
                    </span>

                    {status === 'perfect' && (
                       <div className="absolute top-2 right-2">
                          <Zap size={10} className="text-black fill-black" />
                       </div>
                    )}
                    
                    {isDayToday && (
                      <div className="absolute bottom-2 px-2 py-0.5 rounded-full bg-white/20 text-[6px] font-black uppercase tracking-tighter text-white">
                        Current
                      </div>
                    )}
                  </motion.div>
                );
              })}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-x-hidden font-outfit">
      <div className="fixed inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12 flex-1 z-10">
        {isLoading ? (
           <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
              <Activity className="h-12 w-12 text-cyan-400 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">Loading Attendance History...</p>
           </div>
        ) : (
          <>
            {renderHeader()}
            {renderCalendar()}
          </>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[3rem] max-w-xl p-0 overflow-hidden backdrop-blur-3xl">
            {selectedDay && (
              <div className="relative">
                <div className="h-32 bg-cyan-500/10 border-b border-white/5 flex items-center px-10 gap-6">
                   <div className="h-16 w-16 rounded-2xl bg-cyan-500 flex items-center justify-center text-black">
                      <Target size={32} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Attendance <span className="text-cyan-400">Details</span>
                      </h2>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{format(selectedDay, "EEEE, MMMM do yyyy")}</p>
                   </div>
                </div>

                <div className="p-10 space-y-8">
                   {/* Results */}
                   <div>
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Gym Attendance</span>
                            <Shield size={14} className={cn(getDayData(selectedDay).gym ? "text-emerald-500" : "text-zinc-700")} />
                         </div>
                         <p className="text-xl font-black italic text-white uppercase">{getDayData(selectedDay).gym ? "Verified" : "No Scan"}</p>
                         {getDayData(selectedDay).gym && (
                            <p className="text-[10px] font-bold text-emerald-500/60 uppercase">Check-in: {format(new Date(getDayData(selectedDay).gym.checkInTime), "hh:mm a")}</p>
                         )}
                      </div>
                   </div>

                   {/* Session List */}
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Activity size={12} className="text-cyan-500" /> Day Activity
                      </h4>
                      {getDayData(selectedDay).sessions.length === 0 ? (
                         <div className="p-10 rounded-3xl bg-white/[0.02] border border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-4">
                            <AlertCircle size={24} className="text-zinc-700" />
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">No workouts were scheduled for this day.</p>
                         </div>
                      ) : (
                        getDayData(selectedDay).sessions.map((session, i) => (
                           <div key={i} className="group p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-cyan-500/5 transition-all">
                              <div className="space-y-1">
                                 <p className="text-sm font-black text-white italic uppercase">{session.workoutId?.title || "Workout Session"}</p>
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase">{session.duration || "45"} MINS / {session.workoutId?.difficultyLevel || "Advanced"}</p>
                              </div>
                              {session.isDone ? (
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[8px] font-black uppercase px-3 py-1">COMPLETED</Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-500 border-0 text-[8px] font-black uppercase px-3 py-1">MISSED</Badge>
                              )}
                           </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <SiteFooter />
    </div>
  );
}
