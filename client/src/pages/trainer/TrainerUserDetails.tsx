import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { 
    ArrowLeft, 
    Dumbbell, 
    MessageSquare, 
    Camera, 
    ChevronRight, 
    AlertCircle, 
    User as UserIcon, 
    Activity, 
    Scale, 
    Ruler,
    Video,
    Star,
    FileText,
    History,
    ChevronLeft,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { cn } from "@/lib/utils";

import type { User, UserPlan } from "@/interfaces/trainer/ITrainerUserDetails";

interface Slot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    videoCall?: {
        _id: string;
        trainerRating?: number;
        trainerFeedback?: string;
        userPerformanceRating?: number;
        userFeedback?: string;
        status: string;
    };
}

export default function TrainerUserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sessions State
    const [sessions, setSessions] = useState<Slot[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [sessionPage, setSessionPage] = useState(1);
    const sessionLimit = 5;
    const [selectedSession, setSelectedSession] = useState<Slot | null>(null);

    const isExpired = userPlan ? new Date(userPlan.expiryDate) < new Date() : false;

    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get(`/trainer/get-client/${id}`);
            setUser(response.data.user);
            setIsLoading(false);
        } catch (_err: unknown) {
            setError("Failed to load user details");
            toast.error("Failed to load user details");
            setIsLoading(false);
        }
    }, [id]);

    const fetchUserPlan = useCallback(async () => {
        try {
            const response = await API.get(`/trainer/user-plan/${id}`);
            setUserPlan(response.data.plan);
        } catch (_err: unknown) {
            // Silently handle
        }
    }, [id]);



    const fetchSessions = useCallback(async () => {
        try {
            setIsSessionsLoading(true);
            const response = await API.get(`/trainer/client/${id}/sessions?page=${sessionPage}&limit=${sessionLimit}`);
            setSessions(response.data.sessions);
            setSessionTotal(response.data.total);
        } catch (errorVal) { const error = errorVal as SafeAny;
            console.error("Failed to fetch sessions:", error);
        } finally {
            setIsSessionsLoading(false);
        }
    }, [id, sessionPage]);

    useEffect(() => {
        document.title = "TrainUp - Client Profile";
        if (id) {
            fetchUser();
            fetchUserPlan();
            fetchSessions();
        }
    }, [id, fetchUser, fetchUserPlan, fetchSessions]);

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

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <TrainerSiteHeader />
                <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6">
                    <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-white/40 font-black uppercase italic tracking-widest text-sm">Loading client data...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-[#050505] text-white">
                <TrainerSiteHeader />
                <div className="container mx-auto px-6 py-24 text-center space-y-8">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Client Not Found</h1>
                    <p className="text-white/40 font-medium max-w-md mx-auto">{error || "The requested client could not be found."}</p>
                    <Button 
                        variant="outline"
                        className="border-white/10 text-white"
                        onClick={() => navigate("/trainer/clients")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Clients
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
                        <span className="text-[10px] font-black uppercase italic tracking-widest">Back to Directory</span>
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
                                            Status: {user.activityStatus === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
                                            {user.name}
                                        </h1>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        {user.trainerPlan && (
                                            <Badge className={cn("px-4 py-1.5 font-black italic uppercase tracking-widest text-[10px] border shadow-lg", getPlanStyle(user.trainerPlan))}>
                                                {user.trainerPlan} Plan
                                            </Badge>
                                        )}
                                        {isExpired && (
                                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-1.5 font-black italic uppercase tracking-widest text-[10px] animate-pulse">
                                                Subscription Expired
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
                                        onClick={() => navigate(`/trainer/client/${id}/progress`)}
                                    >
                                        <Camera className="h-5 w-5 mr-3" />
                                        Progress Photos
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="h-16 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black italic uppercase tracking-widest text-xs rounded-3xl"
                                    onClick={handleStartChat}
                                >
                                    <MessageSquare className="h-5 w-5 mr-3 text-cyan-400" />
                                    Message Client
                                </Button>
                            </div>
                        </div>

                        {/* Stats Distribution */}
                        {!isExpired && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-14 border-t border-white/5">
                                {[
                                    { label: 'BMI', value: bmi || '-', icon: Activity, color: 'text-cyan-400' },
                                    { label: 'Weight', value: user.weight ? `${user.weight} KG` : '-', icon: Scale, color: 'text-blue-400' },
                                    { label: 'Height', value: user.height ? `${user.height} CM` : '-', icon: Ruler, color: 'text-purple-400' },
                                    { label: 'Status', value: user.activityStatus?.toUpperCase() || 'IDLE', icon: UserIcon, color: 'text-amber-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 rounded-[2rem] p-6 space-y-2 group hover:bg-white/[0.08] transition-colors border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                                            <span className="text-[9px] font-black uppercase italic tracking-widest text-white/20">Metric {i + 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black italic tracking-tighter uppercase text-white">{stat.value}</p>
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
                                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Access Denied</h2>
                                        <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl mx-auto">
                                            Subscription for this client has expired. You cannot view their progress data until they renew.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                        <Button
                                            variant="outline"
                                            className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl"
                                            onClick={() => navigate("/trainer/clients")}
                                        >
                                            Back to Directory
                                        </Button>
                                        <Button
                                            className="h-14 px-8 bg-red-500 text-white hover:bg-red-600 font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-red-500/20"
                                            onClick={handleStartChat}
                                        >
                                            Send Reminder
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
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-cyan-400">Training Portal</h3>
                                    <Badge className="bg-white/5 text-white/40 border-white/10 font-black italic tracking-widest uppercase text-[9px]">Management</Badge>
                                </div>
                                <CardContent className="p-8 grid gap-4">
                                    <Link to={`/trainer/assign-workout/${id}`} className="group relative bg-white/[0.04] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 p-8 rounded-[2rem] transition-all duration-500 flex items-center justify-between overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] scale-0 group-hover:scale-100 transition-transform duration-700" />
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 text-cyan-400 group-hover:text-black transition-all duration-500">
                                                <Dumbbell className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors text-white">Workouts</h4>
                                                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">Assign Training Plans</p>
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
                                                <h4 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-blue-400 transition-colors text-white">Workout History</h4>
                                                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">Monitor Progress</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-white/10 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Video Call Sessions */}
                            <Card className="bg-white/[0.03] backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-purple-400">Video Call Sessions</h3>
                                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-black italic tracking-widest uppercase text-[9px]">{sessionTotal} Records</Badge>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    {isSessionsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                                            <p className="text-[10px] font-black uppercase italic tracking-widest text-white/40">Fetching session data...</p>
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div className="text-center py-12 space-y-4 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01]">
                                            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                                <History className="h-6 w-6 text-white/20" />
                                            </div>
                                            <p className="text-white/40 text-sm font-bold italic">No video call history for this client.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid gap-4">
                                                {sessions.map((slot) => (
                                                    <div 
                                                        key={slot._id}
                                                        className="group flex items-center justify-between p-6 bg-white/[0.04] border border-white/5 hover:border-purple-500/30 rounded-[2rem] transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                                                <Video className="h-6 w-6 text-purple-400 group-hover:text-black" />
                                                            </div>
                                                            <div>
                                                                <p className="text-lg font-black italic uppercase tracking-tight text-white">{format(new Date(slot.date), "MMMM do, yyyy")}</p>
                                                                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">{formatTime(slot.startTime)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {slot.videoCall?.userPerformanceRating && (
                                                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-black italic text-[10px]">
                                                                    <Star className="w-3 h-3 mr-1 fill-cyan-400" /> {slot.videoCall.userPerformanceRating}/5
                                                                </Badge>
                                                            )}
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-10 w-10 rounded-full hover:bg-white/10 text-white/40 hover:text-white"
                                                                        onClick={() => setSelectedSession(slot)}
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg rounded-[2.5rem] p-10 backdrop-blur-3xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-purple-400">Session Report</DialogTitle>
                                                                        <DialogDescription className="text-white/40 italic">Review performance and trainer feedback.</DialogDescription>
                                                                    </DialogHeader>
                                                                    
                                                                    {selectedSession && (
                                                                        <div className="space-y-8 mt-6">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Trainer Rating</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                                                                        <span className="text-2xl font-black italic">{selectedSession.videoCall?.trainerRating || '-'}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">User Performance</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Star className="h-5 w-5 text-cyan-500 fill-cyan-500" />
                                                                                        <span className="text-2xl font-black italic">{selectedSession.videoCall?.userPerformanceRating || '-'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-2">
                                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2"><MessageSquare className="h-3 w-3" /> Trainer Feedback</h5>
                                                                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-sm italic text-white/70 leading-relaxed min-h-[80px]">
                                                                                        {selectedSession.videoCall?.trainerFeedback || "No feedback recorded."}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2"><Activity className="h-3 w-3" /> Performance Notes</h5>
                                                                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-sm italic text-white/70 leading-relaxed min-h-[80px]">
                                                                                        {selectedSession.videoCall?.userFeedback || "No performance notes recorded."}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <DialogFooter className="mt-8">
                                                                        <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-black italic uppercase tracking-widest text-[10px] rounded-xl" onClick={() => setSelectedSession(null)}>Close Report</Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {sessionTotal > sessionLimit && (
                                                <div className="flex items-center justify-between pt-4">
                                                    <Button 
                                                        variant="ghost" 
                                                        disabled={sessionPage === 1}
                                                        onClick={() => setSessionPage(p => p - 1)}
                                                        className="text-white/40 hover:text-white"
                                                    >
                                                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                                    </Button>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Page {sessionPage} of {Math.ceil(sessionTotal / sessionLimit)}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        disabled={sessionPage === Math.ceil(sessionTotal / sessionLimit)}
                                                        onClick={() => setSessionPage(p => p + 1)}
                                                        className="text-white/40 hover:text-white"
                                                    >
                                                        Next <ChevronRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Column */}
                        <div className="space-y-8">
                            <Card className="bg-white/[0.03] backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-white/5">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-amber-400">Contact Details</h3>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center transition-colors hover:bg-white/[0.08]">
                                            <Badge className="bg-cyan-500/10 text-cyan-400 border-none h-10 w-10 p-0 flex items-center justify-center rounded-xl mr-4 uppercase font-black italic text-xs">@</Badge>
                                            <div className="min-w-0 text-white">
                                                <p className="text-[10px] font-black uppercase italic text-white/20 tracking-widest font-sans">Email Address</p>
                                                <p className="font-bold truncate text-sm">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center transition-colors hover:bg-white/[0.08]">
                                            <Badge className="bg-blue-500/10 text-blue-400 border-none h-10 w-10 p-0 flex items-center justify-center rounded-xl mr-4 uppercase font-black italic text-xs">PH</Badge>
                                            <div className="min-w-0 text-white">
                                                <p className="text-[10px] font-black uppercase italic text-white/20 tracking-widest">Phone Number</p>
                                                <p className="font-bold truncate text-sm">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center transition-colors hover:bg-white/[0.08]">
                                            <Badge className="bg-purple-500/10 text-purple-400 border-none h-10 w-10 p-0 flex items-center justify-center rounded-xl mr-4 uppercase font-black italic text-xs">Joined</Badge>
                                            <div className="min-w-0 text-white">
                                                <p className="text-[10px] font-black uppercase italic text-white/20 tracking-widest">Joined On</p>
                                                <p className="font-bold truncate text-sm">{user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString() : 'N/A'}</p>
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
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-cyan-400">Subscription Plan</h3>
                                            <p className="text-[10px] font-black text-white/40 tracking-widest uppercase italic">{userPlan.planType} Active</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Expiry Date</span>
                                                <span className={cn("text-sm font-black italic uppercase tracking-tight", isExpired ? "text-red-400" : "text-white")}>
                                                    {new Date(userPlan.expiryDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {userPlan.planType !== 'basic' && (
                                                <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Messages Left</span>
                                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 font-black italic text-[9px]">
                                                        {userPlan.planType === 'premium' ? `${userPlan.messagesLeft} REMAINING` : 'UNLIMITED'}
                                                    </Badge>
                                                </div>
                                            )}
                                            {userPlan.planType === 'pro' && (
                                                <div className="flex items-center justify-between py-3">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Video Calls</span>
                                                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-black italic text-[9px]">
                                                        {userPlan.videoCallsLeft} SESSIONS
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

            <SiteFooter />
        </div>
    );
}
