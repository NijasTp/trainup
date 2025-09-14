import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Star,
    FileText,
    MessageSquare,
    Clock,
    Users,
    Award,
    Phone,
    Mail,
    ArrowLeft,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "@/lib/axios";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDistanceToNow, addMonths } from "date-fns";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";

interface Trainer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    isBanned: boolean;
    role: string;
    clients: string[];
    bio: string;
    location: string;
    specialization: string;
    tokenVersion: number;
    experience: string;
    badges: string[];
    rating: number;
    certificate: string;
    profileImage: string;
    profileStatus: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    price?: string;
}

interface User {
    _id: string;
    assignedTrainer?: string;
    subscriptionStartDate?: string;
}

export default function MyTrainerProfile() {
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        document.title = "TrainUp - My Trainer Profile";
        fetchMyTrainer();
        fetchUser();
    }, []);

    const fetchMyTrainer = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/user/my-trainer");
            setTrainer(response.data.trainer);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch my trainer:", err);
            setError("Failed to load trainer details");
            toast.error("Failed to load trainer details");
            setIsLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await API.get("/user/me");
            setUser(response.data.user);
        } catch (err: any) {
            console.error("Failed to fetch user:", err);
            toast.error("Failed to load user data");
        }
    };

    const handleChat = () => {
        if (trainer) {
            navigate(`/chat/${trainer._id}`);
        } else {
            toast.error("No trainer found to chat with");
        }
    };

    const handleCancelSubscription = async () => {
        try {
            await API.post("/user/cancel-subscription");
            toast.success("Subscription cancelled successfully");
            setTrainer(null);
            setUser(null);
        } catch (err: any) {
            console.error("Failed to cancel subscription:", err);
            toast.error("Failed to cancel subscription");
        }
    };

    const getRemainingTime = () => {
        if (!user?.subscriptionStartDate) return "Unknown";
        const startDate = new Date(user.subscriptionStartDate);
        const endDate = addMonths(startDate, 1);
        return formatDistanceToNow(endDate, { addSuffix: true });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">Loading your trainer profile...</p>
                </div>
            </div>
        );
    }

    if (error || !trainer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">No Trainer Hired</h3>
                    <p className="text-muted-foreground text-lg">{error || "You haven't hired a trainer yet"}</p>
                    <Link to="/trainers">
                        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Find a Trainer
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <SiteHeader/>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <div className="relative border-b border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <Link to="/home">
                        <Button variant="ghost" className="group hover:bg-primary/5 transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>

            <main className="relative container mx-auto px-4 py-12 space-y-12">
                <div className="relative">
                    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <CardHeader className="relative p-8 md:p-12">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                                <div className="relative group/image">
                                    <div className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>

                                        {!imageLoaded && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center">
                                                <Users className="h-16 w-16 text-muted-foreground/30" />
                                            </div>
                                        )}

                                        <img
                                            src={trainer.profileImage || "/placeholder.svg"}
                                            alt={trainer.name}
                                            className={`w-full h-full object-cover transition-all duration-700 group-hover/image:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                            onLoad={() => setImageLoaded(true)}
                                        />

                                        {trainer.isVerified && (
                                            <div className="absolute top-4 right-4 z-20">
                                                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-full border border-white/20">
                                                    <Shield className="h-3.5 w-3.5 text-white" />
                                                    <span className="text-white text-xs font-semibold">Verified</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                                            <Award className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-primary">Your Trainer</span>
                                        </div>

                                        <div className="space-y-3">
                                            <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                                                {trainer.name}
                                            </h1>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20 font-medium px-4 py-2"
                                                >
                                                    {trainer.specialization}
                                                </Badge>
                                                {trainer.isVerified && (
                                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-medium px-4 py-2">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                                <span className="font-semibold text-foreground">{trainer.rating}</span>
                                                <span className="text-sm">rating</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-primary" />
                                                <span className="font-medium">{trainer.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-accent" />
                                                <span className="font-medium">{trainer.experience} years experience</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-medium px-8 bg-transparent"
                                            onClick={handleChat}
                                        >
                                            <MessageSquare className="h-5 w-5 mr-2" />
                                            Chat with Trainer
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="lg"
                                                    className="bg-red-500/90 hover:bg-red-600/90 transition-all duration-300 font-medium px-8"
                                                >
                                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                                    Cancel Subscription
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card/90 backdrop-blur-sm border-border/50">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-foreground">Confirm Subscription Cancellation</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-muted-foreground">
                                                        Your subscription with {trainer.name} has {getRemainingTime()} remaining this month. 
                                                        Cancelling now means you will lose the payment for the current period. Are you sure you want to proceed?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="border-border/50 hover:bg-muted/50">Keep Subscription</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-500/90 hover:bg-red-600/90"
                                                        onClick={handleCancelSubscription}
                                                    >
                                                        Cancel Subscription
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <h2 className="text-2xl font-bold text-foreground">About {trainer.name}</h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed text-lg">{trainer.bio}</p>

                                <div className="grid gap-4 sm:grid-cols-2 pt-4">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            Experience
                                        </h3>
                                        <p className="text-muted-foreground">{trainer.experience} years of professional training</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <Award className="h-4 w-4 text-primary" />
                                            Specialization
                                        </h3>
                                        <p className="text-muted-foreground">{trainer.specialization}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={trainer.certificate}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300"
                                >
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Professional Certificate</p>
                                        <p className="text-sm text-muted-foreground">Click to view credentials</p>
                                    </div>
                                </a>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <h3 className="text-xl font-bold text-foreground">Pricing</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                                    <div className="text-3xl font-bold text-primary mb-2">{trainer.price || "₹5,000"}</div>
                                    <p className="text-muted-foreground">per month</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <h3 className="text-xl font-bold text-foreground">Contact Information</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{trainer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{trainer.email}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}