import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
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
  Loader2,
  Ban,
  CheckCircle,
  ShieldCheck,
  Activity,
  Award,
  BookOpen,
  DollarSign,
  Briefcase,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Medal,
  Globe
} from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { getTrainerApplication, getTrainerById, toggleTrainerBan, verifyTrainer } from "@/services/adminService"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ITrainer } from "@/interfaces/admin/individualTrainer"
import { toast } from "sonner"

const IndividualTrainer = () => {
  const [trainer, setTrainer] = useState<ITrainer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { trainerId } = useParams();
  const location = useLocation();

  useEffect(() => {
    const stateTrainer = location.state?.trainer;
    if (stateTrainer) {
      setTrainer(stateTrainer);
    } else if (trainerId) {
      const fetchTrainer = async () => {
        setLoading(true);
        try {
          const res = await getTrainerById(trainerId);
          setTrainer(res);
        } catch (err) {
          console.error("Error fetching trainer:", err);
          setError("Failed to load specialist intelligence.");
        } finally {
          setLoading(false);
        }
      };
      fetchTrainer();
    }
  }, [location.state, trainerId]);

  const handleBanToggle = async () => {
    if (!trainer) return;
    setActionLoading("ban");
    try {
      await toggleTrainerBan(trainer._id, !trainer.isBanned);
      setTrainer({ ...trainer, isBanned: !trainer.isBanned });
      toast.success(`Specialist status updated: ${!trainer.isBanned ? 'Restricted' : 'Active'}`);
    } catch (err) {
      console.error("Error updating trainer ban status:", err);
      toast.error("Failed to update security protocols.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewApplication = async () => {
    if (!trainer) return;
    try {
      const res = await getTrainerApplication(trainer._id);
      const application = res
      navigate(`/admin/trainers/${trainerId}/application`, { state: { application } });
    } catch (error) {
      console.log("Error fetching trainer application:", error);
      toast.error("Could not retrieve application records.");
    }
  }

  const handleVerify = async () => {
    if (!trainer) return;
    setActionLoading("verify");
    try {
      await verifyTrainer(trainer._id);
      setTrainer({ ...trainer, profileStatus: 'approved' });
      toast.success("Specialist credentials authenticated successfully.");
    } catch (err) {
      console.error("Error verifying trainer:", err);
      toast.error("Authentication protocol failed.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
            />
          </div>
          <p className="mt-6 text-white/50 font-medium animate-pulse tracking-widest uppercase text-xs">Retrieving Specialist Dossier...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !trainer) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6">
          <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{error || "Specialist Not Located"}</p>
            <p className="text-white/40 mt-2">The requested intelligence file is missing or corrupted.</p>
          </div>
          <Button
            onClick={() => navigate("/admin/trainers")}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Command Center
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-10 max-w-7xl mx-auto space-y-10"
      >
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/trainers")}
              className="text-white/40 hover:text-white hover:bg-white/5 rounded-2xl h-10 px-4 transition-all group -ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Specialist Roster
            </Button>
            <div className="flex items-center gap-5">
              <div className="bg-primary/10 p-4 rounded-3xl border border-primary/20">
                <UserCheck className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-black italic text-white tracking-tight uppercase">
                  {trainer.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    Specialist ID: {trainer._id.slice(-8).toUpperCase()}
                  </Badge>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary/60">Profile Synchronized</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <Button
              onClick={handleViewApplication}
              className="flex-1 xl:flex-none bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl h-14 px-8 font-black uppercase tracking-widest transition-all group"
            >
              <BookOpen className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Dossier Records
            </Button>

            {trainer.profileStatus !== 'approved' && (
              <Button
                onClick={handleVerify}
                disabled={actionLoading === "verify"}
                className="flex-1 xl:flex-none bg-primary hover:bg-primary/90 text-black rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02]"
              >
                {actionLoading === "verify" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 mr-3" />
                    Authenticate
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={handleBanToggle}
              disabled={actionLoading === "ban"}
              className={`flex-1 xl:flex-none font-black uppercase tracking-widest rounded-2xl h-14 px-8 transition-all group ${trainer.isBanned
                  ? "bg-green-600 hover:bg-green-500 text-black shadow-[0_10px_30px_rgba(22,163,74,0.3)]"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                }`}
            >
              <div className="flex items-center justify-center gap-3">
                {actionLoading === "ban" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  trainer.isBanned ? <CheckCircle className="h-5 w-5" /> : <Ban className="h-5 w-5" />
                )}
                <span>{trainer.isBanned ? "Reinstate" : "Terminate"}</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Intelligence */}
          <div className="lg:col-span-8 space-y-10">
            {/* Identity & Bio */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors" />

              <div className="flex flex-col md:flex-row gap-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-125 opacity-30" />
                  <Avatar className="h-40 w-40 border-[6px] border-[#0a0a0b] shadow-2xl relative">
                    <AvatarImage src={trainer.profileImage || `https://ui-avatars.com/api/?name=${trainer.name}&background=4B8B9B&color=fff&size=256`} />
                    <AvatarFallback className="bg-white/10 text-white text-4xl font-black italic">
                      {trainer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2 rounded-2xl shadow-xl">
                    <Award className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-black italic text-white tracking-tight">{trainer.rating.toFixed(1)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Rating Score</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-primary/50" />
                        <span className="text-lg font-bold text-white tracking-tight">{trainer.experience}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Field Experience</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Specialization</p>
                      <p className="text-white font-black italic uppercase tracking-wider text-xl leading-tight">{trainer.specialization}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3 flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Backstory & Mission
                    </p>
                    <p className="text-white/70 leading-relaxed font-medium">
                      {trainer.bio || "Incomplete biometric data profile."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Strategic Metrics (Prices) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Tariff</h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Standard Protocol", value: trainer.price?.basic, color: "white/5" },
                  { label: "Elite Protocol", value: trainer.price?.premium, color: "primary/10", active: true },
                  { label: "Omega Protocol", value: trainer.price?.pro, color: "white/5" }
                ].map((plan, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className={`p-8 rounded-[2.5rem] border ${plan.active ? 'border-primary/50 bg-primary/5 shadow-[0_20px_40px_rgba(var(--primary),0.05)]' : 'border-white/10 bg-white/5'} flex flex-col items-center justify-center text-center group`}
                  >
                    <div className={`p-4 rounded-2xl mb-6 ${plan.active ? 'bg-primary text-black' : 'bg-white/10 text-white/40 group-hover:text-white transition-colors'}`}>
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${plan.active ? 'text-primary' : 'text-white/20'}`}>{plan.label}</span>
                    <span className="text-3xl font-black italic text-white tracking-widest">₹{plan.value?.toLocaleString() || '0'}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 mt-2 italic">Per Mission Cycle</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Client Collective Listing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-md"
            >
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-wider">Operative Collective</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{trainer.clients.length} Active Assignments</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 rounded-xl">
                  View Full Roster <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trainer.clients.length > 0 ? (
                    trainer.clients.slice(0, 6).map((client, idx) => (
                      <motion.div
                        key={client._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarFallback className="bg-white/10 text-white font-black italic text-xs">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-black italic uppercase tracking-wider text-sm group-hover:text-primary transition-colors">{client.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Calendar className="h-3 w-3 text-white/20" />
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter italic">Joined {new Date(client.joinDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-black p-2 rounded-xl">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                      <Users className="h-12 w-12 text-white/5 mx-auto mb-4" />
                      <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">No operative assignments detected.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Intelligence */}
          <div className="lg:col-span-4 space-y-8">
            {/* Status Command Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md"
            >
              <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black italic text-white uppercase tracking-wider">Command Status</h3>
              </div>
              <div className="p-8 space-y-6">
                {[
                  {
                    label: "Credentials",
                    status: trainer.profileStatus === 'approved' ? "AUTHENTICATED" : "PENDING",
                    color: trainer.profileStatus === 'approved' ? "text-green-500 bg-green-500/10" : "text-orange-500 bg-orange-500/10",
                    icon: ShieldCheck
                  },
                  {
                    label: "Security Level",
                    status: trainer.isBanned ? "RESTRICTED" : "UNRESTRICTED",
                    color: trainer.isBanned ? "text-red-500 bg-red-500/10" : "text-blue-500 bg-blue-500/10",
                    icon: ShieldAlert
                  },
                  {
                    label: "deployment",
                    status: trainer.profileStatus.toUpperCase(),
                    color: "text-primary bg-primary/10",
                    icon: Globe
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl transition-all hover:bg-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-white/20" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</span>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black italic tracking-widest ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance Logs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center space-y-10"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Medal className="h-16 w-16 text-primary relative" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/[0.08] transition-all">
                  <div className="text-3xl font-black italic text-primary group-hover:scale-110 transition-transform">{trainer.clients.length}</div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">Operatives</p>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/[0.08] transition-all">
                  <div className="text-3xl font-black italic text-primary group-hover:scale-110 transition-transform">{trainer.rating.toFixed(1)}</div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">Efficiency</p>
                </div>
              </div>
            </motion.div>

            {/* Network Infrastructure (Contact) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Communications</h3>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: "Encryption ID", value: trainer.email },
                    { icon: Phone, label: "Direct Line", value: trainer.phone },
                    { icon: MapPin, label: "Sector", value: trainer.location }
                  ].map((info, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl group hover:bg-white/[0.08] transition-all">
                      <div className="bg-white/5 p-2.5 rounded-xl text-primary/50 group-hover:text-primary transition-colors">
                        <info.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">{info.label}</p>
                        <p className="text-sm font-bold text-white truncate">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {trainer.gymId && (
                <div className="bg-primary p-8 text-black group cursor-pointer hover:bg-primary/90 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="h-6 w-6" />
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">HQ Affiliation</p>
                  <p className="text-2xl font-black italic uppercase tracking-tighter leading-tight mt-1">{trainer.gymId.name}</p>
                  <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-tighter opacity-80">
                    <MapPin className="h-3 w-3" />
                    {trainer.gymId.location}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  )
}

export default IndividualTrainer
