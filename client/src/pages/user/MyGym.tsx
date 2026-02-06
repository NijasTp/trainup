import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building,
  Users,
  Calendar,
  Star,
  Phone,
  Mail,
  Award,
  CreditCard,
  Bell,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import GymReviews from "@/components/user/reviews/GymReviews";

import type { MyGymData } from "@/interfaces/user/IMyGym";


export default function MyGym() {
  const [gymData, setGymData] = useState<MyGymData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TrainUp - My Gym";
    fetchMyGym();
  }, []);

  const fetchMyGym = async () => {
    try {
      const response = await API.get("/user/my-gym");
      setGymData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch gym data:", err);
      if (err.response?.status === 404) {
        toast.error("You don't have an active gym membership");
        navigate("/gyms");
      } else {
        toast.error("Failed to load gym details");
      }
    } finally {
      setIsLoading(false);
    }
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
        <div className="relative container mx-auto px-4 py-16 text-center z-10">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your gym...</p>
        </div>
      </div>
    );
  }

  if (!gymData) {
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
        <div className="relative container mx-auto px-4 py-16 text-center z-10">
          <Building className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Membership</h3>
          <p className="text-muted-foreground mb-6">
            You don't have an active gym membership
          </p>
          <Button onClick={() => navigate("/gyms")}>
            <Building className="h-4 w-4 mr-2" />
            Find a Gym
          </Button>
        </div>
      </div>
    );
  }

  const { gym, members, userSubscription } = gymData;

  const safeMembers = Array.isArray(members) ? members : [];
  const sub = userSubscription || {
    planName: "No Plan",
    planPrice: 0,
    planDuration: 0,
    planDurationUnit: "month",
    subscribedAt: new Date().toISOString(),
    preferredTime: "Anytime",
  };

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

      <main className="relative flex-1">
        {/* Hero Section with Gym Image */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {gym?.profileImage || (gym?.images && gym.images[0]) ? (
              <img
                src={gym.profileImage || gym.images?.[0]}
                alt={gym?.name}
                className="w-full h-full object-cover filter grayscale-[30%] brightness-50"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/50 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
                  <Building className="h-3 w-3 mr-1" />
                  Active Membership
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {gym?.name}
                </h1>
                {gym?.geoLocation && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <span className="text-sm">📍</span>
                    {gym?.address || "Premium Fitness Center"}
                  </p>
                )}
              </div>

              {/* Subscription Expiry Countdown */}
              {userSubscription?.expiresAt && (
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center min-w-[200px]">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Subscription Expires
                  </p>
                  <p className="text-lg font-bold text-white">
                    {(() => {
                      const days = Math.ceil(
                        (new Date(userSubscription.expiresAt).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                      );
                      return days > 0 ? `${days} days left` : "Expired";
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(userSubscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/gyms/announcements")}
            >
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Announcements</h4>
                  <p className="text-sm text-muted-foreground">Latest gym updates</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Schedule</h4>
                  <p className="text-sm text-muted-foreground">Book your sessions</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Community</h4>
                  <p className="text-sm text-muted-foreground">Connect with members</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/gyms/dashboard")}
            >
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Dashboard</h4>
                  <p className="text-sm text-muted-foreground">View your stats</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Gym Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">About</h4>
                        <p className="text-sm text-muted-foreground">
                          {gym?.description ||
                            "Premium fitness facility with state-of-the-art equipment."}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Rating</h4>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{gym?.rating || 0}</span>
                          <span className="text-sm text-muted-foreground">
                            ({gym?.memberCount || 0} members)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Contact</h4>
                        <div className="space-y-2">
                          {gym?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{gym.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{gym?.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Array.isArray(gym?.images) && gym.images.length > 0 && (
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {gym.images.slice(0, 6).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${gym.name} - ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Gym Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {safeMembers.length > 0 ? (
                    safeMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={member.profileImage}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{member.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Joined{" "}
                            {member.joinedAt
                              ? new Date(member.joinedAt).toLocaleDateString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No members found.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 lg:col-span-2">
              <GymReviews
                gymId={gym._id}
                reviews={gym.reviews || []}
                onReviewAdded={(newReview) => {
                  setGymData(prev => prev ? {
                    ...prev,
                    gym: {
                      ...prev.gym,
                      reviews: [...(prev.gym.reviews || []), newReview]
                    }
                  } : null);
                }}
                canReview={true}
                currentUserPlan={userSubscription?.planName}
              />
            </div>


            <div className="space-y-6">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Your Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                    <h3 className="font-bold text-lg">{sub.planName}</h3>
                    <p className="text-2xl font-bold text-primary">
                      ₹{sub.planPrice}
                      <span className="text-sm text-muted-foreground font-normal">
                        /{sub.planDuration} {sub.planDurationUnit}(s)
                      </span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Subscribed
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Preferred Time
                      </span>
                      <Badge variant="secondary">{sub.preferredTime}</Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Members
                    </span>
                    <Badge variant="secondary">{gym.memberCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Gym Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{gym.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div >
  );
}