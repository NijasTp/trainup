import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Activity,
  Clock,
  ArrowLeft
} from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { getAttendanceHistoryForUser, getMyGym } from "@/services/gymService";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedDateLogs, setSelectedDateLogs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "TrainUp | Mission Logs";
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const gymData = await getMyGym();
      const history = await getAttendanceHistoryForUser(gymData.gym._id, 1, 100);
      setAttendance(history.attendance || []);
    } catch (error) {
      console.error("Fetch attendance error:", error);
    }
  };

  const attendanceDates = attendance.map(a => new Date(a.date));

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    const logs = attendance.filter(a => isSameDay(new Date(a.date), date));
    if (logs.length > 0) {
      setSelectedDateLogs(logs);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-x-hidden font-outfit">
      <div className="fixed inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.03)_0%,transparent_70%)]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12 flex-1 z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12 border-b border-white/5">
          <div className="space-y-4">
            <Link to={ROUTES.USER_GYM_DASHBOARD} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-3 w-3" /> HQ COMMAND
            </Link>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-[2rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <CalendarDays className="h-8 w-8 text-cyan-400" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Mission <span className="text-zinc-500">Logs</span>
              </h1>
            </motion.div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center md:text-right">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Total Deployments</p>
              <p className="text-5xl font-black text-white italic">
                {attendance.length}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Calendar Section */}
          <div className="lg:col-span-12 xl:col-span-7">
            <Card className="bg-black/40 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
              <CardContent className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                    <Activity className="h-5 w-5 text-cyan-400" /> Tactical Calendar
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Deployed</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center bg-white/[0.02] rounded-[2.5rem] p-8 border border-white/5 shadow-inner">
                  <Calendar
                    mode="multiple"
                    selected={attendanceDates}
                    onSelect={(_dates, selectedDay) => handleDateClick(selectedDay)}
                    className="rounded-md border-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center mb-6",
                      caption_label: "text-xl font-black uppercase italic tracking-[0.2em] text-white",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-10 w-10 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse",
                      head_row: "flex w-full mt-2 mb-6",
                      head_cell: "text-zinc-600 rounded-md w-14 font-black text-[10px] uppercase tracking-widest text-center",
                      row: "flex w-full mt-2",
                      cell: "h-14 w-14 text-center text-sm p-0 relative focus-within:z-20 w-full",
                      day: "h-14 w-14 p-0 font-bold aria-selected:opacity-100 rounded-2xl hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20",
                      day_selected: "bg-cyan-500 text-black hover:bg-cyan-600 hover:text-black focus:bg-cyan-500 focus:text-black shadow-[0_0_25px_rgba(34,211,238,0.5)] border-0",
                      day_today: "bg-white/10 font-black text-cyan-400 border-white/20",
                      day_outside: "text-zinc-800 opacity-30",
                      day_disabled: "text-zinc-800 opacity-30",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[2rem] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-cyan-400">
                Deployment Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedDateLogs.map((log, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Marked On</p>
                    <p className="text-xl font-black text-white italic uppercase">{format(new Date(log.date), 'MMMM dd, yyyy')}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <Clock className="h-3 w-3 text-cyan-400" />
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Check-in: {format(new Date(log.checkInTime), 'hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {log.isValidLocation ? (
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">HQ VERIFIED</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/20 text-[8px] font-black uppercase tracking-widest">SCAN ERR</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <SiteFooter />
    </div>
  );
}
