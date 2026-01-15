import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Flame, Lock, Mail, Phone, Ruler, Scale, Trophy, User, Shield, CreditCard, ArrowRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { getProfilePageData } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import type { UserProfile } from "@/interfaces/user/profileInterface";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

import type { Transaction } from "@/interfaces/user/IUserTransactions";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "TrainUp - Your Profile";
    fetchProfile();
    fetchRecentTransactions();
  }, []);

  async function fetchProfile() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProfilePageData();
      console.log(response)
      setProfile(response.user);
    } catch (err) {
      setError("Failed to fetch profile");
      console.error("API error:", err);
      toast.error("Error loading profile", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRecentTransactions() {
    setIsTransactionsLoading(true);
    try {
      const response = await API.get('/payment/transactions?limit=5');
      setTransactions(response.data.transactions || []);
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);

    } finally {
      setIsTransactionsLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1">

        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Fitness Profile</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Your Fitness Journey
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your progress and manage your fitness details
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Loading your profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full border border-destructive/20 mb-4">
              <span className="text-destructive font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!isLoading && !error && profile && (
          <div className="space-y-8">
            <Card className="relative group bg-card/40 backdrop-blur-sm border-border/50 max-w-4xl mx-auto overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full ring-4 ring-primary/10 overflow-hidden shadow-xl">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary/70" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-card flex items-center justify-center shadow-lg">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-3xl font-bold text-foreground">{profile.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                    {profile.isPrivate && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <Lock className="h-4 w-4 text-accent" />
                        <span className="text-sm">Private Profile</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/edit-profile")}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="text-foreground">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                      <Phone className="h-5 w-5 text-primary" />
                      {profile.phone ? (
                        <span className="text-foreground">{profile.phone}</span>
                      ) : (
                        <span className="text-red-500 font-medium">Not added</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                      <Ruler className="h-5 w-5 text-primary" />
                      {profile.height ? (
                        <span className="text-foreground">Height: {profile.height} cm</span>
                      ) : (
                        <span className="text-red-500 font-medium">Height: Not added</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                      <Scale className="h-5 w-5 text-primary" />
                      {profile.weight ? (
                        <span className="text-foreground">Weight: {profile.weight} kg</span>
                      ) : (
                        <span className="text-red-500 font-medium">Weight: Not added</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                      <Calendar className="h-5 w-5 text-primary" />
                      {profile.age ? (
                        <span className="text-foreground">Age: {profile.age} years</span>
                      ) : (
                        <span className="text-red-500 font-medium">Age: Not added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fitness Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" />
                    Fitness Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.goals && profile.goals.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Award className="h-4 w-4 text-primary" />
                          Goals
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.goals.map((goal, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="font-medium bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                            >
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.activityLevel && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Flame className="h-4 w-4 text-primary" />
                          Activity Level
                        </div>
                        <Badge
                          variant="outline"
                          className="font-medium border-primary/30 hover:bg-primary/10 transition-all duration-300"
                        >
                          {profile.activityLevel}
                        </Badge>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        Equipment
                      </div>
                      <Badge
                        variant="outline"
                        className="font-medium border-primary/30 hover:bg-primary/10 transition-all duration-300"
                      >
                        {profile.equipment ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Trainer */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Trainer
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.assignedTrainer && (
                      <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                        <User className="h-5 w-5 text-primary" />
                        <span className="text-foreground">Trainer: {profile.assignedTrainer}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress and Achievements */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Progress & Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Flame className="h-4 w-4 text-primary" />
                        Streak
                      </div>
                      <span className="text-lg font-bold text-primary bg-muted/20 p-3 rounded-lg block">
                        {profile.streak || 0} days
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Trophy className="h-4 w-4 text-primary" />
                        XP
                      </div>
                      <span className="text-lg font-bold text-primary bg-muted/20 p-3 rounded-lg block">
                        {profile.xp || 0} points
                      </span>
                    </div>
                    {profile.achievements && profile.achievements.length > 0 && (
                      <div className="space-y-3 md:col-span-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Award className="h-4 w-4 text-primary" />
                          Achievements
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.achievements.map((achievement, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="font-medium bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                            >
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Account Details
                  </h3>
                  <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-all duration-300">
                    <span className="text-foreground">
                      Joined: {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History Section */}
            <Card className="relative group bg-card/40 backdrop-blur-sm border-border/50 max-w-4xl mx-auto overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Recent Transactions
                </CardTitle>
                <Button
                  variant="outline"
                  className="hover:bg-primary/5"
                  onClick={() => navigate('/transactions')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground font-medium">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">Your payment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {transaction.trainerId?.profileImage ? (
                              <img
                                src={transaction.trainerId.profileImage}
                                alt={transaction.trainerId.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {transaction.trainerId?.name || 'Trainer Subscription'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.months} month{transaction.months > 1 ? 's' : ''} subscription
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            ₹{transaction.amount.toLocaleString()}
                          </div>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="ghost"
                          className="text-primary hover:text-primary/80"
                          onClick={() => navigate('/transactions')}
                        >
                          View All Transactions
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}