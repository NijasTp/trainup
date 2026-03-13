import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Dumbbell, Apple, MessageSquare, Video, Calendar as CalendarIcon, Star, Crown, Camera, ChevronRight, AlertCircle, User as UserIcon, Activity, Scale, Ruler } from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { User, UserPlan, Progress } from "@/interfaces/trainer/ITrainerUserDetails";

export default function TrainerUserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [progressList, setProgressList] = useState<Progress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isProgressOpen, setIsProgressOpen] = useState(false);
    const [selectedProgress, setSelectedProgress] = useState<Progress | null>(null);

    const isExpired = userPlan ? new Date(userPlan.expiryDate) < new Date() : false;

    useEffect(() => {
        document.title = "TrainUp - Client Dossier";
        if (id) {
            fetchUser();
            fetchUserPlan();
            fetchProgress();
        }
    }, [id]);

    const fetchUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get(`/trainer/get-client/${id}`);
            setUser(response.data.user);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch user:", err);
            setError("Failed to load user details");
            toast.error("Failed to load user details");
            setIsLoading(false);
        }
    };

    const fetchUserPlan = async () => {
        try {
            const response = await API.get(`/trainer/user-plan/${id}`);
            setUserPlan(response.data.plan);
        } catch (err: any) {
            console.error("Failed to fetch user plan:", err);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await API.get(`/trainer/client-progress/${id}`);
            const sorted = response.data.progress.sort((a: Progress, b: Progress) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setProgressList(sorted);
            if (sorted.length > 0) {
                setSelectedProgress(sorted[0]);
            }
        } catch (err) {
            console.error("Failed to fetch progress:", err);
        }
    };

    const handleStartChat = () => {
        if (!user?.trainerPlan || user.trainerPlan === 'basic') {
            toast.error("This client doesn't have chat access. They need Premium or Pro plan.");
            return;
        }
        navigate(`/trainer/chat/${id}`);
    };

    const getUserInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const getPlanStyle = (plan: string) => {
        switch (plan) {
            case 'basic':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'premium':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'pro':
                return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            default:
                return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <TrainerSiteHeader />
                <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
                    <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-white/40 font-black uppercase italic tracking-widest text-sm">Accessing Neural Dossier...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <TrainerSiteHeader />
                <div className="container mx-auto px-6 py-24 text-center space-y-8">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">Unit Not Found</h1>
                    <p className="text-white/40 font-medium max-w-md mx-auto">{error || "The requested client could not be located in the network."}</p>
                    <Button 
                        variant="outline"
                        className="border-white/10"
                        onClick={() => navigate("/trainer/clients")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Directory
                    </Button>
                </div>
            </div>
        );
    }

    const bmi = user.height && user.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : null;

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans">
            <TrainerSiteHeader />

            {/* Aurora Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <main className="relative container mx-auto px-6 py-12 space-y-12 z-10">
                {/* Back Navigation & Breadcrumb */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-2 text-white/40 hover:text-cyan-400 p-0 hover:bg-transparent"
                        onClick={() => navigate("/trainer/clients")}
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">Return to Network</span>
                    </Button>
                </div>

                {/* Profile Overview Card */}
                <Card className="bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-2xl overflow-hidden rounded-[3rem]">
                    <CardContent className="p-10 md:p-14">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                                    <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-white/10 group-hover:border-cyan-500/50 transition-all duration-700 ring-4 ring-black">
                                        <AvatarImage src={user.profileImage} alt={user.name} className="object-cover" />
                                        <AvatarFallback className="text-4xl bg-white/5 text-cyan-400 font-black italic uppercase">
                                            {getUserInitial(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-cyan-500 rounded-full flex items-center justify-center border-4 border-[#050505] shadow-lg">
                                        <Activity className="h-4 w-4 text-black" />
                                    </div>
                                </div>
                                <div className="space-y-4 text-center md:text-left">
                                    <div className="space-y-1">
                                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 font-black italic uppercase tracking-widest text-[10px]">
                                            Unit Protocol: {user.activityStatus === 'active' ? 'Operational' : 'Idle'}
                                        </Badge>
                                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                                            {user.name}
                                        </h1>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        {user.trainerPlan && (
                                            <Badge className={cn("px-4 py-1.5 font-black italic uppercase tracking-widest text-[10px] border shadow-lg", getPlanStyle(user.trainerPlan))}>
                                                {user.trainerPlan} Activation
                                            </Badge>
                                        )}
                                        {isExpired && (
                                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-1.5 font-black italic uppercase tracking-widest text-[10px] animate-pulse">
                                                Link Severed / Expired
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {!isExpired && (
                                    <Button
                                        size="lg"
                                        className="h-16 px-10 bg-white text-black hover:bg-cyan-500 hover:text-white font-black italic uppercase tracking-widest text-xs rounded-3xl shadow-2xl transition-all duration-500"
                                        onClick={() => setIsProgressOpen(true)}
                                    >
                                        <Camera className="h-5 w-5 mr-3" />
                                        Visual Analytics
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="h-16 px-10 border-white/10 bg-white/5 hover:bg-white/10 font-black italic uppercase tracking-widest text-xs rounded-3xl"
                                    onClick={handleStartChat}
                                >
                                    <MessageSquare className="h-5 w-5 mr-3 text-cyan-400" />
                                    Open Comm Link
                                </Button>
                            </div>
                        </div>

                        {/* Stats Distribution */}
                        {!isExpired && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-14 border-t border-white/5">
                                {[
                                    { label: 'Intelligence Factor', value: bmi || '-', icon: Activity, color: 'text-cyan-400' },
                                    { label: 'Mass Index', value: user.weight ? `${user.weight} KG` : '-', icon: Scale, color: 'text-blue-400' },
                                    { label: 'Verticality', value: user.height ? `${user.height} CM` : '-', icon: Ruler, color: 'text-purple-400' },
                                    { label: 'Status', value: user.activityStatus?.toUpperCase() || 'IDLE', icon: UserIcon, color: 'text-amber-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 rounded-[2rem] p-6 space-y-2 group hover:bg-white/[0.08] transition-colors border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                                            <span className="text-[9px] font-black uppercase italic tracking-widest text-white/20">Metric {i + 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black italic tracking-tighter uppercase">{stat.value}</p>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isExpired ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 space-y-12">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />
                            <Card className="max-w-3xl bg-white/[0.02] border-white/10 backdrop-blur-2xl rounded-[3rem] overflow-hidden relative z-10">
                                <CardContent className="p-16 text-center space-y-8">
                                    <div className="h-24 w-24 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="h-10 w-10 text-red-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Information Blocked</h2>
                                        <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl mx-auto">
                                            Subscription link for this unit has expired. All biometric and protocol data has been encrypted until renewal.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                        <Button
                                            variant="outline"
                                            className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 font-black italic uppercase tracking-widest text-xs rounded-2xl"
                                            onClick={() => navigate("/trainer/clients")}
                                        >
                                            Network Directory
                                        </Button>
                                        <Button
                                            className="h-14 px-8 bg-red-500 text-white hover:bg-red-600 font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-red-500/20"
                                            onClick={handleStartChat}
                                        >
                                            Broadcast Warning
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Module Management */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="bg-white/[0.03] backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-cyan-400">Tactical Modules</h3>
                                    <Badge className="bg-white/5 text-white/40 border-white/10 font-black italic tracking-widest uppercase text-[9px]">Authorization: Level 4</Badge>
                                </div>
                                <CardContent className="p-8 grid gap-4">
                                    <Link to={`/trainer/assign-workout/${id}`} className="group relative bg-white/[0.04] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 p-8 rounded-[2rem] transition-all duration-500 flex items-center justify-between overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] scale-0 group-hover:scale-100 transition-transform duration-700" />
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 text-cyan-400 group-hover:text-black transition-all duration-500">
                                                <Dumbbell className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors">Physical Protocols</h4>
                                                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">Assign Training Blueprints</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-white/10 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
                                    </Link>

                                    <Link to={`/trainer/workout/${id}`} className="group relative bg-white/[0.04] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 p-8 rounded-[2rem] transition-all duration-500 flex items-center justify-between overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] scale-0 group-hover:scale-100 transition-transform duration-700" />
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 text-blue-400 group-hover:text-black transition-all duration-500">
                                                <Activity className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-blue-400 transition-colors">Active Workouts</h4>
                                                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">Monitor Operational Status</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-white/10 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                    </Link>

                                    <Link to={`/trainer/diet/${id}`} className="group relative bg-white/[0.04] border border-white/5 hover:bg-green-500/10 hover:border-green-500/30 p-8 rounded-[2rem] transition-all duration-500 flex items-center justify-between overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] scale-0 group-hover:scale-100 transition-transform duration-700" />
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:bg-green-500 text-green-400 group-hover:text-black transition-all duration-500">
                                                <Apple className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-green-400 transition-colors">Nutritional Matrix</h4>
                                                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">Bio-Fuel Optimization</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-white/10 group-hover:text-green-400 transition-all group-hover:translate-x-1" />
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Intelligence Column */}
                        <div className="space-y-8">
                            <Card className="bg-white/[0.03] backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-white/5">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-amber-400">Neural Connect</h3>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center transition-colors hover:bg-white/[0.08]">
                                            <Badge className="bg-cyan-500/10 text-cyan-400 border-none h-10 w-10 p-0 flex items-center justify-center rounded-xl mr-4 uppercase font-black italic text-xs">ID</Badge>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase italic text-white/20 tracking-widest font-sans">Unit Identifier</p>
                                                <p className="font-bold truncate text-sm">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center transition-colors hover:bg-white/[0.08]">
                                            <Badge className="bg-blue-500/10 text-blue-400 border-none h-10 w-10 p-0 flex items-center justify-center rounded-xl mr-4 uppercase font-black italic text-xs">TEL</Badge>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase italic text-white/20 tracking-widest">Comm Channel</p>
                                                <p className="font-bold truncate text-sm">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center transition-colors hover:bg-white/[0.08]">
                                            <Badge className="bg-purple-500/10 text-purple-400 border-none h-10 w-10 p-0 flex items-center justify-center rounded-xl mr-4 uppercase font-black italic text-xs">DT</Badge>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase italic text-white/20 tracking-widest">Entry Date</p>
                                                <p className="font-bold truncate text-sm">{user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString() : 'INITIALIZING'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {userPlan && (
                                <Card className="bg-gradient-to-br from-cyan-600/20 via-black to-black border-cyan-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] animate-pulse" />
                                    <CardContent className="p-8 space-y-8">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-cyan-400">Current Deployment</h3>
                                            <p className="text-[10px] font-black text-white/40 tracking-widest uppercase italic">{userPlan.planType} Tier Activated</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Deadline</span>
                                                <span className={cn("text-sm font-black italic uppercase tracking-tight", isExpired ? "text-red-400" : "text-white")}>
                                                    {new Date(userPlan.expiryDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {userPlan.planType !== 'basic' && (
                                                <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Neural Quota</span>
                                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-black italic text-[9px]">
                                                        {userPlan.planType === 'premium' ? `${userPlan.messagesLeft} REMAINING` : 'UNLIMITED'}
                                                    </Badge>
                                                </div>
                                            )}
                                            {userPlan.planType === 'pro' && (
                                                <div className="flex items-center justify-between py-3">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sync Quota</span>
                                                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-black italic text-[9px]">
                                                        {userPlan.videoCallsLeft} CRYSTAL SYNC
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Visual Analytics Modal */}
            <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                <DialogContent className="max-w-6xl h-[85vh] bg-[#050505]/95 backdrop-blur-3xl border-white/10 p-0 gap-0 overflow-hidden text-white rounded-[3rem]">
                    <div className="p-8 md:p-12 border-b border-white/5 bg-white/[0.02]">
                        <DialogHeader>
                            <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <Activity className="h-8 w-8 text-cyan-400" />
                                Growth Analytics
                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-black italic uppercase text-[10px] ml-4">Authorized Access</Badge>
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Dossier Timeline */}
                        <div className="w-80 border-r border-white/5 bg-black/40 flex flex-col">
                            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                <h4 className="text-[10px] font-black uppercase italic tracking-widest text-cyan-400">Captured States</h4>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-2">
                                    {progressList.map((p) => (
                                        <Button
                                            key={p._id}
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-14 justify-start font-black italic uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300",
                                                selectedProgress?._id === p._id 
                                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" 
                                                    : "text-white/20 hover:text-white hover:bg-white/5"
                                            )}
                                            onClick={() => setSelectedProgress(p)}
                                        >
                                            <CalendarIcon className="h-4 w-4 mr-3 opacity-50" />
                                            {new Date(p.date).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </Button>
                                    ))}
                                    {progressList.length === 0 && (
                                        <div className="p-12 text-center text-white/20 font-black italic uppercase tracking-widest text-[10px]">
                                            No Data Logs
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Visual Projection */}
                        <div className="flex-1 overflow-y-auto bg-black/60 custom-scrollbar">
                            {selectedProgress ? (
                                <div className="p-10 md:p-16 space-y-12">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/5">
                                        <div className="space-y-4">
                                            <Badge className="bg-white/5 text-white/40 border-white/10 font-black italic uppercase tracking-widest text-[9px]">Log #{selectedProgress._id?.slice(-6)}</Badge>
                                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                                                {new Date(selectedProgress.date).toLocaleDateString(undefined, {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </h3>
                                            {selectedProgress.notes && (
                                                <p className="text-white/40 text-sm font-medium italic border-l-2 border-cyan-500/20 pl-6 max-w-2xl">
                                                    "{selectedProgress.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Intelligence Projection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {selectedProgress.photos.map((photo, index) => (
                                            <div key={index} className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5 shadow-2xl transition-all duration-700 hover:border-cyan-500/40">
                                                <img
                                                    src={photo}
                                                    alt={`Capture ${index + 1}`}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8">
                                                    <p className="text-[10px] font-black italic uppercase tracking-widest text-cyan-400">Tactical Capture {index + 1}</p>
                                                    <h5 className="text-xl font-black italic uppercase tracking-tight">Anatomy {index + 1}</h5>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedProgress.photos.length === 0 && (
                                        <div className="py-24 text-center text-white/10 border-4 border-dashed border-white/5 rounded-[3rem] space-y-4">
                                            <Camera className="h-12 w-12 mx-auto" />
                                            <p className="font-black italic uppercase tracking-widest text-xs">Visual Sensors Offline</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-white/20 p-12 space-y-6">
                                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                                        <Activity className="h-10 w-10 opacity-30" />
                                    </div>
                                    <p className="font-black italic uppercase tracking-widest text-xs">Awaiting Dossier Selection...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <SiteFooter />
        </div>
    );
}