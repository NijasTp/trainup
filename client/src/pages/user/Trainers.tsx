import { useEffect, useState, useRef, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Search, Users, Award, ChevronRight } from "lucide-react";
import { getTrainers } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { Trainer } from "@/interfaces/trainer/trainers";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { toast } from "sonner";
import io, { Socket } from "socket.io-client";
import { cn } from "@/lib/utils";

const specialties = [
  "Weight Training",
  "Yoga",
  "Pilates",
  "Cardio",
  "CrossFit",
  "Martial Arts",
  "Zumba",
  "Other",
];

const experienceLevels = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userAuth.user);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 7;
  const socketRef = useRef<Socket | null>(null);

  console.log("Current filters:", { search, specialization, experience, minRating, minPrice, maxPrice });

  const fetchTrainers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTrainers(
        page,
        limit,
        search,
        specialization === "all" ? "" : specialization,
        experience === "all" ? "" : experience,
        minRating.toString(),
        minPrice,
        maxPrice
      );
      const trainersData = (response?.trainers?.trainers || []).map((t: SafeAny) => {
        if (t.price && typeof t.price === "string") {
          try {
            t.price = JSON.parse(t.price);
          } catch (eVal) { const e = eVal as SafeAny;
            console.error("Failed to parse trainer price:", e);
          }
        }
        return t;
      });
      setTrainers(trainersData);
      console.log("Fetched trainers:", response);
      setTotalPages(response?.trainers?.totalPages || 1); // Ensure at least 1 page
    } catch (errVal) { const err = errVal as SafeAny;
      setError("Failed to fetch trainers");
      console.error("API error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, specialization, experience, minRating, minPrice, maxPrice]);

  const fetchTrainersRef = useRef(fetchTrainers);
  useEffect(() => {
    fetchTrainersRef.current = fetchTrainers;
  }, [fetchTrainers]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });

    socketRef.current.on("notification", (data: SafeAny) => {
      if (data.type === "SESSION_REJECTED" || data.title === "Subscription Cancelled") {
        toast.error(data.message || "Your subscription has been cancelled.");
        fetchTrainersRef.current(); // Refresh trainers list
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.title = "TrainUp - Find Your Perfect Trainer";
    if (user?.assignedTrainer) {
      navigate("/my-trainer/profile");
    }
  }, [user, navigate]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTrainers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchTrainers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSpecialization("");
    setExperience("");
    setMinRating(0);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />
      
      <main className="relative container mx-auto px-6 py-12 space-y-10 flex-1 z-10 max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 bg-[#171717] border border-[#262626] text-[#22d3ee] font-mono px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
            <Award className="h-3.5 w-3.5" />
            <span>ELITE ATHLETE DIRECTORY</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-mono uppercase">
              FIND YOUR COACH
            </h1>
            <p className="text-xs font-mono text-[#a3a3a3] max-w-md mx-auto leading-relaxed">
              Partner with certified experts to accelerate your progression and unlock potential.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
                <input
                  type="text"
                  placeholder={specialization === "Other" ? "Search by name, bio, specialty..." : "Search trainers..."}
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-11 pr-4 py-3.5 text-xs font-mono bg-[#0d0d0e] border-2 border-[#262626] rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#22d3ee] transition-colors"
                />
              </div>
            </div>
            
            {/* Specialization Select */}
            <div className="flex-1 min-w-[200px] font-mono text-xs">
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger className="w-full bg-[#0d0d0e] border-2 border-[#262626] rounded-xl text-white text-xs h-[46px] px-4 py-3 focus:outline-none focus:border-[#22d3ee] transition-all">
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border-2 border-[#262626] text-white font-mono text-xs rounded-xl">
                  <SelectItem value="all" className="hover:bg-[#262626] focus:bg-[#262626] cursor-pointer">All Specializations</SelectItem>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec} className="hover:bg-[#262626] focus:bg-[#262626] cursor-pointer">
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Select */}
            <div className="flex-1 min-w-[200px] font-mono text-xs">
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger className="w-full bg-[#0d0d0e] border-2 border-[#262626] rounded-xl text-white text-xs h-[46px] px-4 py-3 focus:outline-none focus:border-[#22d3ee] transition-all">
                  <SelectValue placeholder="Select Experience" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border-2 border-[#262626] text-white font-mono text-xs rounded-xl">
                  <SelectItem value="all" className="hover:bg-[#262626] focus:bg-[#262626] cursor-pointer">All Experience Tiers</SelectItem>
                  {experienceLevels.map((exp) => (
                    <SelectItem key={exp} value={exp} className="hover:bg-[#262626] focus:bg-[#262626] cursor-pointer">
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-5 border-t border-[#262626]">
            {/* Minimum Rating Options */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[250px] max-w-sm">
              <label className="text-[9px] font-mono font-bold text-[#a3a3a3] uppercase tracking-wider">Minimum Rating</label>
              <div className="flex flex-wrap gap-2">
                {[0, 3, 4, 4.5].map((val) => {
                  const isActive = minRating === val;
                  const label = val === 0 ? "Any Rating" : `${val}+ Stars`;
                  return (
                    <button
                      key={val}
                      onClick={() => setMinRating(val)}
                      className={cn(
                        "px-3.5 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-b-[4px] active:translate-y-[2px] active:border-b-[2px] transition-all duration-100 cursor-pointer",
                        isActive 
                          ? "bg-cyan-500/10 text-[#22d3ee] border-[#22d3ee] border-b-[#06b6d4]" 
                          : "bg-[#0d0d0e] text-[#a3a3a3] border-[#262626] border-b-[#1f1f1f] hover:border-[#404040]"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              className="duo-btn-gray px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin"></div>
            </div>
            <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">Searching directory...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/20 rounded-xl border border-red-900/30">
              <span className="text-red-400 font-mono text-xs uppercase tracking-wider font-bold">{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && trainers.length === 0 && (
          <div className="text-center py-20 space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto bg-[#171717] border-2 border-[#262626] rounded-2xl flex items-center justify-center text-neutral-600">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-mono uppercase">No coaches found</h3>
              <p className="text-xs text-neutral-500">Try broadening your specialization filter or search term</p>
            </div>
          </div>
        )}

        {/* Trainer Grid */}
        {!isLoading && !error && trainers.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
            {trainers.map((trainer, index) => (
              <Link to={`/trainers/${trainer._id}`} key={trainer._id}>
                <TrainerCard trainer={trainer} index={index} />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-16 font-mono">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="duo-btn-gray px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
            >
              Prev
            </button>
            
            <div className="flex items-center gap-1.5 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-10 h-10 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer",
                      isActive 
                        ? "duo-btn-cyan" 
                        : "duo-btn-outline"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="duo-btn-gray px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
}

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group relative duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl overflow-hidden flex flex-col justify-between h-[420px]"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: "slideUp 0.5s ease-out forwards",
      }}
    >
      <div className="relative w-full h-56 bg-[#0d0d0e] overflow-hidden border-b border-[#262626]">
        {/* Shimmer loading mask */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
            <Users className="h-8 w-8 text-neutral-800" />
          </div>
        )}
        <img
          src={trainer.profileImage}
          alt={trainer.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-black/50 border border-white/10 backdrop-blur-md rounded-full">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="text-white text-[10px] font-mono font-bold">{trainer.rating}</span>
        </div>

        {/* Specialization Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#171717] border border-[#262626] text-[#22d3ee] text-[9px] font-mono font-bold py-1 px-3 rounded-full uppercase tracking-wider">
            {trainer.specialization}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-wide group-hover:text-[#22d3ee] transition-colors line-clamp-1">
            {trainer.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[#a3a3a3]">
            <MapPin className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
            <span className="text-[11px] font-medium truncate">{trainer.location}</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
            {trainer.bio}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#262626] font-mono">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Rate</span>
            <span className="text-sm font-extrabold text-[#22d3ee]">
              ₹{trainer.price?.basic || '0'} <span className="text-[9px] font-bold text-neutral-500">/MO</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-[9px] font-bold text-[#a3a3a3] uppercase group-hover:text-white transition-colors">
            <span>Profile</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}