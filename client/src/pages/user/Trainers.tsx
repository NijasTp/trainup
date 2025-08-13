import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, MessageCircle, Star, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { getTrainers } from "@/services/userService";

type Trainer = {
    id: string;
    name: string;
    specialty: string;
    location: string;
    price: string;
    rating: number;
    bio: string;
    profileImage: string;
};


export default function Trainers() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const limit = 5;

    useEffect(() => {
        document.title = "TrainUp - Trainers";
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
        setPage(1); // Reset to first page on new search
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <main className="container py-8 space-y-6 dark dark:bg-background">
            <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold">Find a Trainer</h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search trainers..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-9 bg-secondary/40"
                    />
                </div>
            </header>

            {isLoading && (
                <p className="text-center text-muted-foreground animate-pulse">Loading trainers...</p>
            )}
            {error && (
                <p className="text-center text-destructive">{error}</p>
            )}
            {!isLoading && !error && trainers.length === 0 && (
                <p className="text-center text-muted-foreground">No trainers found.</p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {trainers.map((t) => (
                    <TrainerCard key={t.id} trainer={t} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(p)}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </main>
    );
}

function TrainerCard({ trainer }: { trainer: Trainer }) {
    const [open, setOpen] = useState(false);

    // Truncate bio to ~60 characters
    const truncatedBio = trainer.bio.length > 30 ? trainer.bio.slice(0, 30) + "..." : trainer.bio;

    return (
        <Card className="relative overflow-hidden animate-slide-down hover-scale min-w-[250px] max-w-[300px] mx-auto">
            <div className="relative w-full h-[250px] sm:h-[280px] md:h-[300px] aspect-square">
                <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white p-3 sm:p-4">
                    <div className="space-y-1.5">
                        <h2 className="text-lg sm:text-xl font-bold font-display tracking-wide text-shadow">
                            {trainer.name}
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-shadow">{trainer.specialty}</p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                            <span className="text-shadow">{trainer.rating}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                            <span className="text-shadow">{trainer.location}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-200 text-shadow line-clamp-2">{truncatedBio}</p>
                    </div>
                </div>
            </div>
            <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary">{trainer.price}</Badge>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">View</Button>
                        </DialogTrigger>
                        <DialogContent className="animate-slide-down">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {trainer.name}
                                    <Badge className="bg-accent text-accent-foreground">{trainer.price}</Badge>
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 text-accent" /> {trainer.specialty}
                                </div>
                                <p className="text-sm">{trainer.bio}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-accent" /> {trainer.location}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="bg-accent text-accent-foreground"
                                        onClick={() => toast.success("Hired (static)")}
                                    >
                                        Hire
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => toast("Chat feature coming soon")}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" /> Chat
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}