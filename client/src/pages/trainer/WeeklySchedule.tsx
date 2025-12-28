import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Video,
    Users,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import API from "@/lib/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { format, addDays } from "date-fns";

// --- Interfaces ---

import type { TimeSlot, DaySchedule, WeeklyScheduleData, UserProfile, RequestItem, SlotItem } from "@/interfaces/trainer/IWeeklySchedule";

const getNext7Days = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
        days.push(format(addDays(today, i), 'EEEE')); // 'EEEE' gives full day name (Monday, Tuesday...)
    }
    return days;
};

const DYNAMIC_DAYS = getNext7Days();

const ITEMS_PER_PAGE = 5;

export default function WeeklySchedule() {
    const navigate = useNavigate();

    // --- State ---

    // Weekly Schedule State
    const [schedule, setSchedule] = useState<WeeklyScheduleData>({
        trainerId: '',
        weekStart: '',
        schedule: DYNAMIC_DAYS.map(day => ({ day, isActive: false, slots: [] }))
    });
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);
    const [isScheduleSaved, setIsScheduleSaved] = useState(false);

    // Slots & Requests State
    const [slots, setSlots] = useState<SlotItem[]>([]);

    // Pagination State
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [requestsPage, setRequestsPage] = useState(1);

    // Joint State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modals
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp - Schedule & Requests";
        fetchAllData();
    }, []);

    // --- Data Fetching ---

    const getTodayDate = () => {
        return format(new Date(), 'yyyy-MM-dd');
    };

    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            try {

                const scheduleRes = await API.get("/trainer/weekly-schedule");
                if (scheduleRes.data.schedule) {
                    const storedSchedule = scheduleRes.data.schedule;
                    const mappedSchedule = DYNAMIC_DAYS.map(dayName => {
                        const storedDay = storedSchedule.schedule.find((s: { day: string }) => s.day === dayName);
                        return storedDay ? { ...storedDay, day: dayName } : { day: dayName, isActive: false, slots: [] };
                    });

                    setSchedule({
                        ...storedSchedule,
                        weekStart: getTodayDate(),
                        schedule: mappedSchedule
                    });
                    setIsScheduleSaved(true);
                } else {
                    setSchedule({
                        trainerId: '',
                        weekStart: getTodayDate(),
                        schedule: DYNAMIC_DAYS.map(day => ({ day, isActive: false, slots: [] }))
                    });
                    setIsScheduleSaved(false);
                }
            } catch (err) {
                console.error("Schedule fetch error:", err);
                setSchedule({
                    trainerId: '',
                    weekStart: getTodayDate(),
                    schedule: DYNAMIC_DAYS.map(day => ({ day, isActive: false, slots: [] }))
                });
            }

            // Fetch Slots
            try {
                const slotsRes = await API.get("/trainer/slots");
                setSlots(slotsRes.data.slots || []);
            } catch (err) {
                console.error("Slots fetch error:", err);
            }
            try {
                await API.get("/trainer/session-requests");
            } catch (e) { }

        } catch (err) {
            console.error("General fetch error:", err);
            setError("Failed to load some data. Please reload.");
        } finally {
            setIsLoading(false);
        }
    };


    const isDayInPast = (_: string) => {

        return false;
    };

    const isTimeInPast = (dayName: string, time: string) => {
        const todayName = format(new Date(), 'EEEE');
        if (dayName !== todayName) return false;

        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime < now;
    };


    const generateTimeSlotId = () => Math.random().toString(36).substr(2, 9);

    const addTimeSlot = (dayIndex: number) => {
        const dayName = DYNAMIC_DAYS[dayIndex];

        if (isDayInPast(dayName)) {
            toast.error(`Cannot edit schedule for past days (${dayName})`);
            return;
        }

        const daySchedule = schedule.schedule[dayIndex];
        if (daySchedule.slots.length >= 5) {
            toast.error("Maximum 5 sessions per day allowed");
            return;
        }

        let startHour = 9;
        const todayName = format(new Date(), 'EEEE');

        if (dayName === todayName) {
            const now = new Date();
            startHour = now.getHours() + 1;
        }

        if (startHour > 23) {
            toast.error("It is too late to add a 1-hour session for today.");
            return;
        }

        const formatTime = (h: number) => `${h.toString().padStart(2, '0')}:00`;
        const defaultStart = formatTime(startHour);
        if (startHour === 23) {
            toast.error("Cannot add session starting at 23:00 (crosses midnight).");
            return;
        }

        const safeEnd = formatTime(startHour + 1);

        const hasOverlap = daySchedule.slots.some(slot => {
            return (slot.startTime < safeEnd && slot.endTime > defaultStart);
        });

        if (hasOverlap) {
            toast.error(`Default slot (${defaultStart}-${safeEnd}) overlaps. Please adjust existing slots or try another time.`);
            return;
        }

        if (isTimeInPast(dayName, defaultStart)) {
            toast.error(`Cannot add slots in the past (${defaultStart}).`);
            return;
        }

        const newSlot: TimeSlot = { id: generateTimeSlotId(), startTime: defaultStart, endTime: safeEnd };
        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, idx) => idx === dayIndex ? { ...day, slots: [...day.slots, newSlot] } : day)
        }));
        setIsScheduleSaved(false);
    };

    const removeTimeSlot = (dayIndex: number, slotId: string) => {
        const dayName = DYNAMIC_DAYS[dayIndex];
        if (isDayInPast(dayName)) {
            toast.error(`Cannot edit schedule for past days (${dayName})`);
            return;
        }

        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, idx) => idx === dayIndex ? { ...day, slots: day.slots.filter(s => s.id !== slotId) } : day)
        }));
        setIsScheduleSaved(false);
    };

    const updateTimeSlot = (dayIndex: number, slotId: string, field: 'startTime' | 'endTime', value: string) => {
        const dayName = DYNAMIC_DAYS[dayIndex];
        if (isDayInPast(dayName)) {
            toast.error(`Cannot edit schedule for past days (${dayName})`);
            return;
        }

        // Real-time conflict detection
        const daySchedule = schedule.schedule[dayIndex];
        const newStartTime = field === 'startTime' ? value : daySchedule.slots.find(s => s.id === slotId)?.startTime || "";
        const newEndTime = field === 'endTime' ? value : daySchedule.slots.find(s => s.id === slotId)?.endTime || "";

        if (newStartTime && newEndTime) {
            const start = new Date(`2000-01-01T${newStartTime}`);
            const end = new Date(`2000-01-01T${newEndTime}`);

            for (const other of daySchedule.slots) {
                if (other.id === slotId) continue;
                const oStart = new Date(`2000-01-01T${other.startTime}`);
                const oEnd = new Date(`2000-01-01T${other.endTime}`);

                if (start < oEnd && end > oStart) {
                    toast.error(`Conflict detected with slot ${other.startTime} - ${other.endTime}`);
                }
            }
        }

        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, idx) => idx === dayIndex ? {
                ...day,
                slots: day.slots.map(s => s.id === slotId ? { ...s, [field]: value } : s)
            } : day)
        }));
        setIsScheduleSaved(false);
    };

    const toggleDay = (dayIndex: number, isActive: boolean) => {
        const dayName = DYNAMIC_DAYS[dayIndex];
        if (isDayInPast(dayName)) {
            toast.error(`Cannot edit schedule for past days (${dayName})`);
            return;
        }
        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, idx) => idx === dayIndex ? { ...day, isActive, slots: isActive ? day.slots : [] } : day)
        }));
        setIsScheduleSaved(false);
    };

    const validateSchedule = (): boolean => {
        for (const day of schedule.schedule) {
            if (!day.isActive) continue;

            for (const slot of day.slots) {
                if (!slot.startTime || !slot.endTime) {
                    toast.error(`Set both times for all slots on ${day.day}`);
                    return false;
                }
                const start = new Date(`2000-01-01T${slot.startTime}`);
                const end = new Date(`2000-01-01T${slot.endTime}`);
                if ((end.getTime() - start.getTime()) / 36e5 !== 1) {
                    toast.error(`Sessions must be exactly 1 hour (${day.day})`);
                    return false;
                }

                // Overlap Check
                for (const other of day.slots) {
                    if (other.id === slot.id) continue;
                    const oStart = new Date(`2000-01-01T${other.startTime}`).getTime();
                    const oEnd = new Date(`2000-01-01T${other.endTime}`).getTime();
                    if (start.getTime() < oEnd && end.getTime() > oStart) {
                        toast.error(`Overlapping slots detected on ${day.day} (${slot.startTime} overlaps with ${other.startTime})`);
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const saveSchedule = async () => {
        if (!validateSchedule()) return;
        setIsSavingSchedule(true);
        try {
            const dataToSave = { ...schedule, weekStart: getTodayDate() };
            const res = await API.post("/trainer/weekly-schedule", dataToSave);
            setSchedule(res.data.schedule);
            setIsScheduleSaved(true);
            toast.success("Schedule saved!");

            try {
                const slotsRes = await API.get("/trainer/slots");
                setSlots(slotsRes.data.slots || []);
            } catch (e) { }

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save schedule");
        } finally {
            setIsSavingSchedule(false);
        }
    };


    const joinVideoCall = async (slotId: string) => {
        try {
            const response = await API.get(`/video-call/slot/${slotId}`);
            navigate(`/trainer/video-call/${response.data.videoCall.roomId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to join video call");
        }
    };


    const canJoinSession = (slot: SlotItem) => {
        if (!slot.isBooked) return false;

        const slotDate = new Date(slot.date);
        const year = slotDate.getFullYear();
        const month = slotDate.getMonth();
        const day = slotDate.getDate();

        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);

        const start = new Date(year, month, day, hours, minutes);
        const end = new Date(year, month, day, endHours, endMinutes);

        const now = new Date();
        const tenMinutesBefore = new Date(start.getTime() - 10 * 60000);

        return now >= tenMinutesBefore && now <= end;
    };

    const upcomingSlots = slots.filter(slot => {
        const slotDate = new Date(slot.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        slotDate.setHours(0, 0, 0, 0);
        return slotDate >= now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalUpcomingItems = upcomingSlots.length;
    const totalUpcomingPages = Math.ceil(totalUpcomingItems / ITEMS_PER_PAGE);
    const visibleUpcomingSlots = upcomingSlots.slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE);


    // --- Session Requests Logic ---

    const approveRequest = async (requestId: string, userId: string) => {
        setProcessingId(requestId);
        try {
            await API.post(`/trainer/session-requests/${requestId}/approve/${userId}`);
            toast.success("Approved!");
            fetchAllData();
        } catch (err) {
            toast.error("Failed to approve");
        } finally {
            setProcessingId(null);
        }
    };

    const rejectRequest = async () => {
        if (!selectedRequestId || !selectedUserId || !rejectionReason.trim()) return;
        setProcessingId(selectedRequestId);
        try {
            await API.post(`/trainer/session-requests/${selectedRequestId}/reject/${selectedUserId}`, {
                rejectionReason: rejectionReason.trim()
            });
            toast.success("Rejected");
            setShowRejectModal(false);
            setRejectionReason('');
            fetchAllData();
        } catch (err) {
            toast.error("Failed to reject");
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (requestId: string, userId: string) => {
        setSelectedRequestId(requestId);
        setSelectedUserId(userId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    // --- Helpers ---

    const formatTimeDisplay = (time: string) => {
        if (!time) return '';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDateDisplay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    // --- Filter Requests (Pending Only for Requests Section) ---
    // Slots contain a requestedBy array. We extract all pending requests from all slots.
    // Sort: RequestedAt Descending (Newest first)
    const pendingRequests = slots.flatMap(r => r.requestedBy.filter(req => req.status === 'pending').map(req => ({ ...req, slot: r })))
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const totalRequestItems = pendingRequests.length;
    const totalRequestPages = Math.ceil(totalRequestItems / ITEMS_PER_PAGE);
    const visibleRequests = pendingRequests.slice((requestsPage - 1) * ITEMS_PER_PAGE, requestsPage * ITEMS_PER_PAGE);


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex flex-col items-center justify-center space-y-4">
                <TrainerSiteHeader />
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading specific trainer data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <TrainerSiteHeader />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h3 className="text-2xl font-bold mb-4">Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchAllData}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20 pb-12">
            <TrainerSiteHeader />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>

            <main className="relative container mx-auto px-4 py-8 space-y-10 flex-1">

                {/* 1. WEEKLY SCHEDULE SECTION */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-primary" />
                            Weekly Schedule
                        </h2>
                        <div className="flex items-center gap-4">
                            {!isScheduleSaved ? (
                                <Button onClick={saveSchedule} disabled={isSavingSchedule} className="bg-primary text-primary-foreground">
                                    {isSavingSchedule ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Schedule
                                </Button>
                            ) : (
                                <div className="flex items-center text-green-600 gap-1 text-sm font-medium">
                                    <CheckCircle className="h-4 w-4" /> Saved
                                </div>
                            )}
                        </div>
                    </div>

                    <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
                        <CardHeader className="pb-2 border-b border-border/40 mb-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-sm text-muted-foreground gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-normal">
                                        Starting From: {schedule.weekStart ? format(new Date(schedule.weekStart), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}
                                    </Badge>
                                </div>
                                <span>Define your availability by adding 1-hour slots for each day.</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {schedule.schedule.map((day, dIdx) => (
                                <Card key={day.day} className={`bg-background/40 border-border/40 transition-all ${day.isActive ? 'border-primary/20 shadow-sm' : 'opacity-80'}`}>
                                    <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="w-40 flex items-center gap-3">
                                            <Checkbox checked={day.isActive} onCheckedChange={(c) => toggleDay(dIdx, !!c)} />
                                            <span className={`font-semibold ${day.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {day.day} {dIdx === 0 && <span className="ml-2 text-xs text-primary">(Today)</span>}
                                            </span>
                                        </div>

                                        {day.isActive && (
                                            <div className="flex-1 space-y-3">
                                                {day.slots.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground italic pl-2">No slots added yet</div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-3">
                                                        {day.slots.map((slot) => (
                                                            <div key={slot.id} className="flex items-center gap-2 bg-background border rounded-md p-1.5 shadow-sm group hover:border-primary/30 transition-colors">
                                                                <Input
                                                                    type="time"
                                                                    className="w-[5.5rem] h-7 text-xs border-0 bg-transparent focus-visible:ring-0 px-1"
                                                                    value={slot.startTime}
                                                                    onChange={(e) => updateTimeSlot(dIdx, slot.id, 'startTime', e.target.value)}
                                                                />
                                                                <span className="text-muted-foreground text-xs">-</span>
                                                                <Input
                                                                    type="time"
                                                                    className="w-[5.5rem] h-7 text-xs border-0 bg-transparent focus-visible:ring-0 px-1"
                                                                    value={slot.endTime}
                                                                    onChange={(e) => updateTimeSlot(dIdx, slot.id, 'endTime', e.target.value)}
                                                                />
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => removeTimeSlot(dIdx, slot.id)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {day.slots.length < 5 && (
                                                    <Button variant="ghost" size="sm" onClick={() => addTimeSlot(dIdx)} className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                                                        <Plus className="h-3 w-3 mr-1" /> Add Slot
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* 2. UPCOMING SESSIONS (SLOTS) SECTION */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Users className="h-6 w-6 text-primary" />
                                Upcoming Sessions
                            </h2>
                        </div>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 h-[600px] flex flex-col">
                            <CardContent className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {visibleUpcomingSlots.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                        <Calendar className="h-12 w-12 opacity-20 mb-3" />
                                        <p>No upcoming sessions.</p>
                                        <p className="text-xs mt-1">Bookings will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {visibleUpcomingSlots.map(slot => {
                                            const approvedReq = slot.requestedBy.find(r => r.status === 'approved');
                                            const bookedBy = slot.bookedBy || (approvedReq ? approvedReq.userId : null);

                                            return (
                                                <div key={slot._id} className="p-4 bg-background/60 border rounded-lg hover:shadow-md transition-all border-l-4 border-l-primary/50 relative overflow-hidden group">

                                                    {/* Header: Date & Time */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 font-semibold">
                                                                {formatDateDisplay(slot.date)}
                                                            </div>
                                                            <div className="block text-xs text-muted-foreground mt-0.5">
                                                                {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                                            </div>
                                                        </div>
                                                        {slot.isBooked && bookedBy ? (
                                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Booked</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">Open</Badge>
                                                        )}
                                                    </div>

                                                    {/* User Info or Empty State */}
                                                    {slot.isBooked && bookedBy ? (
                                                        <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-md mb-3">
                                                            <Avatar className="h-10 w-10 border border-background">
                                                                <AvatarImage src={bookedBy.profileImage} />
                                                                <AvatarFallback>{bookedBy.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{bookedBy.name}</p>
                                                                <p className="text-xs text-muted-foreground">Client</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 bg-secondary/5 rounded-md mb-3 flex items-center justify-center text-xs text-muted-foreground bg-stripes">
                                                            Waiting for booking...
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                                                        {slot.isBooked ? (
                                                            canJoinSession(slot) ? (
                                                                <Button size="sm" onClick={() => joinVideoCall(slot._id)} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                                                    <Video className="h-3.5 w-3.5 mr-2 animate-pulse" /> Join Now
                                                                </Button>
                                                            ) : (
                                                                <div className="w-full text-center py-1.5">
                                                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-dashed">
                                                                        <Clock className="h-3 w-3 mr-1" /> Join 10m before start
                                                                    </Badge>
                                                                </div>
                                                            )
                                                        ) : (
                                                            /* Delete button removed as per request to avoid auth errors and rely on Schedule Grid for management */
                                                            <div className="w-full text-center py-1.5">
                                                                <span className="text-xs text-muted-foreground italic">Manage in Schedule Grid</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>

                            {/* UPCOMING PAGINATION CONTROLS */}
                            {totalUpcomingItems > 0 && (
                                <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Page {upcomingPage} of {totalUpcomingPages}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setUpcomingPage(p => Math.max(1, p - 1))}
                                            disabled={upcomingPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setUpcomingPage(p => Math.min(totalUpcomingPages, p + 1))}
                                            disabled={upcomingPage === totalUpcomingPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </section>

                    {/* 3. REQUESTS SECTION */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <AlertCircle className="h-6 w-6 text-orange-500" />
                                Pending Requests
                            </h2>
                            {pendingRequests.length > 0 && (
                                <Badge className="bg-orange-500">{pendingRequests.length}</Badge>
                            )}
                        </div>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 h-[600px] flex flex-col">
                            <CardContent className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {visibleRequests.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                        <CheckCircle className="h-12 w-12 text-green-500/20 mb-3" />
                                        <p>All caught up!</p>
                                        <p className="text-xs mt-1">No pending requests.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {visibleRequests.map(req => (
                                            <div key={req._id} className="flex flex-col p-4 bg-background/60 border border-orange-200/40 rounded-lg shadow-sm">
                                                <div className="flex items-start gap-4 mb-3">
                                                    <Avatar className="h-10 w-10 border border-orange-100">
                                                        <AvatarImage src={req.userId.profileImage} />
                                                        <AvatarFallback>{req.userId.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                                            {req.userId.name}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">Requested on {new Date(req.requestedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-orange-50/50 p-2 rounded text-xs mb-3 space-y-1 border border-orange-100/50">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Date:</span>
                                                        <span className="font-medium">{formatDateDisplay(req.slot.date)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Time:</span>
                                                        <span className="font-medium">{formatTimeDisplay(req.slot.startTime)} - {formatTimeDisplay(req.slot.endTime)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                                    <Button size="sm" onClick={() => approveRequest(req.slot._id, req.userId._id)} disabled={!!processingId} className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
                                                        {processingId === req.slot._id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1.5" />}
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => openRejectModal(req.slot._id, req.userId._id)} disabled={!!processingId} className="text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs">
                                                        <XCircle className="h-3 w-3 mr-1.5" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            {/* REQUEST PAGINATION CONTROLS */}
                            {totalRequestItems > 0 && (
                                <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Page {requestsPage} of {totalRequestPages}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setRequestsPage(p => Math.max(1, p - 1))}
                                            disabled={requestsPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setRequestsPage(p => Math.min(totalRequestPages, p + 1))}
                                            disabled={requestsPage === totalRequestPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </section>
                </div>

            </main>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <p className="text-sm text-muted-foreground">Please provide a reason for rejecting this session.</p>
                        <Textarea
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={rejectRequest} disabled={!rejectionReason.trim()}>Reject Request</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <SiteFooter />
            <ToastContainer position="top-right" autoClose={3000} />
        </div >
    );
}