import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar,
    Clock,
    Video,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    RefreshCw
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

import type { Session } from "@/interfaces/user/IUserSessions";
import Aurora from "@/components/ui/Aurora";


export default function UserSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.userAuth.user);
    const currentUserId = user?._id;
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "TrainUp - My Sessions";
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/user/sessions");
            // Sort sessions: Latest date first
            const sortedSessions = (response.data.sessions || []).sort((a: Session, b: Session) => {
                const dateA = new Date(`${a.date.split('T')[0]}T${a.startTime}`);
                const dateB = new Date(`${b.date.split('T')[0]}T${b.startTime}`);
                return dateB.getTime() - dateA.getTime();
            });
            setSessions(sortedSessions);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch sessions:", err);
            setError("Failed to load sessions");
            toast.error("Failed to load sessions");
            setIsLoading(false);
        }
    };

    const canJoinSession = (session: Session) => {
        if (!currentUserId) return false;
        const userRequest = session.requestedBy.find(req => req.userId === currentUserId);
        if (!userRequest || userRequest.status !== 'approved' || !session.isBooked) return false;

        // Parse the slot date ensuring we get the correct local year, month, day
        const slotDate = new Date(session.date);
        const year = slotDate.getFullYear();
        const month = slotDate.getMonth();
        const day = slotDate.getDate();

        const [hours, minutes] = session.startTime.split(':').map(Number);
        const [endHours, endMinutes] = session.endTime.split(':').map(Number);

        const start = new Date(year, month, day, hours, minutes);
        const end = new Date(year, month, day, endHours, endMinutes);

        const now = new Date();
        const tenMinutesBefore = new Date(start.getTime() - 10 * 60000);

        return now >= tenMinutesBefore && now <= end;
    };

    const joinVideoCall = async (slotId: string) => {
        try {
            const response = await API.get(`/video-call/slot/${slotId}`);
            const roomId = response.data.videoCall.roomId;
            console.log('Navigating to video call with roomId:', roomId, 'With slotId:', slotId);
            navigate(`/video-call/${roomId}`);
        } catch (error: any) {
            console.error('Error joining video call:', error);
            toast.error(error.response?.data?.message || 'Failed to join video call');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'rejected':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'pending':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
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

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                {/* Background Visuals */}
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#020617", "#0f172a", "#020617"]}
                        amplitude={1.1}
                        blend={0.6}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
                </div>
                <SiteHeader />
                <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">Loading sessions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                {/* Background Visuals */}
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#020617", "#0f172a", "#020617"]}
                        amplitude={1.1}
                        blend={0.6}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
                </div>
                <SiteHeader />
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">Error</h3>
                    <p className="text-muted-foreground text-lg">{error}</p>
                    <Button
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={fetchSessions}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentUserId) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                {/* Background Visuals */}
                <div className="absolute inset-0 z-0">
                    <Aurora
                        colorStops={["#020617", "#0f172a", "#020617"]}
                        amplitude={1.1}
                        blend={0.6}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
                </div>
                <SiteHeader />
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">Authentication Error</h3>
                    <p className="text-muted-foreground text-lg">Please log in to view your sessions</p>
                    <Link to="/login">
                        <Button className="bg-gradient-to-r from-primary to-primary/90">
                            Log In
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>
            <SiteHeader />

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
                                <Video className="h-8 w-8 text-primary" />
                                My Sessions
                            </h1>
                            <Badge variant="secondary" className="text-sm">
                                {sessions.length} Total Sessions
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            View all your session requests, approvals, and scheduled video calls with your trainer.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Video className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-lg">No sessions found</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Book a session from your trainer's availability page to get started
                                    </p>
                                    <Link to="/my-trainer/availability">
                                        <Button className="mt-4 bg-gradient-to-r from-primary to-primary/90">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            View Availability
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                sessions.map((session) => {
                                    // Find the user's request in requestedBy
                                    const userRequest = session.requestedBy.find(req => req.userId === currentUserId);
                                    const status = userRequest?.status || 'pending';
                                    const rejectionReason = userRequest?.rejectionReason;
                                    const canJoin = canJoinSession(session);

                                    return (
                                        <Card
                                            key={session._id}
                                            className="bg-background/50 border-border/50 hover:shadow-md transition-all duration-200"
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage
                                                                src={session.trainerId?.profileImage || "/placeholder.svg"}
                                                                alt={session.trainerId?.name || "Trainer"}
                                                            />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                {session.trainerId?.name?.charAt(0) || "T"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">
                                                                Session with {session.trainerId?.name || "Unknown Trainer"}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Requested on {new Date(session.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={`${getStatusColor(status)} font-medium`}>
                                                            {getStatusIcon(status)}
                                                            <span className="ml-2">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                                        </Badge>
                                                        {canJoin && (
                                                            <Button
                                                                onClick={() => joinVideoCall(session._id)}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                size="sm"
                                                            >
                                                                <Video className="h-4 w-4 mr-2" />
                                                                Join Session
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-foreground font-medium">
                                                            {formatDate(session.date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-foreground font-medium">
                                                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Video className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-foreground font-medium">
                                                            1 Hour Session
                                                        </span>
                                                    </div>
                                                </div>

                                                {status === 'rejected' && rejectionReason && (
                                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                        <div className="flex items-start space-x-2">
                                                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-red-700">Session Rejected</p>
                                                                <p className="text-sm text-red-600 mt-1">
                                                                    {rejectionReason}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {status === 'approved' && (
                                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                        <div className="flex items-start space-x-2">
                                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-green-700">Session Approved</p>
                                                                <p className="text-sm text-green-600 mt-1">
                                                                    {canJoin
                                                                        ? "You can now join the video call session!"
                                                                        : "You can join the session 10 minutes before the scheduled time."
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {status === 'pending' && (
                                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                        <div className="flex items-start space-x-2">
                                                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-amber-700">Awaiting Approval</p>
                                                                <p className="text-sm text-amber-600 mt-1">
                                                                    Your session request is pending approval from your trainer.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}