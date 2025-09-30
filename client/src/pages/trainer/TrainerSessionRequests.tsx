import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Calendar, 
    Clock, 
    Video, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface User {
    _id: string;
    name: string;
    profileImage?: string;
}

interface RequestedBy {
    _id: string;
    userId: User;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

interface SessionRequest {
    _id: string;
    trainerId: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    requestedBy: RequestedBy[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export default function TrainerSessionRequests() {
    const [requests, setRequests] = useState<SessionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp - Session Requests";
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/trainer/session-requests");
            setRequests(response.data.requests);
            console.log("Fetched requests:", response.data.requests);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch requests:", err);
            setError("Failed to load session requests");
            toast.error("Failed to load session requests");
            setIsLoading(false);
        }
    };

    const approveRequest = async (requestId: string, userId: string) => {
        setProcessingId(requestId);
        try {
            await API.post(`/trainer/session-requests/${requestId}/approve/${userId}`);
            toast.success("Session request approved!");
            fetchRequests();
        } catch (err: any) {
            console.error("Failed to approve request:", err);
            toast.error("Failed to approve request");
        } finally {
            setProcessingId(null);
        }
    };

    const rejectRequest = async () => {
        if (!selectedRequestId || !selectedUserId || !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection and select a user");
            return;
        }

        setProcessingId(selectedRequestId);
        try {
            await API.post(`/trainer/session-requests/${selectedRequestId}/reject/${selectedUserId}`, {
                rejectionReason: rejectionReason.trim()
            });
            toast.success("Session request rejected");
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedRequestId(null);
            setSelectedUserId(null);
            fetchRequests();
        } catch (err: any) {
            console.error("Failed to reject request:", err);
            toast.error("Failed to reject request");
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
                    <p className="text-muted-foreground font-medium text-lg">Loading session requests...</p>
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
                        onClick={fetchRequests}
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
                                <Video className="h-8 w-8 text-primary" />
                                Session Requests
                            </h1>
                            <Badge variant="secondary" className="text-sm">
                                {requests.reduce((count, r) => count + r.requestedBy.filter(req => req.status === 'pending').length, 0)} Pending Requests
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Manage incoming video call session requests from your Pro plan clients.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {requests.length === 0 || requests.every(r => r.requestedBy.length === 0) ? (
                                <div className="text-center py-12">
                                    <Video className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-lg">No session requests found</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Pro plan clients can request video sessions from your available slots
                                    </p>
                                </div>
                            ) : (
                                requests.map((request) => (
                                    request.requestedBy.map((reqBy) => {
                                        const user = reqBy.userId;
                                        const requestedAt = reqBy.requestedAt;

                                        return (
                                            <Card
                                                key={`${request._id}-${reqBy._id}`}
                                                className="bg-background/50 border-border/50 hover:shadow-md transition-all duration-200"
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage 
                                                                    src={user.profileImage || "/placeholder.svg"} 
                                                                    alt={user.name} 
                                                                />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                    {user.name.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="font-semibold text-foreground">
                                                                    {user.name}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Requested on {new Date(requestedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className={`${getStatusColor(reqBy.status)} font-medium`}>
                                                            {getStatusIcon(reqBy.status)}
                                                            <span className="ml-2">{reqBy.status.charAt(0).toUpperCase() + reqBy.status.slice(1)}</span>
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-foreground font-medium">
                                                                {formatDate(request.date)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-foreground font-medium">
                                                                {formatTime(request.startTime)} - {formatTime(request.endTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Video className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-foreground font-medium">
                                                                1 Hour Session
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {reqBy.status === 'rejected' && reqBy.rejectionReason && (
                                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                                                            <div className="flex items-start space-x-2">
                                                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                                                <div>
                                                                    <p className="font-medium text-red-700">Rejection Reason</p>
                                                                    <p className="text-sm text-red-600 mt-1">
                                                                        {reqBy.rejectionReason}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {reqBy.status === 'pending' && (
                                                        <div className="flex items-center space-x-3">
                                                            <Button
                                                                onClick={() => approveRequest(request._id, user._id)}
                                                                disabled={processingId === request._id}
                                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                                            >
                                                                {processingId === request._id ? (
                                                                    <>
                                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                        Approving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Approve
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => openRejectModal(request._id, user._id)}
                                                                disabled={processingId === request._id}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Session Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Please provide a reason for rejecting this session request. This will help the client understand why their request was declined.
                            </p>
                            <Textarea
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedUserId(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={rejectRequest}
                                    disabled={!rejectionReason.trim() || processingId === selectedRequestId}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    {processingId === selectedRequestId ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Rejecting...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Request
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}