import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ArrowLeft, MapPin, FileText } from "lucide-react";
import { verifyGym } from "@/services/gymService";


interface Application {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    location: string;
    certificate: string | null;
    profileImage: string | null;
    images: string[];
}

const GymApplication = () => {
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const application: Application = location.state?.application || {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        certificate: null,
        profileImage: null,
        images: [],
    };

    const handleVerifyGym = async () => {
        if (!id) {
            setError("Invalid gym ID.");
            return;
        }
        setActionLoading(true);
        try {
            await verifyGym(id);
            setError(null);
            navigate(`/admin/gyms`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            console.error("Error verifying gym application:", error);
            setError(error.response?.data?.message || "Failed to verify gym application.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="mb-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/gyms`)}
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gym
                    </Button>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <FileText className="mr-3 h-8 w-8 text-[#4B8B9B]" />
                        Trainer Application: {application.name || "Unnamed Applicant"}
                    </h1>
                    <p className="text-gray-400">Review gym application details</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Application Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Name</p>
                                        <p className="text-white">{application.name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Email</p>
                                        <p className="text-white">{application.email || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-[#4B8B9B]" />
                                    <div>
                                        <p className="text-sm text-gray-400">Address</p>
                                        <p className="text-white">
                                            {application.location}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Certificate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {application.certificate ? (
                                    <a
                                        href={application.certificate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#4B8B9B] hover:underline"
                                    >
                                        View Certificate
                                    </a>
                                ) : (
                                    <p className="text-gray-400">No certificate provided</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {application.images && application.images.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {application.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Application Image ${index + 1}`}
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No images provided</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar with Verify Button */}
                    <div className="space-y-6">
                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="default"
                                    onClick={handleVerifyGym}
                                    disabled={actionLoading}
                                    className="w-full flex items-center gap-2 bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    Verify Gym
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default GymApplication;