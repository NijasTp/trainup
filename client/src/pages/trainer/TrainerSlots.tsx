import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
    Calendar, 
    Clock, 
    Plus, 
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Video,
    Users
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface Slot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    bookedBy?: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    requestedBy: Array<{
        userId: {
            _id: string;
            name: string;
            profileImage?: string;
        };
        status: 'pending' | 'approved' | 'rejected';
    }>;
}

export default function TrainerSlots() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSlot, setNewSlot] = useState({
        date: '',
        startTime: '',
        endTime: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "TrainUp - Manage Slots";
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/trainer/slots");
            setSlots(response.data.slots);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch slots:", err);
            setError("Failed to load slots");
            toast.error("Failed to load slots");
            setIsLoading(false);
        }
    };

    const createSlot = async () => {
        if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
            toast.error("Please fill in all fields");
            return;
        }

        // Validate that end time is after start time
        const start = new Date(`${newSlot.date}T${newSlot.startTime}`);
        const end = new Date(`${newSlot.date}T${newSlot.endTime}`);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        if (diffHours !== 1) {
            toast.error("Session must be exactly 1 hour long");
            return;
        }

        setIsCreating(true);
        try {
            await API.post("/trainer/slots", newSlot);
            toast.success("Slot created successfully!");
            setShowCreateModal(false);
            setNewSlot({ date: '', startTime: '', endTime: '' });
            fetchSlots();
        } catch (err: any) {
            console.error("Failed to create slot:", err);
            toast.error(err.response?.data?.message || "Failed to create slot");
        } finally {
            setIsCreating(false);
        }
    };

    const deleteSlot = async (slotId: string) => {
        try {
            await API.delete(`/trainer/slots/${slotId}`);
            toast.success("Slot deleted successfully!");
            fetchSlots();
        } catch (err: any) {
            console.error("Failed to delete slot:", err);
            toast.error("Failed to delete slot");
        }
    };

    const joinVideoCall = async (slotId: string) => {
        try {
            const response = await API.get(`/video-call/slot/${slotId}`);
            console.log('Video call response:', response.data);
            const roomId = response.data.videoCall.roomId;
            console.log('Navigating to roomId:', roomId);
            navigate(`/trainer/video-call/${roomId}`);
        } catch (error: any) {
            console.error('Error joining video call:', error);
            toast.error(error.response?.data?.message || 'Failed to join video call');
        }
    };

    const canJoinSession = (slot: Slot) => {
        if (!slot.isBooked) return false;
        
        const sessionDateTime = new Date(`${slot.date}T${slot.startTime}`);
        const now = new Date();
        const tenMinutesBefore = new Date(sessionDateTime.getTime() - 10 * 60 * 1000);
        const sessionEnd = new Date(`${slot.date}T${slot.endTime}`);
        
        return true
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

    const getStatusColor = (status: string, isBooked: boolean) => {
        if (isBooked) {
            switch (status) {
                case 'approved':
                    return 'bg-green-500/10 text-green-600 border-green-500/20';
                case 'pending':
                    return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
                case 'rejected':
                    return 'bg-red-500/10 text-red-600 border-red-500/20';
                default:
                    return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            }
        }
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    };

    const getStatusIcon = (status: string, isBooked: boolean) => {
        if (isBooked) {
            switch (status) {
                case 'approved':
                    return <CheckCircle className="h-4 w-4" />;
                case 'rejected':
                    return <XCircle className="h-4 w-4" />;
                default:
                    return <Clock className="h-4 w-4" />;
            }
        }
        return <Calendar className="h-4 w-4" />;
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
                    <p className="text-muted-foreground font-medium text-lg">Loading slots...</p>
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
                        onClick={fetchSlots}
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
                                Manage Availability Slots
                            </h1>
                            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-primary to-primary/90">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Slot
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Availability Slot</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Date</label>
                                            <Input
                                                type="date"
                                                value={newSlot.date}
                                                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Start Time</label>
                                            <Input
                                                type="time"
                                                value={newSlot.startTime}
                                                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">End Time</label>
                                            <Input
                                                type="time"
                                                value={newSlot.endTime}
                                                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Note: Sessions must be exactly 1 hour long
                                        </p>
                                        <Button 
                                            onClick={createSlot} 
                                            disabled={isCreating}
                                            className="w-full"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Slot
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <p className="text-muted-foreground">
                            Create and manage your availability slots for video call sessions with your Pro plan clients.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {slots.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-lg">No availability slots created</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Create your first slot to allow Pro plan clients to book video sessions with you
                                    </p>
                                </div>
                            ) : (
                                slots.map((slot) => {
                                    // Only show approved bookings
                                    const approvedRequest = slot.requestedBy.find(req => req.status === 'approved');
                                    const canJoin = canJoinSession(slot);

                                    return (
                                        <Card
                                            key={slot._id}
                                            className="bg-background/50 border-border/50 hover:shadow-md transition-all duration-200"
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-3 flex-1">
                                                        <div className="flex items-center space-x-6">
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
                                                        </div>

                                                        {slot.isBooked && approvedRequest && (
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage
                                                                        src={approvedRequest.userId.profileImage || "/placeholder.svg"}
                                                                        alt={approvedRequest.userId.name}
                                                                    />
                                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                                        {approvedRequest.userId.name.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="text-sm">
                                                                    <span className="font-medium">Session with:</span>{' '}
                                                                    <span className="text-foreground">{approvedRequest.userId.name}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3">
                                                        <Badge className={`${getStatusColor(approvedRequest?.status || 'available', slot.isBooked)} font-medium`}>
                                                            {getStatusIcon(approvedRequest?.status || 'available', slot.isBooked)}
                                                            <span className="ml-2">
                                                                {slot.isBooked && approvedRequest
                                                                    ? 'Approved Session'
                                                                    : 'Available'
                                                                }
                                                            </span>
                                                        </Badge>

                                                        {canJoin && (
                                                            <Button
                                                                onClick={() => joinVideoCall(slot._id)}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                size="sm"
                                                            >
                                                                <Video className="h-4 w-4 mr-2" />
                                                                Join Session
                                                            </Button>
                                                        )}

                                                        {!slot.isBooked && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => deleteSlot(slot._id)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>

                        {slots.length > 0 && (
                            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <h4 className="font-medium text-foreground mb-2">Slot Management Tips:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Only Pro plan clients can book your video call sessions</li>
                                    <li>• Each session is exactly 1 hour long</li>
                                    <li>• You can join sessions 10 minutes before the scheduled time</li>
                                    <li>• You can only delete slots that haven't been booked</li>
                                    <li>• Clients will see your available slots and can request bookings</li>
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}