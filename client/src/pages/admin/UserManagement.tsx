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

interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  role: "user";
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  assignedTrainer?: string;
  gymId?: string;
  isPrivate?: boolean;
  isBanned: boolean;
  streak?: number;
  xp?: number;
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-[#4B8B9B]" />
            User Management
          </h1>
          <p className="text-gray-400">Manage and monitor all registered users</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80">
                  Search
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-400 ml-1">Status</span>
                  <Select onValueChange={setIsBannedFilter} defaultValue="all">
                    <SelectTrigger className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Unbanned</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-400 ml-1">Verification</span>
                  <Select onValueChange={setIsVerifiedFilter} defaultValue="all">
                    <SelectTrigger className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white">
                      <SelectValue placeholder="Filter by Verification" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                      <SelectItem value="all">All Verification</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-400 ml-1">Start Date</span>
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-400 ml-1">End Date</span>
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">
              <div className="text-sm text-gray-400">
                Showing {Math.min(currentPage * usersPerPage, total)} of {total} users
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
                <span className="ml-2 text-gray-400">Loading users...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-800 hover:bg-[#1F2A44]/30">
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-sm text-gray-400">XP: {user.xp || 0}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{user.email}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              {user.isBanned ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                                  Banned
                                </span>
                              ) : (
                                <span className="inline-flex text-center px-1 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                                  Active
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <Button
                              variant="outline"
                              onClick={() => handleViewUser(user._id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
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
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
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