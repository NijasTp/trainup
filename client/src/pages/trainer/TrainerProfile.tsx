import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  DollarSign,
  Star,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface TrainerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  specialization: string;
  experience: string;
  price: string;
  rating: number;
  profileImage: string;
  certificate: string;
  isAvailable: boolean;
  unavailableReason?: string;
  profileStatus: string;
  clients: string[];
  createdAt: string;
}

export default function TrainerProfile() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    document.title = "TrainUp - My Profile";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get("/trainer/get-details");
      setProfile(response.data.trainer);
      setUnavailableReason(response.data.trainer.unavailableReason || "");
      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
      toast.error("Failed to load profile");
      setIsLoading(false);
    }
  };

  const handleAvailabilityToggle = async (isAvailable: boolean) => {
    if (!isAvailable) {
      setShowUnavailableDialog(true);
      return;
    }

    // If making available, update directly
    await updateAvailability(true, "");
  };

  const updateAvailability = async (isAvailable: boolean, reason: string) => {
    setIsUpdating(true);
    try {
      await API.put("/trainer/availability", {
        isAvailable,
        unavailableReason: reason || undefined
      });
      
      setProfile(prev => prev ? {
        ...prev,
        isAvailable,
        unavailableReason: reason || undefined
      } : null);
      
      toast.success(`Availability ${isAvailable ? 'enabled' : 'disabled'} successfully`);
      setShowUnavailableDialog(false);
      setUnavailableReason("");
    } catch (err: any) {
      console.error("Failed to update availability:", err);
      toast.error("Failed to update availability");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnavailableSubmit = () => {
    if (!unavailableReason.trim()) {
      toast.error("Please provide a reason for being unavailable");
      return;
    }
    updateAvailability(false, unavailableReason.trim());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
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
          <p className="text-muted-foreground font-medium text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <TrainerSiteHeader />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Error</h3>
          <p className="text-muted-foreground text-lg">{error}</p>
          <Button
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={fetchProfile}
          >
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
      
      <main className="relative container mx-auto px-4 py-12 space-y-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-background ${
                  profile.isAvailable ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                  <p className="text-lg text-muted-foreground">{profile.specialization}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Badge className={`${getStatusColor(profile.profileStatus)} font-medium`}>
                    {profile.profileStatus.charAt(0).toUpperCase() + profile.profileStatus.slice(1)}
                  </Badge>
                  
                  <Badge className={`${profile.isAvailable 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                  } font-medium`}>
                    {profile.isAvailable ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Available
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Unavailable
                      </>
                    )}
                  </Badge>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.clients.length} Clients</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.experience} Experience</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>₹{profile.price}/month</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Control */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">Availability Settings</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">Accept New Clients</h3>
                <p className="text-sm text-muted-foreground">
                  Control whether you're available to accept new clients
                </p>
              </div>
              <Switch
                checked={profile.isAvailable}
                onCheckedChange={handleAvailabilityToggle}
                disabled={isUpdating}
              />
            </div>
            
            {!profile.isAvailable && profile.unavailableReason && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">Currently Unavailable</p>
                    <p className="text-sm text-red-600 mt-1">{profile.unavailableReason}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{profile.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{profile.location || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">Professional Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="font-medium text-foreground">{profile.specialization}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium text-foreground">{profile.experience}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rate</p>
                <p className="font-medium text-foreground">₹{profile.price}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">About Me</h2>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {profile.bio || 'No bio available.'}
            </p>
          </CardContent>
        </Card>

        {/* Unavailable Dialog */}
        <Dialog open={showUnavailableDialog} onOpenChange={setShowUnavailableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Unavailable Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please provide a reason for your unavailability. This will be shown to potential clients.
              </p>
              <Textarea
                placeholder="e.g., Too many clients, On vacation, Personal reasons..."
                value={unavailableReason}
                onChange={(e) => setUnavailableReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnavailableDialog(false);
                    setUnavailableReason(profile.unavailableReason || "");
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnavailableSubmit}
                  disabled={!unavailableReason.trim() || isUpdating}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isUpdating ? "Updating..." : "Set Unavailable"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}