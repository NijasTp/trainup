import React, { useState, useEffect } from 'react';
import { Loader2, Clock, FileText, User, Mail, Phone, MapPin, Award, Briefcase, FileCheck } from 'lucide-react';
import { getTrainerDetails } from '@/services/trainerService';
import { logoutTrainer } from '@/redux/slices/trainerAuthSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { trainerLogout } from '@/services/authService';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { TrainerDetails } from "@/interfaces/trainer/ITrainerWaitlist";

// Main Component
const TrainerWaitlist: React.FC = () => {
  const [showApplication, setShowApplication] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trainerData, setTrainerData] = useState<TrainerDetails | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getTrainerDetails();
        if (res.trainer.profileStatus === "approved" || res.trainer.profileStatus === "active") {
          toast.success("Your application has been approved!");
          navigate("/trainer/dashboard");
        }
      } catch (error) {
        console.error("Error polling trainer status:", error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await trainerLogout();
      dispatch(logoutTrainer())
      toast.success('Logged out Successfully');
      navigate('/trainer/login')
    } catch (error: any) {
      toast.error(error.response.data.error || error.message || 'Failed to logout');
      console.log('Error logging out:', error.response || error.message);
    }
  }

  const handleViewApplication = async () => {
    setLoading(true);
    try {
      const res = await getTrainerDetails();
      setTrainerData(res.trainer);
      setShowApplication(true);
    } catch (error: any) {
      console.error('Error fetching trainer details:', error);
      toast.error(error.response.data.error || error.message || 'Failed to fetch trainer details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
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
          .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <Logo className="justify-center mb-6" />
          <Button
            onClick={handleLogout}
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </Button >
        </div >

        <Card className="bg-[#111827] border border-[#4B8B9B]/30 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-[#4B8B9B]/20 rounded-full flex items-center justify-center animate-pulse-slow">
              <Clock className="h-10 w-10 text-[#4B8B9B]" />
            </div>
            <CardTitle className="text-white text-3xl font-bold tracking-tight">
              Application Under Review
            </CardTitle>
            <CardDescription className="text-[#4B8B9B] text-lg">
              Your trainer application is being verified by our team
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Verification Status</span>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  Pending
                </Badge>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              <p>We typically review applications within 24-48 hours.</p>
              <p className="mt-1">You'll receive an email once your application is processed.</p>
            </div>

            <Button
              onClick={handleViewApplication}
              disabled={loading}
              className="w-full bg-[#001C30] text-white text-sm font-semibold py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#001C30] hover:to-[#1F2A44] transition duration-300 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FileText className="h-5 text-white w-5 mr-2" />
                  View Submitted Application
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div >

      <Dialog open={showApplication} onOpenChange={setShowApplication}>
        <DialogContent className="bg-[#111827] border border-[#4B8B9B]/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              Your Application Details

            </DialogTitle>
          </DialogHeader>

          {trainerData && (
            <div className="space-y-6 mt-6">
              {/* Profile Image */}
              {trainerData.profileImage && (
                <div className="flex justify-center">
                  <img
                    src={trainerData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#4B8B9B]/30"
                  />
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  <p className="text-white">{trainerData.name}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-white break-all">{trainerData.email}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-white">{trainerData.phone}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-white">{trainerData.location}</p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <p className="text-white">{trainerData.experience}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">Specialization</span>
                  </div>
                  <p className="text-white">{trainerData.specialization}</p>
                </div>

                <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                  <div className="flex items-center space-x-2 text-[#4B8B9B] mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Bio</span>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{trainerData.bio}</p>
                </div>

                {trainerData.certificate && (
                  <div className="bg-[#1F2A44]/50 rounded-lg p-4 border border-[#4B8B9B]/20">
                    <div className="flex items-center space-x-2 text-[#4B8B9B] mb-2">
                      <FileCheck className="h-4 w-4" />
                      <span className="text-sm font-medium">Certificate</span>
                    </div>
                    <p className="text-white text-sm">Certificate uploaded ✓</p>
                  </div>
                )}
              </div>

              {/* Submission Date */}
              <div className="text-center text-sm text-gray-400 pt-4 border-t border-[#4B8B9B]/20">
                <p>Application submitted on {new Date(trainerData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default TrainerWaitlist;