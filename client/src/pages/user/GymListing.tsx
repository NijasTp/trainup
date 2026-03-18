import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Search, Users, Dumbbell, Navigation, Filter } from "lucide-react";
import { getGymsForUser, getSubscriptionPlan } from "@/services/gymService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";

export default function GymListing() {
    const [gyms, setGyms] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const navigate = useNavigate();
    const limit = 8;

    useEffect(() => {
        document.title = "TrainUp - Discover Elite Gyms";
        fetchGyms();
    }, [page, location]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (page === 1) fetchGyms();
            else setPage(1);
        }, 500);
        return () => clearTimeout(debounce);
    }, [search]);

    async function fetchGyms() {
        setIsLoading(true);
        setError(null);
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
        } catch (err) {
            setError("Failed to fetch gyms. Please try again later.");
            console.error("API error:", err);
        } finally {
            setIsLoading(false);
        }
    }


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
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1 z-10">
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
                    >
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Premium Fitness Centers</span>
                    </motion.div>
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-black bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
                        >
                            Discover Elite Gyms
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                        >
                            Find the perfect environment to crush your fitness goals with state-of-the-art facilities.
                        </motion.p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[280px]">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search by gym name or location..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary transition-all text-lg"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleDetectLocation}
                                disabled={isLocating}
                                className={`h-14 px-6 rounded-2xl font-bold flex items-center gap-2 transition-all ${location
                                        ? "bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30"
                                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                {isLocating ? (
                                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <Navigation className={`h-5 w-5 ${location ? "fill-green-500" : ""}`} />
                                )}
                                {location ? "Location Active" : "Detect Location"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => { setLocation(null); setSearch(""); setPage(1); }}
                                className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all p-0"
                                title="Reset Filters"
                            >
                                <Filter className="h-5 w-5" />
                            </Button>
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
                            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="h-[480px] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10" />
                            ))}
                        </motion.div>
                    ) : gyms.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center space-y-6"
                        >
                            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <Search className="h-10 w-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-300">No gyms found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search terms or expanding your area.</p>
                            <Button variant="outline" onClick={() => { setSearch(""); setLocation(null); }} className="rounded-full">Reset All</Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8"
                        >
                            {gyms.map((gym, index) => (
                                <GymCard key={gym._id} gym={gym} index={index} navigate={navigate} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-16 pb-8">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    variant={p === page ? "default" : "ghost"}
                                    className={`w-12 h-12 rounded-2xl font-bold transition-all ${p === page
                                            ? "bg-primary text-white scale-110 shadow-[0_0_20px_rgba(var(--primary-rgb),.4)]"
                                            : "hover:bg-white/10"
                                        }`}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}

function GymCard({ gym, index, navigate }: { gym: any; index: number; navigate: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            className="group relative h-[480px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 shadow-2xl transition-all duration-500 hover:border-primary/30"
        >
            <div className="absolute inset-0">
                <img
                    src={gym.profileImage || "/placeholder.svg"}
                    alt={gym.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent" />
            </div>

            <div className="absolute top-6 left-6 z-20">
                <Badge className="bg-primary/90 backdrop-blur-md text-white border-0 py-2 px-4 rounded-2xl font-black shadow-xl uppercase tracking-wider text-[10px]">
                    Verified
                </Badge>
            </div>

            <div className="absolute top-6 right-6 z-20 h-12 w-12 bg-black/40 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/10">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-white">{gym.avgRating || "0.0"}</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
                <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors">{gym.name}</h4>
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{gym.distance ? `${gym.distance.toFixed(1)} km away` : "Main Center"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/5 rounded-xl">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Members</p>
                            <p className="text-sm font-black text-white">{gym.memberCount || 0}+</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/5 rounded-xl">
                            <Star className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Rating</p>
                            <p className="text-sm font-black text-white">{gym.avgRating ? "Top Tier" : "New"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Starting At</p>
                        <p className="text-3xl font-black text-white">
                            {gym.minPlanPrice ? (
                                <>
                                    <span className="text-primary text-sm font-bold mr-1">₹</span>
                                    {gym.minPlanPrice}
                                </>
                            ) : (
                                <span className="text-xl text-gray-400 italic">Unavailable</span>
                            )}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate(ROUTES.USER_INDIVIDUAL_GYM.replace(':id', gym._id))}
                        className="flex-1 h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-black shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all"
                    >
                        Explore
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
