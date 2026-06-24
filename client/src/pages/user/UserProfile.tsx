import { useEffect, useState } from "react";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<SafeAny[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const navigate = useNavigate();

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
      case 'completed': return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40';
      case 'failed': return 'bg-red-950/30 text-red-400 border-red-900/40';
      case 'pending': return 'bg-amber-950/30 text-amber-400 border-amber-900/40';
      default: return 'bg-neutral-900 text-neutral-400 border-[#262626]';
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
    <div className="group relative duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 flex flex-col justify-between gap-3 h-32">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#0d0d0e] border border-[#262626] rounded-lg text-[#22d3ee]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{title}</h4>
        <p className="text-base font-extrabold font-mono text-white uppercase">{value || "Not specified"}</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-6 py-12 space-y-10 flex-1 z-10 max-w-5xl w-full">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-8 md:p-10 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-2 border-[#262626] overflow-hidden bg-[#0d0d0e]">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-700">
                    <User className="h-10 w-10" />
                  </div>
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-[#171717] rounded-lg px-2.5 py-1 border-2 border-[#262626] flex items-center gap-1.5 shadow-md"
              >
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-wider">{profile?.streak || 0} DAY STREAK</span>
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-extrabold font-mono text-white uppercase tracking-tight">
                {profile?.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-cyan-500/5 text-[#22d3ee] border border-[#22d3ee]/20 py-0.5 px-2.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  FITNESS ENTHUSIAST
                </span>
                <span className="bg-neutral-800 text-neutral-400 border border-[#262626] py-0.5 px-2.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  XP: {profile?.xp || 0}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="duo-btn-cyan h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider w-full md:w-auto"
          >
            Edit Profile
          </button>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
            <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing credentials...</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Left Column: Metrics & Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard icon={Activity} title="Activity Level" value={profile.activityLevel} label="FITNESS" />
                <MetricCard icon={Target} title="Primary Goal" value={profile.goals![0] || 'Not specified'} label="TARGET" />
                <MetricCard icon={Ruler} title="Height" value={profile.height ? `${profile.height} cm` : null} label="BODY" />
                <MetricCard icon={Scale} title="Current Weight" value={profile.weight ? `${profile.weight} kg` : null} label="BODY" />
              </div>

              {/* Health & Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-red-400" /> MEDICAL STATUS
                  </h3>
                  <p className="text-xs font-mono font-bold text-neutral-300">
                    {profile.medicalConditions === "haven't given" || !profile.medicalConditions ? "No medical details shared yet." : profile.medicalConditions}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Utensils className="h-4 w-4 text-emerald-400" /> DIETARY PROFILE
                  </h3>
                  <p className="text-xs font-mono font-bold text-neutral-300">
                    {profile.dietaryPreferences === "haven't given" || !profile.dietaryPreferences ? "No dietary preferences listed." : profile.dietaryPreferences}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Info & Transactions */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">Contact Details</h3>
                <div className="space-y-3 font-mono">
                  <div className="flex items-center gap-3 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                    <Mail className="h-4 w-4 text-[#22d3ee]" />
                    <div className="overflow-hidden">
                      <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Email</p>
                      <p className="text-xs font-bold truncate text-white">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                    <Phone className="h-4 w-4 text-[#22d3ee]" />
                    <div>
                      <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Phone</p>
                      <p className="text-xs font-bold text-white">{profile.phone || "Not linked"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Subscriptions */}
              <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">Subscriptions</h3>
                  <button 
                    onClick={() => navigate('/my-subscriptions')} 
                    className="text-[#22d3ee] hover:text-[#67e8f9] font-mono font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer border-0 bg-transparent p-0 flex items-center"
                  >
                    MANAGE <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
                
                <div className="space-y-3 font-mono text-xs">
                  {profile && profile.activeSubscriptions && profile.activeSubscriptions.length > 0 ? (
                    profile.activeSubscriptions.map((sub: SafeAny, idx: number) => (
                      <div key={idx} className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white uppercase text-[10px] truncate max-w-[120px]">
                            {sub.subscriptionType === 'gym' ? (sub.gymId?.name || 'Gym') : (sub.trainerId?.name || 'Trainer')}
                          </span>
                          <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-neutral-500 font-bold uppercase">
                          <span>{sub.planId?.name || sub.planType || 'Premium'} PLAN</span>
                          <span>EXP: {formatDate(sub.expiryDate || sub.endDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center bg-[#0d0d0e] rounded-xl border border-[#262626] space-y-2">
                      <p className="text-[10px] text-neutral-500 italic uppercase">No active schedules</p>
                      <button 
                        onClick={() => navigate('/trainers')} 
                        className="text-[#22d3ee] text-[9px] uppercase font-bold tracking-wider cursor-pointer bg-transparent border-0"
                      >
                        BROWSE PLANS
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">Payments Log</h3>
                  <button 
                    onClick={() => navigate('/transactions')} 
                    className="text-[#22d3ee] hover:text-[#67e8f9] font-mono font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer border-0 bg-transparent p-0 flex items-center"
                  >
                    VIEW ALL <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
                
                <div className="space-y-3 font-mono text-xs">
                  {isTransactionsLoading ? (
                    <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx: SafeAny) => (
                      <div key={tx._id} className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase truncate w-24">
                              {tx.type === 'gym' ? (tx.gymId?.name || "Gym Plan") : (tx.trainerId?.name || "Trainer Plan")}
                            </span>
                            <span className="text-[8px] text-neutral-500">{formatDate(tx.createdAt)}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-white text-xs">₹{tx.amount}</p>
                            <span className={cn(
                              "text-[8px] font-bold uppercase",
                              tx.transactionType === 'credit' ? "text-emerald-400" : "text-red-400"
                            )}>
                              {tx.transactionType || 'DEBIT'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-[#1f1f1f]">
                          <span className={cn(getStatusColor(tx.status), "text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase")}>
                            {tx.status}
                          </span>
                          <span className="text-[8px] text-neutral-500 font-bold uppercase">{tx.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-neutral-500 italic text-center py-4 uppercase">No transactions</p>
                  )}
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
