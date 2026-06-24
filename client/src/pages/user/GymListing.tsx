import { useEffect, useState, useCallback } from "react";
import { MapPin, Star, Search, Users, Dumbbell, Navigation, Filter, ChevronRight } from "lucide-react";
import { getGymsForUser, type IGym } from "@/services/gymService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GymListing() {
    const [gyms, setGyms] = useState<IGym[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const navigate = useNavigate();
    const limit = 8;

    const fetchGyms = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getGymsForUser(
                page,
                limit,
                search,
                location?.lat,
                location?.lng
            );
            setGyms(response.gyms || []);
            setTotalPages(response.totalPages || 1);
        } catch (_err) {
            console.error("API error:", _err);
        } finally {
            setIsLoading(false);
        }
    }, [page, location, search, limit]);

    useEffect(() => {
        document.title = "TrainUp - Discover Elite Gyms";
        fetchGyms();
    }, [fetchGyms]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (page === 1) fetchGyms();
            else setPage(1);
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, page, fetchGyms]);

    const handleDetectLocation = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLocating(false);
                toast.success("Location detected! Showing nearest gyms first.");
            },
            (error) => {
                console.error("Location error:", error);
                toast.error("Unable to retrieve your location. Showing gyms by popularity.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true }
        );
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
                        <Dumbbell className="h-3.5 w-3.5" />
                        <span>ELITE GYM FINDER</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-mono uppercase">
                            DISCOVER ELITE GYMS
                        </h1>
                        <p className="text-xs font-mono text-[#a3a3a3] max-w-md mx-auto leading-relaxed">
                            Locate top-rated fitness facilities and specialized workout centers near you.
                        </p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 space-y-6 max-w-4xl mx-auto">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search Input */}
                        <div className="flex-1 min-w-[280px]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
                                <input
                                    type="text"
                                    placeholder="Search by gym name or location..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full pl-11 pr-4 py-3.5 text-xs font-mono bg-[#0d0d0e] border-2 border-[#262626] rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-[#22d3ee] transition-all"
                                />
                            </div>
                        </div>

                        {/* Location Detection Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDetectLocation}
                                disabled={isLocating}
                                className={cn(
                                    "h-[46px] px-5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
                                    location
                                        ? "duo-btn-cyan"
                                        : "duo-btn-outline"
                                )}
                            >
                                {isLocating ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Navigation className={cn("h-4 w-4", location ? "fill-current" : "")} />
                                )}
                                {location ? "Location Active" : "Detect Location"}
                            </button>

                            {/* Reset Button */}
                            <button
                                onClick={() => { setLocation(null); setSearch(""); setPage(1); }}
                                className="duo-btn-gray h-[46px] w-[46px] flex items-center justify-center p-0 rounded-xl"
                                title="Reset Filters"
                            >
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gym Grid */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="h-[430px] rounded-2xl bg-[#171717] border-2 border-[#262626] animate-pulse" />
                            ))}
                        </motion.div>
                    ) : gyms.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center space-y-4 max-w-sm mx-auto"
                        >
                            <div className="w-16 h-16 mx-auto bg-[#171717] border-2 border-[#262626] rounded-2xl flex items-center justify-center text-neutral-600">
                                <Search className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-white font-mono uppercase">No gyms found</h3>
                                <p className="text-xs text-neutral-500">Try adjusting your search terms or geocodes.</p>
                            </div>
                            <button 
                                onClick={() => { setSearch(""); setLocation(null); }} 
                                className="duo-btn-gray px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider"
                            >
                                Reset All
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4"
                        >
                            {gyms.map((gym, index) => (
                                <GymCard key={gym._id} gym={gym} index={index} navigate={navigate} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-16 font-mono">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="duo-btn-gray px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                        >
                            Prev
                        </button>
                        <div className="flex items-center gap-1.5 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const isActive = p === page;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "w-10 h-10 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer",
                                            isActive 
                                                ? "duo-btn-cyan" 
                                                : "duo-btn-outline"
                                        )}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

function GymCard({ gym, index, navigate }: { gym: IGym & { distance?: number; memberCount?: number; avgRating?: number; minPlanPrice?: number }; index: number; navigate: (path: string) => void }) {
    return (
        <div
            onClick={() => navigate(ROUTES.USER_INDIVIDUAL_GYM.replace(':id', gym._id))}
            className="group relative h-[430px] rounded-2xl overflow-hidden border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] bg-[#171717] duo-card-3d cursor-pointer flex flex-col justify-between"
            style={{
                animationDelay: `${index * 80}ms`,
                animation: "slideUp 0.5s ease-out forwards",
            }}
        >
            <div className="relative w-full h-56 bg-[#0d0d0e] overflow-hidden border-b border-[#262626]">
                <img
                    src={gym.profileImage || "/placeholder.svg"}
                    alt={gym.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Verified Badge overlay */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#171717] border border-[#262626] text-[#22d3ee] text-[9px] font-mono font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                        Verified
                    </span>
                </div>

                {/* Rating Badge overlay */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-black/50 border border-white/10 backdrop-blur-md rounded-full">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-[10px] font-mono font-bold">{gym.avgRating || "0.0"}</span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                    <h4 className="text-base font-extrabold text-white font-mono uppercase tracking-wide group-hover:text-[#22d3ee] transition-colors line-clamp-1">
                        {gym.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[#a3a3a3]">
                        <MapPin className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                        <span className="text-[11px] font-medium truncate">
                            {gym.distance ? `${gym.distance.toFixed(1)} km away` : "Main Center"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#262626]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                            <Users className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="text-[8px] text-neutral-500 font-bold font-mono uppercase leading-tight">Members</p>
                            <p className="text-xs font-extrabold text-white">{gym.memberCount || 0}+</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#0d0d0e] border border-[#262626] rounded-xl text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400/10" />
                        </div>
                        <div>
                            <p className="text-[8px] text-neutral-500 font-bold font-mono uppercase leading-tight">Tier</p>
                            <p className="text-xs font-extrabold text-white">{gym.avgRating ? "Top Gym" : "New"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262626] font-mono">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest leading-tight">Starting At</span>
                        <span className="text-sm font-extrabold text-[#22d3ee]">
                            {gym.minPlanPrice ? (
                                <>
                                    ₹{gym.minPlanPrice} <span className="text-[9px] font-bold text-neutral-500">/MO</span>
                                </>
                            ) : (
                                <span className="text-[10px] text-neutral-500 italic">Unavailable</span>
                            )}
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold text-[#a3a3a3] uppercase group-hover:text-white transition-colors">
                        <span>Explore</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
