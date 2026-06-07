import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Mail,
  Phone,
  User,
  ArrowRight,
  Activity,
  Target,
  Scale,
  Ruler,
  Calendar,
  ShieldAlert,
  Utensils
} from "lucide-react";
import { toast } from "sonner";
import { getProfilePageData } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import type { UserProfile } from "@/interfaces/user/profileInterface";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<SafeAny[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "TrainUp - Your Profile";
    fetchProfile();
    fetchRecentTransactions();
  }, []);

  async function fetchProfile() {
    setIsLoading(true);
    try {
      const response = await getProfilePageData();
      setProfile(response.user);
    } catch (errVal) { const err = errVal as SafeAny;
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
      const response = await API.get('/payment/transactions?limit=2');
      setTransactions(response.data.transactions || []);
    } catch (errVal) { const err = errVal as SafeAny;
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsTransactionsLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const MetricCard = ({ icon: Icon, title, value, label }: SafeAny) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-2 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-400">{title}</h4>
        <p className="text-xl font-black italic uppercase tracking-tight">{value || "Not specified"}</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 py-12 space-y-12 flex-1 z-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-primary/20 overflow-hidden shadow-2xl">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary/70" />
                  </div>
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-primary rounded-2xl px-4 py-2 border-4 border-[#030303] flex items-center gap-2 shadow-xl"
              >
                <Flame className="h-5 w-5 text-black fill-black" />
                <span className="text-black font-black italic">{profile?.streak || 0} DAY STREAK</span>
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                {profile?.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
                  FITNESS ENTHUSIAST
                </Badge>
                <Badge variant="outline" className="border-white/10 text-gray-400 py-1 px-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
                  XP: {profile?.xp || 0}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/edit-profile")}
            className="h-16 px-10 rounded-2xl bg-white text-black hover:bg-gray-200 transition-all font-black italic uppercase tracking-widest text-sm"
          >
            Edit Profile
          </Button>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Metrics & Progress */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard icon={Activity} title="Activity Level" value={profile.activityLevel} label="FITNESS" />
                <MetricCard icon={Target} title="Primary Goal" value={profile.goals![0] || 'Not specified'} label="TARGET" />
                <MetricCard icon={Ruler} title="Height" value={profile.height ? `${profile.height} cm` : null} label="BODY" />
                <MetricCard icon={Scale} title="Current Weight" value={profile.weight ? `${profile.weight} kg` : null} label="BODY" />
              </div>

              {/* Health & Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500" /> Medical Conditions
                  </h3>
                  <p className="text-lg font-medium text-gray-200 italic">
                    {profile.medicalConditions === "haven't given" || !profile.medicalConditions ? "No medical details shared yet." : profile.medicalConditions}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-green-500" /> Dietary Preferences
                  </h3>
                  <p className="text-lg font-medium text-gray-200 italic">
                    {profile.dietaryPreferences === "haven't given" || !profile.dietaryPreferences ? "No dietary preferences listed." : profile.dietaryPreferences}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Info & Transactions */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] space-y-6">
                <h3 className="text-xl font-black italic uppercase">Contact Credentials</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
                      <p className="font-bold truncate">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
                      <p className="font-bold">{profile.phone || "Not linked"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Subscriptions */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black italic uppercase">My Subscriptions</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/my-subscriptions')} className="text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10">
                    Manage <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {profile && profile.activeSubscriptions && profile.activeSubscriptions.length > 0 ? (
                    profile.activeSubscriptions.map((sub: SafeAny, idx: number) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black italic uppercase text-white group-hover:text-primary transition-colors">
                            {sub.subscriptionType === 'gym' ? (sub.gymId?.name || 'Gym') : (sub.trainerId?.name || 'Trainer')}
                          </span>
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[8px] font-black uppercase">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            <Badge variant="outline" className="text-[8px] py-0 h-4 border-white/10 uppercase">
                              {sub.subscriptionType}
                            </Badge>
                            <span>{sub.planId?.name || sub.planType || 'Premium'} Plan</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(sub.expiryDate || sub.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                      <p className="text-xs text-gray-500 italic">No active subscriptions found.</p>
                      <Button variant="link" onClick={() => navigate('/trainers')} className="text-primary h-auto p-0 text-xs mt-2 uppercase font-bold">Browse Plans</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black italic uppercase">Payments</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')} className="text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {isTransactionsLoading ? (
                    <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx: SafeAny) => (
                      <div key={tx._id} className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter truncate w-32">
                              {tx.type === 'gym' ? (tx.gymId?.name || "Gym Plan") : (tx.trainerId?.name || "Trainer Plan")}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">{formatDate(tx.createdAt)}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-black italic text-sm">₹{tx.amount}</p>
                            <Badge className={cn(
                              "text-[8px] h-4 font-black uppercase",
                              tx.transactionType === 'credit' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {tx.transactionType || 'DEBIT'}
                            </Badge>
                          </div>
                        </div>
                        {tx.description && (
                          <p className="text-[10px] text-gray-500 italic line-clamp-1 border-t border-white/5 pt-2">
                            {tx.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                           <Badge className={getStatusColor(tx.status) + " text-[8px] px-2 py-0 h-4 border font-bold uppercase tracking-widest"}>
                            {tx.status}
                          </Badge>
                          <span className="text-[8px] text-gray-600 font-bold uppercase">{tx.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic text-center py-4">No recent payments found.</p>
                  )}
                </div>
              </div>

              {/* Membership Status */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <ShieldAlert className="h-20 w-20" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-black italic uppercase">Account Status</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-bold uppercase tracking-widest">Active Member</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">Your profile is fully synchronized with our cloud network.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
