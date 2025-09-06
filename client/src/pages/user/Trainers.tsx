import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Search, Clock, Users, Award } from "lucide-react";
import { getTrainers } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { Link } from "react-router-dom";
import type { Trainer } from "@/interfaces/trainer/trainers";




export default function Trainers() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const limit = 8;

    useEffect(() => {
        document.title = "TrainUp - Find Your Perfect Trainer";
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchTrainers();
        }, 300);

        return () => clearTimeout(debounce);
    }, [page, search]);

    async function fetchTrainers() {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getTrainers(page, limit, search);
            setTrainers(response.trainers.trainers);
            console.log("Fetched trainers:", response);
            setTotalPages(response.trainers.totalPages);
        } catch (err) {
            setError("Failed to fetch trainers");
            console.error("API error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <SiteHeader />
            <main className="relative container mx-auto px-4 py-12 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Premium Certified Trainers</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                            Find Your Perfect Trainer
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Connect with world-class fitness professionals who will transform your journey
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="max-w-md mx-auto">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-lg">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Input
                                        placeholder="Search by name, specialty, or location..."
                                        value={search}
                                        onChange={handleSearch}
                                        className="pl-12 pr-4 py-6 bg-transparent border-0 text-base font-medium placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse "></div>
                        </div>
                        <p className="text-muted-foreground font-medium">Finding your perfect trainers...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full border border-destructive/20 mb-4">
                            <span className="text-destructive font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && trainers.length === 0 && (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                            <Search className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No trainers found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria or browse all trainers</p>
                    </div>
                )}

                {/* Trainer Grid */}
                {!isLoading && !error && trainers.length > 0 && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {trainers.map((trainer, index) => (
                            <TrainerCard key={trainer.id} trainer={trainer} index={index} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-6 font-medium hover:bg-primary/5 border-border/50"
                        >
                            Previous
                        </Button>

                        <div className="flex items-center gap-1 mx-4">
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

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === page ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-10 h-10 font-medium transition-all duration-200 ${pageNum === page
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                : "hover:bg-secondary/80"
                                            }`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-6 font-medium hover:bg-primary/5 border-border/50"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

function TrainerCard({ trainer, index }: { trainer: any; index: number }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Card className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2`}
            style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideUp 0.6s ease-out forwards'
            }}>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Image Section */}
            <div className="relative w-full h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>

                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                )}

                <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white text-sm font-semibold">{trainer.rating}</span>
                    </div>
                </div>

                {/* Specialty Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <Badge variant="secondary" className="bg-white/90 text-foreground border-0 shadow-lg font-medium">
                        {trainer.specialty}
                    </Badge>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                            {trainer.name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/90">
                            <MapPin className="h-4 w-4 text-accent drop-shadow" />
                            <span className="text-sm font-medium drop-shadow">{trainer.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {trainer.bio}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg font-bold text-primary">{trainer.price}</span>
                        </div>
                        <Link to={`/trainers/${trainer._id}`} className="hidden group-hover:block">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                            >
                                View Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}