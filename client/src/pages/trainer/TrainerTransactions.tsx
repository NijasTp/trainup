import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Users
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface Transaction {
  _id: string;
  userId: string | { _id: string; name: string; profileImage?: string };
  trainerId: string;
  amount: number;
  months: number;
  status: 'pending' | 'completed' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

export default function TrainerTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const limit = 10;

  // Stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedTransactions: 0,
    pendingTransactions: 0
  });

  useEffect(() => {
    document.title = "TrainUp - Transactions";
    fetchTransactions();
  }, [currentPage, search, statusFilter, sortBy]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search,
        status: statusFilter,
        sort: sortBy
      });

      const response = await API.get(`/trainer/dashboard/transactions?${params}`);
      console.log("Transactions response:", response.data);

      // Process transactions to handle userId as string or object
      const processedTransactions = await Promise.all(
        response.data.transactions.map(async (transaction: Transaction) => {
          if (typeof transaction.userId === 'string') {
            try {
              const userResponse = await API.get(`/user/${transaction.userId}`);
              return {
                ...transaction,
                userId: {
                  _id: transaction.userId,
                  name: userResponse.data.user.name || 'Unknown User',
                  profileImage: userResponse.data.user.profileImage
                }
              };
            } catch (error) {
              console.error(`Failed to fetch user ${transaction.userId}:`, error);
              return {
                ...transaction,
                userId: {
                  _id: transaction.userId,
                  name: 'Unknown User',
                  profileImage: undefined
                }
              };
            }
          }
          return transaction;
        })
      );

      setTransactions(processedTransactions);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);

      const completed = processedTransactions.filter((t) => t.status === 'completed');
      const pending = processedTransactions.filter((t) => t.status === 'pending');

      const totalEarnings = completed.reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = completed
        .filter((t) => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      setStats({
        totalEarnings,
        monthlyEarnings,
        completedTransactions: completed.length,
        pendingTransactions: pending.length
      });

    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

        <TrainerSiteHeader/>
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/trainer/dashboard">
              <Button variant="ghost" className="group hover:bg-primary/5 transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.monthlyEarnings}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTransactions}</div>
              <p className="text-xs text-muted-foreground">Successful payments</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by client name or transaction ID..."
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
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
                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                  <SelectItem value="amount_low">Amount: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Transaction History ({total} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  {search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Transactions will appear here once clients start paying.'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/30">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={typeof transaction.userId === 'string' ? '/placeholder.svg' : (transaction.userId.profileImage || '/placeholder.svg')}
                            alt={typeof transaction.userId === 'string' ? 'Unknown User' : transaction.userId.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getClientInitials(typeof transaction.userId === 'string' ? 'Unknown User' : transaction.userId.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {typeof transaction.userId === 'string' ? 'Unknown User' : transaction.userId.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.months} month{transaction.months > 1 ? 's' : ''} subscription
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Order ID: {transaction.razorpayOrderId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg text-foreground">₹{transaction.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="border-border/50 hover:bg-primary/5"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {total} total
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="border-border/50 hover:bg-primary/5"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}