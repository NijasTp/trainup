import type React from "react";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "@/services/adminService";
import type { IUser } from "@/interfaces/admin/IUserManagement";

const UserManagement = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isBannedFilter, setIsBannedFilter] = useState<string>("all");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const usersPerPage = 5;
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {

        const { users, total, totalPages } = await getUsers(
          currentPage,
          usersPerPage,
          searchQuery,
          isBannedFilter,
          isVerifiedFilter,
          startDate,
          endDate
        );
        setUsers(users);
        setTotal(total);
        setTotalPages(totalPages);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching users:", {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(err.response?.data?.message || "Failed to fetch users. Please try again.");
        setUsers([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchQuery, isBannedFilter, isVerifiedFilter, startDate, endDate]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      navigate(`/admin/users/${userId}`);
    } catch (err) {
      console.error("Failed to fetch user details", err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage and monitor all registered users</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md transition-all duration-300">
                  Search
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground ml-1">Status</span>
                  <Select onValueChange={setIsBannedFilter} defaultValue="all">
                    <SelectTrigger className="bg-background/50 border-border/50 text-foreground">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50 text-foreground">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Unbanned</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground ml-1">Verification</span>
                  <Select onValueChange={setIsVerifiedFilter} defaultValue="all">
                    <SelectTrigger className="bg-background/50 border-border/50 text-foreground">
                      <SelectValue placeholder="Filter by Verification" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50 text-foreground">
                      <SelectItem value="all">All Verification</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground ml-1">Start Date</span>
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground ml-1">End Date</span>
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-foreground">
              <div className="text-sm text-muted-foreground font-normal">
                Showing {Math.min(currentPage * usersPerPage, total)} of {total} users
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm">Name</th>
                        <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm">Email</th>
                        <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm">Status</th>
                        <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm">Joined</th>
                        <th className="text-left py-4 px-6 text-muted-foreground font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-foreground font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">XP: {user.xp || 0}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">{user.email}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1 items-start">
                              {user.isBanned ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                  Banned
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                                  Active
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUser(user._id)}
                              className="flex items-center gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-border/40">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;