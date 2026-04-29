import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import {
    Clock,
    Video,
    ArrowLeft,
    RefreshCw,
    Send,
    CheckCircle,
    Calendar as CalendarIcon,
    Loader2,
    Lock,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import Aurora from "@/components/ui/Aurora";
import { format, isSameDay, eachDayOfInterval, startOfToday, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import type { WeeklySlot } from "@/interfaces/user/ITrainerAvailability";

export default function TrainerAvailability() {
    const [slots, setSlots] = useState<WeeklySlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [userPlan, setUserPlan] = useState<any | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate 60 days starting from today
    const dates = eachDayOfInterval({
        start: startOfToday(),
        end: addDays(startOfToday(), 60)
    });

    useEffect(() => {
        document.title = "TrainUp - Trainer Availability";
        fetchAvailability();
        fetchUserPlan();
    }, []);

    const fetchAvailability = async () => {
        setIsLoading(true);
        try {
            const response = await API.get("/user/trainer-availability");
            setSlots(response.data.slots);
        } catch (err: any) {
            console.error("Failed to fetch availability:", err);
            toast.error("Failed to load availability");
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

    const handleBookSlot = async (slotId: string) => {
        setBookingSlotId(slotId);
        try {
            await API.post("/user/book-session", { slotId });
            toast.success("Session request sent successfully!");
            fetchAvailability();
        } catch (err: any) {
            console.error("Failed to book slot:", err);
            toast.error(err.response?.data?.error || "Failed to book session");
        } finally {
            setBookingSlotId(null);
        }
    };

    const formatTime = (time: string) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const selectedDateSlots = slots.filter(slot => 
        isSameDay(new Date(slot.date), selectedDate)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const isSlotInPast = (date: string, time: string) => {
        const slotDateTime = new Date(`${date}T${time}`);
        return slotDateTime < new Date();
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleCalendarSelect = (date: Date) => {
        setSelectedDate(date);
        const index = dates.findIndex(d => isSameDay(d, date));
        if (index !== -1 && scrollContainerRef.current) {
            const itemWidth = 112 + 16; // w-28 (112px) + gap-4 (16px)
            scrollContainerRef.current.scrollTo({
                left: index * itemWidth,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading && slots.length === 0) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                <div className="absolute inset-0 z-0">
                    <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                </div>
                <SiteHeader />
                <div className="relative flex-1 flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium text-lg">Synchronizing availability...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit selection:bg-white/10">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>
            <SiteHeader />

            <div className="relative border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/my-trainer/profile">
                        <Button variant="ghost" className="group text-neutral-400 hover:text-white transition-all">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Trainer
                        </Button>
                    </Link>
                    {userPlan && (
                        <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-full border border-white/5">
                            <Video className="w-4 h-4 text-white/40" />
                            <span className="text-sm font-bold tracking-tight">
                                {userPlan.videoCallsLeft} Sessions <span className="text-neutral-500 font-medium">Remaining</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <main className="relative container mx-auto px-6 py-16 space-y-16">
                
                {/* Header & Date Scroller */}
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black tracking-tighter">Choose a <span className="text-neutral-500 italic">Date.</span></h1>
                            <div className="flex items-center gap-4">
                                <p className="text-neutral-400 text-lg max-w-md">Book your next session from your trainer's available slots below.</p>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-neutral-500"
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
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => scroll('left')}
                                className="h-12 w-12 rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => scroll('right')}
                                className="h-12 w-12 rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
                    >
                        {dates.map((date) => {
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());
                            
                            return (
                                <button
                                    key={date.toString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "flex-shrink-0 w-28 h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 border",
                                        isSelected 
                                            ? "bg-white text-black border-white shadow-[0_20px_50px_rgba(255,255,255,0.15)] -translate-y-2" 
                                            : "bg-white/[0.02] border-white/5 text-neutral-500 hover:border-white/20 hover:bg-white/[0.05]"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                        {format(date, "EEE")}
                                    </span>
                                    <span className="text-4xl font-black tracking-tighter">
                                        {format(date, "d")}
                                    </span>
                                    {isToday && !isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slots Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4">
                            {format(selectedDate, "EEEE, MMMM do")}
                            <Badge className="bg-white/5 text-neutral-400 border-white/10 px-4 py-1.5 rounded-full font-mono">
                                {selectedDateSlots.length} Slots
                            </Badge>
                        </h2>
                        <Button variant="ghost" onClick={fetchAvailability} className="text-neutral-500 hover:text-white">
                            <RefreshCw className="h-4 w-4 mr-2" /> Sync
                        </Button>
                    </div>

                    <AnimatePresence mode="popLayout">
                        <div className="grid gap-6">
                            {selectedDateSlots.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-40 bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] text-center px-10"
                                >
                                    <CalendarIcon className="h-20 w-20 text-neutral-800 mb-8" />
                                    <h3 className="text-2xl font-bold mb-3 tracking-tight">Fully Booked or Resting</h3>
                                    <p className="text-neutral-500 max-w-sm mx-auto text-lg leading-relaxed">
                                        Your trainer hasn't scheduled any sessions for this date yet. Try checking the surrounding dates!
                                    </p>
                                </motion.div>
                            ) : (
                                selectedDateSlots.map((slot, index) => {
                                    const isPast = isSlotInPast(slot.date, slot.startTime);
                                    const isDisabled = isPast || slot.isBooked || slot.isRequested || (userPlan && userPlan.videoCallsLeft <= 0);

                                    return (
                                        <motion.div
                                            key={slot._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className={cn(
                                                "group relative bg-white/[0.02] border-white/5 hover:border-white/20 transition-all duration-500 rounded-[3rem] overflow-hidden",
                                                isDisabled ? 'opacity-40' : 'hover:bg-white/[0.05] hover:scale-[1.01]'
                                            )}>
                                                <CardContent className="p-10">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                                        <div className="flex items-center gap-10">
                                                            <div className="relative group">
                                                                <Avatar className="h-24 w-24 rounded-[2.5rem] ring-4 ring-black/50 shadow-2xl transition-transform duration-500 group-hover:scale-110">
                                                                    <AvatarImage src={slot.trainerId.profileImage} className="object-cover" />
                                                                    <AvatarFallback className="bg-white/10 text-white text-3xl font-black">
                                                                        {slot.trainerId.name[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full border-2 border-white/10 flex items-center justify-center">
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <h3 className="text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">{slot.trainerId.name}</h3>
                                                                <div className="flex flex-wrap items-center gap-6 text-neutral-400">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <Clock className="h-5 w-5 text-white/20" />
                                                                        <span className="font-mono text-lg font-bold tracking-tight">
                                                                            {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                                                                    <div className="flex items-center gap-2.5">
                                                                        <Video className="h-5 w-5 text-white/20" />
                                                                        <span className="font-medium">Private Coaching Session</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-stretch md:items-end gap-4 min-w-[240px]">
                                                            {slot.isBooked ? (
                                                                <Badge className="py-3 px-6 justify-center bg-green-500/10 text-green-500 border-green-500/20 rounded-full text-xs font-black uppercase tracking-[0.1em] italic">
                                                                    Confirmed
                                                                </Badge>
                                                            ) : slot.isRequested ? (
                                                                <Badge className="py-3 px-6 justify-center bg-white/10 text-white/60 border-white/10 rounded-full text-xs font-black uppercase tracking-[0.1em] italic">
                                                                    In Review
                                                                </Badge>
                                                            ) : isPast ? (
                                                                <Badge className="py-3 px-6 justify-center bg-white/5 text-neutral-600 border-white/5 rounded-full text-xs font-black uppercase tracking-[0.1em]">
                                                                    Expired
                                                                </Badge>
                                                            ) : (userPlan && userPlan.videoCallsLeft <= 0) ? (
                                                                <Button disabled className="w-full h-14 rounded-full bg-white/5 text-neutral-600 border border-white/5 font-bold uppercase tracking-widest text-[10px]">
                                                                    <Lock className="h-4 w-4 mr-2" /> Upgrade Plan
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => handleBookSlot(slot._id)}
                                                                    disabled={bookingSlotId === slot._id}
                                                                    className="w-full h-16 rounded-full bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-[0.1em] text-xs shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                                                                >
                                                                    {bookingSlotId === slot._id ? (
                                                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                                                    ) : (
                                                                        <>Book Session <Send className="h-4 w-4 ml-3" /></>
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </AnimatePresence>
                </div>
            </main>

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