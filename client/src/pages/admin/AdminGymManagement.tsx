import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Search,
    CheckCircle2,
    XCircle,
    Ban,
    Eye,
    Building2,
    Calendar,
    MapPin,
    FileText,
    ExternalLink,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    getGyms,
    updateGymStatus
} from '@/services/adminService';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const AdminGymManagement = () => {
    const [gyms, setGyms] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [verifyStatus, setVerifyStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const fetchGyms = async () => {
        try {
            setLoading(true);
            const data = await getGyms(page, 10, search, undefined, verifyStatus);
            setGyms(data.gyms || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            toast.error('Failed to fetch gyms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, [verifyStatus, search, page]);

    const handleStatusUpdate = async (gymId: string, status: string, reason?: string) => {
        try {
            await updateGymStatus(gymId, {
                verifyStatus: status,
                rejectReason: reason
            });
            toast.success(`Gym ${status} successfully`);
            fetchGyms();
            setIsPreviewOpen(false);
            setIsRejectDialogOpen(false);
            setRejectReason('');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleBanToggle = async (gymId: string, isBanned: boolean) => {
        try {
            await updateGymStatus(gymId, { isBanned: !isBanned });
            toast.success(`Gym ${!isBanned ? 'banned' : 'unbanned'} successfully`);
            fetchGyms();
        } catch (error) {
            toast.error('Failed to toggle ban status');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500/20 text-green-500 border-0">APPROVED</Badge>;
            case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-500 border-0">PENDING</Badge>;
            case 'rejected': return <Badge className="bg-red-500/20 text-red-500 border-0">REJECTED</Badge>;
            default: return <Badge variant="outline" className="border-white/10 text-gray-400">{(status?.toUpperCase() || 'UNKNOWN')}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white italic">GYM MANAGEMENT</h1>
                        <p className="text-gray-500">Review and manage gym registration applications</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                            <Input
                                placeholder="Search gyms..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white outline-none focus:ring-0"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 outline-none focus:ring-1 focus:ring-primary/50"
                                value={verifyStatus}
                                onChange={(e) => setVerifyStatus(e.target.value)}
                            >
                                <option value="all" className="bg-[#1a1a1a]">All Status</option>
                                <option value="pending" className="bg-[#1a1a1a]">Pending</option>
                                <option value="approved" className="bg-[#1a1a1a]">Approved</option>
                                <option value="rejected" className="bg-[#1a1a1a]">Rejected</option>
                            </select>
                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                <Loader2 className="animate-spin text-primary" size={40} />
                                <p className="text-zinc-500 font-bold animate-pulse tracking-widest">LOADING GYMS...</p>
                            </div>
                        ) : gyms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                <Building className="text-zinc-700" size={60} />
                                <p className="text-zinc-500 font-bold">NO GYMS FOUND</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                        <th className="px-8 py-4">Gym Details</th>
                                        <th className="px-8 py-4">Location</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Joined</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {gyms.map((gym) => (
                                        <motion.tr
                                            key={gym._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                        {gym.logo ? (
                                                            <img src={gym.logo} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Building2 className="text-zinc-500 h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white truncate">{gym.name}</div>
                                                        <div className="text-xs text-gray-500 truncate">{gym.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <MapPin className="h-4 w-4 text-primary/60" />
                                                    <span className="truncate max-w-[200px] font-medium">{gym.address || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    {getStatusBadge(gym.verifyStatus)}
                                                    {gym.isBanned && (
                                                        <Badge className="bg-red-500/20 text-red-500 border-0 text-[10px] py-0.5">BANNED</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                                    <Calendar className="h-4 w-4 text-gray-600" />
                                                    {new Date(gym.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white"
                                                        onClick={() => { setSelectedGym(gym); setIsPreviewOpen(true); }}
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 ${gym.isBanned ? 'text-green-500' : 'text-red-500'}`}
                                                        onClick={() => handleBanToggle(gym._id, gym.isBanned)}
                                                    >
                                                        <Ban className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && gyms.length > 0 && (
                        <div className="p-6 border-t border-white/10 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-bold">
                                PAGE {page} OF {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all group"
                                >
                                    <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0b] border-white/10 text-white rounded-3xl p-8">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <DialogTitle className="text-3xl font-black italic mb-2 tracking-tight">
                                    {selectedGym?.name}
                                </DialogTitle>
                                <DialogDescription className="text-gray-400 font-medium">
                                    {selectedGym?.email}
                                </DialogDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {selectedGym && getStatusBadge(selectedGym.verifyStatus)}
                                {selectedGym?.isBanned && <Badge className="bg-red-500/20 text-red-500 border-0">BANNED</Badge>}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-8">
                        <section className="space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">ABOUT GYM</h4>
                                <p className="text-sm text-gray-400 leading-bold font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
                                    {selectedGym?.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">LOCATION INFO</h4>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                                    <MapPin className="text-primary h-5 w-5" />
                                    <span>{selectedGym?.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <Building2 className="text-gray-600 h-5 w-5" />
                                    <span className="font-mono text-xs tracking-tighter">COORDS: {selectedGym?.geoLocation?.coordinates?.join(', ')}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">CERTIFICATIONS</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedGym?.certifications?.map((cert: string, i: number) => (
                                        <a
                                            key={i}
                                            href={cert}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/20 transition-all group"
                                        >
                                            <FileText className="text-primary h-6 w-6" />
                                            <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">Certification {i + 1}</span>
                                            <ExternalLink className="ml-auto h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                                        </a>
                                    ))}
                                    {(!selectedGym?.certifications || selectedGym.certifications.length === 0) && (
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-gray-600 italic">No certifications uploaded.</div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">SHOWCASE IMAGES</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedGym?.images?.map((img: string, i: number) => (
                                        <div key={i} className="aspect-video rounded-2xl bg-white/5 overflow-hidden border border-white/10 shadow-lg transition-transform hover:scale-[1.02]">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {(!selectedGym?.images || selectedGym.images.length === 0) && (
                                        <div className="col-span-2 p-8 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-sm text-gray-600 italic">No showcase images.</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 font-outfit">OPENING HOURS</h4>
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-1">
                                    {selectedGym?.openingHours?.map((oh: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <span className="font-bold text-gray-300">{oh.day}</span>
                                            <span className={oh.isClosed ? 'text-red-500 font-black italic text-xs tracking-widest' : 'text-primary font-bold'}>
                                                {oh.isClosed ? 'CLOSED' : `${oh.open} - ${oh.close}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <DialogFooter className="gap-3 pt-6 border-t border-white/10">
                        {selectedGym?.verifyStatus === 'pending' && (
                            <>
                                <Button
                                    className="h-12 px-6 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-bold transition-all flex items-center gap-2"
                                    onClick={() => setIsRejectDialogOpen(true)}
                                >
                                    <XCircle size={18} /> Reject
                                </Button>
                                <Button
                                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-black rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] shadow-primary/20"
                                    onClick={() => handleStatusUpdate(selectedGym._id, 'approved')}
                                >
                                    <CheckCircle2 size={18} /> Approve
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            className="h-12 px-6 rounded-xl hover:bg-white/5 text-gray-400 font-bold"
                            onClick={() => setIsPreviewOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Reason Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-[#0a0a0b] border-white/10 text-white rounded-3xl p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tight">REJECT APPLICATION</DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium">
                            Please provide a reason for rejecting <span className="text-white font-bold">{selectedGym?.name}</span>'s application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                            className="bg-white/5 border-white/10 rounded-xl min-h-[120px] text-white focus:ring-primary/50 text-base p-4"
                        />
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-xl text-gray-400 font-bold hover:bg-white/5"
                            onClick={() => setIsRejectDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all disabled:opacity-50"
                            onClick={() => handleStatusUpdate(selectedGym?._id, 'rejected', rejectReason)}
                            disabled={!rejectReason}
                        >
                            REJECT
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminGymManagement;

