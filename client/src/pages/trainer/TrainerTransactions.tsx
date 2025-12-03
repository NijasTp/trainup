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
  RefreshCw
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profileImage?: string;
  } | string;
  amount: number;
  planType: 'basic' | 'premium' | 'pro';
  status: 'pending' | 'completed' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  totalRevenue: number;
}

export default function TrainerTransactions() {
  const [transactions, setTransactions] = useState<TransactionResponse>({
    transactions: [],
    total: 0,
    page: 1,
    totalPages: 1,
    totalRevenue: 0
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <main className="relative container mx-auto px-4 py-12 space-y-8">
       

        {/* Transactions Table */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary" />
                Transaction History
              </h1>
              <Badge variant="secondary" className="text-sm">
                Page {transactions.page} of {transactions.totalPages}
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={handlePlanFilterChange}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {transactions.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-lg">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {search || statusFilter !== 'all' || planFilter !== 'all'
                      ? "Try adjusting your search terms or filters"
                      : "Transactions will appear here when clients subscribe"}
                  </p>
                </div>
              ) : (
                transactions.transactions.map((transaction) => (
                  <Card
                    key={transaction._id}
                    className="bg-background/50 border-border/50 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={(typeof transaction.userId === 'object' && transaction.userId.profileImage) || "/placeholder.svg"}
                              alt={typeof transaction.userId === 'object' ? transaction.userId.name : 'User'}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {typeof transaction.userId === 'object' ? getUserInitials(transaction.userId.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {typeof transaction.userId === 'object' ? transaction.userId.name : 'Unknown User'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {transaction.razorpayOrderId}
                              </p>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {formatDate(transaction.createdAt)}
                                </span>
                              </div>

                              <Badge className={`${getPlanColor(transaction.planType)} font-medium`}>
                                {transaction.planType.charAt(0).toUpperCase() + transaction.planType.slice(1)} Plan
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-foreground">
                            {formatAmount(transaction.amount)}
                          </div>

                          <Badge className={`${getStatusColor(transaction.status)} font-medium`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {transaction.razorpayPaymentId && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            Payment ID: {transaction.razorpayPaymentId}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {transactions.totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border-border/50 hover:bg-primary/5"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Page {transactions.page} of {transactions.totalPages}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {transactions.total} total
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  disabled={page === transactions.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border-border/50 hover:bg-primary/5"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}