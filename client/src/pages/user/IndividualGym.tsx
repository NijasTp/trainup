import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  MapPin,
  Star,
  Users,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  Image as ImageIcon,
  Award,
  Crown,
  Target,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import API from "@/lib/axios";
import GymReviews from "@/components/user/reviews/GymReviews";

interface SubscriptionPlan {
  _id: string;
  name: string;
  duration: number;
  durationUnit: string;
  price: number;
  features: string[];
  description?: string;
}

interface Gym {
  _id: string;
  name: string;
  description: string;
  rating: number;
  memberCount: number;
  location: string;
  operatingHours: string;
  phone: string;
  email: string;
  images: string[];
  profileImage: string;
  reviews?: any[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  gymId?: string;
  gymPlan?: string;
}

export default function GymPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const [gym, setGym] = useState<Gym | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [preferredTime, setPreferredTime] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!id) return;
    document.title = "TrainUp - Gym Details";
    fetchGymDetails();
    fetchSubscriptionPlans();
    fetchUser();
  }, [id]);

  const fetchGymDetails = async () => {
    try {
      const response = await API.get(`/user/gyms/${id}`);
      setGym(response.data.gym);
    } catch (err: any) {
      console.error("Failed to fetch gym details:", err);
      toast.error("Failed to load gym details");
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await API.get(`/user/gyms/${id}/subscription-plans`);
      setSubscriptionPlans(response.data.plans || []);
    } catch (err: any) {
      console.error("Failed to fetch subscription plans:", err);
      toast.error("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await API.get("/user/get-profile");
      setUser(response.data.user);
    } catch (err: any) {
      console.error("Failed to fetch user:", err);
    }
  };

  const handleJoinGym = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowSubscriptionModal(true);
  };

  const handleSubscribeWithPayment = async () => {
    if (!selectedPlan || !preferredTime.trim()) {
      toast.error("Please select a preferred time");
      return;
    }

    setIsProcessingPayment(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        const response = await API.post("/payment/gym/create-order", {
          gymId: id,
          subscriptionPlanId: selectedPlan._id,
          amount: selectedPlan.price,
          currency: "INR",
          preferredTime
        });

        const order = response.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency,
          name: "TrainUp",
          description: `${selectedPlan.name} - ${gym?.name}`,
          image: import.meta.env.VITE_LOGO_URL || "/logo.png",
          order_id: order.id,
          handler: async (response: any) => {
            try {
              const verifyResponse = await API.post("/payment/gym/verify-payment", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                gymId: id,
                subscriptionPlanId: selectedPlan._id,
                amount: selectedPlan.price,
                preferredTime
              });

              if (verifyResponse.data.success) {
                toast.success("Payment successful! Welcome to the gym!");
                setShowSubscriptionModal(false);
                navigate("/gyms/my-gym");
              } else {
                toast.error("Payment verification failed");
              }
            } catch (err: any) {
              console.error("Payment verification failed:", err);
              toast.error(err.response?.data?.message || "Failed to verify payment");
            }
          },
          prefill: {
            name: gym?.name || "",
            email: gym?.email || "",
          },
          theme: {
            color: "#3b82f6",
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Please try again.");
        });
        rzp.open();
      } catch (err: any) {
        console.error("Failed to create order:", err);
        toast.error(err.response?.data?.error || "Failed to initiate payment");
      } finally {
        setIsProcessingPayment(false);
        document.body.removeChild(script);
      }
    };

    script.onerror = () => {
      toast.error("Failed to load Razorpay SDK");
      setIsProcessingPayment(false);
      document.body.removeChild(script);
    };
  };

  if (isLoading || !gym) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gym details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <SiteHeader />

      {/* Navigation */}
      <div className="relative border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/gyms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gyms
          </Button>
        </div>
      </div>

      <main className="relative container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img
              src={gym.profileImage || gym.images?.[0] || "/placeholder.svg"}
              alt={gym.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary">Premium Gym</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{gym.rating}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{gym.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Premium Location</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{gym.memberCount} members</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  About {gym.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {gym.description || "Premium fitness facility with state-of-the-art equipment and professional trainers."}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Operating Hours</h4>
                    <p className="text-sm text-muted-foreground">{gym.operatingHours || "6:00 AM - 10:00 PM"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Contact</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {gym.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{gym.phone}</span>
                        </div>
                      )}
                      {gym.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{gym.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            {gym.images && gym.images.length > 0 && (
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gym.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${gym.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Plans */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Membership Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionPlans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No subscription plans available at the moment.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {subscriptionPlans.map((plan) => (
                      <Card key={plan._id} className="border-border/50">
                        <CardContent className="p-6">
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <div className="text-3xl font-bold text-primary mt-2">
                              ₹{plan.price}
                              <span className="text-sm text-muted-foreground font-normal">
                                /{plan.duration} {plan.durationUnit}(s)
                              </span>
                            </div>
                          </div>

                          {plan.description && (
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                              {plan.description}
                            </p>
                          )}

                          <div className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => handleJoinGym(plan)}
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Choose Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-8">
              <GymReviews
                gymId={gym._id}
                reviews={gym.reviews || []}
                onReviewAdded={(newReview) => {
                  setGym(prev => prev ? {
                    ...prev,
                    reviews: [...(prev.reviews || []), newReview]
                  } : null);
                }}
                canReview={user?.gymId === gym._id}
                currentUserPlan={user?.gymPlan}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Members</span>
                  <Badge variant="secondary">{gym.memberCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{gym.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plans Available</span>
                  <Badge variant="secondary">{subscriptionPlans.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {[
                    "Modern Equipment",
                    "Personal Trainers",
                    "Group Classes",
                    "Cardio Zone",
                    "Weight Training",
                    "Locker Rooms",
                    "Premium Location"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join {gym.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Selected Plan: {selectedPlan?.name}</h4>
              <p className="text-sm text-muted-foreground">
                Price: ₹{selectedPlan?.price} for {selectedPlan?.duration} {selectedPlan?.durationUnit}(s)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Preferred Workout Time</Label>
              <Input
                id="time"
                placeholder="e.g., 7:00 AM - 9:00 AM"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
            </div>
            <Button onClick={handleSubscribeWithPayment} disabled={isProcessingPayment} className="w-full">
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay & Subscribe
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}