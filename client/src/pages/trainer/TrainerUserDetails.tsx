import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Dumbbell, Apple, MessageSquare } from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    height: number; // in cm
    weight: number; // in kg
    activityStatus: 'active' | 'inactive';
    subscriptionStartDate: string;
    profileImage?: string;
}

export default function TrainerUserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp - User Details";
        fetchUser();
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


    const handleStartChat = () => {
        navigate(`/trainer/chat/${id}`);
    };

    const getUserInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
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
                    <p className="text-muted-foreground font-medium text-lg">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">Error</h3>
                    <p className="text-muted-foreground text-lg">{error || "User not found"}</p>
                    <Button
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate("/trainer/dashboard")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Clients
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <div className="relative border-b border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <Button
                        variant="ghost"
                        className="group hover:bg-primary/5 transition-all duration-300"
                        onClick={() => navigate("/trainer/dashboard")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Clients
                    </Button>
                </div>
            </div>

            <main className="relative container mx-auto px-4 py-12 space-y-8">
                <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {getUserInitial(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <h1 className="text-3xl font-bold text-foreground">{user.name}'s Details</h1>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                                <p className="text-muted-foreground">
                                    <span className="font-medium">Email:</span> {user.email}
                                </p>
                                <p className="text-muted-foreground">
                                    <span className="font-medium">Phone:</span> {user.phone}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Physical Details</h3>
                                <p className="text-muted-foreground">
                                    <span className="font-medium">Height:</span> {user.height ? `${user.height} cm` : 'N/A'}
                                </p>
                                <p className="text-muted-foreground">
                                    <span className="font-medium">Weight:</span> {user.weight ? `${user.weight} kg` : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Status</h3>
                            <Badge
                                variant={user.activityStatus === 'active' ? "default" : "secondary"}
                                className={user.activityStatus === 'active' ? "bg-green-500/90" : "bg-muted/50"}
                            >
                                {user.activityStatus === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Subscription</h3>
                            <p className="text-muted-foreground">
                                <span className="font-medium">Start Date:</span>{' '}
                                {user.subscriptionStartDate
                                    ? new Date(user.subscriptionStartDate).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link to={`/trainer/workout/${id}`}>
                            <Button
                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                                
                            >
                                <Dumbbell className="h-4 w-4 mr-2" />
                                Set Workout Session
                            </Button>
                            </Link>
                            <Link  to={`/trainer/diet/${id}`}>
                            <Button
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                
                            >
                                <Apple className="h-4 w-4 mr-2" />
                                Set Diet Plan
                            </Button>
                            </Link>
                            <Button
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={handleStartChat}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Start Chat
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}