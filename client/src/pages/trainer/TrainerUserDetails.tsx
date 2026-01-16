import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Dumbbell, Apple, MessageSquare, Video, Calendar as CalendarIcon, Star, Crown, Camera, ChevronRight, X } from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { User, UserPlan, Progress } from "@/interfaces/trainer/ITrainerUserDetails";

export default function TrainerUserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [progressList, setProgressList] = useState<Progress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isProgressOpen, setIsProgressOpen] = useState(false);
    const [selectedProgress, setSelectedProgress] = useState<Progress | null>(null);

    useEffect(() => {
        document.title = "TrainUp - User Details";
        if (id) {
            fetchUser();
            fetchUserPlan();
            fetchProgress();
        }
    }, [id]);

    const fetchUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get(`/trainer/get-client/${id}`);
            setUser(response.data.user);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch user:", err);
            setError("Failed to load user details");
            toast.error("Failed to load user details");
            setIsLoading(false);
        }
    };

    const fetchUserPlan = async () => {
        try {
            const response = await API.get(`/trainer/user-plan/${id}`);
            setUserPlan(response.data.plan);
        } catch (err: any) {
            console.error("Failed to fetch user plan:", err);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await API.get(`/trainer/client-progress/${id}`);
            const sorted = response.data.progress.sort((a: Progress, b: Progress) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setProgressList(sorted);
            if (sorted.length > 0) {
                setSelectedProgress(sorted[0]);
            }
        } catch (err) {
            console.error("Failed to fetch progress:", err);
        }
    };

    const handleStartChat = () => {
        if (!user?.trainerPlan || user.trainerPlan === 'basic') {
            toast.error("This client doesn't have chat access. They need Premium or Pro plan.");
            return;
        }
        navigate(`/trainer/chat/${id}`);
    };

    const getUserInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'basic':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'premium':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'pro':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'basic':
                return <Star className="h-4 w-4" />;
            case 'premium':
                return <MessageSquare className="h-4 w-4" />;
            case 'pro':
                return <Crown className="h-4 w-4" />;
            default:
                return <Star className="h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <TrainerSiteHeader />
                <div className="flex flex-col items-center justify-center min-h-[80vh]">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading client profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-background">
                <TrainerSiteHeader />
                <div className="container mx-auto px-4 py-16 text-center space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">Client Not Found</h3>
                    <p className="text-muted-foreground text-lg">{error || "The requested client could not be found."}</p>
                    <Button onClick={() => navigate("/trainer/clients")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Clients
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            <TrainerSiteHeader />

            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Back Navigation */}
            <div className="relative border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-[64px] z-10">
                <div className="container mx-auto px-4 py-4">
                    <Button
                        variant="ghost"
                        className="group text-muted-foreground hover:text-foreground hover:bg-transparent pl-0"
                        onClick={() => navigate("/trainer/clients")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Clients List
                    </Button>
                </div>
            </div>

            <main className="relative container mx-auto px-4 py-8 flex-1 space-y-8">
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-border/50">
                            <AvatarImage src={user.profileImage} alt={user.name} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                {getUserInitial(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{user.name}</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                {user.trainerPlan && (
                                    <Badge className={`${getPlanColor(user.trainerPlan)} px-3 py-1 text-sm`}>
                                        {getPlanIcon(user.trainerPlan)}
                                        <span className="ml-2 capitalize">{user.trainerPlan} Plan</span>
                                    </Badge>
                                )}
                                <Badge variant={user.activityStatus === 'active' ? "default" : "secondary"} className={user.activityStatus === 'active' ? "bg-green-500 hover:bg-green-600" : ""}>
                                    {user.activityStatus === 'active' ? 'Active Status' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            onClick={() => setIsProgressOpen(true)}
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            View Progress Photos
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-6 text-center space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Height</p>
                                    <p className="text-2xl font-bold">{user.height ? `${user.height} cm` : '-'}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-6 text-center space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Weight</p>
                                    <p className="text-2xl font-bold">{user.weight ? `${user.weight} kg` : '-'}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-6 text-center space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                                    <p className="text-2xl font-bold">-</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-6 text-center space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">BMI</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {user.height && user.weight
                                            ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
                                            : '-'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Info */}
                        <Card className="border-border/50 bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                    <p className="font-medium">{user.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Subscription Started</p>
                                    <p className="font-medium">{user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Management</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal hover:border-primary/50 hover:bg-primary/5" asChild>
                                    <Link to={`/trainer/workout/${id}`}>
                                        <div className="p-1.5 rounded-md bg-blue-500/10 mr-3">
                                            <Dumbbell className="h-4 w-4 text-blue-500" />
                                        </div>
                                        Workouts
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal hover:border-primary/50 hover:bg-primary/5" asChild>
                                    <Link to={`/trainer/diet/${id}`}>
                                        <div className="p-1.5 rounded-md bg-green-500/10 mr-3">
                                            <Apple className="h-4 w-4 text-green-500" />
                                        </div>
                                        Diet Plan
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                    </Link>
                                </Button>
                                {user.trainerPlan !== 'basic' && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-12 text-base font-normal hover:border-primary/50 hover:bg-primary/5"
                                        onClick={handleStartChat}
                                    >
                                        <div className="p-1.5 rounded-md bg-amber-500/10 mr-3">
                                            <MessageSquare className="h-4 w-4 text-amber-500" />
                                        </div>
                                        Messages
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                )}
                                {user.trainerPlan === 'pro' && (
                                    <Button variant="outline" className="w-full justify-start h-12 text-base font-normal hover:border-primary/50 hover:bg-primary/5" asChild>
                                        <Link to="/trainer/sessions">
                                            <div className="p-1.5 rounded-md bg-purple-500/10 mr-3">
                                                <Video className="h-4 w-4 text-purple-500" />
                                            </div>
                                            Video Sessions
                                            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Plan Details Sidebar */}
                        {userPlan && (
                            <Card className="bg-gradient-to-br from-card/80 to-card/40 border-border/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Current Plan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Type</span>
                                        <span className="font-semibold capitalize">{userPlan.planType}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Expires</span>
                                        <span className="font-medium">{new Date(userPlan.expiryDate).toLocaleDateString()}</span>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 space-y-2">
                                        {userPlan.planType !== 'basic' && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                                    Messages
                                                </span>
                                                <Badge variant="outline" className="font-normal">
                                                    {userPlan.planType === 'premium' ? `${userPlan.messagesLeft} left` : 'Unlimited'}
                                                </Badge>
                                            </div>
                                        )}
                                        {userPlan.planType === 'pro' && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <Video className="h-3.5 w-3.5 text-primary" />
                                                    Video Calls
                                                </span>
                                                <Badge variant="outline" className="font-normal">
                                                    {userPlan.videoCallsLeft} left
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Progress Photos Modal */}
            <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <div className="p-6 border-b">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Camera className="h-6 w-6 text-primary" />
                                Progress Tracker
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar: Date List */}
                        <div className="w-64 border-r bg-muted/10 flex flex-col">
                            <div className="p-4 border-b bg-muted/20">
                                <h4 className="font-semibold text-sm text-muted-foreground">Entry Dates</h4>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {progressList.map((p) => (
                                        <Button
                                            key={p._id}
                                            variant={selectedProgress?._id === p._id ? "secondary" : "ghost"}
                                            className={`w-full justify-start font-normal ${selectedProgress?._id === p._id ? 'bg-primary/10 text-primary border-primary/20 border' : ''}`}
                                            onClick={() => setSelectedProgress(p)}
                                        >
                                            <CalendarIcon className="h-4 w-4 mr-2 opacity-70" />
                                            {new Date(p.date).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </Button>
                                    ))}
                                    {progressList.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            No progress entries found
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Main Viewing Area */}
                        <div className="flex-1 bg-background/50 overflow-y-auto">
                            {selectedProgress ? (
                                <div className="p-6 space-y-8">
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div>
                                            <h3 className="text-xl font-semibold">
                                                {new Date(selectedProgress.date).toLocaleDateString(undefined, {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </h3>
                                            {selectedProgress.notes && (
                                                <p className="text-muted-foreground mt-1 max-w-2xl">
                                                    "{selectedProgress.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Photos Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {selectedProgress.photos.map((photo, index) => (
                                            <div key={index} className="group relative aspect-[3/4] rounded-lg overflow-hidden border bg-black/5 shadow-sm">
                                                <img
                                                    src={photo}
                                                    alt={`Progress ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    <Badge variant="outline" className="text-white border-white/30 bg-black/20 backdrop-blur-md">
                                                        Photo {index + 1}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedProgress.photos.length === 0 && (
                                        <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                            No photos uploaded for this entry
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <CalendarIcon className="h-8 w-8 opacity-50" />
                                    </div>
                                    <p>Select a date from the list to view progress details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <SiteFooter />
        </div>
    );
}