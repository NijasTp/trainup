import type React from "react";
import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, UserCheck, Ban, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTrainerApplication, getTrainerById, getTrainers, toggleTrainerBan } from "@/services/adminService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { ITrainer, TrainerResponse } from "@/interfaces/admin/adminTrainerManagement";



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
        console.log('trainers:',res)
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
    try {
      const res = await getTrainerById(trainerId);
      const trainer = res as ITrainer;
      navigate(`/admin/trainers/${trainerId}`, { state: { trainer } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching trainer details:", error);
      setError(error.response?.data?.message || "Failed to fetch trainer details.");
    }
  };

  const handleViewApplication = async (trainerId: string) => {
    try {
      const res = await getTrainerApplication(trainerId);
      const application = res;
      navigate(`/admin/trainers/${trainerId}/application`, { state: { application } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching trainer application:", error);
      setError(error.response?.data?.message || "Failed to fetch application.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
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
                <Select onValueChange={setIsBannedFilter} defaultValue="all">
                  <SelectTrigger className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                    <SelectItem value="all">All </SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={setIsVerifiedFilter} defaultValue="all">
                  <SelectTrigger className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white">
                    <SelectValue placeholder="Filter by Verification" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                />
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Specialization</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Experience</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Clients</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Rating</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.trainers.map((trainer) => (
                        <tr key={trainer._id} className="border-b border-gray-800 hover:bg-[#1F2A44]/30">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={trainer.profileImage || "/placeholder.svg"}
                                alt={trainer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-white font-medium">{trainer.name}</p>
                                <p className="text-sm text-gray-400">{trainer.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{trainer.email}</td>
                          <td className="py-4 px-4 text-gray-300">{trainer.phone}</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4B8B9B]/20 text-[#4B8B9B]">
                              {trainer.specialization}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{trainer.experience}</td>
                          <td className="py-4 px-4 text-gray-300">{trainer.clients.length}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span className="text-white">{trainer.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trainer.profileStatus == 'approved'
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-yellow-900/30 text-yellow-400"
                                  }`}
                              >
                                {trainer.profileStatus == 'approved' ? "Verified" : "Unverified"}
                              </span>
                              {trainer.isBanned && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                                  Banned
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trainer.profileStatus === "active"
                                    ? "bg-green-900/30 text-green-400"
                                    : trainer.profileStatus === "pending"
                                      ? "bg-yellow-900/30 text-yellow-400"
                                      : trainer.profileStatus === "approved"
                                        ? "bg-blue-900/30 text-blue-400"
                                        : trainer.profileStatus === "rejected"
                                          ? "bg-red-900/30 text-red-400"
                                          : "bg-gray-900/30 text-gray-400"
                                  }`}
                              >
                                {trainer.profileStatus}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                onClick={() => {handleBanToggle(trainer._id, trainer.isBanned)
                                trainer.isBanned = !trainer.isBanned 
                                }}
                                disabled={actionLoading === trainer._id}
                                className="flex items-center gap-1 text-xs px-2 py-1"
                              >
                                {actionLoading === trainer._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Ban className="h-3 w-3" />
                                )}
                                {trainer.isBanned ? "Unban" : "Ban"}
                              </Button>
                              {trainer.profileStatus !== 'approved' && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleViewApplication(trainer._id)}
                                  className="flex items-center gap-1 text-xs px-2 py-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  App
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                onClick={() => handleViewTrainer(trainer._id)}
                                className="flex items-center gap-1 text-xs px-2 py-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
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
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
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