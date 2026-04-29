import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import {
    Clock,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    Video,
    User,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Navigation2,
} from "lucide-react";
import { 
    format, 
    isSameDay, 
    isBefore, 
    startOfToday, 
    addDays, 
    eachDayOfInterval,
} from "date-fns";
import API from "@/lib/axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Slot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    bookedBy?: {
        name: string;
        profileImage: string;
    };
    requestedBy?: any[];
}

export default function WeeklySchedule() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
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
    }, []);

    const fetchSlots = async () => {
        try {
            setIsLoading(true);
            const response = await API.get("/trainer/slots");
            setSlots(response.data.slots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            toast.error("Failed to load slots");
        } finally {
            setIsLoading(false);
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
            setSlots([...slots, response.data.slot]);
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

    const selectedDateSlots = slots.filter(slot => 
        isSameDay(new Date(slot.date), selectedDate)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

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

    return (
        <div className="min-h-screen bg-[#030303] text-white p-4 md:p-10 font-outfit selection:bg-white/10 selection:text-white">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 text-neutral-500 uppercase tracking-[0.2em] text-[10px] font-bold">
                            <Navigation2 className="w-3.5 h-3.5 fill-current" />
                            <span>Schedule Optimization</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                            Weekly <span className="text-neutral-500 italic">Pulse.</span>
                        </h1>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={goToToday}
                            className="h-14 px-6 rounded-2xl text-neutral-400 hover:text-white hover:bg-white/5 font-bold"
                        >
                            Today
                        </Button>
                        <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-white text-black hover:bg-neutral-200 h-14 px-10 rounded-2xl font-black transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:-translate-y-1 active:translate-y-0"
                                >
                                    <Plus className="w-5 h-5 mr-3" />
                                    Create Slot
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-4xl font-black tracking-tighter">New Slot.</DialogTitle>
                                    <DialogDescription className="text-neutral-500 mt-3 text-lg leading-relaxed">
                                        Defining availability for <span className="text-white font-bold">{format(selectedDate, "MMMM do")}</span>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-10 py-12">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Start Time</label>
                                            <div className="relative group">
                                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within:text-white transition-colors" />
                                                <Input 
                                                    type="time" 
                                                    className="bg-white/[0.03] border-white/5 pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-white/20 transition-all text-lg font-bold"
                                                    value={newSlot.startTime}
                                                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">End Time</label>
                                            <div className="relative group">
                                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within:text-white transition-colors" />
                                                <Input 
                                                    type="time" 
                                                    className="bg-white/[0.03] border-white/5 pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-white/20 transition-all text-lg font-bold"
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
                                        className="h-16 rounded-2xl px-8 text-neutral-500 hover:bg-white/5 font-bold"
                                    >
                                        Dismiss
                                    </Button>
                                    <Button 
                                        onClick={handleAddSlot}
                                        className="bg-white text-black hover:bg-neutral-200 h-16 px-12 rounded-2xl font-black flex-1 text-lg transition-transform hover:scale-[1.02]"
                                    >
                                        Set Active
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Date Strip Scroller */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-neutral-200">
                                {format(selectedDate, "MMMM yyyy")}
                            </h2>
                            
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

                            <div className="h-[2px] w-16 bg-white/5" />
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => scroll('left')}
                                className="h-12 w-12 rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-neutral-500 transition-all hover:scale-110"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => scroll('right')}
                                className="h-12 w-12 rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-neutral-500 transition-all hover:scale-110"
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
                                            ? "bg-white text-black border-white shadow-[0_25px_60px_rgba(255,255,255,0.15)] -translate-y-3" 
                                            : "bg-white/[0.02] border-white/5 text-neutral-600 hover:border-white/20 hover:bg-white/[0.05]"
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

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Planned", val: slots.length },
                        { label: "Filled", val: slots.filter(s => s.isBooked).length },
                        { label: "Open", val: slots.filter(s => !s.isBooked).length },
                        { label: "Book Rate", val: `${slots.length > 0 ? Math.round((slots.filter(s => s.isBooked).length / slots.length) * 100) : 0}%` }
                    ].map((stat, i) => (
                        <Card key={i} className="bg-white/[0.01] border-white/5 rounded-[2rem] overflow-hidden group hover:bg-white/[0.03] transition-colors">
                            <CardContent className="p-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 mb-3 group-hover:text-neutral-500 transition-colors">{stat.label}</p>
                                <p className="text-4xl font-black tracking-tighter">{stat.val}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Slots Pipeline */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-10">
                        <h3 className="text-3xl font-black tracking-tighter flex items-center gap-6">
                            Daily Flow.
                            <Badge variant="outline" className="border-white/10 text-neutral-600 rounded-full font-mono text-sm px-4 py-1">
                                {selectedDateSlots.length} Total
                            </Badge>
                        </h3>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            <div className="py-32 flex flex-col items-center gap-6">
                                <Loader2 className="w-10 h-10 animate-spin text-white/10" />
                                <span className="text-neutral-700 font-bold tracking-widest uppercase text-xs">Synchronizing Pipeline</span>
                            </div>
                        ) : selectedDateSlots.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-40 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem] text-center px-10"
                            >
                                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] flex items-center justify-center mb-8 border border-white/5">
                                    <CalendarIcon className="w-10 h-10 text-neutral-800" />
                                </div>
                                <h3 className="text-2xl font-black mb-3 tracking-tighter">No Active Slots.</h3>
                                <p className="text-neutral-600 text-lg max-w-sm mx-auto leading-relaxed italic">
                                    Your availability pipeline for this day is currently empty.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid gap-6">
                                {selectedDateSlots.map((slot, index) => (
                                    <motion.div
                                        key={slot._id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <Card className={cn(
                                            "relative overflow-hidden bg-white/[0.01] border-white/5 hover:border-white/10 transition-all duration-500 group rounded-[3.5rem]",
                                            slot.isBooked && "bg-white text-black border-white shadow-[0_30px_70px_rgba(255,255,255,0.1)]"
                                        )}>
                                            <CardContent className="p-10 md:p-12">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                                    <div className="flex items-center gap-10">
                                                        <div className={cn(
                                                            "w-24 h-24 rounded-[2.2rem] flex flex-col items-center justify-center border transition-colors duration-500",
                                                            slot.isBooked ? "bg-black text-white border-black" : "bg-white/[0.03] border-white/5 text-neutral-600"
                                                        )}>
                                                            <Clock className="w-8 h-8 mb-2" />
                                                            <span className="text-[10px] font-black uppercase tracking-tighter">Session</span>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex flex-wrap items-center gap-6">
                                                                <p className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                                                                    {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
                                                                </p>
                                                                {slot.isBooked ? (
                                                                    <Badge className="bg-black text-white border-none px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-[0.2em]">
                                                                        Confirmed
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="border-white/10 text-neutral-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                                                        Open Slot
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-8 text-sm md:text-base">
                                                                <div className={cn("flex items-center gap-3", slot.isBooked ? "text-black/50" : "text-neutral-500")}>
                                                                    <Video className="w-5 h-5 opacity-30" />
                                                                    <span className="font-bold tracking-tight">Interactive Consultation</span>
                                                                </div>
                                                                {slot.isBooked && (
                                                                    <div className="flex items-center gap-3 pl-8 border-l border-black/10">
                                                                        <User className="w-5 h-5 text-black/30" />
                                                                        <span className="font-black text-lg tracking-tighter">{slot.bookedBy?.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {slot.isBooked ? (
                                                            <Button className="rounded-full bg-black text-white hover:bg-neutral-900 px-10 h-16 font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 shadow-2xl">
                                                                Manage Call
                                                            </Button>
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
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
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