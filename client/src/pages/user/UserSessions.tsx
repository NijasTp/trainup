import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { MessageSquare, Star, Zap } from "lucide-react";
import { BundlePurchaseModal } from "@/components/user/BundlePurchaseModal";

import type { Session } from "@/interfaces/user/IUserSessions";

export default function UserSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [userPlan, setUserPlan] = useState<any | null>(null);
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
    const [activeTrainer, setActiveTrainer] = useState<{ id: string; name: string; bundles: any[] } | null>(null);
    const limit = 8;
    
    const user = useSelector((state: RootState) => state.userAuth.user);
    const currentUserId = user?._id;
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "TrainUp - Training Sessions";
        fetchSessions();
    }, [activeTab, page, selectedDate]);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/user/sessions", {
                params: {
                    type: activeTab,
                    page,
                    limit,
                    date: selectedDate
                }
            });
            setSessions(response.data.sessions || []);
            setTotal(response.data.total || 0);
        } catch (err: any) {
            console.error("Failed to fetch sessions:", err);
            toast.error("Could not load sessions. Check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserPlan = async () => {
        try {
            const response = await API.get("/user/plan");
            setUserPlan(response.data.plan);
        } catch (err) {
            console.error("Failed to fetch user plan:", err);
        }
    };

    useEffect(() => {
        fetchUserPlan();
    }, []);

    const canJoinSession = (session: Session) => {
        if (!currentUserId) return false;
        const userRequest = session.requestedBy.find(req => 
            (typeof req.userId === 'string' ? req.userId : (req.userId as any)._id) === currentUserId
        );
        if (!userRequest || userRequest.status !== 'approved' || !session.isBooked) return false;

        const slotDate = new Date(session.date);
        const [hours, minutes] = session.startTime.split(':').map(Number);
        const [endHours, endMinutes] = session.endTime.split(':').map(Number);

        const start = new Date(slotDate.setHours(hours, minutes, 0, 0));
        const end = new Date(slotDate.setHours(endHours, endMinutes, 0, 0));

        const now = new Date();
        const tenMinutesBefore = new Date(start.getTime() - 10 * 60000);

        return now >= tenMinutesBefore && now <= end;
    };

    const joinVideoCall = async (slotId: string) => {
        try {
            const response = await API.get(`/video-call/slot/${slotId}`);
            const roomId = response.data.videoCall.roomId;
            navigate(`/video-call/${roomId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Connection failed. Please try again.');
        }
    };

    const handleCancelBooking = async (slotId: string) => {
        try {
            await API.post("/user/cancel-session-booking", { slotId });
            toast.success("Booking cancelled successfully");
            fetchSessions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'approved': return { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle, label: 'Approved' };
            case 'rejected': return { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, label: 'Rejected' };
            case 'pending': return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock, label: 'Pending' };
            default: return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: AlertCircle, label: status };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-site-bg text-foreground overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-12 space-y-12 flex-1 z-10">
                {/* Header Section */}
                <header className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <Link to="/my-trainer/profile" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group mb-4">
                                <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Coach Profile
                            </Link>
                            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                                Your <span className="text-primary">Sessions</span>
                            </h1>
                            <p className="text-gray-400 font-medium max-w-lg text-sm md:text-base leading-relaxed">Manage your scheduled training sessions and connect with your coach.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Button 
                                onClick={() => navigate('/my-trainer/availability')}
                                className="bg-white text-black hover:bg-neutral-200 px-8 h-14 rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                <CalendarIcon className="mr-3 h-4 w-4" /> Check Availability
                            </Button>
                            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-2xl">
                                <button 
                                    onClick={() => { setActiveTab('upcoming'); setPage(1); }}
                                    className={`px-8 py-3 rounded-xl font-black italic uppercase tracking-widest text-xs transition-all ${activeTab === 'upcoming' ? 'bg-primary text-black shadow-xl ring-4 ring-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Upcoming
                                </button>
                                <button 
                                    onClick={() => { setActiveTab('past'); setPage(1); }}
                                    className={`px-8 py-3 rounded-xl font-black italic uppercase tracking-widest text-xs transition-all ${activeTab === 'past' ? 'bg-primary text-black shadow-xl ring-4 ring-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Past Sessions
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 max-w-xl">
                        <div className="relative flex-1 group">
                            <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <Input 
                                type="date"
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
                                className="h-16 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 focus:border-primary/30 font-bold transition-all [color-scheme:dark]"
                            />
                        </div>
                        {selectedDate && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => { setSelectedDate(""); setPage(1); }}
                                className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-red-500/30 transition-all text-red-400 group"
                            >
                                <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            </Button>
                        )}
                    </div>
                </header>

                {/* Session Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 opacity-50 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                        <Video className="h-20 w-20 text-gray-500" />
                        <div>
                            <h3 className="text-2xl font-black italic uppercase">No Sessions Found</h3>
                            <p className="text-gray-400 font-medium mt-2 max-w-sm mx-auto">
                                {selectedDate 
                                    ? `No sessions found for ${formatDate(selectedDate)}.` 
                                    : "You haven't booked any sessions yet."
                                }
                            </p>
                        </div>
                        <Button onClick={() => navigate('/my-trainer/availability')} className="bg-white text-black hover:bg-gray-200 px-8 h-12 rounded-xl font-black italic uppercase tracking-widest text-xs shadow-2xl">
                            Explore Availability
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {sessions.map((session, index) => {
                                const userReq = session.requestedBy.find(req => (typeof req.userId === 'string' ? req.userId : (req.userId as any)._id) === currentUserId);
                                const status = userReq?.status || 'pending';
                                const statusInfo = getStatusInfo(status);
                                const StatusIcon = statusInfo.icon;
                                const canJoin = canJoinSession(session);

                                return (
                                    <motion.div
                                        key={session._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 hover:border-primary/20 transition-all duration-500 shadow-2xl overflow-hidden h-full flex flex-col">
                                            {/* Top Section */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 border-4 border-background">
                                                        <AvatarImage src={session.trainerId?.profileImage} />
                                                        <AvatarFallback className="bg-primary/20 text-primary font-black italic">{session.trainerId?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="text-lg font-black italic uppercase tracking-tight group-hover:text-primary transition-colors">{session.trainerId?.name}</h3>
                                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Coach</p>
                                                    </div>
                                                </div>
                                                <Badge className={`${statusInfo.color} font-black italic uppercase text-[8px] px-3 py-1 rounded-full border shadow-lg`}>
                                                    <StatusIcon className="h-3 w-3 mr-1.5" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            {/* Timing Details */}
                                            <div className="space-y-4 mb-8 flex-1">
                                                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</p>
                                                        <p className="text-sm font-bold">{formatDate(session.date)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <Clock className="h-5 w-5 text-accent" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Time</p>
                                                        <p className="text-sm font-bold">{formatTime(session.startTime)} - {formatTime(session.endTime)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                             {/* Action Section */}
                                             <div className="pt-6 border-t border-white/10">
                                                 {activeTab === 'past' && session.videoCall?.userPerformanceRating ? (
                                                     <div className="space-y-4">
                                                         <Button
                                                             onClick={() => setSelectedFeedback(session)}
                                                             className="w-full h-14 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl font-black italic uppercase tracking-widest text-[10px]"
                                                         >
                                                             <MessageSquare className="mr-2 h-4 w-4 text-primary" /> View Feedback
                                                         </Button>
                                                     </div>
                                                 ) : status === 'approved' ? (
                                                     <div className="space-y-4">
                                                         {canJoin ? (
                                                             userPlan?.videoCallsLeft > 0 ? (
                                                                <Button
                                                                    onClick={() => joinVideoCall(session._id)}
                                                                    className="w-full h-14 bg-green-500 text-black hover:bg-green-600 rounded-2xl font-black italic uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse"
                                                                >
                                                                    <Video className="mr-2 h-5 w-5 fill-black" /> Join Call
                                                                </Button>
                                                              ) : (
                                                                <Button
                                                                    onClick={() => {
                                                                        setActiveTrainer({
                                                                            id: session.trainerId._id,
                                                                            name: session.trainerId.name,
                                                                            bundles: session.trainerId.sessionBundles || []
                                                                        });
                                                                        setIsBundleModalOpen(true);
                                                                    }}
                                                                    className="w-full h-14 bg-cyan-500 text-black hover:bg-cyan-400 rounded-2xl font-black italic uppercase tracking-widest shadow-[0_10px_30px_rgba(6,182,212,0.3)]"
                                                                >
                                                                    <Zap className="mr-2 h-5 w-5" /> Top-up to Join
                                                                </Button>
                                                              )
                                                         ) : (
                                                             <div className="flex items-center justify-center p-4 bg-green-500/5 border border-green-500/10 rounded-2xl text-[10px] font-black uppercase text-green-500 tracking-widest text-center">
                                                                 Link opens 10 mins before start
                                                             </div>
                                                         )}
                                                     </div>
                                                 ) : status === 'rejected' ? (
                                                     <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase text-red-500 tracking-widest text-center leading-relaxed">
                                                         Session Cancelled: {userReq?.rejectionReason || "Unavailable"}
                                                     </div>
                                                 ) : (
                                                     <div className="space-y-4">
                                                         <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[10px] font-black uppercase text-amber-500 tracking-widest text-center">
                                                             Waiting for coach approval...
                                                         </div>
                                                         <Button
                                                             variant="outline"
                                                             onClick={() => handleCancelBooking(session._id)}
                                                             className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-black italic uppercase tracking-widest text-[10px] transition-all"
                                                         >
                                                             <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                                                         </Button>
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     </motion.div>
                                 );
                             })}
                         </AnimatePresence>
                     </div>
                 )}
 
                 {/* Pagination */}
                 {totalPages > 1 && (
                     <div className="flex items-center justify-center gap-4 pt-8">
                         <Button 
                             variant="ghost" 
                             disabled={page === 1} 
                             onClick={() => setPage(page - 1)}
                             className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20"
                         >
                             <ChevronLeft className="h-5 w-5" />
                         </Button>
                         <div className="flex items-center gap-2">
                             {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                 <button
                                     key={p}
                                     onClick={() => setPage(p)}
                                     className={`w-12 h-12 rounded-full font-black italic text-xs transition-all ${page === p ? 'bg-primary text-black shadow-lg scale-110' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                 >
                                     {p}
                                 </button>
                             ))}
                         </div>
                         <Button 
                             variant="ghost" 
                             disabled={page === totalPages} 
                             onClick={() => setPage(page + 1)}
                             className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20"
                         >
                             <ChevronRight className="h-5 w-5" />
                         </Button>
                     </div>
                 )}
             </main>
 
             {/* Feedback Dialog */}
             <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
                 <DialogContent className="bg-card border-white/10 text-foreground max-w-xl rounded-[3rem] p-12 font-outfit shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                     <DialogHeader className="space-y-6">
                         <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                 <Star className="h-8 w-8 text-primary" />
                             </div>
                             <div>
                                 <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic">Session Feedback.</DialogTitle>
                                 <DialogDescription className="text-gray-500 font-medium italic">Coach feedback and performance rating.</DialogDescription>
                             </div>
                         </div>
                     </DialogHeader>
 
                     <div className="space-y-10 py-10">
                         <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Performance Rating</label>
                             <div className="flex items-center gap-4 bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
                                 <div className="text-5xl font-black text-primary italic leading-none">{selectedFeedback?.videoCall?.userPerformanceRating}</div>
                                 <div className="h-10 w-[1px] bg-white/10" />
                                 <div className="text-xs font-black uppercase tracking-widest text-neutral-500">Scale of 1-10</div>
                             </div>
                         </div>
 
                         <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Coach Feedback</label>
                             <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 text-lg font-medium leading-relaxed italic text-gray-300">
                                 "{selectedFeedback?.videoCall?.userFeedback || "No notes recorded for this session."}"
                             </div>
                         </div>
                     </div>
 
                     <DialogFooter>
                         <Button 
                             onClick={() => setSelectedFeedback(null)}
                             className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all"
                         >
                             Close
                         </Button>
                     </DialogFooter>
                 </DialogContent>
             </Dialog>

            {activeTrainer && (
                <BundlePurchaseModal
                    isOpen={isBundleModalOpen}
                    onClose={() => setIsBundleModalOpen(false)}
                    trainerId={activeTrainer.id}
                    trainerName={activeTrainer.name}
                    bundles={activeTrainer.bundles}
                />
            )}

             <SiteFooter />
        </div>
    );
}