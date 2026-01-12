import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  DollarSign,
  Star,
  Users
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

import type { TrainerProfile } from "@/interfaces/trainer/ITrainerProfile";

export default function TrainerProfile() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
      toast.error("Failed to load profile");
      setIsLoading(false);
    }
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1 max-w-4xl">
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between w-full space-y-6 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    src={profile.profileImage || "/placeholder.svg"}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
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
                      <span>₹{profile.price.basic}/month</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate("/trainer/edit-profile")}>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-muted-foreground">Monthly Rate (Basic)</p>
                <p className="font-medium text-foreground">₹{profile.price.basic}</p>
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
      </main>
      <SiteFooter />
    </div >
  );
}