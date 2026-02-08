import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Star,
  CreditCard,
  Bell,
  ChevronRight,
  Dumbbell,
  ShoppingBag,
  Flame,
  Zap,
  Clock,
  ArrowRight,
  MapPin,
  Trophy,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import {
  getUserGymAnnouncements,
  getUserGymEquipment,
  getUserGymProducts,
  getUserGymWorkoutTemplates
} from "@/services/gymService";
import GymReviews from "@/components/user/reviews/GymReviews";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MyGym() {
  const [gymData, setGymData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        getUserGymAnnouncements(1, 3),
        getUserGymEquipment(),
        getUserGymProducts(1, 4),
        getUserGymWorkoutTemplates(1, 3)
      ]);

      setGymData(gymRes.data);
      setAnnouncements(annRes.announcements || []);
      setEquipment(eqRes.equipment || []);
      setProducts(prodRes.products || []);
      setTemplates(tempRes.templates || []);
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
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" />
      </div>

      <SiteHeader />

      <main className="relative flex-1 z-10 pb-24">
        {/* --- HERO SECTION --- */}
        <div className="relative h-[60vh] min-h-[500px] flex items-end">
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ duration: 1.5 }}
              src={gym?.profileImage || gym?.images?.[0]}
              className="w-full h-full object-cover grayscale-[50%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
          </div>

          <div className="container mx-auto px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase italic">
                  <Flame size={12} className="mr-2 inline" /> ACTIVE HQ
                </Badge>
                {userSubscription?.expiresAt && (
                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black tracking-widest uppercase italic">
                    <Clock size={12} />
                    {(() => {
                      const days = Math.ceil((new Date(userSubscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return days > 0 ? `${days} DAYS REMAINING` : "MEMBERSHIP EXPIRED";
                    })()}
                  </div>
                )}
              </div>

              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-6 uppercase">
                {gym?.name}
              </h1>

              <div className="flex flex-wrap items-center gap-8 mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Base Location</p>
                    <p className="text-sm font-bold text-white">{gym?.address || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Star size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Reputation</p>
                    <p className="text-sm font-bold text-white">{gym?.rating || "0.0"} / 5.0</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Users size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Member Unit</p>
                    <p className="text-sm font-bold text-white">{gym?.memberCount || 0} Registered</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 -mt-16 space-y-24">
          {/* --- BROADCAST CENTER --- */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Broadcast Center</h2>
                <div className="h-1 w-24 bg-primary mt-2" />
              </div>
              <Button variant="link" className="text-primary font-black uppercase text-xs tracking-widest italic hover:gap-2 transition-all">
                ALL SIGNALS <ChevronRight size={14} />
              </Button>
            </div>

            {announcements.length === 0 ? (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <Bell size={48} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 font-bold uppercase italic tracking-widest">No active broadcasts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {announcements.map((ann, i) => (
                  <motion.div
                    key={ann._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 group hover:border-primary/20 transition-all cursor-default"
                  >
                    {ann.image && (
                      <div className="h-40 rounded-2xl overflow-hidden mb-6 relative">
                        <img src={ann.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                      </div>
                    )}
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest italic mb-2 block">
                      {format(new Date(ann.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <h3 className="text-xl font-black text-white italic uppercase mb-4 tracking-tight group-hover:text-primary transition-colors">
                      {ann.title}
                    </h3>
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed italic line-clamp-3">
                      {ann.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* --- RESOURCE GALLERY (EQUIPMENT) --- */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Arsenal Gallery</h2>
                <div className="h-1 w-24 bg-primary mt-2" />
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black italic text-zinc-500">
                  <Dumbbell size={12} /> {equipment.length} ASSETS
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="overflow-x-auto pb-6 scrollbar-hide flex gap-6 px-2">
                {equipment.length === 0 ? (
                  <div className="w-full h-48 flex items-center justify-center bg-zinc-900/40 border border-white/5 rounded-[2.5rem]">
                    <p className="text-zinc-600 font-bold uppercase italic tracking-widest">Inventory scanner offline</p>
                  </div>
                ) : (
                  equipment.map((eq, i) => (
                    <motion.div
                      key={eq._id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="min-w-[280px] bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all"
                    >
                      <div className="h-40 relative">
                        <img src={eq.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute top-4 left-4">
                          <Badge className={`${eq.available ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border-0 text-[8px] font-black tracking-widest px-2 uppercase`}>
                            {eq.available ? 'ONLINE' : 'MAINTENANCE'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">{eq.categoryName}</p>
                        <h4 className="text-lg font-black text-white italic uppercase tracking-tight">{eq.name}</h4>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="absolute right-0 top-0 bottom-6 w-32 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* --- BLUEPRINT HUB (WORKOUT TEMPLATES) --- */}
            <section>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Blueprint Hub</h2>
                  <div className="h-1 w-24 bg-primary mt-2" />
                </div>
              </div>
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <Flame size={32} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-600 font-bold uppercase italic tracking-widest text-sm">No training blueprints deployed</p>
                  </div>
                ) : (
                  templates.map((temp) => (
                    <motion.div
                      key={temp._id}
                      whileHover={{ x: 10 }}
                      className="bg-zinc-900/40 border border-white/5 rounded-[1.5rem] p-6 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-xl">
                          <Zap size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white italic uppercase tracking-tight group-hover:text-primary transition-colors">{temp.title}</h4>
                          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest italic mt-1">
                            {temp.days?.length} Training Cycles • {temp.goal || "General Strength"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-zinc-800 group-hover:text-primary transition-colors" />
                    </motion.div>
                  ))
                )}
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white font-black uppercase italic tracking-widest mt-4">
                  EXPLORE ALL BLUEPRINTS
                </Button>
              </div>
            </section>

            {/* --- PREMIUM STORE PREVIEW --- */}
            <section>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Premium Gear</h2>
                  <div className="h-1 w-24 bg-primary mt-2" />
                </div>
                <Button variant="link" className="text-primary font-black uppercase text-xs tracking-widest italic hover:gap-2 transition-all">
                  OPEN ARMORY <ChevronRight size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-2 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <ShoppingBag size={32} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-600 font-bold uppercase italic tracking-widest text-sm">Armory shelves are empty</p>
                  </div>
                ) : (
                  products.map((prod) => (
                    <motion.div
                      key={prod._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-4 group hover:border-primary/20 transition-all"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                        <img src={prod.images?.[0]} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/80 rounded-lg text-primary font-black italic text-xs">
                          ₹{prod.price}
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-white italic uppercase tracking-tight truncate px-1 group-hover:text-primary transition-colors">{prod.name}</h4>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* --- COMMUNITY & SUBSCRIPTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12">
            <Card className="bg-zinc-950/50 border-white/5 rounded-[3rem] p-4 lg:col-span-2 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users size={200} />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-black italic text-white uppercase tracking-tight flex items-center gap-4">
                  <Trophy className="text-primary" /> COMMUNITY ELITE
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gymData.members?.slice(0, 6).map((member: any) => (
                  <div key={member._id} className="flex items-center gap-4 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-primary/20 transition-all">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={member.profileImage} />
                      <AvatarFallback className="bg-zinc-800 text-white font-black uppercase italic">{member.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-white italic uppercase truncate">{member.name}</p>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Member Unit</p>
                    </div>
                  </div>
                ))}
                <button className="flex items-center justify-center gap-3 p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20 hover:bg-primary/20 transition-all group">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">JOIN ALL</span>
                  <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950/50 border-white/5 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="text-2xl font-black italic text-white uppercase tracking-tight flex items-center gap-4">
                  <CreditCard className="text-primary" /> ACCESS LEVEL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-8 bg-zinc-900 border border-white/5 rounded-[2rem] text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic mb-2">Current Protocol</p>
                  <h3 className="text-4xl font-black text-white italic uppercase mb-2 tracking-tighter">{userSubscription?.planName || "STATIC"}</h3>
                  <div className="flex items-baseline justify-center gap-1 text-primary">
                    <span className="text-xl font-black italic">₹</span>
                    <span className="text-4xl font-black tracking-tighter">{userSubscription?.planPrice || "0"}</span>
                    <span className="text-xs font-black text-zinc-500 italic uppercase">/ {userSubscription?.planDuration} {userSubscription?.planDurationUnit}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Deployed On</span>
                    <span className="text-sm font-black text-white italic uppercase">{format(new Date(userSubscription?.subscribedAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Sector Mode</span>
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-black italic tracking-widest px-3 py-1 uppercase">{userSubscription?.preferredTime || "FULL ACCESS"}</Badge>
                  </div>
                </div>

                <Button className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-black font-black uppercase italic tracking-widest text-lg shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all">
                  MANAGE ACCESS
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* --- REVIEWS SECTION --- */}
          <section className="pt-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Mission Reports</h2>
                <div className="h-1 w-24 bg-primary mt-2" />
              </div>
            </div>
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
          </section>
        </div>
      </main>
      <SiteFooter />
    </div >
  );
}
