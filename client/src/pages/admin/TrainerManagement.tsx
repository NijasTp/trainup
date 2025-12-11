import type React from "react";
import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, UserCheck, Ban, FileText, Star, Users, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTrainerApplication, getTrainerById, getTrainers, toggleTrainerBan } from "@/services/adminService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { ITrainer, TrainerResponse } from "@/interfaces/admin/adminTrainerManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

const TrainerManagement = () => {
  const [response, setResponse] = useState<TrainerResponse>({ trainers: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isBannedFilter, setIsBannedFilter] = useState<string>("all");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const trainersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const res = await getTrainers(
          currentPage,
          trainersPerPage,
          searchQuery,
          isBannedFilter,
          isVerifiedFilter,
          startDate,
          endDate
        );
        setResponse(res as TrainerResponse);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching trainers:", {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError(error.response?.data?.message || "Failed to fetch trainers. Please try again.");
        setResponse({ trainers: [], total: 0, page: 1, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
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

  const handleBanToggle = async (trainerId: string, currentBanStatus: boolean) => {
    setActionLoading(trainerId);
    try {
      await toggleTrainerBan(trainerId, !currentBanStatus);
      // Optimistic update
      setResponse(prev => ({
        ...prev,
        trainers: prev.trainers.map(t =>
          t._id === trainerId ? { ...t, isBanned: !currentBanStatus } : t
        )
      }));
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error updating trainer ban status:", error);
      setError(error.response?.data?.message || "Failed to update ban status.");
    } finally {
      setActionLoading(null);
    }
  };



  const handleViewTrainer = async (trainerId: string) => {
    if (!trainerId) {
      console.error("Trainer ID is undefined");
      return;
    }
    try {
      const res = await getTrainerById(trainerId);
      const trainer = res as ITrainer;
      navigate(ROUTES.ADMIN_TRAINER_DETAILS.replace(':trainerId', trainerId), { state: { trainer } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching trainer details:", error);
      setError(error.response?.data?.message || "Failed to fetch trainer details.");
    }
  };

  const handleViewApplication = async (trainerId: string) => {
    if (!trainerId) {
      console.error("Trainer ID is undefined");
      return;
    }
    try {
      const res = await getTrainerApplication(trainerId);
      const application = res;
      navigate(ROUTES.ADMIN_TRAINER_APPLICATION.replace(':trainerId', trainerId), { state: { application } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching trainer application:", error);
      setError(error.response?.data?.message || "Failed to fetch application.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <UserCheck className="mr-3 h-8 w-8 text-[#4B8B9B]" />
            Trainer Management
          </h1>
          <p className="text-gray-400">Manage and monitor all registered trainers</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                  <Input
                    placeholder="Search trainers by name, email, or specialization..."
                    value={searchInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
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
                      <SelectItem value="all">All Status</SelectItem>
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
                      <SelectItem value="unverified">Pending</SelectItem>
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

        {/* Trainers Table */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">
              Trainers ({response.trainers.length} of {response.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
                <span className="ml-2 text-gray-400">Loading trainers...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : response.trainers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No trainers found</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-4 px-4 text-gray-400 font-medium w-[35%]">Trainer Details</th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium w-[20%]">Expertise</th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium w-[15%]">Stats</th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium w-[15%]">Status</th>
                        <th className="text-right py-4 px-4 text-gray-400 font-medium w-[15%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.trainers.map((trainer) => (
                        <tr key={trainer._id} className="border-b border-gray-800 hover:bg-[#1F2A44]/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12 border border-gray-700">
                                <AvatarImage src={trainer.profileImage} alt={trainer.name} />
                                <AvatarFallback className="bg-[#1F2A44] text-[#4B8B9B]">
                                  {trainer.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <p className="text-white font-medium leading-none">{trainer.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Mail className="h-3 w-3" />
                                  {trainer.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {trainer.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-2">
                              <Badge variant="secondary" className="bg-[#4B8B9B]/10 text-[#4B8B9B] hover:bg-[#4B8B9B]/20 border-0">
                                {trainer.specialization}
                              </Badge>
                              <p className="text-xs text-gray-400">{trainer.experience} Experience</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                {trainer.rating.toFixed(1)}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Users className="h-3.5 w-3.5" />
                                {trainer.clients.length} Clients
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-2 items-start">
                              {trainer.isBanned ? (
                                <Badge className="bg-red-900/40 text-red-400 border-0 hover:bg-red-900/60">
                                  Banned
                                </Badge>
                              ) : (
                                <Badge className={`border-0 ${trainer.profileStatus === 'approved'
                                  ? "bg-green-900/40 text-green-400 hover:bg-green-900/60"
                                  : trainer.profileStatus === 'pending'
                                    ? "bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/60"
                                    : "bg-red-900/40 text-red-400 hover:bg-red-900/60"
                                  }`}>
                                  {trainer.profileStatus === 'approved' ? 'Verified' :
                                    trainer.profileStatus.charAt(0).toUpperCase() + trainer.profileStatus.slice(1)}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBanToggle(trainer._id, trainer.isBanned)}
                                disabled={actionLoading === trainer._id}
                                className={`h-8 w-8 ${trainer.isBanned ? "text-green-400 hover:text-green-300 hover:bg-green-900/20" : "text-red-400 hover:text-red-300 hover:bg-red-900/20"}`}
                                title={trainer.isBanned ? "Unban Trainer" : "Ban Trainer"}
                              >
                                {actionLoading === trainer._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </Button>

                              {trainer.profileStatus !== 'approved' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewApplication(trainer._id)}
                                  className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                  title="View Application"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTrainer(trainer._id)}
                                className="h-8 w-8 text-[#4B8B9B] hover:text-[#4B8B9B]/80 hover:bg-[#4B8B9B]/10"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {response.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {response.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === response.totalPages}
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

export default TrainerManagement;