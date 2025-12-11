import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { verifyTrainer, rejectTrainer } from '@/services/adminService';
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
  Clock,
  Badge,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

const TrainerApplication = () => {
  const { trainerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application || {
    _id: trainerId,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    location: "New York, NY",
    experience: "5 years",
    specialization: "Strength Training, HIIT, Nutrition",
    bio: "Certified personal trainer with a passion for helping clients achieve their fitness goals. Specializing in strength training and high-intensity interval training. I believe in creating personalized workout plans that are both challenging and enjoyable.",
    certificate: "cert_url_here",
    profileImage: "https://via.placeholder.com/150",
    profileStatus: "pending",
    createdAt: new Date("2024-01-15T10:30:00")
  };

  const [loading, setLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

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
      alert('Please provide a reason for rejection');
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

  return (
    <div className="min-h-screen bg-[#1F2A44] p-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:text-[#4B8B9B] hover:bg-[#4B8B9B]/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Trainers
            </Button>
          </div>
          <Logo />
        </div>

        {/* Main Content */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30 shadow-xl">
          <CardHeader className="border-b border-[#4B8B9B]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4B8B9B]/20 to-[#001C30]/20 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-[#4B8B9B]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Trainer Application Review</h1>
                  <p className="text-[#4B8B9B] mt-1">Review and verify trainer application</p>
                </div>
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                <Clock className="h-3 w-3 mr-1" />
                Pending Verification
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 mt-6">
            {/* Profile Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {application.profileImage && (
                <img
                  src={application.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#4B8B9B]/30"
                />
              )}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white">{application.name}</h2>
                <p className="text-[#4B8B9B] text-lg mt-1">{application.specialization}</p>
                <div className="flex items-center justify-center md:justify-start space-x-4 mt-3 text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-[#4B8B9B]" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-white">{application.email}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-white">{application.phone}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-white">{application.location}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <p className="text-white">{application.experience}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-[#4B8B9B]" />
                Professional Details
              </h3>
              <div className="space-y-4">
                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Bio</span>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{application.bio}</p>
                </div>

                {application.certificate && (
                  <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#4B8B9B]">
                        <FileCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Certificate</span>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                        Uploaded
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-3 text-[#4B8B9B] border-[#4B8B9B]/30 hover:bg-[#4B8B9B]/10"
                      onClick={() => setIsCertificateModalOpen(true)}
                    >
                      View Certificate
                    </Button>
                  </div>
                )}
              </div>
              {/* Certificate Modal */}
              {application.certificate && (
                <Dialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
                  <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold flex items-center">
                        <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                        Trainer Certificate
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex justify-center items-center">
                      {/* If it's an image, show image. If PDF, show iframe. */}
                      {application.certificate.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img
                          src={application.certificate}
                          alt="Trainer Certificate"
                          className="max-h-[400px] rounded-lg border border-[#4B8B9B]/30"
                        />
                      ) : (
                        <iframe
                          src={application.certificate}
                          title="Trainer Certificate"
                          className="w-full h-[400px] rounded-lg border border-[#4B8B9B]/30 bg-white"
                        />
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCertificateModalOpen(false)}
                        className="text-gray-400 border-gray-600 hover:bg-gray-700/50"
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-[#4B8B9B]/20">
              <Button
                variant="outline"
                onClick={handleBack}
                className="text-gray-400 border-gray-600 hover:bg-gray-700/50 hover:text-white px-6 py-2"
              >
                Cancel
              </Button>
              {application.profileStatus !== 'approved' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={loading}
                    className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject Trainer
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={loading}
                    className="bg-[#001C30] text-white px-8 py-2 rounded-lg hover:bg-gradient-to-r hover:from-[#001C30] hover:to-[#1F2A44] transition duration-300 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verify Trainer
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reject Modal */}
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                Reject Trainer Application
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="rejectReason" className="text-white mb-2 block">
                Reason for Rejection
              </Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this application"
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 border-gray-600 hover:bg-gray-700/50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TrainerApplication;