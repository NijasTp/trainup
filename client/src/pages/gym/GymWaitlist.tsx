import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { getGymDetails } from '@/services/gymService';
import { logoutGymThunk } from '@/redux/slices/gymAuthSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface GymApplication {
    name: string;
    email: string;
    location: string;
    certificate: string | null;
    profileImage: string | null;
    images: string[];
    submittedAt?: string;
    status?: string;
}

interface WaitlistHeaderProps {
    onLogout: () => void;
}
// Header Component
const WaitlistHeader: React.FC<WaitlistHeaderProps> = ({ onLogout }) => (
    <div className="relative text-center mb-8">
        <button
            className="absolute top-0 right-0 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors duration-200"
            onClick={onLogout}
        >
            Logout
        </button>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-4">
            <span className="text-4xl">⏳</span>
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 mb-2">
            Application Under Review
        </h1>
        <p className="text-gray-400 text-lg">
            Your gym registration is being verified by our team
        </p>
    </div>
);

// Status Card Component
const StatusCard: React.FC<{ status: string; submittedAt?: string }> = ({ status, submittedAt }) => (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Application Status</h2>
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                {status || 'Pending Approval'}
            </span>
        </div>
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <p className="text-gray-300">Your application is currently being reviewed</p>
            </div>
            {submittedAt && (
                <p className="text-gray-500 text-sm">
                    Submitted on: {new Date(submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            )}
        </div>
    </div>
);

// Timeline Component
const ReviewTimeline: React.FC = () => {
    const steps = [
        { title: 'Application Submitted', status: 'completed', icon: '✓' },
        { title: 'Document Verification', status: 'active', icon: '📄' },
        { title: 'Location Verification', status: 'pending', icon: '📍' },
        { title: 'Final Approval', status: 'pending', icon: '🎉' }
    ];

    return (
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-6">
            <h3 className="text-xl font-semibold text-white mb-6">Review Progress</h3>
            <div className="relative">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center mb-6 last:mb-0">
                        <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg
              ${step.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                step.status === 'active' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' :
                                    'bg-gray-700 text-gray-500'}
            `}>
                            {step.icon}
                        </div>
                        <div className="ml-4 flex-1">
                            <p className={`font-medium ${step.status === 'completed' ? 'text-green-400' :
                                step.status === 'active' ? 'text-yellow-400' :
                                    'text-gray-500'
                                }`}>
                                {step.title}
                            </p>
                            {step.status === 'active' && (
                                <p className="text-gray-400 text-sm mt-1">Currently in progress...</p>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`
                absolute left-6 top-12 w-0.5 h-6 
                ${step.status === 'completed' ? 'bg-green-500/50' : 'bg-gray-700'}
              `} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Image Gallery Component for Modal
const ImageGallery: React.FC<{ images: string[]; profileImage: string | null }> = ({ images, profileImage }) => (
    <div className="space-y-4">
        {profileImage && (
            <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Profile Image</h4>
                <img
                    src={profileImage}
                    alt="Gym Profile"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                />
            </div>
        )}
        {images.length > 0 && (
            <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Gym Images</h4>
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Gym ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
);

// Application Details Modal Component
const ApplicationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    application: GymApplication | null
}> = ({ isOpen, onClose, application }) => {
    if (!isOpen || !application) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Your Application Details</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Gym Name</p>
                                    <p className="text-white font-medium">{application.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <p className="text-white font-medium">{application.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Location Details</h3>
                            <div className="space-y-2">
                                <p className="text-white">{application.location}</p>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Submitted Documents</h3>
                            {application.certificate ? (
                                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <p className="text-white font-medium">Business Certificate</p>
                                        <p className="text-gray-400 text-sm">Uploaded successfully</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">No certificate uploaded</p>
                            )}
                        </div>

                        {/* Images */}
                        <div className="bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Images</h3>
                            <ImageGallery images={application.images} profileImage={application.profileImage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Info Cards Component
const InfoCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

// Main Waitlist Component
const GymWaitlist: React.FC = () => {
    const { gym, isAuthenticated } = useSelector((state: RootState) => state.gymAuth);
    const [application, setApplication] = useState<GymApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            if (gym?._id && gym?.verifyStatus !== 'approved') {
                try {
                    setLoading(true);
                    const response = await getGymDetails();
                    if (response.gymDetails) {
                        setApplication(response.gymDetails);
                    }
                } catch (error:any) {
                    console.error('Error fetching application details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchApplicationDetails();
    }, [gym]);

    const handleLogout = async () => {
        try {
            // @ts-ignore
            await dispatch<any>(logoutGymThunk())
            toast.success('Successfully Logged out')
            navigate('/gym/login')
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Logout failed')
        }
    }

    if (!isAuthenticated || !gym) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                    <p className="text-gray-400 text-lg">Please log in to view your application status.</p>
                </div>
            </div>
        );
    }

    if (gym.verifyStatus === 'approved') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                    <p className="text-green-400 text-lg">Your gym is already verified!</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <WaitlistHeader onLogout={handleLogout} />

                <StatusCard status="Pending Approval" submittedAt={application?.submittedAt} />

                <div className="text-center mb-8">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                    >
                        View Your Application
                    </button>
                </div>

                <ReviewTimeline />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <InfoCard
                        icon="⏱️"
                        title="Processing Time"
                        description="Applications are typically reviewed within 24-48 hours"
                    />
                    <InfoCard
                        icon="📧"
                        title="Email Updates"
                        description="You'll receive an email once your application is reviewed"
                    />
                    <InfoCard
                        icon="💬"
                        title="Need Help?"
                        description="Contact our support team for any questions"
                    />
                </div>

                <ApplicationModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    application={application}
                />
            </div>
        </div>
    );
};

export default GymWaitlist;