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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

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
  const [confirmBan, setConfirmBan] = useState<{ id: string, status: boolean, name: string } | null>(null);
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
      } catch (error: unknown) {
        const err = error as any;
        console.error("Error fetching trainers:", {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(err.response?.data?.message || "Failed to fetch trainers. Please try again.");
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

  const handleBanToggle = async (trainerId: string, currentBanStatus: boolean, trainerName: string) => {
    if (!confirmBan) {
      setConfirmBan({ id: trainerId, status: currentBanStatus, name: trainerName });
      return;
    }

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
      toast.success(`Trainer ${trainerName} ${!currentBanStatus ? 'banned' : 'unbanned'} successfully`);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error updating trainer ban status:", error);
      toast.error(error.response?.data?.message || "Failed to update ban status.");
    } finally {
      setActionLoading(null);
      setConfirmBan(null);
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
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <UserCheck className="mr-3 h-8 w-8 text-primary" />
            Trainer Management
          </h1>
          <p className="text-muted-foreground">Manage and monitor all registered trainers</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search trainers by name, email, or specialization..."
                    value={searchInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
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
                      <SelectItem value="all">All Status</SelectItem>
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
                      <SelectItem value="unverified">Pending</SelectItem>
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

        {/* Trainers Table */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-foreground">
              Trainers ({response.trainers.length} of {response.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading trainers...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
              </div>
            ) : response.trainers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No trainers found</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left py-4 px-4 text-muted-foreground font-medium w-[35%] text-sm">Trainer Details</th>
                        <th className="text-left py-4 px-4 text-muted-foreground font-medium w-[20%] text-sm">Expertise</th>
                        <th className="text-left py-4 px-4 text-muted-foreground font-medium w-[15%] text-sm">Stats</th>
                        <th className="text-left py-4 px-4 text-muted-foreground font-medium w-[15%] text-sm">Status</th>
                        <th className="text-right py-4 px-4 text-muted-foreground font-medium w-[15%] text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.trainers.map((trainer) => (
                        <tr key={trainer._id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12 border border-border/50">
                                <AvatarImage src={trainer.profileImage} alt={trainer.name} />
                                <AvatarFallback className="bg-background text-primary">
                                  {trainer.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <p className="text-foreground font-medium leading-none">{trainer.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {trainer.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {trainer.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                {trainer.specialization}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{trainer.experience} Experience</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                {trainer.rating.toFixed(1)}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {trainer.clients.length} Clients
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-2 items-start">
                              {trainer.isBanned ? (
                                <Badge className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20">
                                  Banned
                                </Badge>
                              ) : (
                                <Badge className={`border-0 ${trainer.profileStatus === 'approved'
                                  ? "bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20"
                                  : trainer.profileStatus === 'pending'
                                    ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
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
                                onClick={() => handleBanToggle(trainer._id, trainer.isBanned, trainer.name)}
                                disabled={actionLoading === trainer._id}
                                className={`h-8 w-8 ${trainer.isBanned ? "text-green-600 hover:text-green-500 hover:bg-green-500/10" : "text-destructive hover:text-destructive/80 hover:bg-destructive/10"}`}
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
                                  className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                                  title="View Application"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTrainer(trainer._id)}
                                className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
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
                  <div className="flex items-center justify-between p-4 border-t border-border/40">
                    <div className="text-sm text-muted-foreground">
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

        {/* Ban Confirmation Modal */}
        <Dialog open={!!confirmBan} onOpenChange={() => setConfirmBan(null)}>
          <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center">
                {confirmBan?.status ? (
                  <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <Ban className="h-5 w-5 mr-2 text-red-500" />
                )}
                {confirmBan?.status ? 'Unban Trainer' : 'Ban Trainer'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to {confirmBan?.status ? 'unban' : 'ban'} <strong>{confirmBan?.name}</strong>?
                {!confirmBan?.status && " This will restrict their access to the platform."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmBan(null)}
                className="text-gray-400 border-gray-600 hover:bg-gray-700/50"
              >
                Cancel
              </Button>
              <Button
                variant={confirmBan?.status ? "default" : "destructive"}
                onClick={() => confirmBan && handleBanToggle(confirmBan.id, confirmBan.status, confirmBan.name)}
                disabled={!!actionLoading}
                className={confirmBan?.status ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Confirm {confirmBan?.status ? 'Unban' : 'Ban'}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TrainerManagement;