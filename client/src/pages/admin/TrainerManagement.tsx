import React, { useState, useEffect, type ChangeEvent } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, UserCheck, Ban, FileText, Star, Mail, Phone, Calendar, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

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
  const trainersPerPage = 10;
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
      toast.error(err.response?.data?.message || "Failed to fetch trainer details.");
    }
  };

  const handleViewApplication = async (trainerId: string) => {
    try {
      const res = await getTrainerApplication(trainerId);
      const application = res;
      navigate(ROUTES.ADMIN_TRAINER_APPLICATION.replace(':trainerId', trainerId), { state: { application } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch application.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white italic">TRAINER MANAGEMENT</h1>
            <p className="text-gray-500">Manage and verify platform trainers</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
              <Input
                placeholder="Search trainers..."
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
                <p className="text-zinc-500 font-bold animate-pulse tracking-widest">LOADING TRAINERS...</p>
              </div>
            ) : response.trainers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <Users className="text-zinc-700" size={60} />
                <p className="text-zinc-500 font-bold">NO TRAINERS FOUND</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <th className="px-8 py-4">Trainer Details</th>
                    <th className="px-8 py-4">Expertise</th>
                    <th className="px-8 py-4">Stats</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {response.trainers.map((trainer) => (
                    <motion.tr
                      key={trainer._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-lg overflow-hidden shrink-0">
                            {trainer.profileImage ? (
                              <img src={trainer.profileImage} className="w-full h-full object-cover" />
                            ) : (
                              trainer.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{trainer.name}</p>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-[10px] text-gray-500 font-black tracking-widest flex items-center gap-1">
                                <Mail className="h-2.5 w-2.5" /> {trainer.email}
                              </p>
                              <p className="text-[10px] text-gray-500 font-black tracking-widest flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5" /> {trainer.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <Badge className="bg-primary/20 text-primary border-0 font-black text-[10px]">
                            {trainer.specialization.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-500 font-medium">{trainer.experience} Experience</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            {trainer.rating?.toFixed(1) || "0.0"}
                          </div>
                          <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">{trainer.clients?.length || 0} Clients</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={`${trainer.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'} border-0 font-black text-[10px]`}>
                          {trainer.isBanned ? "BANNED" : (trainer.profileStatus === 'approved' ? 'VERIFIED' : trainer.profileStatus.toUpperCase())}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleBanToggle(trainer._id, trainer.isBanned, trainer.name)}
                            disabled={actionLoading === trainer._id}
                            className={`h-10 w-10 rounded-xl bg-white/5 border border-white/10 transition-all flex items-center justify-center ${trainer.isBanned ? "text-green-500 hover:bg-green-500/10" : "text-red-500 hover:bg-red-500/10"}`}
                            title={trainer.isBanned ? "Unban" : "Ban"}
                          >
                            {actionLoading === trainer._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                          </button>
                          {trainer.profileStatus !== 'approved' && (
                            <button
                              onClick={() => handleViewApplication(trainer._id)}
                              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-primary transition-all flex items-center justify-center"
                              title="View Application"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewTrainer(trainer._id)}
                            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && response.totalPages > 1 && (
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-500 font-bold">
                PAGE {currentPage} OF {response.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === response.totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-bold"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <Dialog open={!!confirmBan} onOpenChange={() => setConfirmBan(null)}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                {confirmBan?.status ? <UserCheck className="h-6 w-6 text-green-500" /> : <Ban className="h-6 w-6 text-red-500" />}
                {confirmBan?.status ? 'UNBAN TRAINER' : 'BAN TRAINER'}
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-medium">
                Are you sure you want to {confirmBan?.status ? 'unban' : 'ban'} <strong className="text-white">{confirmBan?.name}</strong>?
                {!confirmBan?.status && " This will restrict their access to the platform."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-0 mt-6">
              <button
                onClick={() => setConfirmBan(null)}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={() => confirmBan && handleBanToggle(confirmBan.id, confirmBan.status, confirmBan.name)}
                className={`px-6 py-2 rounded-xl text-black font-black text-xs transition-all ${confirmBan?.status ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                CONFIRM
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TrainerManagement;
