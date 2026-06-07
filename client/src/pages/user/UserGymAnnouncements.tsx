import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, 
  Search, 
  Calendar, 
  ArrowRight,
  Filter,
  Bell,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import UserGymLayout from "@/layouts/UserGymLayout";
import { getUserGymAnnouncements, type IGymAnnouncement } from "@/services/gymService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserGymAnnouncements() {
  const [announcements, setAnnouncements] = useState<IGymAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getUserGymAnnouncements(page, 10, searchTerm);
      setAnnouncements(res.announcements || []);
      setTotalPages(res.totalPages || 1);
    } catch (errorVal) { const error = errorVal as SafeAny;
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    document.title = "TrainUp | Gym Announcements";
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <UserGymLayout>
          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full font-black uppercase tracking-[0.3em] text-[10px] italic">INTEL FEED</Badge>
                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                  Gym <span className="text-zinc-500">Announcements</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">
                  Stay updated with the latest protocols and mission updates from your HQ.
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                <Input 
                  placeholder="Search transmissions..." 
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 gap-2 font-bold uppercase tracking-widest text-[10px]">
                <Filter size={16} /> Filter
              </Button>
            </div>
          </div>

          {/* Announcements List */}
          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48 bg-white/10" />
                      <Skeleton className="h-3 w-24 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full bg-white/10" />
                </Card>
              ))
            ) : announcements.length === 0 ? (
              <div className="py-32 text-center space-y-6 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 border border-white/5">
                  <Megaphone className="h-10 w-10 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase">Radio Silence</h3>
                  <p className="text-zinc-500 font-medium">No announcements found matching your current coordinates.</p>
                </div>
              </div>
            ) : (
              announcements.map((ann, i) => (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group relative overflow-hidden bg-white/5 border-white/10 rounded-[2.5rem] p-8 md:p-12 hover:border-primary/40 transition-all duration-500 shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                      <Megaphone size={200} className="text-primary" />
                    </div>

                    <div className="relative z-10 space-y-8">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                            <Bell size={24} />
                          </div>
                          <div>
                            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors">
                              {ann.title}
                            </h3>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">
                              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {format(new Date(ann.createdAt), "MMM dd, yyyy")}</span>
                              <span className="h-1 w-1 bg-zinc-800 rounded-full" />
                              <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {format(new Date(ann.createdAt), "hh:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-white/5 text-zinc-400 border-white/10 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px]">
                          OFFICIAL
                        </Badge>
                      </div>

                      <div className="space-y-6">
                        <p className="text-lg text-zinc-300 font-medium leading-relaxed max-w-4xl">
                          {ann.content || ann.description}
                        </p>
                        {ann.image && (
                          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 max-h-[400px]">
                            <img src={ann.image} alt={ann.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">
                          Transmitted by HQ Control
                        </p>
                        <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 gap-2">
                          View Protocol Details <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 pt-12">
              <Button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold"
              >
                Previous
              </Button>
              <div className="flex items-center px-6 rounded-xl bg-primary text-black font-black italic">
                {page} / {totalPages}
              </div>
              <Button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold"
              >
                Next
              </Button>
            </div>
          )}
    </UserGymLayout>
  );
}
