
import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Users,
  Award,
  Loader2,
  Ban,
  CheckCircle,
} from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { getTrainerApplication, getTrainerById, toggleTrainerBan, verifyTrainer } from "@/services/adminService"

interface ITrainer {
  _id: string
  name: string
  email: string
  phone: string
  isVerified: boolean
  isBanned: boolean
  role: "trainer"
  gymId?: {
    _id: string
    name: string
    location: string
  } | null
  clients: Array<{
    _id: string
    name: string
    joinDate: Date
  }>
  bio: string
  location: string
  specialization: string
  experience: string
  badges: string[]
  rating: number
  certificate: string
  profileImage: string
  profileStatus: "pending" | "approved" | "rejected" | "active" | "suspended"
  createdAt: Date
  updatedAt: Date
}


const IndividualTrainer = () => {
  const [trainer, setTrainer] = useState<ITrainer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    const stateTrainer = location.state?.trainer;
    if (stateTrainer) {
      setTrainer(stateTrainer);
    } else if (id) {
      const fetchTrainer = async () => {
        setLoading(true);
        try {
          const res = await getTrainerById(id);
          setTrainer(res);
        } catch (err) {
          console.error("Error fetching trainer:", err);
          setError("Failed to load trainer details");
        } finally {
          setLoading(false);
        }
      };
      fetchTrainer();
    }
  }, [location.state, id]);

  const handleBanToggle = async () => {
    if (!trainer) return;
    setActionLoading("ban");
    try {
      await toggleTrainerBan(trainer._id, !trainer.isBanned);
      setTrainer({ ...trainer, isBanned: !trainer.isBanned });
    } catch (err) {
      console.error("Error updating trainer ban status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewApplication =async () => {
    if (!trainer) return;
    try {
        const res = await getTrainerApplication(trainer._id);
        const application = res
        navigate(`/admin/trainers/${id}/application`, { state: { application } });
    } catch (error) {
        console.log("Error fetching trainer application:", error);
    }
  }

  const handleVerify = async () => {
    if (!trainer) return;
    setActionLoading("verify");
    try {
      await verifyTrainer(trainer._id);
      setTrainer({ ...trainer, isVerified: true });
    } catch (err) {
      console.error("Error verifying trainer:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
            <span className="ml-2 text-gray-400">Loading trainer details...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !trainer) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error || "Trainer not found"}</p>
            <Button onClick={() => navigate("/admin/trainers")}>Back to Trainers</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/trainers")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trainers
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <UserCheck className="mr-3 h-8 w-8 text-[#4B8B9B]" />
                {trainer.name}
              </h1>
              <p className="text-gray-400">Trainer Details and Performance</p>
            </div>
            <div className="flex items-center gap-2">
              {!trainer.isVerified && (
                <Button
                  variant="default"
                  onClick={handleVerify}
                  disabled={actionLoading === "verify"}
                  className="flex items-center gap-2"
                >
                  {actionLoading === "verify" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Verify
                </Button>
              )}
              <Button
                variant='default'
                onClick={handleBanToggle}
                disabled={actionLoading === "ban"}
                className="flex items-center gap-2"
              >
                {actionLoading === "ban" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                {trainer.isBanned ? "Unban" : "Ban"}
              </Button>
              <Button
                variant="outline"
                onClick={handleViewApplication}
                className="flex items-center gap-2"
              >
                View Application
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={trainer.profileImage || "/placeholder.svg"}
                    alt={trainer.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                    <p className="text-[#4B8B9B]">{trainer.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-white">{trainer.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#4B8B9B]" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{trainer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#4B8B9B]" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{trainer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#4B8B9B]" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white">{trainer.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#4B8B9B]" />
                    <div>
                      <p className="text-sm text-gray-400">Experience</p>
                      <p className="text-white">{trainer.experience}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{trainer.bio}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                  Clients ({trainer.clients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainer.clients.slice(0, 6).map((client) => (
                    <div key={client._id} className="flex items-center justify-between p-3 bg-[#1F2A44]/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{client.name}</p>
                        <p className="text-sm text-gray-400">Joined {new Date(client.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {trainer.clients.length > 6 && (
                    <div className="col-span-full text-center">
                      <Button variant="outline" className="mt-2 bg-transparent">
                        View All Clients
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verification</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      trainer.isVerified ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {trainer.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Status</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      trainer.isBanned ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"
                    }`}
                  >
                    {trainer.isBanned ? "Banned" : "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Status</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      trainer.profileStatus === "active"
                        ? "bg-green-900/30 text-green-400"
                        : trainer.profileStatus === "pending"
                          ? "bg-yellow-900/30 text-yellow-400"
                          : trainer.profileStatus === "approved"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {trainer.profileStatus}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4B8B9B]">{trainer.clients.length}</div>
                  <p className="text-sm text-gray-400">Active Clients</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4B8B9B]">{trainer.rating.toFixed(1)}</div>
                  <p className="text-sm text-gray-400">Average Rating</p>
                </div>
              </CardContent>
            </Card>

            {trainer.gymId && (
              <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                <CardHeader>
                  <CardTitle className="text-white">Gym Affiliation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#4B8B9B]" />
                    <div>
                      <p className="text-white font-medium">{trainer.gymId.name}</p>
                      <p className="text-sm text-gray-400">{trainer.gymId.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trainer.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[#1F2A44]/30 rounded">
                      <Award className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm">{badge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default IndividualTrainer
