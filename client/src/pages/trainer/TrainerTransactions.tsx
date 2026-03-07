import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard,
  Search,
  Calendar,
  Filter,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import { cn } from "@/lib/utils";
import type { TransactionResponse } from "@/interfaces/trainer/ITrainerTransactions";

export default function TrainerTransactions() {
  const [transactions, setTransactions] = useState<TransactionResponse>({
    transactions: [],
    page: 1,
    totalPages: 1,
    totalRevenue: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    document.title = "TrainUp - Synergy Ledgers";
    fetchTransactions();
  }, [page, search, statusFilter, planFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/trainer/transactions", {
        params: {
          page,
          limit,
          search,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          planType: planFilter !== 'all' ? planFilter : undefined
        },
      });
      setTransactions(response.data);
    } catch (err: any) {
      toast.error("Failed to calibrate ledger records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'basic': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'premium': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'pro': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getUserInitials = (name: string) => {
    return name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  return (
    <TrainerLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
              <CreditCard className="w-10 h-10 text-cyan-500" /> Synergy <span className="text-cyan-400">Ledger</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
              Financial Architecture & Protocol Archives
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-white/5 border-white/10 text-gray-400 hover:text-white rounded-2xl h-14 px-8 font-black italic uppercase text-xs">
              <Download size={16} className="mr-2" /> Export Protocol
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={160} className="text-cyan-400" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 bg-cyan-500/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                <TrendingUp size={12} /> Total Revenue
              </div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter">
                {formatAmount(transactions.totalRevenue)}
              </h2>
              <p className="text-[9px] text-gray-500 font-black uppercase italic tracking-widest">* Includes Automated Payout Nodes</p>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight size={32} />
            </div>
            <div>
              <p className="text-4xl font-black text-white italic tracking-tighter">{transactions.total}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Subscription Cycles</p>
            </div>
          </Card>

          <Card className="hidden lg:flex bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Calendar size={32} />
            </div>
            <div>
              <p className="text-lg font-black text-white italic uppercase tracking-tighter">Active Matrix</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic tracking-widest">Temporal Sync Enabled</p>
            </div>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <Input
                placeholder="PROBE USER IDENTITY..."
                value={search}
                onChange={handleSearchChange}
                className="bg-black/40 border-white/10 h-16 pl-16 rounded-2xl text-white font-black italic uppercase text-xs focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-48 bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-[10px] focus:ring-1 focus:ring-cyan-500/50">
                  <Filter size={14} className="mr-2 text-cyan-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="all">ALL DEPLOYMENTS</SelectItem>
                  <SelectItem value="completed">SUCCESS</SelectItem>
                  <SelectItem value="failed">FAILED</SelectItem>
                  <SelectItem value="pending">PENDING</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
                <SelectTrigger className="w-48 bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-[10px] focus:ring-1 focus:ring-cyan-500/50">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="all">ALL PROTOCOLS</SelectItem>
                  <SelectItem value="basic">BASIC</SelectItem>
                  <SelectItem value="premium">PREMIUM</SelectItem>
                  <SelectItem value="pro">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Records Table-ish List */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[3rem] overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Syncing Ledger Nodes...</p>
              </div>
            ) : transactions.transactions.length === 0 ? (
              <div className="p-40 text-center space-y-4">
                <CreditCard className="mx-auto h-16 w-16 text-gray-800" />
                <p className="text-gray-500 font-black italic uppercase tracking-widest text-xs">No Synergy Records Initialized</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {transactions.transactions.map((tx: any) => (
                  <div key={tx._id} className="p-10 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                    <div className="flex items-center gap-8">
                      <Avatar className="h-16 w-16 border-2 border-white/10 group-hover:border-cyan-500/50 transition-all shadow-2xl">
                        <AvatarImage src={tx.userId?.profileImage} className="object-cover" />
                        <AvatarFallback className="bg-white/5 text-gray-500 font-black italic text-xl">
                          {getUserInitials(tx.userId?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                          {tx.userId?.name || "Unknown Operative"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                          <Badge className={cn("px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest italic border", getPlanColor(tx.planType))}>
                            {tx.planType} Protocol
                          </Badge>
                          <span className="text-[10px] text-gray-600 font-black italic uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={12} className="text-gray-700" /> {formatDate(tx.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                      <div className="text-3xl font-black text-white italic tracking-tighter tabular-nums underline decoration-cyan-500/20 underline-offset-8">
                        {formatAmount(tx.trainerEarnings || tx.amount)}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          tx.status === 'completed' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] italic",
                          tx.status === 'completed' ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">RID: {tx.razorpayOrderId?.slice(-12)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {transactions.totalPages > 1 && (
            <div className="p-10 border-t border-white/5 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <Button
                variant="ghost"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-14 px-8 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-2xl font-black italic uppercase text-xs disabled:opacity-20"
              >
                <ChevronLeft size={16} className="mr-2" /> Previous Shift
              </Button>

              <div className="flex items-center gap-3">
                {Array.from({ length: transactions.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-12 h-12 rounded-xl text-xs font-black italic transition-all",
                      page === p ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-110" : "bg-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                disabled={page === transactions.totalPages}
                onClick={() => setPage(page + 1)}
                className="h-14 px-8 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-2xl font-black italic uppercase text-xs disabled:opacity-20"
              >
                Next Shift <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </TrainerLayout>
  );
}
