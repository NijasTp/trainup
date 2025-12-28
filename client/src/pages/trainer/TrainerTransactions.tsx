import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  RefreshCw,
  Wallet,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    document.title = "TrainUp - Transactions";
    fetchTransactions();
  }, [page, search, statusFilter, planFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
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
      console.log(response.data);
      setTransactions(response.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions");
      toast.error("Failed to load transactions");
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value);
    setPage(1);
  };



  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'premium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'pro':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          <p className="text-muted-foreground font-medium text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <TrainerSiteHeader />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Error</h3>
          <p className="text-muted-foreground text-lg">{error}</p>
          <Button
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={fetchTransactions}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <main className="relative container mx-auto px-4 py-8 space-y-8 flex-1 text-card-foreground">
        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden relative group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-foreground">
              <Wallet className="h-32 w-32" />
            </div>
            <CardContent className="p-8 relative z-10">
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                {formatAmount(transactions.totalRevenue)}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-2 italic">* A 10% platform fee is deducted from all subscriptions.</p>
              <div className="mt-6 flex items-center gap-2 text-primary text-sm bg-primary/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Lifetime Earnings</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg p-6 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{transactions.total} Transactions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Recent Transactions
                </h1>
                <p className="text-sm text-muted-foreground">Manage and track your incoming subscriptions</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-10 h-10 bg-background/50 border-border/50 focus:ring-primary/20"
                  />
                </div>

                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-40 h-10 bg-background/50 border-border/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="completed">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={planFilter} onValueChange={handlePlanFilterChange}>
                  <SelectTrigger className="w-40 h-10 bg-background/50 border-border/50">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {transactions.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-lg">No transactions found</p>
                </div>
              ) : (
                transactions.transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="group bg-transparent hover:bg-accent/5 transition-all duration-300 p-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-inner">
                          <AvatarImage
                            src={(typeof transaction.userId === 'object' && transaction.userId.profileImage) || "/placeholder.svg"}
                            alt={typeof transaction.userId === 'object' ? transaction.userId.name : 'User'}
                          />
                          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                            {typeof transaction.userId === 'object' ? getUserInitials(transaction.userId.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {typeof transaction.userId === 'object' ? transaction.userId.name : 'Unknown User'}
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge className={`${getPlanColor(transaction.planType)} hover:bg-transparent font-medium px-2 py-0 border-[0.5px]`}>
                              {transaction.planType.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 border-l border-border/50 pl-3">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-2xl font-black text-foreground tabular-nums">
                          {formatAmount(transaction.trainerEarnings || transaction.amount)}
                        </div>
                        <div className="text-[10px] text-muted-foreground text-right">
                          (After 10% fee: -{formatAmount(transaction.platformFee || (transaction.amount * 0.1))})
                        </div>
                        <div className="flex items-center gap-2">
                          {transaction.status === 'completed' ? (
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          ) : transaction.status === 'failed' ? (
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                          )}
                          <span className={`text-xs font-bold uppercase tracking-widest ${transaction.status === 'completed' ? 'text-green-500' : transaction.status === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>
                            {transaction.status === 'completed' ? 'Success' : transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pl-[72px] flex items-center gap-6">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        ORDER ID: <span className="text-foreground/70">{transaction.razorpayOrderId}</span>
                      </div>
                      {transaction.razorpayPaymentId && (
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          PAYMENT: <span className="text-foreground/70">{transaction.razorpayPaymentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="bg-muted/30 p-8 border-t border-border/50">
              {transactions.totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-card border-border/50 hover:bg-accent h-10 px-6 rounded-lg font-medium shadow-sm transition-all text-card-foreground"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: transactions.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${page === p ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-card text-muted-foreground hover:bg-accent border border-border/50'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <Badge variant="outline" className="h-8 border-border/50 bg-card text-xs uppercase tracking-widest font-bold">
                      {transactions.total} records
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    disabled={page === transactions.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="bg-card border-border/50 hover:bg-accent h-10 px-6 rounded-lg font-medium shadow-sm transition-all text-card-foreground"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div >
  );
}