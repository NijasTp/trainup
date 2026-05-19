import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
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
    Utensils,
    Activity
} from "lucide-react";
import { toast } from "sonner";
import { getMyGym, getUserGymAnnouncements, cancelGymMembership } from "@/services/gymService";

import UserGymLayout from "@/layouts/UserGymLayout";
import ActivityMatrix from "@/components/user/dashboard/ActivityMatrix";
import type { IActivityData } from "@/interfaces/user/IUserDashboard";
import API from "@/lib/axios";

export default function UserGymDashboard() {
    const [gymData, setGymData] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<IActivityData>({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [myGym, announces, activityRes] = await Promise.all([
                getMyGym(),
                getUserGymAnnouncements(1, 4),
                API.get("/user/dashboard/activity")
            ]);
            setGymData(myGym);
            setAnnouncements(announces.announcements || []);
            setActivityData(activityRes.data.activityData);
        } catch (error: any) {
            console.error("Dashboard error:", error);
            if (error.response?.status === 404) {
                toast.error("No active gym membership found.");
                navigate(ROUTES.USER_GYMS);
            } else {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        document.title = "TrainUp | My Gym Dashboard";
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleCancelMembership = async () => {
        if (!window.confirm("Are you sure you want to cancel your membership? This action cannot be undone.")) return;

        try {
            await cancelGymMembership(gymData.userSubscription._id);
            toast.success("Membership cancelled successfully");
            navigate(ROUTES.USER_GYMS);
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

    const membership = gymData?.userSubscription;
    const gym = gymData?.gym;
    const daysLeft = membership ? differenceInDays(new Date(membership.expiresAt), new Date()) : 0;

    return (
        <UserGymLayout>
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
                            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">{gym.name}</h1>
                        </motion.div>
                        <p className="text-gray-400 font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" /> {gym.address}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to={ROUTES.USER_GYM_SHOP}>
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
                                            {membership.planName || 'Standard Plan'}
                                        </Badge>
                                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tight uppercase">Membership <span className="text-primary">Status</span></h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black italic text-primary tabular-nums">{daysLeft}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Days Remaining</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Start Date</span>
                                        <p className="text-xl font-bold italic">{format(new Date(membership.subscribedAt), "MMM d, yyyy")}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expires On</span>
                                        <p className="text-xl font-bold italic">{format(new Date(membership.expiresAt), "MMM d, yyyy")}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Preferred Time</span>
                                        <p className="text-xl font-bold italic">{membership.preferredTime || "Anytime"}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" /> Attendance
                                    </h3>
                                    <Link to={ROUTES.USER_GYM_ATTENDANCE} className="text-xs font-bold text-primary hover:underline">View History</Link>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-gray-400">Streak</span>
                                        <span className="text-lg font-black italic text-green-500">5 Days</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-gray-400">Total Visits</span>
                                        <span className="text-lg font-black italic">42</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-500" /> Progress
                                    </h3>
                                    <Link to={ROUTES.USER_PROGRESS} className="text-xs font-bold text-primary hover:underline">Full Report</Link>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-gray-400">Weight Change</span>
                                        <span className="text-lg font-black italic text-blue-500">-2.4 kg</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-gray-400">Goal Progress</span>
                                        <span className="text-lg font-black italic">78%</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Feed & Announcements */}
                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <Bell className="h-5 w-5 text-primary" /> Feed
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {announcements.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No recent updates</p>
                                </div>
                            ) : (
                                announcements.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 4 }}
                                        className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1 italic uppercase tracking-tight">{item.title}</h4>
                                            <span className="text-[10px] font-black text-gray-500 whitespace-nowrap">{format(new Date(item.createdAt), "MMM d")}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">{item.content}</p>
                                        <div className="mt-4 flex justify-end">
                                            <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-primary transition-all" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <Button variant="ghost" className="w-full mt-8 rounded-2xl border border-white/5 hover:bg-white/10 font-black uppercase tracking-widest text-[10px] text-gray-500">
                            View Previous Logs
                        </Button>
                    </Card>
                </div>

                {/* Bottom Section: Facilities */}
                <section className="pt-8 pb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Gym <span className="text-gray-500">Inventory</span></h2>
                        <Link to={ROUTES.USER_GYM_EQUIPMENT}><Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px]">Sector Map <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {["Sauna", "Dumbbells", "CrossFit", "Cafeteria", "Locker Room", "Cardio"].map((facility, i) => (
                            <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center gap-4 text-center group hover:bg-white/10 transition-all">
                                <Award className="h-6 w-6 text-primary group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic group-hover:text-white">{facility}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Engagement Matrix Section */}
                <section className="pt-8 pb-12">
                    <div className="flex items-end justify-between mb-8">
                        <div className="space-y-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full font-black uppercase tracking-[0.3em] text-[10px] italic">ENGAGEMENT</Badge>
                            <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">Your <span className="text-zinc-500">Activity</span></h2>
                        </div>
                    </div>
                    <Card className="bg-white/5 border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-3xl overflow-hidden">
                        <ActivityMatrix activityData={activityData} />
                    </Card>
                </section>
        </UserGymLayout>
    );
}
