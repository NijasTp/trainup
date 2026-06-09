import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import {
    Clock,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    Video,
    User,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Navigation2,
    Search,
    X,
    Filter,
    ArrowRight,
    Star,
    FileText,
    History
} from "lucide-react";
import { 
    format, 
    isSameDay, 
    startOfToday, 
    addDays, 
    eachDayOfInterval,
} from "date-fns";
import API from "@/lib/axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getVideoCallBySlotId } from "@/services/trainerService";
import { ROUTES } from "@/constants/routes";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";


interface Slot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    bookedBy?: {
        _id: string;
        name: string;
        profileImage: string;
    };
    requestedBy?: {
        userId: {
            _id: string;
            name: string;
            profileImage: string;
        };
        status: 'pending' | 'approved' | 'rejected';
        _id: string;
    }[];
    videoCall?: {
        _id: string;
        trainerRating?: number;
        trainerFeedback?: string;
        userPerformanceRating?: number;
        userFeedback?: string;
        status: string;
    };
    createdAt: string;
    updatedAt: string;
}

export default function WeeklySchedule() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [requests, setRequests] = useState<Slot[]>([]);
    const [pastSessions, setPastSessions] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRequestsLoading, setIsRequestsLoading] = useState(false);
    const [isPastLoading, setIsPastLoading] = useState(false);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [activeTab, setActiveTab] = useState("schedule");
    
    // Pagination & Search for Requests
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination for Past Sessions
    const [pastPage, setPastPage] = useState(1);
    const [pastTotal, setPastTotal] = useState(0);
    const pastLimit = 10;

    const [selectedPastSession, setSelectedPastSession] = useState<Slot | null>(null);

    const [newSlot, setNewSlot] = useState({
        startTime: "09:00",
        endTime: "10:00"
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate 60 days starting from today
    const dates = eachDayOfInterval({
        start: startOfToday(),
        end: addDays(startOfToday(), 60)
    });

    const fetchSlots = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await API.get("/trainer/slots");
            setSlots(response.data.slots);
        } catch (_error) {
            toast.error("Failed to load slots");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            setIsRequestsLoading(true);
            const response = await API.get("/trainer/session-requests");
            setRequests(response.data.requests);
        } catch (_error) {
            // Silently handle error
        } finally {
            setIsRequestsLoading(false);
        }
    }, []);

    const fetchPastSessions = useCallback(async () => {
        try {
            setIsPastLoading(true);
            const response = await API.get(`/trainer/past-sessions?page=${pastPage}&limit=${pastLimit}`);
            setPastSessions(response.data.sessions);
            setPastTotal(response.data.total);
        } catch (_error) {
            toast.error("Failed to load past sessions");
        } finally {
            setIsPastLoading(false);
        }
    }, [pastPage]);

    useEffect(() => {
        fetchSlots();
        fetchRequests();
    }, [fetchSlots, fetchRequests]);

    useEffect(() => {
        if (activeTab === 'past') {
            fetchPastSessions();
        }
    }, [activeTab, fetchPastSessions]);

    const handleAddSlot = async () => {
        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const response = await API.post("/trainer/slots", {
                date: dateStr,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime
            });
            setSlots([response.data.slot, ...slots]);
            setIsAddingSlot(false);
            toast.success("Slot added successfully");
        } catch (errorVal) { const error = errorVal as SafeAny;
            toast.error(error.response?.data?.error || "Failed to add slot");
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        try {
            await API.delete(`/trainer/slots/${slotId}`);
            setSlots(slots.filter(s => s._id !== slotId));
            toast.success("Slot deleted");
        } catch (errorVal) { const error = errorVal as SafeAny;
            toast.error(error.response?.data?.error || "Failed to delete slot");
        }
    };

    const handleApprove = async (slotId: string, userId: string) => {
        try {
            await API.post(`/trainer/session-requests/${slotId}/approve/${userId}`);
            toast.success("Session approved!");
            fetchSlots();
            fetchRequests();
        } catch (errorVal) { const error = errorVal as SafeAny;
            toast.error(error.response?.data?.message || "Failed to approve session");
        }
    };

    const handleReject = async (slotId: string, userId: string) => {
        const reason = window.prompt("Reason for rejection:");
        if (reason === null) return;
        if (!reason) {
            toast.error("Rejection reason is required");
            return;
        }

        try {
            await API.post(`/trainer/session-requests/${slotId}/reject/${userId}`, { rejectionReason: reason });
            toast.success("Session rejected");
            fetchSlots();
            fetchRequests();
        } catch (errorVal) { const error = errorVal as SafeAny;
            toast.error(error.response?.data?.message || "Failed to reject session");
        }
    };

    const handleJoinCall = async (slotId: string) => {
        try {
            const data = await getVideoCallBySlotId(slotId);
            const roomId = data.videoCall.roomId;
            navigate(ROUTES.TRAINER_CLIENT_VIDEO_CALL.replace(':roomId', roomId));
        } catch (errorVal) { const error = errorVal as SafeAny;
            toast.error(error.response?.data?.message || 'Failed to join video call');
        }
    };

    const selectedDateSlots = useMemo(() => {
        return slots
            .filter(slot => isSameDay(new Date(slot.date), selectedDate))
            .sort((a, b) => {
                if (a.isBooked && b.isBooked) {
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [slots, selectedDate]);


    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const goToToday = () => {
        setSelectedDate(new Date());
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const handleCalendarSelect = (date: Date) => {
        setSelectedDate(date);
        const index = dates.findIndex(d => isSameDay(d, date));
        if (index !== -1 && scrollContainerRef.current) {
            const itemWidth = 112 + 20; // w-28 (112px) + gap-5 (20px)
            scrollContainerRef.current.scrollTo({
                left: index * itemWidth,
                behavior: 'smooth'
            });
        }
    };

    const flattenedRequests = useMemo(() => {
        const result: { slot: Slot; request: NonNullable<Slot['requestedBy']>[0] }[] = [];
        requests.forEach(slot => {
            slot.requestedBy?.forEach(req => {
                if (req.status === 'pending') {
                    if (!searchQuery || req.userId.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                        result.push({ slot, request: req });
                    }
                }
            });
        });
        return result.sort((a, b) => new Date(a.slot.date).getTime() - new Date(b.slot.date).getTime());
    }, [requests, searchQuery]);

    const paginatedFlattenedRequests = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return flattenedRequests.slice(start, start + itemsPerPage);
    }, [flattenedRequests, currentPage]);

    const totalPages = Math.ceil(flattenedRequests.length / itemsPerPage);

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white overflow-hidden relative">
            {/* Ambient Aurora Canvas Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <Aurora colorStops={["#00f2fe", "#4facfe", "#00f2fe"]} />
            </div>

            {/* Glowing radial background accent */}
            <div className="absolute -left-[10%] top-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute -right-[10%] bottom-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <TrainerSiteHeader />

                <main className="flex-1 container max-w-6xl mx-auto py-16 px-6 space-y-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-10">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black">
                                <Navigation2 className="w-3.5 h-3.5 fill-current text-cyan-500" />
                                <span>Your Schedule</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white italic uppercase">
                                Weekly <span className="text-cyan-400">Schedule.</span>
                            </h1>
                        </motion.div>

                        <div className="flex items-center gap-4">
                            <Button 
                                variant="ghost" 
                                onClick={goToToday}
                                className="h-14 px-6 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 font-bold"
                            >
                                Today
                            </Button>
                            <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="bg-cyan-500 hover:bg-cyan-400 text-black h-14 px-10 rounded-2xl font-black transition-all shadow-[0_20px_50px_rgba(6,182,212,0.15)] hover:-translate-y-1 active:translate-y-0 text-xs uppercase italic tracking-widest"
                                    >
                                        <Plus className="w-5 h-5 mr-3 text-black" />
                                        Create Slot
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-4xl font-black tracking-tighter text-white italic uppercase">New Slot.</DialogTitle>
                                        <DialogDescription className="text-gray-500 mt-3 text-lg leading-relaxed uppercase tracking-wider text-xs">
                                            Set availability for <span className="text-cyan-400 font-bold">{format(selectedDate, "MMMM do")}</span>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-10 py-12">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Start Time</label>
                                                <div className="relative group">
                                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
                                                    <Input 
                                                        type="time" 
                                                        className="bg-black/40 border-white/10 pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-cyan-500/20 transition-all text-lg font-bold text-white"
                                                        value={newSlot.startTime}
                                                        onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">End Time</label>
                                                <div className="relative group">
                                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
                                                    <Input 
                                                        type="time" 
                                                        className="bg-black/40 border-white/10 pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-cyan-500/20 transition-all text-lg font-bold text-white"
                                                        value={newSlot.endTime}
                                                        onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter className="gap-4">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setIsAddingSlot(false)}
                                            className="h-16 rounded-2xl px-8 text-gray-400 hover:bg-white/5 font-bold text-xs uppercase tracking-widest"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleAddSlot}
                                            className="bg-cyan-500 hover:bg-cyan-400 text-black h-16 px-12 rounded-2xl font-black flex-1 text-xs uppercase italic tracking-widest transition-transform hover:scale-[1.02]"
                                        >
                                            Create Slot
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 h-16">
                            <TabsTrigger value="schedule" className="rounded-xl px-8 data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-gray-400 transition-all font-black uppercase italic tracking-widest text-[10px]">
                                My Calendar
                            </TabsTrigger>
                            <TabsTrigger value="requests" className="rounded-xl px-8 data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-gray-400 transition-all font-black uppercase italic tracking-widest text-[10px] relative">
                                Session Requests
                                {flattenedRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-black text-[10px] flex items-center justify-center rounded-full font-black border-2 border-[#050505]">
                                        {flattenedRequests.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="past" className="rounded-xl px-8 data-[state=active]:bg-cyan-500 data-[state=active]:text-black text-gray-400 transition-all font-black uppercase italic tracking-widest text-[10px]">
                                Past Sessions
                            </TabsTrigger>
                        </TabsList>

                    <TabsContent value="schedule" className="space-y-12 outline-none">
                        {/* Date Strip Scroller */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
                                        {format(selectedDate, "MMMM yyyy")}
                                    </h2>
                                    
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-10 w-10 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover text-muted-foreground"
                                            >
                                                <CalendarIcon className="w-4 h-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="start" sideOffset={12}>
                                            <ModernCalendar
                                                selected={selectedDate}
                                                onSelect={handleCalendarSelect}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <div className="h-[2px] w-16 bg-white/10" />
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => scroll('left')}
                                        className="h-12 w-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-all hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => scroll('right')}
                                        className="h-12 w-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-all hover:scale-110"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div 
                                ref={scrollContainerRef}
                                className="flex gap-5 overflow-x-auto pb-6 no-scrollbar scroll-smooth"
                            >
                                {dates.map((date) => {
                                    const isSelected = isSameDay(date, selectedDate);
                                    const isToday = isSameDay(date, new Date());
                                    
                                    return (
                                        <button
                                            key={date.toString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={cn(
                                                "flex-shrink-0 w-28 h-36 rounded-[2.8rem] flex flex-col items-center justify-center gap-2 transition-all duration-500 border",
                                                isSelected 
                                                    ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_25px_60px_rgba(6,182,212,0.15)] -translate-y-3 font-black" 
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-cyan-500/20 hover:bg-white/10"
                                            )}
                                        >
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
                                                {format(date, "EEE")}
                                            </span>
                                            <span className="text-4xl font-black tracking-tighter">
                                                {format(date, "d")}
                                            </span>
                                            {isToday && !isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 mt-1 animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Slots Pipeline */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-white/10 pb-10">
                                <h3 className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-6 text-white">
                                    Day Overview.
                                    <Badge variant="outline" className="border-white/10 text-gray-400 rounded-full font-mono text-sm px-4 py-1">
                                        {selectedDateSlots.length} Total
                                    </Badge>
                                </h3>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <div className="py-32 flex flex-col items-center gap-6">
                                        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                                        <span className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading slots...</span>
                                    </div>
                                ) : selectedDateSlots.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-40 bg-white/[0.02] border border-dashed border-white/10 rounded-[4rem] text-center px-10"
                                    >
                                        <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                            <CalendarIcon className="w-10 h-10 text-gray-600 opacity-20" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 tracking-tighter text-white italic uppercase">No Active Slots.</h3>
                                        <p className="text-gray-500 text-lg max-w-sm mx-auto leading-relaxed italic">
                                            Your availability for this day is currently empty.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-6">
                                        {selectedDateSlots.map((slot, index) => {
                                            const pendingRequests = slot.requestedBy?.filter(r => r.status === 'pending') || [];
                                            const isPending = pendingRequests.length > 0;
                                            
                                            return (
                                                <motion.div
                                                    key={slot._id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.08 }}
                                                >
                                                    <Card className={cn(
                                                        "relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-cyan-500/20 transition-all duration-500 group rounded-[3.5rem]",
                                                        slot.isBooked && "bg-cyan-500 text-black border-cyan-500 shadow-[0_30px_70px_rgba(6,182,212,0.1)]"
                                                    )}>
                                                        <CardContent className="p-10 md:p-12">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                                <div className="flex items-center gap-10">
                                                                    <div className={cn(
                                                                        "w-24 h-24 rounded-[2.2rem] flex flex-col items-center justify-center border transition-colors duration-500",
                                                                        slot.isBooked ? "bg-black/20 text-cyan-400 border-none" : "bg-white/5 border-white/10 text-gray-400"
                                                                    )}>
                                                                        <Clock className="w-8 h-8 mb-2" />
                                                                        <span className="text-[10px] font-black uppercase tracking-tighter">Session</span>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div className="flex flex-wrap items-center gap-6">
                                                                            <p className={cn("text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase", slot.isBooked ? "text-white" : "text-white")}>
                                                                                {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                                                                            </p>
                                                                            {slot.isBooked ? (
                                                                                <Badge className="bg-black/20 text-cyan-400 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-[0.2em]">
                                                                                    Booked
                                                                                </Badge>
                                                                            ) : isPending ? (
                                                                                <Badge className="bg-cyan-500 text-black border-none px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-[0.2em] animate-pulse">
                                                                                    {pendingRequests.length} Pending {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="outline" className="border-white/10 text-gray-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                                                                    Open Slot
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-8 text-sm md:text-base">
                                                                            <div className={cn("flex items-center gap-3", slot.isBooked ? "text-black/60" : "text-gray-400")}>
                                                                                <Video className="w-5 h-5 opacity-30" />
                                                                                <span className="font-bold tracking-tight italic">Video Session</span>
                                                                            </div>
                                                                            {slot.isBooked && (
                                                                                <div className="flex items-center gap-3 pl-8 border-l border-black/10">
                                                                                    <User className="w-5 h-5 text-black/30" />
                                                                                    <span className="font-black text-lg tracking-tighter text-black">{slot.bookedBy?.name}</span>
                                                                                </div>
                                                                            )}
                                                                            {!slot.isBooked && isPending && (
                                                                                <div className="flex flex-col gap-2 pl-8 border-l border-white/10">
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Requested by:</span>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="flex -space-x-3 overflow-hidden">
                                                                                            {pendingRequests.slice(0, 3).map((req) => (
                                                                                                <Avatar key={req._id} className="h-8 w-8 border-2 border-[#050505] ring-0">
                                                                                                    <AvatarImage src={req.userId.profileImage} />
                                                                                                    <AvatarFallback className="bg-white/5 text-[10px] font-black text-white">{req.userId.name[0]}</AvatarFallback>
                                                                                                </Avatar>
                                                                                            ))}
                                                                                            {pendingRequests.length > 3 && (
                                                                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border-2 border-[#050505] text-[10px] font-black text-gray-400">
                                                                                                    +{pendingRequests.length - 3}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <span className="font-bold text-gray-400 text-sm">
                                                                                            {pendingRequests[0].userId.name} {pendingRequests.length > 1 ? `and ${pendingRequests.length - 1} others` : ''}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-4">
                                                                    {slot.isBooked ? (
                                                                        <Button 
                                                                            onClick={() => handleJoinCall(slot._id)}
                                                                            className="rounded-full bg-black text-white hover:bg-black/80 px-10 h-16 font-black uppercase tracking-widest text-xs shadow-2xl"
                                                                        >
                                                                            Join Call
                                                                        </Button>
                                                                    ) : isPending ? (
                                                                        <div className="flex flex-col gap-3 min-w-[200px]">
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <Button className="h-14 px-8 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] w-full shadow-2xl">
                                                                                        Manage Requests
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg rounded-[3rem] p-10 backdrop-blur-2xl">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase text-white">Session Requests.</DialogTitle>
                                                                                        <DialogDescription className="text-gray-500 mt-2 italic text-xs uppercase tracking-wider">Select a client to approve for this slot.</DialogDescription>
                                                                                    </DialogHeader>
                                                                                    <div className="space-y-4 mt-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                                                                        {pendingRequests.map((req) => (
                                                                                            <div key={req._id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-cyan-500/20 transition-all">
                                                                                                <div className="flex items-center gap-4">
                                                                                                    <Avatar className="h-12 w-12 rounded-2xl border border-white/10">
                                                                                                        <AvatarImage src={req.userId.profileImage} />
                                                                                                        <AvatarFallback className="bg-white/5 text-white">{req.userId.name[0]}</AvatarFallback>
                                                                                                    </Avatar>
                                                                                                    <span className="font-black text-lg tracking-tighter text-white italic">{req.userId.name}</span>
                                                                                                </div>
                                                                                                <div className="flex gap-2">
                                                                                                    <Button 
                                                                                                        onClick={() => handleApprove(slot._id, req.userId._id)}
                                                                                                        size="sm"
                                                                                                        className="h-10 px-6 rounded-xl bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400"
                                                                                                    >
                                                                                                        Approve
                                                                                                    </Button>
                                                                                                    <Button 
                                                                                                        onClick={() => handleReject(slot._id, req.userId._id)}
                                                                                                        size="sm"
                                                                                                        variant="ghost"
                                                                                                        className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 p-0 hover:bg-red-500/20"
                                                                                                    >
                                                                                                        <X className="w-4 h-4" />
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        </div>
                                                                    ) : (
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon"
                                                                            onClick={() => handleDeleteSlot(slot._id)}
                                                                            className="h-16 w-16 rounded-full text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                        >
                                                                            <Trash2 className="w-6 h-6" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-10 outline-none">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative w-full md:w-[400px] group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500/40 group-focus-within:text-cyan-400 transition-colors" />
                                <Input 
                                    placeholder="Search by client name..."
                                    className="h-16 bg-white/[0.02] border-white/10 pl-14 rounded-3xl focus:ring-1 focus:ring-cyan-500/20 text-white font-bold"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="border-white/10 text-gray-400 h-10 px-4 rounded-xl flex gap-2">
                                    <Filter className="w-4 h-4 text-cyan-400" />
                                    <span>{flattenedRequests.length} Pending</span>
                                </Badge>
                                <Button variant="ghost" onClick={fetchRequests} className="h-12 px-6 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white">
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {isRequestsLoading ? (
                                <div className="py-40 flex flex-col items-center gap-6">
                                    <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                                    <p className="text-gray-500 font-black tracking-widest uppercase text-[10px] italic">Loading requests...</p>
                                </div>
                            ) : paginatedFlattenedRequests.length === 0 ? (
                                <div className="py-40 bg-white/[0.02] border border-dashed border-white/10 rounded-[4rem] text-center px-10">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
                                        <AlertCircle className="w-10 h-10 text-gray-600 opacity-20" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 text-white italic uppercase">No pending requests.</h3>
                                    <p className="text-gray-500 text-lg max-w-sm mx-auto italic">Everything is in order. Enjoy the peace.</p>
                                </div>
                            ) : (
                                paginatedFlattenedRequests.map(({ slot, request }, index) => {
                                    return (
                                        <motion.div
                                            key={`${slot._id}-${request.userId._id}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="bg-white/[0.02] border-white/10 rounded-[3.5rem] overflow-hidden hover:bg-white/[0.04] transition-all group">
                                                <CardContent className="p-10">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                        <div className="flex items-center gap-10">
                                                            <Avatar className="h-24 w-24 rounded-[2.5rem] ring-4 ring-white/10 shadow-2xl">
                                                                <AvatarImage src={request.userId.profileImage} />
                                                                <AvatarFallback className="bg-white/5 text-white text-3xl font-black italic">{request.userId.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-3">
                                                                <h3 className="text-3xl font-black tracking-tighter group-hover:text-cyan-400 transition-colors text-white italic uppercase">{request.userId.name}</h3>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                                                        <CalendarIcon className="w-4 h-4 text-gray-600" />
                                                                        <span className="text-sm font-black text-white italic">{format(new Date(slot.date), "MMMM do")}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                                                        <Clock className="w-4 h-4 text-gray-600" />
                                                                        <span className="text-sm font-black text-white italic">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Button 
                                                                onClick={() => handleApprove(slot._id, request.userId._id)}
                                                                className="h-16 px-12 rounded-[2rem] bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] shadow-2xl transition-transform hover:scale-105 active:scale-95"
                                                            >
                                                                Approve <ArrowRight className="w-4 h-4 ml-3 text-black" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost"
                                                                onClick={() => handleReject(slot._id, request.userId._id)}
                                                                className="h-16 w-16 rounded-full text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            >
                                                                <X className="w-6 h-6" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-10">
                                <Button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={cn(
                                                "w-14 h-14 rounded-2xl font-black text-lg transition-all",
                                                currentPage === i + 1 ? "bg-cyan-500 text-black scale-110" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-10 outline-none">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h3 className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-6 text-white">
                                Session History.
                                <Badge variant="outline" className="border-white/10 text-gray-400 rounded-full font-mono text-sm px-4 py-1">
                                    {pastTotal} Total
                                </Badge>
                            </h3>
                        </div>

                        <div className="grid gap-6">
                            {isPastLoading ? (
                                <div className="py-40 flex flex-col items-center gap-6">
                                    <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                                    <p className="text-gray-500 font-black tracking-widest uppercase text-[10px] italic">Loading history...</p>
                                </div>
                            ) : pastSessions.length === 0 ? (
                                <div className="py-40 bg-white/[0.02] border border-dashed border-white/10 rounded-[4rem] text-center px-10">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
                                        <History className="w-10 h-10 text-gray-600 opacity-20" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 text-white italic uppercase">No past sessions.</h3>
                                    <p className="text-gray-500 text-lg max-w-sm mx-auto italic">Complete your first session to see history here.</p>
                                </div>
                            ) : (
                                pastSessions.map((slot, index) => (
                                    <motion.div
                                        key={slot._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="bg-white/[0.02] border-white/10 rounded-[3.5rem] overflow-hidden hover:bg-white/[0.04] transition-all group">
                                            <CardContent className="p-10">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                    <div className="flex items-center gap-10">
                                                        <Avatar className="h-20 w-20 rounded-[2rem] ring-4 ring-white/10 shadow-2xl">
                                                            <AvatarImage src={slot.bookedBy?.profileImage} />
                                                            <AvatarFallback className="bg-white/5 text-white text-2xl font-black italic">{slot.bookedBy?.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-3">
                                                            <h3 className="text-2xl font-black tracking-tighter text-white italic uppercase">{slot.bookedBy?.name}</h3>
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                                                    <CalendarIcon className="w-3.5 h-3.5 text-gray-600" />
                                                                    <span className="text-xs font-black text-white italic">{format(new Date(slot.date), "MMMM do, yyyy")}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                                                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                                                                    <span className="text-xs font-black text-white italic">{formatTime(slot.startTime)}</span>
                                                                </div>
                                                                {slot.videoCall?.userPerformanceRating && (
                                                                    <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                                                                        <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                                                                        <span className="text-xs font-black text-cyan-400 italic">{slot.videoCall.userPerformanceRating}/5</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button 
                                                                    className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-[10px] shadow-2xl"
                                                                    onClick={() => setSelectedPastSession(slot)}
                                                                >
                                                                    <FileText className="w-4 h-4 mr-3" /> View Details
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-xl rounded-[3rem] p-10 backdrop-blur-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase text-white">Session Report.</DialogTitle>
                                                                    <DialogDescription className="text-gray-500 mt-2 italic text-xs uppercase tracking-wider">Historical performance and feedback summary.</DialogDescription>
                                                                </DialogHeader>
                                                                
                                                                {selectedPastSession && (
                                                                    <div className="space-y-8 mt-10">
                                                                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                                                                            <Avatar className="h-16 w-16 rounded-2xl border border-white/10">
                                                                                <AvatarImage src={selectedPastSession.bookedBy?.profileImage} />
                                                                                <AvatarFallback>{selectedPastSession.bookedBy?.name[0]}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <h4 className="font-black text-xl italic uppercase tracking-tighter text-white">{selectedPastSession.bookedBy?.name}</h4>
                                                                                <p className="text-gray-500 text-sm font-bold">{format(new Date(selectedPastSession.date), "MMMM do, yyyy")} @ {formatTime(selectedPastSession.startTime)}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-6">
                                                                            <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Trainer Rating</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Star className={cn("w-6 h-6", selectedPastSession.videoCall?.trainerRating ? "text-cyan-500 fill-cyan-500" : "text-gray-600 opacity-20")} />
                                                                                    <span className="text-3xl font-black tracking-tighter italic text-white">{selectedPastSession.videoCall?.trainerRating || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">User Perf. Rating</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Star className={cn("w-6 h-6", selectedPastSession.videoCall?.userPerformanceRating ? "text-cyan-500 fill-cyan-500" : "text-gray-600 opacity-20")} />
                                                                                    <span className="text-3xl font-black tracking-tighter italic text-white">{selectedPastSession.videoCall?.userPerformanceRating || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-6">
                                                                            <div className="space-y-3">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                                                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> Trainer Feedback
                                                                                </span>
                                                                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 min-h-[100px]">
                                                                                    <p className="text-sm leading-relaxed italic text-white/80">
                                                                                        {selectedPastSession.videoCall?.trainerFeedback || "No feedback provided by trainer."}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                                                    <User className="w-3.5 h-3.5 text-cyan-400" /> User Performance Feedback
                                                                                </span>
                                                                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 min-h-[100px]">
                                                                                    <p className="text-sm leading-relaxed italic text-white/80">
                                                                                        {selectedPastSession.videoCall?.userFeedback || "No performance notes recorded."}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                <DialogFooter className="mt-10">
                                                                    <Button 
                                                                        className="w-full h-14 rounded-2xl bg-cyan-500 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-xs"
                                                                        onClick={() => setSelectedPastSession(null)}
                                                                    >
                                                                        Close Report
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Past Pagination */}
                        {pastTotal > pastLimit && (
                            <div className="flex items-center justify-center gap-4 pt-10">
                                <Button
                                    disabled={pastPage === 1}
                                    onClick={() => setPastPage(prev => prev - 1)}
                                    className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                <div className="flex gap-2">
                                    {Array.from({ length: Math.ceil(pastTotal / pastLimit) }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPastPage(i + 1)}
                                            className={cn(
                                                "w-14 h-14 rounded-2xl font-black text-lg transition-all",
                                                pastPage === i + 1 ? "bg-cyan-500 text-black scale-110" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    disabled={pastPage === Math.ceil(pastTotal / pastLimit)}
                                    onClick={() => setPastPage(prev => prev + 1)}
                                    className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
              </main>
              <SiteFooter />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}