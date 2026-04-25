import { useEffect, useState, useCallback } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { updateUser, type UserType } from "@/redux/slices/userAuthSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
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
  getUserWishlist,
  type IGym,
  type IGymAnnouncement,
  type IGymMember,
  type IGymAttendance,
  type IGymProduct,
  type IGymWorkoutTemplate
} from "@/services/gymService";
import GymReviews from "@/components/user/reviews/GymReviews";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { GymSidebar } from "@/components/user/gym/GymSidebar";
import ActivityMatrix from "@/components/user/dashboard/ActivityMatrix";
import type { IActivityData } from "@/interfaces/user/IUserDashboard";
import { Calendar } from "lucide-react";

const safeFormatDate = (date: string | Date | undefined | null, formatStr: string = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return format(d, formatStr);
};

export default function MyGym() {
  const [gymData, setGymData] = useState<{ gym: IGym & { reviews?: any[] }; userSubscription: any } | null>(null);
  const [announcements, setAnnouncements] = useState<IGymAnnouncement[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<IGymAttendance[]>([]);
  const [products, setProducts] = useState<IGymProduct[]>([]);
  const [templates, setTemplates] = useState<IGymWorkoutTemplate[]>([]);
  const [wishlist, setWishlist] = useState<IGymProduct[]>([]);
  const [activityData, setActivityData] = useState<IActivityData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [gymRes, annRes, eqRes, prodRes, tempRes, wishlistRes, activityRes] = await Promise.all([
        API.get("/user/my-gym"),
        getUserGymAnnouncements(1, 4),
        getUserGymEquipment(),
        getUserGymProducts(1, 4),
        getUserGymWorkoutTemplates(1, 3),
        getUserWishlist(),
        API.get("/user/dashboard/activity")
      ]);

      if (!gymRes.data || !gymRes.data.gym) {
        throw { response: { status: 404 } }; // Mimic axios error for missing data
      }

      setActivityData(activityRes.data.activityData);

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
      const attendedToday = (history.attendance || []).some((a: IGymAttendance) =>
        new Date(a.date).toLocaleDateString('en-CA') === todayStr
      );
      setHasAttendedToday(attendedToday);
    } catch (_err: unknown) {
      console.error("Dashboard fetch error:", _err);
      const error = _err as any;
      if (error?.response?.status === 404) {
        dispatch(updateUser({ activeGymDetails: null }));
        toast.error("Active membership required");
        navigate("/gyms");
      } else if (error?.response?.data?.message?.toLowerCase().includes('expired')) {
        dispatch(updateUser({ activeGymDetails: null }));
        toast.error("Your gym membership has expired. Please renew.");
        navigate("/pricing");
      } else {
        toast.error("Could not load gym data");
        navigate("/gyms");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "TrainUp - Dashboard";
    fetchDashboardData();
  }, [fetchDashboardData]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkAttendance = async () => {
    try {
      if (!gymData?.gym?._id || !gymData?.gym?.geoLocation) {
        toast.error("Gym location data not available");
        return;
      }

      setIsMarkingAttendance(true);

      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const [gymLng, gymLat] = gymData.gym.geoLocation.coordinates;

          const distance = calculateDistance(latitude, longitude, gymLat, gymLng);

          if (distance > 1) { // 1km limit
            toast.error(`You are too far from the gym (${distance.toFixed(2)}km). You must be within 1km to mark attendance.`);
            setIsMarkingAttendance(false);
            return;
          }

          try {
            await markAttendance(gymData.gym._id, { lat: latitude, lng: longitude });
            toast.success("Attendance marked successfully!");
            setHasAttendedToday(true);
            fetchDashboardData();
          } catch (error: any) {
            console.error("Failed to mark attendance:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Failed to mark attendance";
            toast.error(msg);
          } finally {
            setIsMarkingAttendance(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to get your location. Please enable location services.");
          setIsMarkingAttendance(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } catch (_err) {
      setIsMarkingAttendance(false);
      toast.error("An unexpected error occurred while marking attendance");
    }
  };

  const handleCancelMembership = async () => {
    try {
      if (!userSubscription?._id) return;
      await API.post("/user/gyms/cancel-membership", {
        membershipId: userSubscription._id
      });
      toast.success("Membership cancelled successfully");

      // Update Redux state immediately
      dispatch(updateUser({ activeGymDetails: null }));

      setGymData(null);
      navigate("/gyms");
    } catch (_err: unknown) {
      console.error("Failed to cancel membership:", _err);
      const errorMessage = (_err && typeof _err === 'object' && 'response' in _err) ? (_err as any).response?.data?.error : "Failed to cancel membership";
      toast.error(errorMessage || "Failed to cancel membership");
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

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-12 flex gap-8 flex-1 z-10">
        <GymSidebar />

        <main className="flex-1 py-12 space-y-12">
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
                    GYM DASHBOARD
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
                  <Activity className="h-3 w-3" /> GYM ACTIVE
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
                        Membership <span className="text-zinc-500">Status</span>: <br />
                        <span className="text-cyan-400">Active</span>
                      </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md min-w-[200px] text-center md:text-right">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Days Remaining</p>
                        <div className="text-6xl font-black tracking-tighter text-white tabular-nums italic">
                          {(() => {
                            if (!userSubscription.expiresAt) return "??";
                            const days = Math.ceil((new Date(userSubscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            return days > 0 ? days : "00";
                          })()}
                        </div>
                        <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-1">Gym Access</p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-10 text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl font-black italic uppercase tracking-widest text-[10px]"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" /> Cancel Membership
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#0a0a0a] border border-white/10 backdrop-blur-2xl rounded-3xl p-8">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black italic uppercase text-white">Cancel Gym Membership?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-500 font-medium py-4">
                              Your current membership at {gym.name} is active.
                              Cancelling now will grant you a partial refund to your wallet based on remaining days.
                              This action ends your access immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-4">
                            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-xl font-bold uppercase text-[10px] text-white">Keep Membership</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelMembership}
                              className="bg-red-500 text-white hover:bg-red-600 h-12 rounded-xl font-bold uppercase text-[10px]"
                            >
                              Confirm Cancellation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Plan Price</p>
                      <p className="text-xl font-bold text-cyan-400 italic">₹{userSubscription.planPrice}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* SECTOR: ARMORY (Equipment & Store) */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-cyan-500" /> Gym Store & <span className="text-zinc-500">Equipment</span>
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
                          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-4">SHOP</Badge>
                          <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">Explore <br /><span className="text-cyan-400">Gym Shop</span></h4>
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
                          <Badge className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-4">FAVORITES</Badge>
                          <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">My <br /><span className="text-fuchsia-400">Wishlist</span></h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{wishlist.length} SAVED ITEMS</p>
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
                    <Activity className="h-5 w-5 text-green-500" /> Recent <span className="text-zinc-500">Visits</span>
                  </h3>
                  <Link to={ROUTES.USER_GYM_ATTENDANCE}>
                    <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400">Attendance History <ArrowUpRight className="ml-2 h-3 w-3" /></Button>
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

            {/* RIGHT: SECTOR: UPDATES (Announcements as Social Posts) */}
            <div className="lg:col-span-4 h-full">
              <div className="space-y-6 sticky top-24">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                    <Bell className="h-5 w-5 text-cyan-400" /> <span className="text-zinc-500">Feed</span>
                  </h3>
                </div>

                <div className="space-y-8">
                  {announcements.length === 0 ? (
                    <div className="py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
                      <AlertCircle className="h-10 w-10 text-zinc-800" />
                      <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Transmission Silence...</p>
                    </div>
                  ) : (
                    announcements.slice(0, 3).map((ann, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="group bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-2xl"
                      >
                        {ann.image && (
                          <div className="h-48 overflow-hidden relative">
                            <img src={ann.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60" />
                          </div>
                        )}

                        <div className="p-8 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                              <Dumbbell size={14} className="text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Gym HQ</h4>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
                                {safeFormatDate(ann.createdAt || ann.date, 'MMM dd, h:mm a')}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-lg font-black text-white italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors leading-tight">
                              {ann.title}
                            </h5>
                            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed line-clamp-3">
                              {ann.description || ann.content}
                            </p>
                          </div>

                          <div className="pt-4 flex items-center justify-between border-t border-white/5">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map(j => (
                                <div key={j} className="h-6 w-6 rounded-full bg-zinc-800 border-2 border-zinc-900" />
                              ))}
                            </div>
                            <Link to={ROUTES.USER_GYM_ANNOUNCEMENTS}>
                              <Button variant="ghost" className="h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10">
                                DETAILS
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="px-4">
                  <Link to={ROUTES.USER_GYM_ANNOUNCEMENTS}>
                    <Button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 font-black uppercase italic tracking-[0.2em] text-[11px] text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all shadow-xl group">
                      Explore All Field Reports <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FEEDBACK & PROTOCOL REPORTS */}
          <section className="pt-24">
            <div className="flex items-end justify-between mb-12 px-4">
              <div className="space-y-4">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1 rounded-full font-black uppercase tracking-[0.3em] text-[10px] italic">ENGAGEMENT</Badge>
                <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">Your <span className="text-zinc-500">Activity</span></h2>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl">
              <ActivityMatrix activityData={activityData} />
            </div>

            <div className="flex items-end justify-between mb-12 mt-24 px-4">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full font-black uppercase tracking-[0.3em] text-[10px] italic">REVIEWS</Badge>
                <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">Gym <span className="text-zinc-500">Reviews</span></h2>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-[3s]">
                <Activity size={400} className="text-white" />
              </div>
              <div className="relative z-10">
                <GymReviews
                  gymId={gymData.gym._id}
                  onReviewAdded={() => {
                    // No need to manually update state, internal fetch handles it
                    // but we could refresh stats if needed.
                  }}
                  canReview={true}
                  currentUserPlan={gymData.userSubscription.planName}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
