import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Star,
    MessageSquare,
    Clock,
    Users,
    Award,
    Phone,
    Mail,
    ArrowLeft,
    Calendar,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getTrainer } from "@/services/userService";
import { toast } from "sonner";
import API from "@/lib/axios";

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
}

export default function TrainerPage() {
    const params = useParams();
    const id = params?.id as string;
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        document.title = "TrainUp - Trainer Profile";
        fetchTrainer();
        fetchUser();
    }, [id]);

    const fetchTrainer = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getTrainer(id);
            setTrainer(response.trainer);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch trainer:", err);
            setError("Failed to load trainer details");
            toast.error("Failed to load trainer details");
            setIsLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await API.get("/user/get-profile");
            setUser(response.data.user);
        } catch (err: any) {
            console.error("Failed to fetch user:", err);
            toast.error("Failed to load user data");
        }
    };

    const handleBookNow = () => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
            try {
                const amount = trainer?.price ? parseFloat(trainer.price) : 5000;
                const response = await API.post("/payment/create-order", {
                    amount,
                    currency: "INR",
                    receipt: `booking_${Date.now()}`,
                });
                const order = response.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY,
                    amount: order.amount,
                    currency: order.currency,
                    name: "TrainUp",
                    description: `Booking for ${trainer?.name}`,
                    image: import.meta.env.VITE_LOGO_URL || "/logo.png",
                    order_id: order.id,
                    handler: async (response: any) => {
                        try {
                            const verifyResponse = await API.post("/payment/verify-payment", {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                trainerId: id,
                            });
                            if (verifyResponse.data.success) {
                                toast.success("Payment successful! Booking confirmed.");
                                navigate("/my-trainer/profile");
                            } else {
                                toast.error("Payment verification failed");
                            }
                        } catch (err: any) {
                            console.error("Payment verification failed:", err);
                            toast.error("Failed to verify payment");
                        }
                    },
                    prefill: {
                        name: trainer?.name || "",
                        email: trainer?.email || "",
                        contact: trainer?.phone || "",
                    },
                    theme: {
                        color: "#176B87",
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.on("payment.failed", () => {
                    toast.error("Payment failed. Please try again.");
                });
                rzp.open();
            } catch (err: any) {
                console.error("Failed to create order:", err);
                toast.error("Failed to initiate payment");
            } finally {
                document.body.removeChild(script);
            }
        };

        script.onerror = () => {
            toast.error("Failed to load Razorpay SDK");
            document.body.removeChild(script);
        };
    };

    const handleChat = () => {
        if (trainer) {
            navigate(`/chat/${trainer._id}`);
        } else {
            toast.error("No trainer found to chat with");
        }
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
                    <p className="text-muted-foreground font-medium text-lg">Loading trainer profile...</p>
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
                    <h3 className="text-2xl font-bold text-foreground">Trainer Not Found</h3>
                    <p className="text-muted-foreground text-lg">{error || "The trainer you're looking for doesn't exist"}</p>
                    <Link to="/trainers">
                        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Trainers
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isSameTrainer = user?.assignedTrainer === id;
    const hasTrainer = !!user?.assignedTrainer;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            {hasTrainer && (
                <div className="relative bg-yellow-500/10 border-b border-yellow-500/20 py-4 px-6 text-center">
                    <div className="container mx-auto flex items-center justify-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">
                            You already have a trainer assigned.{" "}
                            <Link to="/my-trainer/profile" className="underline hover:text-yellow-700">
                                View your trainer's profile
                            </Link>{" "}
                            or cancel your current subscription to book a new trainer.
                        </span>
                    </div>
                </div>
            )}

            <div className="relative border-b border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <Link to="/trainers">
                        <Button variant="ghost" className="group hover:bg-primary/5 transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Trainers
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
                                            <span className="text-sm font-medium text-primary">Professional Trainer</span>
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
                                        {isSameTrainer ? (
                                            <Button
                                                disabled
                                                size="lg"
                                                className="bg-gray-500/50 cursor-not-allowed font-semibold px-8"
                                            >
                                                <Calendar className="h-5 w-5 mr-2" />
                                                This is already your trainer
                                            </Button>
                                        ) : hasTrainer ? (
                                            <Button
                                                disabled
                                                size="lg"
                                                className="bg-gray-500/50 cursor-not-allowed font-semibold px-8"
                                            >
                                                <Calendar className="h-5 w-5 mr-2" />
                                                You already have a trainer
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleBookNow}
                                                size="lg"
                                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8"
                                            >
                                                <Calendar className="h-5 w-5 mr-2" />
                                                Book Session
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-medium px-8 bg-transparent"
                                            onClick={handleChat}
                                        >
                                            <MessageSquare className="h-5 w-5 mr-2" />
                                            Message
                                        </Button>
                                        {isSameTrainer && (
                                            <Link to="/my-trainer/profile">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-medium px-8 bg-transparent"
                                                >
                                                    Go to Trainer Profile
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    {hasTrainer && !isSameTrainer && (
                                        <p className="text-sm text-yellow-600 mt-2">
                                            You already have a trainer assigned. Please cancel your current subscription to book this trainer.
                                            <Link to="/my-trainer/profile" className="underline ml-1">
                                                View your trainer's profile
                                            </Link>
                                        </p>
                                    )}
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
                                {isSameTrainer ? (
                                    <Button
                                        disabled
                                        className="w-full bg-gray-500/50 cursor-not-allowed font-semibold"
                                        size="lg"
                                    >
                                        This is already your trainer
                                    </Button>
                                ) : hasTrainer ? (
                                    <Button
                                        disabled
                                        className="w-full bg-gray-500/50 cursor-not-allowed font-semibold"
                                        size="lg"
                                    >
                                        You already have a trainer
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleBookNow}
                                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                                        size="lg"
                                    >
                                        Book Now
                                    </Button>
                                )}
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