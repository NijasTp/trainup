import React, { useState, useEffect, type ChangeEvent } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, UserCheck, Ban, FileText, Star, Mail, Phone, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTrainerApplication, getTrainerById, getTrainers, toggleTrainerBan } from "@/services/adminService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { ITrainer, TrainerResponse } from "@/interfaces/admin/adminTrainerManagement";
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
import Badge from "@/components/admin/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/admin/ui/Table";

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
  const trainersPerPage = 8;
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
      } catch (err: any) {
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
      setResponse(prev => ({
        ...prev,
        trainers: prev.trainers.map(t =>
          t._id === trainerId ? { ...t, isBanned: !currentBanStatus } : t
        )
      }));
      toast.success(`Trainer ${trainerName} ${!currentBanStatus ? 'banned' : 'unbanned'} successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update ban status.");
    } finally {
      setActionLoading(null);
      setConfirmBan(null);
    }
  };

  const handleViewTrainer = async (trainerId: string) => {
    try {
      const res = await getTrainerById(trainerId);
      const trainer = res as ITrainer;
      navigate(ROUTES.ADMIN_TRAINER_DETAILS.replace(':trainerId', trainerId), { state: { trainer } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch trainer details.");
    }
  };

  const handleViewApplication = async (trainerId: string) => {
    try {
      const res = await getTrainerApplication(trainerId);
      const application = res;
      navigate(ROUTES.ADMIN_TRAINER_APPLICATION.replace(':trainerId', trainerId), { state: { application } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch application.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-brand-500" />
              Trainer Management
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and verify platform trainers</p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative col-span-1 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trainers by name, email, or specialization..."
                value={searchInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={isBannedFilter}
                onChange={(e) => setIsBannedFilter(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Trainers Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trainer Details</TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expertise</TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</TableCell>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-500 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : response.trainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-20 text-center">
                      <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No trainers found matching your criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  response.trainers.map((trainer) => (
                    <TableRow key={trainer._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-start gap-3 min-w-[200px]">
                          <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0 bg-brand-50 flex items-center justify-center">
                            {trainer.profileImage ? (
                              <img src={trainer.profileImage} alt={trainer.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-brand-600 font-bold">{trainer.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="space-y-1 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{trainer.name}</p>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Mail className="h-3 w-3" /> <span className="truncate">{trainer.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Phone className="h-3 w-3" /> {trainer.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1.5">
                          <Badge size="sm" color="primary">
                            {trainer.specialization}
                          </Badge>
                          <p className="text-xs text-gray-500">{trainer.experience} Experience</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {trainer.rating?.toFixed(1) || "0.0"}
                          </div>
                          <p className="text-xs text-gray-500">{trainer.clients?.length || 0} active clients</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {trainer.isBanned ? (
                            <Badge color="error" size="sm" variant="solid">Banned</Badge>
                          ) : (
                            <Badge color={trainer.profileStatus === 'approved' ? 'success' : 'warning'} size="sm">
                              {trainer.profileStatus === 'approved' ? 'Verified' : trainer.profileStatus}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleBanToggle(trainer._id, trainer.isBanned, trainer.name)}
                            disabled={actionLoading === trainer._id}
                            className={`p-2 rounded-lg transition-colors ${trainer.isBanned ? "text-success-600 hover:bg-success-50" : "text-error-600 hover:bg-error-50"}`}
                            title={trainer.isBanned ? "Unban" : "Ban"}
                          >
                            {actionLoading === trainer._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                          </button>
                          {trainer.profileStatus !== 'approved' && (
                            <button
                              onClick={() => handleViewApplication(trainer._id)}
                              className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                              title="View Application"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewTrainer(trainer._id)}
                            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && response.totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500">Page {currentPage} of {response.totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === response.totalPages}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal remains use the project's shadcn dialog but can be styled */}
        <Dialog open={!!confirmBan} onOpenChange={() => setConfirmBan(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {confirmBan?.status ? <UserCheck className="h-5 w-5 text-success-500" /> : <Ban className="h-5 w-5 text-error-500" />}
                {confirmBan?.status ? 'Unban Trainer' : 'Ban Trainer'}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to {confirmBan?.status ? 'unban' : 'ban'} <strong>{confirmBan?.name}</strong>?
                {!confirmBan?.status && " This will restrict their access to the platform."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <button
                onClick={() => setConfirmBan(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmBan && handleBanToggle(confirmBan.id, confirmBan.status, confirmBan.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${confirmBan?.status ? 'bg-success-500 hover:bg-success-600' : 'bg-error-500 hover:bg-error-600'}`}
              >
                Confirm
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TrainerManagement;