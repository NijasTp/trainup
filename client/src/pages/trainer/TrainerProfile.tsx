import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  Users,
  User,
  Wallet,
  Settings as SettingsIcon,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  CreditCard
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import type { TrainerProfile } from "@/interfaces/trainer/ITrainerProfile";
import type { TransactionResponse } from "@/interfaces/trainer/ITrainerTransactions";

export default function TrainerProfile() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TrainUp - My Hub";
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "transactions" && !transactions) {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const response = await API.get("/trainer/get-details");
      setProfile(response.data.trainer);
    } catch (err: any) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await API.get("/trainer/transactions", { params: { limit: 10 } });
      setTransactions(response.data);
    } catch (err: any) {
      toast.error("Failed to load records");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-white/5 text-gray-500 border-white/10';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (isLoading || !profile) {
    return (
      <TrainerLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-tighter text-gray-500 italic">Accessing Profile Data...</p>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        {/* Header Hero Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <Card className="relative bg-black/40 backdrop-blur-3xl border-white/5 rounded-[3rem] overflow-hidden shadow-3xl">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
                  <Avatar className="h-48 w-48 border-4 border-white/10 group-hover:border-white/20 transition-all ring-offset-black">
                    <AvatarImage src={profile.profileImage} className="object-cover" />
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-4xl italic font-black">
                      {profile.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    onClick={() => navigate("/trainer/edit-profile")}
                    className="absolute bottom-4 right-4 h-12 w-12 rounded-2xl bg-white text-black hover:bg-cyan-500 hover:text-white transition-all shadow-xl"
                  >
                    <Star className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                      <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">{profile.name}</h1>
                      <Badge className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic border shadow-lg", getStatusColor(profile.profileStatus))}>
                        {profile.profileStatus}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xl font-bold italic uppercase tracking-tight">{profile.specialization}</p>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-12">
                    <div className="space-y-1 text-center lg:text-left">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Rating Index</p>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-cyan-400 fill-current" />
                        <span className="text-2xl font-black text-white italic">{profile.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-center lg:text-left">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Personnel Pool</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <span className="text-2xl font-black text-white italic">{profile.clients.length} Clients</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-center lg:text-left">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">Experience Core</p>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-cyan-400" />
                        <span className="text-2xl font-black text-white italic">{profile.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="bg-white/5 border border-white/10 p-2 h-16 rounded-3xl gap-2 w-full lg:w-auto">
            <TabsTrigger value="overview" className="flex-1 lg:flex-none px-10 rounded-2xl font-black italic uppercase text-xs">
              <User className="h-4 w-4 mr-2" /> Identity
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 lg:flex-none px-10 rounded-2xl font-black italic uppercase text-xs">
              <Wallet className="h-4 w-4 mr-2" /> Ledgers
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 lg:flex-none px-10 rounded-2xl font-black italic uppercase text-xs">
              <SettingsIcon className="h-4 w-4 mr-2" /> Global Config
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-10"
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-10 space-y-10">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter border-l-4 border-cyan-500 pl-4">Connection Nodes</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Satellite Link</p>
                          <p className="text-white font-black italic">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <Phone className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Voice Protocol</p>
                          <p className="text-white font-black italic">{profile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Coordinates</p>
                          <p className="text-white font-black italic">{profile.location || "UNTRACKED"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-10 space-y-10">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter border-l-4 border-cyan-500 pl-4">Directive Bio</h3>
                    <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 min-h-[280px]">
                      <p className="text-gray-400 font-bold italic leading-relaxed text-sm">
                        {profile.bio || "INITIALIZING BIOGRAPHIC DATA..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="transactions">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Revenue Overview Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                      <Wallet className="h-40 w-40 text-cyan-400" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3 bg-cyan-500/10 w-fit px-4 py-1 rounded-full text-cyan-400 shadow-xl border border-cyan-500/20">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Gross Synergy</span>
                      </div>
                      <h4 className="text-5xl font-black text-white italic tracking-tighter">
                        {transactions ? formatAmount(transactions.totalRevenue) : "₹0.00"}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">* Includes 10% Protocol Fee</p>
                    </div>
                  </Card>
                  <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <ArrowUpRight className="h-8 w-8" />
                      </div>
                      <div>
                        <h5 className="text-3xl font-black text-white italic tracking-tighter">{transactions?.total || 0}</h5>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Subscription Nodes Activated</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Transactions List */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[3rem] overflow-hidden">
                  <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                      <CreditCard className="text-cyan-400" /> Recent Synergies
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/trainer/transactions")}
                      className="border-white/5 text-gray-500 font-black italic uppercase text-[10px] hover:bg-white/5 px-6 rounded-xl"
                    >
                      Audit Full Ledger <ChevronRight size={14} className="ml-2" />
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                      {!transactions || transactions.transactions.length === 0 ? (
                        <div className="p-20 text-center text-gray-600 font-black uppercase italic tracking-[0.3em] text-[10px]">
                          Archive Empty / No Recorded Subscriptions
                        </div>
                      ) : (
                        transactions.transactions.map((tx: any, idx) => (
                          <div key={idx} className="p-8 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                              <Avatar className="h-14 w-14 border border-white/10 group-hover:border-cyan-500/50 transition-all">
                                <AvatarImage src={tx.userId?.profileImage} className="object-cover" />
                                <AvatarFallback className="bg-white/5 text-gray-500 text-xs italic font-black uppercase">
                                  {tx.userId?.name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h6 className="text-white font-black italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                                  {tx.userId?.name || "Anonymous Operative"}
                                </h6>
                                <div className="flex items-center gap-3 mt-1">
                                  <Badge className="bg-white/5 text-gray-500 border-white/10 text-[8px] font-black uppercase italic tracking-widest">
                                    {tx.planType} PROTOCOL
                                  </Badge>
                                  <span className="text-[9px] text-gray-600 font-black uppercase italic">
                                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-xl font-black text-white italic tracking-tighter">
                                {formatAmount(tx.trainerEarnings || tx.amount)}
                              </p>
                              <p className={cn(
                                "text-[9px] font-black uppercase tracking-widest italic",
                                tx.status === 'completed' ? "text-emerald-500" : "text-amber-500"
                              )}>
                                {tx.status}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-10"
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-10 hover:bg-white/[0.08] cursor-pointer transition-all border-dashed border-2 group" onClick={() => navigate("/trainer/settings")}>
                  <div className="space-y-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                      <SettingsIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">System Parameters</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic mt-2">Adjust core account settings & preferences</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-10 hover:bg-rose-500/10 cursor-pointer transition-all border-dashed border-2 group border-white/10">
                  <div className="space-y-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Withdrawal Matrix</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic mt-2">Manage payout nodes & financial architecture</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </TrainerLayout>
  );
}
