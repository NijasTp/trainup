import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Dumbbell,
  MapPin,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { useNavigate, Link } from "react-router-dom";
import API from "@/lib/axios";
import {
  getUserGymAnnouncements,
  getUserGymEquipment,
  getUserGymProducts,
  getUserGymWorkoutTemplates,
  markAttendance,
  getAttendanceHistoryForUser
} from "@/services/gymService";
import GymReviews from "@/components/user/reviews/GymReviews";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const safeFormatDate = (date: any, formatStr: string = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return format(d, formatStr);
};

export default function MyGym() {
  const [gymData, setGymData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TrainUp - Dashboard";
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [gymRes, annRes, eqRes, prodRes, tempRes] = await Promise.all([
        API.get("/user/my-gym"),
        getUserGymAnnouncements(1, 4),
        getUserGymEquipment(),
        getUserGymProducts(1, 4),
        getUserGymWorkoutTemplates(1, 3)
      ]);

      const gym = gymRes.data.gym;
      const history = await getAttendanceHistoryForUser(gym._id, 1, 15);

      setGymData(gymRes.data);
      setAnnouncements(annRes.announcements || []);
      setEquipment(eqRes.equipment || []);
      setProducts(prodRes.products || []);
      setTemplates(tempRes.templates || []);
      setAttendance(history.attendance || []);

      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
      const attendedToday = (history.attendance || []).some((a: any) =>
        new Date(a.date).toLocaleDateString('en-CA') === todayStr
      );
      setHasAttendedToday(attendedToday);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      if (err.response?.status === 404) {
        toast.error("Active membership required");
        navigate("/gyms");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!gymData?.gym?._id) return;

    setIsMarkingAttendance(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await markAttendance(gymData.gym._id, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

          toast.success(res.message);
          setHasAttendedToday(true);
          fetchDashboardData();
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Failed to mark attendance");
        } finally {
          setIsMarkingAttendance(false);
        }
      }, () => {
        toast.error("Please enable location access to mark attendance");
        setIsMarkingAttendance(false);
      });
    } catch (error: any) {
      toast.error(error.message);
      setIsMarkingAttendance(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} />
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-primary/20 rounded-full" />
            <div className="w-24 h-24 border-t-2 border-primary rounded-full animate-spin absolute top-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="text-primary animate-pulse" size={32} />
            </div>
          </div>
          <p className="text-zinc-500 font-black italic tracking-[0.3em] uppercase animate-pulse">Synchronizing Data...</p>
        </div>
      </div>
    );
  }

  if (!gymData) return null;

  const { gym, userSubscription } = gymData;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-x-hidden font-outfit">
      {/* Dynamic Background Layer */}
      <div className="fixed inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12 flex-1 z-10">
        {/* Header Section - Modern Brutalist */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-white/5">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="h-16 w-16 rounded-[2rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <Dumbbell className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.3em] border-cyan-500/30 text-cyan-400 py-1 px-3 rounded-full bg-cyan-500/5">
                  HQ COMMAND
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
                  {gym.name}
                </h1>
              </div>
            </motion.div>
            <div className="flex items-center gap-6 text-zinc-500 font-bold uppercase tracking-widest text-[11px] italic">
              <span className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-cyan-500" /> {gym.address}
              </span>
              <span className="h-1 w-1 bg-zinc-800 rounded-full" />
              <span className="flex items-center gap-2 text-green-500">
                <Activity className="h-3 w-3" /> ACTIVE PROTOCOL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {hasAttendedToday ? (
              <div className="h-14 px-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-500 font-black uppercase italic tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={20} className="animate-bounce" /> ATTENDANCE MARKED
              </div>
            ) : (
              <Button
                onClick={handleMarkAttendance}
                disabled={isMarkingAttendance}
                className="h-14 px-8 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase italic tracking-widest text-xs shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
              >
                {isMarkingAttendance ? <Activity className="animate-spin mr-2" /> : <MapPin className="mr-2" />} Mark Presence
              </Button>
            )}
          </div>
        </section>

        {/* Dashboard Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: STATUS & ATTENDANCE */}
          <div className="lg:col-span-8 space-y-8">

            {/* Membership "Intelligence Card" */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl backdrop-blur-3xl"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Shield className="h-72 w-72" />
              </div>

              <div className="relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">{userSubscription.planName} MEMBER</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none italic text-white line-clamp-2">
                      Mission <span className="text-zinc-500">Status</span>: <br />
                      <span className="text-cyan-400">Deployed</span>
                    </h2>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md min-w-[200px] text-center md:text-right">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Days Remaining</p>
                    <div className="text-6xl font-black tracking-tighter text-white tabular-nums italic">
                      {(() => {
                        if (!userSubscription.expiresAt) return "??";
                        const days = Math.ceil((new Date(userSubscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return days > 0 ? days : "00";
                      })()}
                    </div>
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-1">Operational</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Entry Window</p>
                    <p className="text-xl font-bold text-white italic">{userSubscription.preferredTime || "00:00 - 23:59"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Start Date</p>
                    <p className="text-xl font-bold text-white italic">{safeFormatDate(userSubscription.subscribedAt, 'MMM dd, yy')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Expiration</p>
                    <p className="text-xl font-bold text-white italic">{safeFormatDate(userSubscription.expiresAt, 'MMM dd, yy')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Sector Price</p>
                    <p className="text-xl font-bold text-cyan-400 italic">₹{userSubscription.planPrice}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Attendance Analytics */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-white">
                  <Activity className="h-5 w-5 text-green-500" /> Entry Logs
                </h3>
                <Link to={ROUTES.USER_GYM_ATTENDANCE}>
                  <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400">Archived Data <ArrowUpRight className="ml-2 h-3 w-3" /></Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {attendance.length === 0 ? (
                  <div className="col-span-full py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
                    <Activity className="h-10 w-10 text-zinc-700" />
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No recent entry detected</p>
                  </div>
                ) : (
                  attendance.slice(0, 5).map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative overflow-hidden bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center group hover:bg-green-500/5 hover:border-green-500/30 transition-all cursor-crosshair"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-green-500/20 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-green-500 transition-colors">
                            {safeFormatDate(log.date, 'EEE, MMM dd')}
                          </p>
                          <p className="text-sm font-black text-white italic">{safeFormatDate(log.checkInTime, 'hh:mm a')}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: UPDATES & PROTOCOL */}
          <div className="lg:col-span-4 space-y-8">
            {/* Announcements Terminal */}
            <Card className="bg-black/40 border border-white/10 rounded-[3rem] h-full flex flex-col overflow-hidden backdrop-blur-3xl shadow-2xl">
              <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                  <Bell className="h-5 w-5 text-cyan-400" /> Briefings
                </h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-[9px] font-black tracking-widest">LIVE</Badge>
              </div>

              <CardContent className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[500px] scrollbar-hide">
                {announcements.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <AlertCircle className="h-10 w-10 text-zinc-800" />
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Digital silence maintained</p>
                  </div>
                ) : (
                  announcements.map((ann, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                    >
                      <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest italic mb-2 block">
                        {safeFormatDate(ann.createdAt, 'MMM dd, yyyy')}
                      </span>
                      <h4 className="text-lg font-black text-white italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors mb-3">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-zinc-500 leading-relaxed font-bold uppercase tracking-tight">
                        {ann.content}
                      </p>
                    </motion.div>
                  ))
                )}
              </CardContent>

              <div className="p-8 border-t border-white/5">
                <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 bg-white/5 font-black uppercase italic tracking-widest text-[10px] text-zinc-500 hover:text-white transition-all">
                  Access Previous Logs
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* System Nodes Section */}
        <section className="pt-12">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
              HQ <span className="text-zinc-500">Inventory</span>
            </h2>
            <Link to={ROUTES.USER_GYM_EQUIPMENT}><Button variant="ghost" className="text-cyan-400 font-black uppercase tracking-widest text-[10px] italic hover:bg-transparent">Sector Map <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {equipment.slice(0, 6).map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate("/gym/equipment-inventory")}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center gap-4 text-center group cursor-pointer hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all shadow-xl backdrop-blur-md"
              >
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all group-hover:rotate-12">
                  <Dumbbell className="h-6 w-6 text-cyan-400" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest italic transition-colors">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feedback Section */}
        <section className="pt-24">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[10px] italic">REPORTS</Badge>
              <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Mission <span className="text-zinc-500">Reports</span></h2>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl">
            <GymReviews
              gymId={gym._id}
              reviews={gym.reviews || []}
              onReviewAdded={(newReview) => {
                setGymData((prev: any) => prev ? {
                  ...prev,
                  gym: {
                    ...prev.gym,
                    reviews: [...(prev.gym.reviews || []), newReview]
                  }
                } : null);
              }}
              canReview={true}
              currentUserPlan={userSubscription?.planName}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
