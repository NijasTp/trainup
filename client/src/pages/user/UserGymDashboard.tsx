import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  MapPin,
  Award,
  Bell,
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";

interface Gym {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  images?: string[];
  certificate?: string;
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface UserSubscription {
  planName: string;
  planPrice: number;
  planDuration: number;
  planDurationUnit: string;
  subscribedAt: string;
  status: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  checkInTime: string;
  isValidLocation: boolean;
}



export default function UserGymDashboard() {
  const [gymDetails, setGymDetails] = useState<Gym | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TrainUp - My Gym Dashboard";
    fetchMyGymDetails();
  }, []);

  useEffect(() => {
    if (gymDetails?._id) {
      fetchAttendanceHistory();
    }
  }, [gymDetails]);

  const fetchMyGymDetails = async () => {
    try {
      const response = await API.get("/user/my-gym");
      const { gym, userSubscription } = response.data;

      setGymDetails(gym);
      setSubscription(userSubscription);
    } catch (err: any) {
      console.error("Failed to fetch gym details:", err);
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

  const fetchAttendanceHistory = async () => {
    if (!gymDetails?._id) return;

    try {
      const response = await API.get(`/attendance/history/${gymDetails._id}`);
      setAttendanceHistory(response.data.attendance || []);
    } catch (err: any) {
      console.error("Failed to fetch attendance history:", err);
    }
  };

  const handleMarkAttendance = async () => {
    if (!gymDetails || !navigator.geolocation) {
      toast.error("Location access is required to mark attendance");
      return;
    }

    setIsMarkingAttendance(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          await API.post("/attendance/mark", {
            gymId: gymDetails._id,
            location: { lat: latitude, lng: longitude },
          });

          toast.success("Attendance marked successfully!");
          fetchAttendanceHistory();
        } catch (err: any) {
          console.error("Failed to mark attendance:", err);
          toast.error(err.response?.data?.message || "Failed to mark attendance");
        } finally {
          setIsMarkingAttendance(false);
        }
      },
      () => {
        toast.error("Please enable location access in your browser.");
        setIsMarkingAttendance(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const canMarkAttendance = () => {
    if (!attendanceHistory.length) return true;
    const today = new Date().toDateString();
    return !attendanceHistory.some(
      (record) => new Date(record.date).toDateString() === today
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your gym dashboard...</p>
        </div>
      </div>
    );
  }

  if (!gymDetails || !subscription) {
    return (
      <div className="min-h-screen bg-background text-foreground dark">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">No Active Gym Membership</h1>
          <p className="text-muted-foreground mb-8">
            You don't have an active gym membership. Browse and join a gym to get started!
          </p>
          <Button onClick={() => navigate("/gyms")}>Browse Gyms</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
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
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            My Gym Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to {gymDetails.name}! Track your progress and stay motivated.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gym Hero Card */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
              <div className="relative h-48">
                <img
                  src={gymDetails.profileImage || gymDetails.images?.[0] || "/placeholder.svg"}
                  alt={gymDetails.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                 
                  <h2 className="text-2xl font-bold">{gymDetails.name}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3" />
                    <span>Premium Location</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  onClick={handleMarkAttendance}
                  disabled={!canMarkAttendance() || isMarkingAttendance}
                >
                  {isMarkingAttendance ? (
                    <>Marking...</>
                  ) : canMarkAttendance() ? (
                    <>Mark Attendance</>
                  ) : (
                    <>Already Marked Today</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/gyms/announcements")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  View Announcements
                </Button>

                {!canMarkAttendance() && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Attendance already marked for today!
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance History */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No attendance records yet. Mark your first attendance!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attendanceHistory.slice(0, 10).map((record) => (
                      <div key={record._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.checkInTime).toLocaleTimeString()}
                          </p>
                        </div>
                        {record.isValidLocation ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            {gymDetails.images && gymDetails.images.length > 0 && (
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Gym Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gymDetails.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${gymDetails.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificate */}
            {gymDetails.certificate && (
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Gym Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Official Gym Certificate</p>
                        <p className="text-sm text-muted-foreground">Verified and approved</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(gymDetails.certificate, "_blank")}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Details */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Membership Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{subscription.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">₹{subscription.planPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">
                    {subscription.planDuration} {subscription.planDurationUnit}(s)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold">
                    {new Date(subscription.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{gymDetails.email}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}