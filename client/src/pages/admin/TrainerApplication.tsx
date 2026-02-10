import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { verifyTrainer, rejectTrainer, getTrainerApplication } from '@/services/adminService';
import {
  ArrowLeft,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  FileText,
  FileCheck,
  Calendar,
  Loader2,
  Shield,
  Star,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const TrainerApplication = () => {
  const { trainerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(location.state?.application || null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!location.state?.application);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  useEffect(() => {
    if (!application && trainerId) {
      const fetchApplication = async () => {
        try {
          const data = await getTrainerApplication(trainerId);
          setApplication(data);
        } catch (error) {
          console.error("Error fetching trainer application:", error);
        } finally {
          setFetching(false);
        }
      };
      fetchApplication();
    }
  }, [trainerId, application]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyTrainer(trainerId!);
      navigate('/admin/trainers');
    } catch (err) {
      console.error("Error verifying trainer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }
    setLoading(true);
    try {
      await rejectTrainer(trainerId!, rejectReason);
      navigate('/admin/trainers');
    } catch (err) {
      console.error("Error rejecting trainer:", err);
    } finally {
      setLoading(false);
      setIsRejectModalOpen(false);
      setRejectReason('');
    }
  };

  const handleBack = () => {
    navigate('/admin/trainers');
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-zinc-500 font-bold animate-pulse tracking-widest uppercase">LOADING APPLICATION...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
          <p className="text-white text-xl font-bold">APPLICATION NOT FOUND</p>
          <Button
            onClick={handleBack}
            className="bg-primary text-black font-black italic px-8 h-12 rounded-2xl hover:bg-primary/90"
          >
            BACK TO TRAINERS
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black tracking-widest uppercase mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              BACK TO LIST
            </button>
            <h1 className="text-4xl font-black text-white italic leading-none">APPLICATION REVIEW</h1>
            <p className="text-gray-500">Evaluate trainer application and professional credentials</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-2 font-black text-xs h-10 flex items-center gap-2">
              <Clock size={14} />
              PENDING VERIFICATION
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Contact */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Info Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield size={120} className="text-primary" />
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                <div className="relative">
                  <img
                    src={application.profileImage || "/default-avatar.png"}
                    alt="Profile"
                    className="w-40 h-40 rounded-[2rem] object-cover border-4 border-white/5 shadow-2xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-primary text-black p-3 rounded-2xl shadow-xl">
                    <User size={24} />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h2 className="text-4xl font-black text-white italic">{application.name.toUpperCase()}</h2>
                    <p className="text-primary font-black tracking-[0.2em] text-sm mt-1">{application.specialization.toUpperCase()}</p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase block">Email Address</span>
                      <p className="text-white font-medium">{application.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase block">Contact Number</span>
                      <p className="text-white font-medium">{application.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase block">Location</span>
                      <p className="text-white font-medium">{application.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                <FileText className="text-primary" size={24} />
                PROFESSIONAL BIO
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                {application.bio}
              </p>
            </div>

            {/* Certificate Section */}
            {application.certificate && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Award size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic">PROFESSIONAL CERTIFICATE</h3>
                    <p className="text-zinc-500 text-sm font-medium">Verified document uploaded by trainer</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsCertificateModalOpen(true)}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-8 h-12 font-black text-xs"
                >
                  VIEW DOCUMENT
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Experience & Pricing */}
          <div className="space-y-8">
            {/* Quick Stats Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-primary border border-white/5">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase block">Experience</span>
                    <p className="text-white font-black text-xl italic">{application.experience.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-amber-500 border border-white/5">
                    <Star size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase block">Initial Rating</span>
                    <p className="text-white font-black text-xl italic">0.0 / 5.0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-black text-white italic text-center">MONTHLY PRICING</h3>

              <div className="space-y-4">
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl flex justify-between items-center group hover:border-primary/30 transition-colors">
                  <span className="text-zinc-500 font-black text-xs tracking-widest uppercase">BASIC</span>
                  <span className="text-white font-black text-xl italic">₹{application.price?.basic?.toLocaleString() || '0'}</span>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl flex justify-between items-center group hover:border-primary/30 transition-colors">
                  <span className="text-primary font-black text-xs tracking-widest uppercase">PREMIUM</span>
                  <span className="text-white font-black text-xl italic">₹{application.price?.premium?.toLocaleString() || '0'}</span>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl flex justify-between items-center group hover:border-primary/30 transition-colors">
                  <span className="text-amber-500 font-black text-xs tracking-widest uppercase">PRO</span>
                  <span className="text-white font-black text-xl italic">₹{application.price?.pro?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleVerify}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-black font-black italic rounded-[1.5rem] h-14 w-full text-lg shadow-[0_10px_30px_rgba(var(--primary),0.3)]"
              >
                {loading ? <Loader2 className="animate-spin" /> : "APPROVE TRAINER"}
              </Button>
              <Button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={loading}
                className="bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-[1.5rem] h-14 w-full font-black text-xs tracking-widest"
              >
                REJECT APPLICATION
              </Button>
            </div>
          </div>
        </div>

        {/* Certificate Modal */}
        <Dialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-4xl p-2 rounded-[2.5rem]">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black italic flex items-center gap-3">
                  <FileCheck className="text-primary" size={28} />
                  CREDENTIAL DOCUMENT
                </h3>
              </div>
              <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center min-h-[500px]">
                {application.certificate?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img
                    src={application.certificate}
                    alt="Certificate"
                    className="max-h-[70vh] w-auto object-contain"
                  />
                ) : (
                  <iframe
                    src={application.certificate}
                    title="Certificate"
                    className="w-full h-[70vh] bg-white border-none"
                  />
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-12 h-14 font-black"
                >
                  CLOSE
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-[2.5rem] p-8">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-black italic flex items-center gap-3">
                <XCircle className="text-red-500" size={32} />
                REJECT APPLICATION
              </DialogTitle>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Please provide a detailed reason for rejecting <span className="text-white font-bold">{application.name}</span>.
                This will be shared with the applicant.
              </p>
            </DialogHeader>
            <div className="py-8">
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Indicate why the application was not approved..."
                className="bg-zinc-900/50 border-white/10 text-white rounded-3xl p-6 min-h-[150px] focus:border-red-500/50 transition-colors"
                required
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsRejectModalOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-8 h-12 font-black text-xs"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-8 h-12 font-black text-xs shadow-[0_10px_30px_rgba(239,68,68,0.3)]"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "CONFIRM REJECTION"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TrainerApplication;
