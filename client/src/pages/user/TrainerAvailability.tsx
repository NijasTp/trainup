import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar,
    Clock,
    Video,
    ArrowLeft,
    RefreshCw,
    Send,
    CheckCircle,
    Filter
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";

import type { WeeklySlot } from "@/interfaces/user/ITrainerAvailability";

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
];

export default function TrainerAvailability() {
    const [slots, setSlots] = useState<WeeklySlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>("all");
    const [userPlan, setUserPlan] = useState<any | null>(null);

    useEffect(() => {
        document.title = "TrainUp - Trainer Availability";
        fetchAvailability();
        fetchUserPlan();
    }, []);

    const fetchAvailability = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/user/trainer-availability");
            setSlots(response.data.slots);
            console.log("Fetched slots:", response.data.slots);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch availability:", err);
            setError("Failed to load availability");
            toast.error("Failed to load availability");
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const isSlotInPast = (date: string, time: string) => {
        const slotDateTime = new Date(`${date}T${time}`);
        return slotDateTime < new Date();
    };

    const filteredSlots = selectedDay === "all"
        ? slots
        : slots.filter(slot => slot.day === selectedDay);

    // Group slots by day for better organization
    const slotsByDay = filteredSlots.reduce((acc, slot) => {
        if (!acc[slot.day]) {
            acc[slot.day] = [];
        }
        acc[slot.day].push(slot);
        return acc;
    }, {} as Record<string, WeeklySlot[]>);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <SiteHeader />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">Loading availability...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <SiteHeader />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">Error</h3>
                    <p className="text-muted-foreground text-lg">{error}</p>
                    <Button
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={fetchAvailability}
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
            <SiteHeader />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <div className="relative border-b border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <Link to="/my-trainer/profile">
                        <Button variant="ghost" className="group hover:bg-primary/5 transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Trainer Profile
                        </Button>
                    </Link>
                </div>
            </div>

            <main className="relative container mx-auto px-4 py-12 space-y-8">
                <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-primary" />
                                Trainer Availability
                            </h1>
                            <div className="flex items-center space-x-4">
                                <Select value={selectedDay} onValueChange={setSelectedDay}>
                                    <SelectTrigger className="w-48 bg-background/50 border-border/50">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter by day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Days</SelectItem>
                                        {DAYS_OF_WEEK.map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Badge variant="secondary" className="text-sm">
                                    {filteredSlots.filter(slot => !slot.isBooked && !slot.isRequested && !isSlotInPast(slot.date, slot.startTime)).length} Available
                                </Badge>
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                            Book a video call session with your trainer.
                            {userPlan && (
                                <span className="ml-2 font-medium text-primary">
                                    You have {userPlan.videoCallsLeft} sessions remaining this month.
                                </span>
                            )}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {slots.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-lg">No availability slots found</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Your trainer hasn't set any availability slots yet. Please contact them directly.
                                    </p>
                                </div>
                            ) : Object.keys(slotsByDay).length === 0 ? (
                                <div className="text-center py-12">
                                    <Filter className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-lg">No slots found for selected day</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Try selecting a different day or "All Days"
                                    </p>
                                </div>
                            ) : (
                                DAYS_OF_WEEK.filter(day => slotsByDay[day]?.length > 0).map((day) => (
                                    <div key={day}>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <h3 className="text-xl font-semibold text-foreground">{day}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {slotsByDay[day].length} session{slotsByDay[day].length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {slotsByDay[day].map((slot) => {
                                                const isPastSlot = isSlotInPast(slot.date, slot.startTime);

                                                return (
                                                    <Card
                                                        key={slot._id}
                                                        className={`bg-background/50 border-border/50 hover:shadow-md transition-all duration-200 ${isPastSlot ? 'opacity-50' : ''
                                                            }`}
                                                    >
                                                        <CardContent className="p-6">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage
                                                                            src={slot.trainerId.profileImage || "/placeholder.svg"}
                                                                            alt={slot.trainerId.name}
                                                                        />
                                                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                                                            {slot.trainerId.name.charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>

                                                                    <div>
                                                                        <h4 className="font-medium text-foreground">
                                                                            {slot.trainerId.name}
                                                                        </h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            1-hour session
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div className="flex items-center space-x-2 text-sm">
                                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-foreground font-medium">
                                                                            {formatDate(slot.date)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 text-sm">
                                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-foreground font-medium">
                                                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 text-sm">
                                                                        <Video className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-foreground font-medium">
                                                                            Video Call
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-2">
                                                                    {slot.isBooked ? (
                                                                        <Badge className="w-full justify-center bg-green-500/10 text-green-600 border-green-500/20">
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Booked
                                                                        </Badge>
                                                                    ) : slot.isRequested ? (
                                                                        <Badge className="w-full justify-center bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                                            <Clock className="h-4 w-4 mr-1" />
                                                                            Requested
                                                                        </Badge>
                                                                    ) : isPastSlot ? (
                                                                        <Badge className="w-full justify-center bg-gray-500/10 text-gray-600 border-gray-500/20">
                                                                            Expired
                                                                        </Badge>
                                                                    ) : (
                                                                        <Button
                                                                            onClick={() => handleBookSlot(slot._id)}
                                                                            disabled={bookingSlotId === slot._id || (userPlan && userPlan.videoCallsLeft <= 0)}
                                                                            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                                                            size="sm"
                                                                        >
                                                                            {bookingSlotId === slot._id ? (
                                                                                <>
                                                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                                    Booking...
                                                                                </>
                                                                            ) : (userPlan && userPlan.videoCallsLeft <= 0) ? (
                                                                                <>
                                                                                    <Video className="h-4 w-4 mr-2" />
                                                                                    Limit Reached
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Send className="h-4 w-4 mr-2" />
                                                                                    Request Session
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {slots.length > 0 && (
                            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <h4 className="font-medium text-foreground mb-2">How it works:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Your trainer sets their weekly availability from Monday to Friday</li>
                                    <li>• Choose an available time slot that fits your schedule</li>
                                    <li>• Click "Request Session" to send a booking request</li>
                                    <li>• Your trainer will approve or reject the request with a reason</li>
                                    <li>• Once approved, you'll receive a video call link before the session</li>
                                    <li>• Use the filter to view availability for specific days</li>
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}