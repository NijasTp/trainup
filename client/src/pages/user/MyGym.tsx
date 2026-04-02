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
  getAttendanceHistoryForUser,
  getUserWishlist
} from "@/services/gymService";
import GymReviews from "@/components/user/reviews/GymReviews";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [wishlist, setWishlist] = useState<any[]>([]);
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
      const [gymRes, annRes, eqRes, prodRes, tempRes, wishlistRes] = await Promise.all([
        API.get("/user/my-gym"),
        getUserGymAnnouncements(1, 4),
        getUserGymEquipment(),
        getUserGymProducts(1, 4),
        getUserGymWorkoutTemplates(1, 3),
        getUserWishlist()
      ]);

      const gym = gymRes.data.gym;
      const history = await getAttendanceHistoryForUser(gym._id, 1, 15);

      setGymData(gymRes.data);
      setAnnouncements(annRes.announcements || []);
      setEquipment(eqRes.equipment || []);
      setProducts(prodRes.products || []);
      setTemplates(tempRes.templates || []);
      setAttendance(history.attendance || []);
      setWishlist(wishlistRes.products || []);

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

          {/* LEFT: STATUS & ARMORY */}
          <div className="lg:col-span-8 space-y-12">

            {/* Membership Card */}
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
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none italic text-white">
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

            {/* SECTOR: ARMORY (Equipment & Store) */}
            <section className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                  <Dumbbell className="h-5 w-5 text-cyan-500" /> Sector: <span className="text-zinc-500">Armory</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Tactical Gear Card */}
                <Link to={ROUTES.USER_GYM_SHOP} className="group block">
                  <div className="h-full bg-white/5 border border-white/10 rounded-[3rem] p-10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                      <Activity size={80} className="text-cyan-400" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div>
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-4">SUPPLIES</Badge>
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">Tactical <br /><span className="text-cyan-400">Gear Shop</span></h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{products.filter(p => p.isAvailable).length} ITEMS AVAILABLE NOW</p>
                      </div>
                      
                      <div className="flex -space-x-3">
                         {products.filter(p => p.isAvailable).slice(0, 4).map((p, i) => (
                           <div key={i} className="h-10 w-10 rounded-full border-2 border-black overflow-hidden bg-zinc-800">
                             <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                           </div>
                         ))}
                         {products.filter(p => p.isAvailable).length > 4 && (
                           <div className="h-10 w-10 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[10px] font-black text-cyan-500">
                             +{products.filter(p => p.isAvailable).length - 4}
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Tactical Wishlist Card */}
                <Link to={ROUTES.USER_WISHLIST} className="group block">
                  <div className="h-full bg-zinc-950/80 border border-white/5 rounded-[3rem] p-10 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 transition-all relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                       <Shield size={80} className="text-fuchsia-400" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div>
                        <Badge className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-4">RESERVED</Badge>
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">Target <br /><span className="text-fuchsia-400">Wishlist</span></h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{wishlist.length} PENDING ACQUISITIONS</p>
                      </div>

                      <div className="flex items-center gap-3">
                         {wishlist.slice(0, 3).map((w, i) => (
                           <div key={i} className="h-12 w-12 rounded-2xl border border-white/10 overflow-hidden">
                              <img src={w.images[0]} alt="" className="w-full h-full object-cover" />
                           </div>
                         ))}
                         {wishlist.length === 0 && <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest italic italic">Scan gear to prioritize...</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Equipment Sector Map Link Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {equipment.slice(0, 4).map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(ROUTES.USER_GYM_EQUIPMENT)}
                    className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center gap-4 text-center group cursor-pointer hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all shadow-xl"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                       <Dumbbell className="h-6 w-6 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest italic line-clamp-1">{item.name}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECTOR: LOGS (Attendance) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-white">
                  <Activity className="h-5 w-5 text-green-500" /> Sector: <span className="text-zinc-500">Logs</span>
                </h3>
                <Link to={ROUTES.USER_GYM_ATTENDANCE}>
                  <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400">Tactical History <ArrowUpRight className="ml-2 h-3 w-3" /></Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {attendance.length === 0 ? (
                  <div className="col-span-full py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
                    <Activity className="h-10 w-10 text-zinc-700" />
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No recent entry records detected...</p>
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
                      <div className="relative z-10 space-y-3 text-center">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-green-500/20 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-center">
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

          {/* RIGHT: SECTOR: UPDATES (Announcements) */}
          <div className="lg:col-span-4 h-full">
            <Card className="bg-black/40 border border-white/10 rounded-[3rem] h-full flex flex-col overflow-hidden backdrop-blur-3xl shadow-2xl sticky top-24">
              <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                  <Bell className="h-5 w-5 text-cyan-400" /> Sector: <span className="text-zinc-500">Updates</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[800px] scrollbar-hide p-8 space-y-8">
                {announcements.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <AlertCircle className="h-10 w-10 text-zinc-800" />
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Digital silence maintained from HQ...</p>
                  </div>
                ) : (
                  announcements.map((ann, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative rounded-[2.5rem] bg-zinc-900 border border-white/5 overflow-hidden transition-all hover:border-cyan-500/30"
                    >
                      {ann.image && (
                         <div className="absolute inset-0 z-0">
                           <img src={ann.image} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                         </div>
                      )}
                      
                      <div className="relative z-10 p-8 space-y-4">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic bg-cyan-500/10 px-3 py-1 rounded-full">
                          {safeFormatDate(ann.createdAt, 'MMM dd, yyyy')}
                        </span>
                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight group-hover:text-cyan-400 transition-colors">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-[0.02em] leading-relaxed">
                          {ann.description || ann.content}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-zinc-950/50">
                <Link to={ROUTES.USER_GYM_ANNOUNCEMENTS}>
                   <Button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 font-black uppercase italic tracking-[0.2em] text-[11px] text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all">
                     View All HQ Briefings
                   </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* FEEDBACK & PROTOCOL REPORTS */}
        <section className="pt-24">
          <div className="flex items-end justify-between mb-12 px-4">
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full font-black uppercase tracking-[0.3em] text-[10px] italic">REPORTS</Badge>
              <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">Sector <span className="text-zinc-500">Feedback</span></h2>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-[3s]">
                <Activity size={400} className="text-white" />
             </div>
             <div className="relative z-10">
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
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
