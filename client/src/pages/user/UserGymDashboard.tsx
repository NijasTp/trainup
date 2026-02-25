import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    ShoppingBag,
    Heart,
    MapPin,
    Award,
    AlertCircle,
    CheckCircle2,
    LogOut,
    ArrowUpRight,
    Dumbbell,
    Navigation,
    Utensils
} from "lucide-react";
import { toast } from "sonner";
import { getMyGym, getUserGymAnnouncements, cancelGymMembership } from "@/services/gymService";

import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function UserGymDashboard() {
    const [gymData, setGymData] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "TrainUp | My Gym Dashboard";
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setIsLoading(true);
        try {
            const [myGym, announces] = await Promise.all([
                getMyGym(),
                getUserGymAnnouncements(1, 4)
            ]);
            setGymData(myGym);
            setAnnouncements(announces.announcements || []);
        } catch (error: any) {
            console.error("Dashboard error:", error);
            if (error.response?.status === 404) {
                toast.error("No active gym membership found.");
                navigate("/gyms");
            } else {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancelMembership = async () => {
        if (!window.confirm("Are you sure you want to cancel your membership? This action cannot be undone.")) return;

        try {
            await cancelGymMembership(gymData.membership._id);
            toast.success("Membership cancelled successfully");
            navigate("/gyms");
        } catch (error) {
            toast.error("Failed to cancel membership");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const membership = gymData?.membership;
    const gym = gymData?.gym;
    const daysLeft = membership ? differenceInDays(new Date(membership.endDate), new Date()) : 0;

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-8 space-y-8 flex-1 z-10">
                {/* Top Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Dumbbell className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black">{gym.name}</h1>
                        </motion.div>
                        <p className="text-gray-400 font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" /> {gym.address}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/gym-shop">
                            <Button className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold gap-2">
                                <ShoppingBag className="h-4 w-4" /> Gym Store
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            onClick={handleCancelMembership}
                            className="h-12 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold transition-all gap-2"
                        >
                            <LogOut className="h-4 w-4" /> Cancel
                        </Button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Membership & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Membership Card */}
                        <Card className="bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl backdrop-blur-md">
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                <Award className="h-32 w-32" />
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <Badge className="bg-primary/90 text-white border-0 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                                            {membership.planDetails?.name || 'Standard Plan'}
                                        </Badge>
                                        <h2 className="text-4xl font-black">Active Member</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Renew In</p>
                                        <p className="text-5xl font-black text-primary">{daysLeft} <span className="text-xl">Days</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Subscribed On</p>
                                        <p className="font-bold text-white">{format(new Date(membership.startDate), "MMM dd, yyyy")}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Expiry Date</p>
                                        <p className="font-bold text-white">{format(new Date(membership.endDate), "MMM dd, yyyy")}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Daily Window</p>
                                        <p className="font-bold text-white">{membership.preferredTime || "Anytime"}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Recent Attendance / Progress Placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" /> Attendance
                                    </h3>
                                    <Link to="/attendance" className="text-xs font-bold text-primary hover:underline">View History</Link>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            </div>
                                            <p className="font-bold">Today</p>
                                        </div>
                                        <span className="text-sm font-black text-green-500 uppercase tracking-widest">Marked</span>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center font-medium italic">You've maintained a 5-day streak! Keep going.</p>
                                </div>
                            </Card>

                            <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-xl font-black flex items-center gap-3 text-white">
                                    <Navigation className="h-5 w-5 text-primary" /> Navigation
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <Link to={ROUTES.USER_WISHLIST} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 flex flex-col items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-500" />
                                        <span className="text-xs font-bold">Wishlist</span>
                                    </Link>
                                    <Link to="/diets" className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 flex flex-col items-center gap-2">
                                        <Utensils className="h-5 w-5 text-green-500" />
                                        <span className="text-xs font-bold">Diet</span>
                                    </Link>
                                    <Link to="/gym-shop" className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 flex flex-col items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs font-bold">Shop</span>
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Announcements */}
                    <div className="space-y-8">
                        <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 h-full shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black flex items-center gap-3"><Bell className="h-6 w-6 text-primary" /> Updates</h3>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/20">All</Badge>
                            </div>

                            <div className="space-y-6">
                                {announcements.length === 0 ? (
                                    <div className="py-20 text-center space-y-4">
                                        <AlertCircle className="h-12 w-12 text-gray-600 mx-auto" />
                                        <p className="text-gray-500 font-medium">No new announcements</p>
                                    </div>
                                ) : (
                                    announcements.map((item, i) => (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                                                <span className="text-[10px] font-black text-gray-500 whitespace-nowrap">{format(new Date(item.createdAt), "MMM d")}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.content}</p>
                                            <div className="mt-4 flex justify-end">
                                                <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-primary transition-all" />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <Button variant="ghost" className="w-full mt-8 rounded-2xl border border-white/5 hover:bg-white/10 font-bold text-gray-400">
                                View Previous Logs
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section: Facilities */}
                <section className="pt-8 pb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black">Gym Facilities</h2>
                        <Link to="/gym-equipment"><Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px]">Explore Map <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {["Sauna", "Dumbbells", "CrossFit", "Cafeteria", "Locker Room", "Cardio"].map((facility, i) => (
                            <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center gap-4 text-center group hover:bg-white/10 transition-all">
                                <Award className="h-6 w-6 text-primary group-hover:scale-110 transition-all" />
                                <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{facility}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
