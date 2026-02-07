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
    ExternalLink
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

const AdminGymManagement = () => {
    const [gyms, setGyms] = useState<any[]>([]);
    const [page] = useState(1);
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
        } catch (error) {
            toast.error('Failed to fetch gyms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, [verifyStatus, search]);

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
            case 'approved': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
            case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
            case 'rejected': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Gym Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Review and manage gym registration applications</p>
                </header>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                        <Input
                            placeholder="Search by gym name or email..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm"
                            value={verifyStatus}
                            onChange={(e) => setVerifyStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400">
                                    <th className="px-6 py-4">Gym Details</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {gyms.map((gym) => (
                                    <tr key={gym._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                    {gym.logo ? (
                                                        <img src={gym.logo} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Building2 className="text-zinc-400 h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white">{gym.name}</div>
                                                    <div className="text-xs text-zinc-500">{gym.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-zinc-500 text-sm">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{gym.address || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(gym.verifyStatus)}
                                            {gym.isBanned && <Badge className="ml-2 bg-red-500/10 text-red-500 border-red-500/20">Banned</Badge>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-zinc-500 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(gym.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setSelectedGym(gym); setIsPreviewOpen(true); }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={gym.isBanned ? 'text-green-500' : 'text-red-500'}
                                                    onClick={() => handleBanToggle(gym._id, gym.isBanned)}
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {gyms.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No gym applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            {selectedGym?.name} {getStatusBadge(selectedGym?.verifyStatus)}
                        </DialogTitle>
                        <DialogDescription>{selectedGym?.email}</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
                        <section className="space-y-4">
                            <div>
                                <h4 className="text-xs uppercase font-black text-zinc-400 mb-2">About Gym</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {selectedGym?.description || 'No description provided.'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="text-zinc-400 h-4 w-4" />
                                    <span>{selectedGym?.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="text-zinc-400 h-4 w-4" />
                                    <span>Coordinates: {selectedGym?.geoLocation?.coordinates?.join(', ')}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase font-black text-zinc-400 mb-2">Certifications</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedGym?.certifications?.map((cert: string, i: number) => (
                                        <a
                                            key={i}
                                            href={cert}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                                        >
                                            <FileText className="text-primary h-5 w-5" />
                                            <span className="text-sm font-medium">Certification {i + 1}</span>
                                            <ExternalLink className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                    {(!selectedGym?.certifications || selectedGym.certifications.length === 0) && (
                                        <p className="text-sm text-zinc-500 italic">No certifications uploaded.</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h4 className="text-xs uppercase font-black text-zinc-400 mb-2">Showcase Images</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedGym?.images?.map((img: string, i: number) => (
                                        <div key={i} className="aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {(!selectedGym?.images || selectedGym.images.length === 0) && (
                                        <p className="text-sm text-zinc-500 italic col-span-2">No showcase images.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase font-black text-zinc-400 mb-2 font-outfit">Opening Hours</h4>
                                <div className="space-y-1">
                                    {selectedGym?.openingHours?.map((oh: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm py-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                            <span className="font-medium">{oh.day}</span>
                                            <span className={oh.isClosed ? 'text-red-500 font-bold' : 'text-zinc-600 dark:text-zinc-400'}>
                                                {oh.isClosed ? 'Closed' : `${oh.open} - ${oh.close}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedGym?.verifyStatus === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                    onClick={() => setIsRejectDialogOpen(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject Application
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleStatusUpdate(selectedGym._id, 'approved')}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Application
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Reason Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting {selectedGym?.name}'s application.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleStatusUpdate(selectedGym?._id, 'rejected', rejectReason)}
                            disabled={!rejectReason}
                        >
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminGymManagement;
