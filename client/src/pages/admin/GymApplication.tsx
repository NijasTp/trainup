import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, ArrowLeft, MapPin, FileText, XCircle } from "lucide-react";
import { verifyGym } from "@/services/gymService";

interface Application {
  _id?: string; // Added to align with GymModel
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  geoLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  certificate: string | null;
  profileImage: string | null;
  images: string[];
  verifyStatus: "pending" | "approved" | "rejected"; 
  rejectReason?: string | null; 
}

const GymApplication = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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
    verifyStatus: "pending",
    rejectReason: null,
  };

  const handleVerifyGym = async () => {
    if (!id) {
      setError("Invalid gym ID.");
      return;
    }
    setActionLoading(true);
    try {
      await verifyGym(id, { verifyStatus: "approved" });
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

  const handleRejectGym = async () => {
    if (!id) {
      setError("Invalid gym ID.");
      return;
    }
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      await verifyGym(id, { verifyStatus: "rejected", rejectReason });
      setError(null);
      setRejectDialogOpen(false);
      setRejectReason("");
      navigate(`/admin/gyms`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error rejecting gym application:", error);
      setError(error.response?.data?.message || "Failed to reject gym application.");
    } finally {
      setActionLoading(false);
    }
  };

  const isActionDisabled = application.verifyStatus === "approved" || application.verifyStatus === "rejected";

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
            Gym Application: {application.name || "Unnamed Applicant"}
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
                <div>
                  <p className="text-sm text-gray-400">Verification Status</p>
                  <p className="text-white capitalize">{application.verifyStatus || "N/A"}</p>
                </div>
                {application.rejectReason && (
                  <div>
                    <p className="text-sm text-gray-400">Rejection Reason</p>
                    <p className="text-white">{application.rejectReason}</p>
                  </div>
                )}
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
                      {application.location || (application.geoLocation?.coordinates
                        ? `${application.geoLocation.coordinates[1]}, ${application.geoLocation.coordinates[0]}`
                        : "N/A")}
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

          {/* Sidebar with Action Buttons */}
          <div className="space-y-6">
            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isActionDisabled && (
                  <>
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
                    <Button
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject Gym
                    </Button>
                  </>
                )}
                {isActionDisabled && (
                  <p className="text-gray-400 text-center">
                    This gym has been {application.verifyStatus}.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reject Reason Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-[#111827] border border-[#4B8B9B]/30">
            <DialogHeader>
              <DialogTitle className="text-white">Reject Gym Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="rejectReason" className="text-white">
                Reason for Rejection
              </Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejecting this gym application"
                className="bg-[#1F2937] text-white border-[#4B8B9B]/30 focus:border-[#4B8B9B]"
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectReason("");
                  setError(null);
                }}
                className="border-[#4B8B9B]/30 text-white hover:bg-[#4B8B9B]/10"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectGym}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default GymApplication;