import { useState, useEffect, useRef, useMemo } from "react";
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
    MoreHorizontal,
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

    useEffect(() => {
        fetchSlots();
        fetchRequests();
    }, []);

    useEffect(() => {
        if (activeTab === 'past') {
            fetchPastSessions();
        }
    }, [activeTab, pastPage]);

    const fetchSlots = async () => {
        try {
            setIsLoading(true);
            const response = await API.get("/trainer/slots");
            setSlots(response.data.slots);
        } catch (error) {
            toast.error("Failed to load slots");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            setIsRequestsLoading(true);
            const response = await API.get("/trainer/session-requests");
            setRequests(response.data.requests);
        } catch (error) {
            // Silently handle error
        } finally {
            setIsRequestsLoading(false);
        }
    };

    const fetchPastSessions = async () => {
        try {
            setIsPastLoading(true);
            const response = await API.get(`/trainer/past-sessions?page=${pastPage}&limit=${pastLimit}`);
            setPastSessions(response.data.sessions);
            setPastTotal(response.data.total);
        } catch (error) {
            toast.error("Failed to load past sessions");
        } finally {
            setIsPastLoading(false);
        }
    };

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
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add slot");
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        try {
            await API.delete(`/trainer/slots/${slotId}`);
            setSlots(slots.filter(s => s._id !== slotId));
            toast.success("Slot deleted");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete slot");
        }
    };

    const handleApprove = async (slotId: string, userId: string) => {
        try {
            await API.post(`/trainer/session-requests/${slotId}/approve/${userId}`);
            toast.success("Session approved!");
            fetchSlots();
            fetchRequests();
        } catch (error: any) {
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject session");
        }
    };

    const handleJoinCall = async (slotId: string) => {
        try {
            const data = await getVideoCallBySlotId(slotId);
            const roomId = data.videoCall.roomId;
            navigate(ROUTES.TRAINER_CLIENT_VIDEO_CALL.replace(':roomId', roomId));
        } catch (error: any) {
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
        <div className="min-h-screen bg-site-bg text-foreground p-4 md:p-10 font-outfit selection:bg-primary/10 selection:text-foreground">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-glass-border pb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
                            <Navigation2 className="w-3.5 h-3.5 fill-current" />
                            <span>Your Schedule</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-foreground italic uppercase">
                            Weekly <span className="text-muted-foreground">Schedule.</span>
                        </h1>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={goToToday}
                            className="h-14 px-6 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-glass-hover font-bold"
                        >
                            Today
                        </Button>
                        <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-primary text-primary-foreground hover:opacity-90 h-14 px-10 rounded-2xl font-black transition-all shadow-[0_20px_50px_rgba(var(--primary),0.15)] hover:-translate-y-1 active:translate-y-0"
                                >
                                    <Plus className="w-5 h-5 mr-3" />
                                    Create Slot
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-site-bg border-glass-border text-foreground max-w-md rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-4xl font-black tracking-tighter">New Slot.</DialogTitle>
                                    <DialogDescription className="text-neutral-500 mt-3 text-lg leading-relaxed">
                                        Set availability for <span className="text-white font-bold">{format(selectedDate, "MMMM do")}</span>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-10 py-12">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Start Time</label>
                                            <div className="relative group">
                                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                <Input 
                                                    type="time" 
                                                    className="bg-glass-bg border-glass-border pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-primary/20 transition-all text-lg font-bold"
                                                    value={newSlot.startTime}
                                                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">End Time</label>
                                            <div className="relative group">
                                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                                <Input 
                                                    type="time" 
                                                    className="bg-glass-bg border-glass-border pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-primary/20 transition-all text-lg font-bold"
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
                                        className="h-16 rounded-2xl px-8 text-muted-foreground hover:bg-glass-hover font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleAddSlot}
                                        className="bg-primary text-primary-foreground hover:opacity-90 h-16 px-12 rounded-2xl font-black flex-1 text-lg transition-transform hover:scale-[1.02]"
                                    >
                                        Create Slot
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                    <TabsList className="bg-glass-bg p-1 rounded-2xl border border-glass-border h-14">
                        <TabsTrigger value="schedule" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-black uppercase italic tracking-widest text-[10px]">
                            My Calendar
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-black uppercase italic tracking-widest text-[10px] relative">
                            Session Requests
                            {flattenedRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full font-black border-2 border-site-bg">
                                    {flattenedRequests.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="past" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-black uppercase italic tracking-widest text-[10px]">
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

                                    <div className="h-[2px] w-16 bg-glass-border" />
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => scroll('left')}
                                        className="h-12 w-12 rounded-full border-glass-border bg-glass-bg hover:bg-glass-hover text-muted-foreground transition-all hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => scroll('right')}
                                        className="h-12 w-12 rounded-full border-glass-border bg-glass-bg hover:bg-glass-hover text-muted-foreground transition-all hover:scale-110"
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
                                                    ? "bg-primary text-primary-foreground border-primary shadow-[0_25px_60px_rgba(var(--primary),0.15)] -translate-y-3" 
                                                    : "bg-glass-bg border-glass-border text-muted-foreground hover:border-primary/20 hover:bg-glass-hover"
                                            )}
                                        >
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
                                                {format(date, "EEE")}
                                            </span>
                                            <span className="text-4xl font-black tracking-tighter">
                                                {format(date, "d")}
                                            </span>
                                            {isToday && !isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1 animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Slots Pipeline */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-glass-border pb-10">
                                <h3 className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-6 text-foreground">
                                    Day Overview.
                                    <Badge variant="outline" className="border-glass-border text-muted-foreground rounded-full font-mono text-sm px-4 py-1">
                                        {selectedDateSlots.length} Total
                                    </Badge>
                                </h3>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <div className="py-32 flex flex-col items-center gap-6">
                                        <Loader2 className="w-10 h-10 animate-spin text-white/10" />
                                        <span className="text-neutral-700 font-bold tracking-widest uppercase text-xs">Loading slots...</span>
                                    </div>
                                ) : selectedDateSlots.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-40 bg-glass-bg border border-dashed border-glass-border rounded-[4rem] text-center px-10"
                                    >
                                        <div className="w-24 h-24 rounded-[2rem] bg-glass-bg flex items-center justify-center mb-8 border border-glass-border">
                                            <CalendarIcon className="w-10 h-10 text-muted-foreground opacity-20" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 tracking-tighter text-foreground italic uppercase">No Active Slots.</h3>
                                        <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed italic">
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
                                                        "relative overflow-hidden bg-glass-bg border-glass-border hover:border-primary/20 transition-all duration-500 group rounded-[3.5rem]",
                                                        slot.isBooked && "bg-primary text-primary-foreground border-primary shadow-[0_30px_70px_rgba(var(--primary),0.1)]"
                                                    )}>
                                                        <CardContent className="p-10 md:p-12">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                                <div className="flex items-center gap-10">
                                                                    <div className={cn(
                                                                        "w-24 h-24 rounded-[2.2rem] flex flex-col items-center justify-center border transition-colors duration-500",
                                                                        slot.isBooked ? "bg-site-bg text-foreground border-site-bg" : "bg-glass-bg border-glass-border text-muted-foreground"
                                                                    )}>
                                                                        <Clock className="w-8 h-8 mb-2" />
                                                                        <span className="text-[10px] font-black uppercase tracking-tighter">Session</span>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div className="flex flex-wrap items-center gap-6">
                                                                            <p className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-foreground">
                                                                                {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                                                                            </p>
                                                                            {slot.isBooked ? (
                                                                                <Badge className="bg-primary-foreground text-primary border-none px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-[0.2em]">
                                                                                    Booked
                                                                                </Badge>
                                                                            ) : isPending ? (
                                                                                <Badge className="bg-primary text-primary-foreground border-none px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-[0.2em] animate-pulse">
                                                                                    {pendingRequests.length} Pending {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="outline" className="border-glass-border text-muted-foreground px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                                                                    Open Slot
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-8 text-sm md:text-base">
                                                                            <div className={cn("flex items-center gap-3", slot.isBooked ? "text-primary-foreground/50" : "text-muted-foreground")}>
                                                                                <Video className="w-5 h-5 opacity-30" />
                                                                                <span className="font-bold tracking-tight italic">Video Session</span>
                                                                            </div>
                                                                            {slot.isBooked && (
                                                                                <div className="flex items-center gap-3 pl-8 border-l border-primary-foreground/10">
                                                                                    <User className="w-5 h-5 text-primary-foreground/30" />
                                                                                    <span className="font-black text-lg tracking-tighter text-primary-foreground">{slot.bookedBy?.name}</span>
                                                                                </div>
                                                                            )}
                                                                            {!slot.isBooked && isPending && (
                                                                                <div className="flex flex-col gap-2 pl-8 border-l border-glass-border">
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Requested by:</span>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="flex -space-x-3 overflow-hidden">
                                                                                            {pendingRequests.slice(0, 3).map((req) => (
                                                                                                <Avatar key={req._id} className="h-8 w-8 border-2 border-site-bg ring-0">
                                                                                                    <AvatarImage src={req.userId.profileImage} />
                                                                                                    <AvatarFallback className="bg-glass-bg text-[10px] font-black text-foreground">{req.userId.name[0]}</AvatarFallback>
                                                                                                </Avatar>
                                                                                            ))}
                                                                                            {pendingRequests.length > 3 && (
                                                                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-glass-bg border-2 border-site-bg text-[10px] font-black text-muted-foreground">
                                                                                                    +{pendingRequests.length - 3}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <span className="font-bold text-muted-foreground text-sm">
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
                                                                            className="rounded-full bg-primary-foreground text-primary hover:opacity-90 px-10 h-16 font-black uppercase tracking-widest text-xs shadow-2xl"
                                                                        >
                                                                            Join Call
                                                                        </Button>
                                                                    ) : isPending ? (
                                                                        <div className="flex flex-col gap-3 min-w-[200px]">
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest text-[10px] w-full shadow-2xl">
                                                                                        Manage Requests
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="bg-site-bg border-glass-border text-foreground max-w-lg rounded-[3rem] p-10 backdrop-blur-2xl">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase">Session Requests.</DialogTitle>
                                                                                        <DialogDescription className="text-muted-foreground mt-2 italic">Select a client to approve for this slot.</DialogDescription>
                                                                                    </DialogHeader>
                                                                                    <div className="space-y-4 mt-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                                                                        {pendingRequests.map((req) => (
                                                                                            <div key={req._id} className="flex items-center justify-between p-6 bg-glass-bg rounded-3xl border border-glass-border group hover:border-primary/20 transition-all">
                                                                                                <div className="flex items-center gap-4">
                                                                                                    <Avatar className="h-12 w-12 rounded-2xl border border-glass-border">
                                                                                                        <AvatarImage src={req.userId.profileImage} />
                                                                                                        <AvatarFallback className="bg-glass-bg text-foreground">{req.userId.name[0]}</AvatarFallback>
                                                                                                    </Avatar>
                                                                                                    <span className="font-black text-lg tracking-tighter text-foreground italic">{req.userId.name}</span>
                                                                                                </div>
                                                                                                <div className="flex gap-2">
                                                                                                    <Button 
                                                                                                        onClick={() => handleApprove(slot._id, req.userId._id)}
                                                                                                        size="sm"
                                                                                                        className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]"
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
                                                                            className="h-16 w-16 rounded-full text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
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
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    placeholder="Search by client name..."
                                    className="h-16 bg-glass-bg border-glass-border pl-14 rounded-3xl focus:ring-1 focus:ring-primary/20 text-foreground"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="border-glass-border text-muted-foreground h-10 px-4 rounded-xl flex gap-2">
                                    <Filter className="w-4 h-4" />
                                    <span>{flattenedRequests.length} Pending</span>
                                </Badge>
                                <Button variant="ghost" onClick={fetchRequests} className="h-12 px-6 rounded-2xl hover:bg-glass-hover text-muted-foreground">
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {isRequestsLoading ? (
                                <div className="py-40 flex flex-col items-center gap-6">
                                    <Loader2 className="w-12 h-12 animate-spin text-muted-foreground opacity-10" />
                                    <p className="text-muted-foreground font-black tracking-widest uppercase text-[10px] italic">Loading requests...</p>
                                </div>
                            ) : paginatedFlattenedRequests.length === 0 ? (
                                <div className="py-40 bg-glass-bg border border-dashed border-glass-border rounded-[4rem] text-center px-10">
                                    <div className="w-24 h-24 rounded-full bg-glass-bg flex items-center justify-center mx-auto mb-8 border border-glass-border">
                                        <AlertCircle className="w-10 h-10 text-muted-foreground opacity-20" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 text-foreground italic uppercase">No pending requests.</h3>
                                    <p className="text-muted-foreground text-lg max-w-sm mx-auto italic">Everything is in order. Enjoy the peace.</p>
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
                                            <Card className="bg-glass-bg border-glass-border rounded-[3.5rem] overflow-hidden hover:bg-glass-hover transition-all group">
                                                <CardContent className="p-10">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                        <div className="flex items-center gap-10">
                                                            <Avatar className="h-24 w-24 rounded-[2.5rem] ring-4 ring-glass-border shadow-2xl">
                                                                <AvatarImage src={request.userId.profileImage} />
                                                                <AvatarFallback className="bg-glass-bg text-foreground text-3xl font-black italic">{request.userId.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-3">
                                                                <h3 className="text-3xl font-black tracking-tighter group-hover:text-primary transition-colors text-foreground italic uppercase">{request.userId.name}</h3>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-3 bg-glass-bg px-4 py-2 rounded-2xl border border-glass-border">
                                                                        <CalendarIcon className="w-4 h-4 text-muted-foreground/40" />
                                                                        <span className="text-sm font-black text-foreground italic">{format(new Date(slot.date), "MMMM do")}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-glass-bg px-4 py-2 rounded-2xl border border-glass-border">
                                                                        <Clock className="w-4 h-4 text-muted-foreground/40" />
                                                                        <span className="text-sm font-black text-foreground italic">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Button 
                                                                onClick={() => handleApprove(slot._id, request.userId._id)}
                                                                className="h-16 px-12 rounded-[2rem] bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest text-[10px] shadow-2xl transition-transform hover:scale-105 active:scale-95"
                                                            >
                                                                Approve <ArrowRight className="w-4 h-4 ml-3" />
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
                                    className="h-14 w-14 rounded-full bg-glass-bg border-glass-border text-muted-foreground hover:bg-glass-hover"
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
                                                currentPage === i + 1 ? "bg-primary text-primary-foreground scale-110" : "bg-glass-bg text-muted-foreground hover:bg-glass-hover border border-glass-border"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-14 w-14 rounded-full bg-glass-bg border-glass-border text-muted-foreground hover:bg-glass-hover"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-10 outline-none">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h3 className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-6 text-foreground">
                                Session History.
                                <Badge variant="outline" className="border-glass-border text-muted-foreground rounded-full font-mono text-sm px-4 py-1">
                                    {pastTotal} Total
                                </Badge>
                            </h3>
                        </div>

                        <div className="grid gap-6">
                            {isPastLoading ? (
                                <div className="py-40 flex flex-col items-center gap-6">
                                    <Loader2 className="w-12 h-12 animate-spin text-muted-foreground opacity-10" />
                                    <p className="text-muted-foreground font-black tracking-widest uppercase text-[10px] italic">Loading history...</p>
                                </div>
                            ) : pastSessions.length === 0 ? (
                                <div className="py-40 bg-glass-bg border border-dashed border-glass-border rounded-[4rem] text-center px-10">
                                    <div className="w-24 h-24 rounded-full bg-glass-bg flex items-center justify-center mx-auto mb-8 border border-glass-border">
                                        <History className="w-10 h-10 text-muted-foreground opacity-20" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 text-foreground italic uppercase">No past sessions.</h3>
                                    <p className="text-muted-foreground text-lg max-w-sm mx-auto italic">Complete your first session to see history here.</p>
                                </div>
                            ) : (
                                pastSessions.map((slot, index) => (
                                    <motion.div
                                        key={slot._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="bg-glass-bg border-glass-border rounded-[3.5rem] overflow-hidden hover:bg-glass-hover transition-all group">
                                            <CardContent className="p-10">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                    <div className="flex items-center gap-10">
                                                        <Avatar className="h-20 w-20 rounded-[2rem] ring-4 ring-glass-border shadow-2xl">
                                                            <AvatarImage src={slot.bookedBy?.profileImage} />
                                                            <AvatarFallback className="bg-glass-bg text-foreground text-2xl font-black italic">{slot.bookedBy?.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-3">
                                                            <h3 className="text-2xl font-black tracking-tighter text-foreground italic uppercase">{slot.bookedBy?.name}</h3>
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center gap-2 bg-glass-bg px-3 py-1.5 rounded-xl border border-glass-border">
                                                                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/40" />
                                                                    <span className="text-xs font-black text-foreground italic">{format(new Date(slot.date), "MMMM do, yyyy")}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-glass-bg px-3 py-1.5 rounded-xl border border-glass-border">
                                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
                                                                    <span className="text-xs font-black text-foreground italic">{formatTime(slot.startTime)}</span>
                                                                </div>
                                                                {slot.videoCall?.userPerformanceRating && (
                                                                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                                                                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                                                                        <span className="text-xs font-black text-primary italic">{slot.videoCall.userPerformanceRating}/5</span>
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
                                                            <DialogContent className="bg-site-bg border-glass-border text-foreground max-w-xl rounded-[3rem] p-10 backdrop-blur-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase">Session Report.</DialogTitle>
                                                                    <DialogDescription className="text-muted-foreground mt-2 italic">Historical performance and feedback summary.</DialogDescription>
                                                                </DialogHeader>
                                                                
                                                                {selectedPastSession && (
                                                                    <div className="space-y-8 mt-10">
                                                                        <div className="flex items-center gap-6 p-6 bg-glass-bg rounded-3xl border border-glass-border">
                                                                            <Avatar className="h-16 w-16 rounded-2xl border border-glass-border">
                                                                                <AvatarImage src={selectedPastSession.bookedBy?.profileImage} />
                                                                                <AvatarFallback>{selectedPastSession.bookedBy?.name[0]}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <h4 className="font-black text-xl italic uppercase tracking-tighter">{selectedPastSession.bookedBy?.name}</h4>
                                                                                <p className="text-muted-foreground text-sm font-bold">{format(new Date(selectedPastSession.date), "MMMM do, yyyy")} @ {formatTime(selectedPastSession.startTime)}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-6">
                                                                            <div className="space-y-4 p-6 bg-glass-bg rounded-3xl border border-glass-border">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trainer Rating</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Star className={cn("w-6 h-6", selectedPastSession.videoCall?.trainerRating ? "text-primary fill-primary" : "text-muted-foreground opacity-20")} />
                                                                                    <span className="text-3xl font-black tracking-tighter italic">{selectedPastSession.videoCall?.trainerRating || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-4 p-6 bg-glass-bg rounded-3xl border border-glass-border">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Perf. Rating</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Star className={cn("w-6 h-6", selectedPastSession.videoCall?.userPerformanceRating ? "text-primary fill-primary" : "text-muted-foreground opacity-20")} />
                                                                                    <span className="text-3xl font-black tracking-tighter italic">{selectedPastSession.videoCall?.userPerformanceRating || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-6">
                                                                            <div className="space-y-3">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                                                    <FileText className="w-3.5 h-3.5" /> Trainer Feedback
                                                                                </span>
                                                                                <div className="p-6 bg-glass-bg rounded-3xl border border-glass-border min-h-[100px]">
                                                                                    <p className="text-sm leading-relaxed italic text-foreground/80">
                                                                                        {selectedPastSession.videoCall?.trainerFeedback || "No feedback provided by trainer."}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                                                    <User className="w-3.5 h-3.5" /> User Performance Feedback
                                                                                </span>
                                                                                <div className="p-6 bg-glass-bg rounded-3xl border border-glass-border min-h-[100px]">
                                                                                    <p className="text-sm leading-relaxed italic text-foreground/80">
                                                                                        {selectedPastSession.videoCall?.userFeedback || "No performance notes recorded."}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                <DialogFooter className="mt-10">
                                                                    <Button 
                                                                        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs"
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
                                    className="h-14 w-14 rounded-full bg-glass-bg border-glass-border text-muted-foreground hover:bg-glass-hover"
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
                                                pastPage === i + 1 ? "bg-primary text-primary-foreground scale-110" : "bg-glass-bg text-muted-foreground hover:bg-glass-hover border border-glass-border"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    disabled={pastPage === Math.ceil(pastTotal / pastLimit)}
                                    onClick={() => setPastPage(prev => prev + 1)}
                                    className="h-14 w-14 rounded-full bg-glass-bg border-glass-border text-muted-foreground hover:bg-glass-hover"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
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