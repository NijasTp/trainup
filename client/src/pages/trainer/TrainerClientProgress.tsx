import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Calendar as CalendarIcon } from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface Progress {
    _id: string;
    date: string;
    photos: string[];
    notes?: string;
    weight?: number;
    metrics?: {
        waterIntake?: number;
        sleepHours?: number;
        calories?: number;
    };
}

interface User {
    _id: string;
    name: string;
}

export default function TrainerClientProgress() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [progressList, setProgressList] = useState<Progress[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedProgress, setSelectedProgress] = useState<Progress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await API.get(`/trainer/get-client/${id}`);
            setUser(response.data.user);
        } catch (_err: unknown) {
            toast.error("Failed to load client details");
        }
    }, [id]);

    const fetchProgress = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await API.get(`/trainer/client-progress/${id}`);
            const sorted = response.data.progress.sort((a: Progress, b: Progress) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setProgressList(sorted);
            
            // Try to find progress for selected date
            const found = sorted.find((p: Progress) => 
                new Date(p.date).toDateString() === selectedDate.toDateString()
            );
            setSelectedProgress(found || null);
        } catch (_err: unknown) {
            console.error("Failed to fetch progress:", _err);
        } finally {
            setIsLoading(false);
        }
    }, [id, selectedDate]);

    useEffect(() => {
        if (id) {
            fetchUser();
            fetchProgress();
        }
    }, [id, fetchUser, fetchProgress]);

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans">
            <TrainerSiteHeader />

            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <main className="relative container mx-auto px-6 py-12 space-y-8 z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            className="group flex items-center gap-2 text-white/40 hover:text-cyan-400 p-0 hover:bg-transparent"
                            onClick={() => navigate(`/trainer/user/${id}`)}
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">Back to Profile</span>
                        </Button>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                            Progress <span className="text-cyan-500">History</span>
                        </h1>
                        <p className="text-white/40 font-medium">Viewing activity logs for {user?.name || "Client"}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-14 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black italic uppercase tracking-widest text-xs rounded-2xl flex gap-3"
                                >
                                    <CalendarIcon className="h-4 w-4 text-cyan-400" />
                                    {format(selectedDate, "PPP")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-black border-white/10" align="end">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateChange}
                                    initialFocus
                                    className="bg-black text-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar: Log List */}
                    <Card className="lg:col-span-1 bg-white/[0.03] backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[70vh]">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xs font-black uppercase italic tracking-widest text-cyan-400">Available Logs</h3>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-2">
                                {progressList.map((p) => (
                                    <Button
                                        key={p._id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full h-16 justify-start font-black italic uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300 px-4",
                                            selectedDate.toDateString() === new Date(p.date).toDateString()
                                                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                                : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                        onClick={() => setSelectedDate(new Date(p.date))}
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-xs">{format(new Date(p.date), "MMM dd, yyyy")}</span>
                                            <span className="text-[8px] opacity-60 uppercase">{p.photos.length} Photos Captured</span>
                                        </div>
                                    </Button>
                                ))}
                                {progressList.length === 0 && (
                                    <div className="py-20 text-center text-white/20 font-black italic uppercase tracking-widest text-[10px]">
                                        No entries found
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>

                    {/* Main Content: Selected Log Details */}
                    <Card className="lg:col-span-3 bg-white/[0.03] backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden min-h-[70vh]">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center py-40 space-y-4">
                                <div className="w-12 h-12 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin" />
                                <p className="text-[10px] font-black uppercase italic tracking-widest text-white/20">Loading Log Data...</p>
                            </div>
                        ) : selectedProgress ? (
                            <div className="p-8 md:p-12 space-y-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
                                    <div className="space-y-2">
                                        <Badge className="bg-cyan-500/10 text-cyan-400 border-none px-3 py-1 font-black italic uppercase tracking-widest text-[10px]">
                                            Status: Logged
                                        </Badge>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                            {format(new Date(selectedProgress.date), "EEEE, MMMM do yyyy")}
                                        </h2>
                                    </div>
                                    {selectedProgress.weight && (
                                        <div className="bg-white/5 rounded-2xl px-6 py-3 border border-white/10">
                                            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Recorded Weight</p>
                                            <p className="text-2xl font-black italic text-cyan-400">{selectedProgress.weight} KG</p>
                                        </div>
                                    )}
                                </div>

                                {selectedProgress.notes && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Trainer/Client Notes</h4>
                                        <p className="text-lg text-white/80 font-medium italic leading-relaxed bg-white/5 p-6 rounded-[2rem] border-l-4 border-cyan-500">
                                            "{selectedProgress.notes}"
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Progress Captures</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {selectedProgress.photos.map((photo, index) => (
                                            <div key={index} className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl transition-all duration-700 hover:border-cyan-500/40">
                                                <img
                                                    src={photo}
                                                    alt={`Progress ${index + 1}`}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-6">
                                                    <p className="text-[10px] font-black italic uppercase tracking-widest text-cyan-400">Angle {index + 1}</p>
                                                    <h5 className="text-lg font-black italic uppercase tracking-tight">View {index + 1}</h5>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-40 space-y-8 text-center px-10">
                                <div className="w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center opacity-30">
                                    <Camera className="h-10 w-10" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">No Entry for this Date</h3>
                                    <p className="text-white/40 max-w-sm mx-auto text-sm font-medium">
                                        The client has not uploaded any progress photos or weight metrics for {format(selectedDate, "MMMM do")}.
                                    </p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black italic uppercase tracking-widest text-[10px] rounded-2xl"
                                    onClick={() => setSelectedDate(new Date())}
                                >
                                    Jump to Today
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
