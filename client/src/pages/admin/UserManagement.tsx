import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, Calendar, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "@/services/adminService";
import type { IUser } from "@/interfaces/admin/IUserManagement";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

const UserManagement = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isBannedFilter, setIsBannedFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
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
          undefined,
          startDate,
          undefined
        );
        setUsers(users);
        setTotal(total);
        setTotalPages(totalPages);
      } catch (err: any) {
        setUsers([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchQuery, isBannedFilter, startDate]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white italic">USER MANAGEMENT</h1>
            <p className="text-gray-500">Total {total} users registered in the system</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
              <Input
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white outline-none focus:ring-0"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={isBannedFilter}
                onChange={(e) => setIsBannedFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="all" className="bg-[#1a1a1a]">All Status</option>
                <option value="active" className="bg-[#1a1a1a]">Active</option>
                <option value="banned" className="bg-[#1a1a1a]">Banned</option>
              </select>
              <div className="relative hidden lg:block">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-300 outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleSearch}
                className="p-3 bg-primary text-black rounded-xl hover:bg-primary/90 transition-all font-bold text-xs px-6"
              >
                FILTER
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-zinc-500 font-bold animate-pulse tracking-widest">LOADING USERS...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <UserX className="text-zinc-700" size={60} />
                <p className="text-zinc-500 font-bold">NO USERS FOUND</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Contact</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Joined</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-lg overflow-hidden shrink-0">
                            {user.profileImage ? (
                              <img src={user.profileImage} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-500 font-black tracking-widest">XP: {user.xp || 0}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-400 font-medium">{user.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={`${user.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'} border-0 font-black text-[10px]`}>
                          {user.isBanned ? "BANNED" : "ACTIVE"}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-gray-700" />
                          {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center ml-auto opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-500 font-bold">
                PAGE {currentPage} OF {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold group"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
