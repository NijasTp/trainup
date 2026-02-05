import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, Filter, Calendar, User, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import Aurora from "@/components/ui/Aurora";

import type { Transaction } from "@/interfaces/user/IUserTransactions";


export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    document.title = "TrainUp - Transaction History";
    fetchTransactions();
  }, [currentPage, searchQuery, statusFilter, sortBy]);

  async function fetchTransactions() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sort: sortBy
      });

      const response = await API.get(`/payment/transactions?${params}`);
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: unknown) {
      console.error("Failed to fetch transactions:", err);
      const errorMessage = err instanceof Error ? (err as any).response?.data?.error || err.message : "Failed to load transactions";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

  const getTotalAmount = () => {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#020617", "#0f172a", "#020617"]}
          amplitude={1.1}
          blend={0.6}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
      </div>
      <SiteHeader />

      <main className="relative container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Transaction History</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Payment History
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track all your subscription payments and transaction details
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                ₹{getTotalAmount().toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {transactions.filter(t => t.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Successful Payments</p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {transactions.filter(t => t.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by trainer name or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-transparent border-border/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-transparent border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                  <SelectItem value="amount_low">Amount: Low to High</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Transactions ({transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground font-medium">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground/70 mt-2">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction._id} className="bg-muted/20 border-border/30 hover:bg-muted/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
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
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground text-lg">
                              {transaction.trainerId?.name || 'Trainer Subscription'}
                            </p>
                            <p className="text-muted-foreground">
                              {transaction.months} month{transaction.months > 1 ? 's' : ''} subscription
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(transaction.createdAt)}
                              </div>
                              {transaction.razorpayPaymentId && (
                                <div className="text-xs font-mono">
                                  ID: {transaction.razorpayPaymentId.slice(0, 10)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-foreground">
                            ₹{transaction.amount.toLocaleString()}
                          </div>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-transparent"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}