import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Calendar, 
    Clock, 
    Plus, 
    Trash2,
    Save,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

interface DaySchedule {
    day: string;
    isActive: boolean;
    slots: TimeSlot[];
}

interface WeeklySchedule {
    _id?: string;
    trainerId: string;
    weekStart: string;
    schedule: DaySchedule[];
    createdAt?: string;
    updatedAt?: string;
}

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

export default function WeeklySchedule() {
    const [schedule, setSchedule] = useState<WeeklySchedule>({
        trainerId: '',
        weekStart: '',
        schedule: DAYS_OF_WEEK.map(day => ({
            day,
            isActive: false,
            slots: []
        }))
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp - Weekly Schedule";
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/trainer/weekly-schedule");
            if (response.data.schedule) {
                setSchedule(response.data.schedule);
            } else {
                // Initialize with current week
                const currentWeek = getCurrentWeekStart();
                setSchedule(prev => ({
                    ...prev,
                    weekStart: currentWeek
                }));
            }
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch schedule:", err);
            setError("Failed to load schedule");
            toast.error("Failed to load schedule");
            setIsLoading(false);
        }
    };

    const getCurrentWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); 
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        const monday = new Date(now.setDate(diff));
        return monday.toISOString().split('T')[0];
    };

    const generateTimeSlotId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const addTimeSlot = (dayIndex: number) => {
        const daySchedule = schedule.schedule[dayIndex];
        if (daySchedule.slots.length >= 5) {
            toast.error("Maximum 5 sessions per day allowed");
            return;
        }

        const newSlot: TimeSlot = {
            id: generateTimeSlotId(),
            startTime: '09:00',
            endTime: '10:00'
        };

        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, index) => 
                index === dayIndex 
                    ? { ...day, slots: [...day.slots, newSlot] }
                    : day
            )
        }));
    };

    const removeTimeSlot = (dayIndex: number, slotId: string) => {
        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, index) =>
                index === dayIndex
                    ? { ...day, slots: day.slots.filter(slot => slot.id !== slotId) }
                    : day
            )
        }));
    };

    const updateTimeSlot = (dayIndex: number, slotId: string, field: 'startTime' | 'endTime', value: string) => {
        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, index) =>
                index === dayIndex
                    ? {
                        ...day,
                        slots: day.slots.map(slot =>
                            slot.id === slotId
                                ? { ...slot, [field]: value }
                                : slot
                        )
                    }
                    : day
            )
        }));
    };

    const toggleDay = (dayIndex: number, isActive: boolean) => {
        setSchedule(prev => ({
            ...prev,
            schedule: prev.schedule.map((day, index) =>
                index === dayIndex
                    ? { ...day, isActive, slots: isActive ? day.slots : [] }
                    : day
            )
        }));
    };

    const validateSchedule = (): boolean => {
        for (const day of schedule.schedule) {
            if (!day.isActive) continue;

            for (const slot of day.slots) {
                // Check if times are valid
                if (!slot.startTime || !slot.endTime) {
                    toast.error(`Please set both start and end times for all slots on ${day.day}`);
                    return false;
                }

                // Check if session is exactly 1 hour
                const start = new Date(`2000-01-01T${slot.startTime}`);
                const end = new Date(`2000-01-01T${slot.endTime}`);
                const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                if (diffHours !== 1) {
                    toast.error(`Each session must be exactly 1 hour on ${day.day}`);
                    return false;
                }

                // Check for overlapping slots on the same day
                const currentSlotStart = start.getTime();
                const currentSlotEnd = end.getTime();

                for (const otherSlot of day.slots) {
                    if (otherSlot.id === slot.id) continue;

                    const otherStart = new Date(`2000-01-01T${otherSlot.startTime}`).getTime();
                    const otherEnd = new Date(`2000-01-01T${otherSlot.endTime}`).getTime();

                    if (
                        (currentSlotStart < otherEnd && currentSlotEnd > otherStart)
                    ) {
                        toast.error(`Overlapping time slots found on ${day.day}`);
                        return false;
                    }
                }
            }
        }

        return true;
    };

    const saveSchedule = async () => {
        if (!validateSchedule()) return;

        setIsSaving(true);
        try {
            const scheduleData = {
                ...schedule,
                weekStart: schedule.weekStart || getCurrentWeekStart()
            };

            await API.post("/trainer/weekly-schedule", scheduleData);
            toast.success("Weekly schedule saved successfully!");
            fetchSchedule(); // Refresh to get the saved version
        } catch (err: any) {
            console.error("Failed to save schedule:", err);
            toast.error(err.response?.data?.message || "Failed to save schedule");
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <TrainerSiteHeader />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">Loading schedule...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <TrainerSiteHeader />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">Error</h3>
                    <p className="text-muted-foreground text-lg">{error}</p>
                    <Button
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={fetchSchedule}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <TrainerSiteHeader />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <main className="relative container mx-auto px-4 py-12 space-y-8">
                <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-primary" />
                                Weekly Schedule
                            </h1>
                            <Button
                                onClick={saveSchedule}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-primary to-primary/90"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Schedule
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground">
                                Set your weekly availability for Pro plan video call sessions.
                            </p>
                            {schedule.weekStart && (
                                <Badge variant="outline" className="text-sm">
                                    Week starting: {new Date(schedule.weekStart).toLocaleDateString()}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {schedule.schedule.map((day, dayIndex) => (
                            <Card
                                key={day.day}
                                className="bg-background/50 border-border/50"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={day.isActive}
                                                onCheckedChange={(checked) => toggleDay(dayIndex, checked as boolean)}
                                            />
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {day.day}
                                            </h3>
                                            <Badge variant="outline" className="text-xs">
                                                {day.slots.length}/5 sessions
                                            </Badge>
                                        </div>
                                        {day.isActive && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addTimeSlot(dayIndex)}
                                                disabled={day.slots.length >= 5}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Session
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>

                                {day.isActive && (
                                    <CardContent className="pt-0">
                                        {day.slots.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No sessions scheduled for {day.day}</p>
                                                <p className="text-sm">Click "Add Session" to create a time slot</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {day.slots.map((slot, slotIndex) => (
                                                    <div
                                                        key={slot.id}
                                                        className="flex items-center space-x-4 p-4 bg-card/40 rounded-lg border border-border/50"
                                                    >
                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <span className="font-medium">Session {slotIndex + 1}:</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <Input
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'startTime', e.target.value)}
                                                                className="w-32"
                                                            />
                                                            <span className="text-muted-foreground">to</span>
                                                            <Input
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'endTime', e.target.value)}
                                                                className="w-32"
                                                            />
                                                        </div>
                                                        
                                                        {slot.startTime && slot.endTime && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                            </div>
                                                        )}
                                                        
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeTimeSlot(dayIndex, slot.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}

                        {/* Important Notes */}
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-foreground mb-2">Schedule Guidelines:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Each session must be exactly 1 hour long</li>
                                        <li>• Maximum 5 sessions per day</li>
                                        <li>• Sessions cannot overlap on the same day</li>
                                        <li>• Schedule resets every Sunday for the new week</li>
                                        <li>• Only Pro plan clients can book video call sessions</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}