import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Search,
  ArrowLeft,
  Zap,
  Flame,
  Award
} from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import {  Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { getUserGymEquipment } from "@/services/gymService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserGymEquipment() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    document.title = "TrainUp | Arsenal Inventory";
    fetchEquipment();
  }, []);

  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || (item.categoryName || "Uncategorized") === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-x-hidden font-outfit">
      <div className="fixed inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12 flex-1 z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12 border-b border-white/5">
          <div className="space-y-4">
            <Link to={ROUTES.USER_GYM_DASHBOARD} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-3 w-3" /> HQ COMMAND
            </Link>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-[2rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Dumbbell className="h-8 w-8 text-cyan-400" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Arsenal <span className="text-zinc-500">Inventory</span>
              </h1>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <Input
                placeholder="Search tactical gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 bg-white/5 border-white/10 rounded-2xl focus:border-cyan-500/50 text-white font-bold"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-2xl">
                  <SelectItem value="all">All Sectors</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <Dumbbell className="h-20 w-20 text-zinc-800" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Inventory Sparse</h3>
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Adjust search parameters or deployment filters</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {paginatedEquipment.map((item, i) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative group p-6 rounded-[2.5rem] border-2 transition-all duration-500 shadow-xl ${
                      item.available
                        ? 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30'
                        : 'bg-zinc-900/50 border-red-500/10 grayscale opacity-60'
                    }`}
                  >
                    <div className="aspect-square rounded-3xl overflow-hidden bg-black/40 mb-6 relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800">
                          <Dumbbell size={64} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute top-4 left-4 pt-4 px-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-[-10px]">
                         <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-black uppercase tracking-widest italic">{item.categoryName}</Badge>
                      </div>

                      <Badge
                        className={`absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-widest shadow-2xl py-1.5 px-3 rounded-full ${
                          item.available ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.available ? 'OPERATIONAL' : 'OUT OF ORDER'}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.categoryName || "MISSION GEAR"}</p>
                        <h3 className="text-2xl font-black text-white italic line-clamp-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <div className={`h-2 w-2 rounded-full ${item.available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sector: {item.available ? "Safe" : "Unmapped"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-cyan-400 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Vector Back
                </button>
                <div className="flex items-center gap-4">
                  {[...Array(totalPages)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        currentPage === i + 1 ? 'w-12 bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'w-2 bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-cyan-400 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Vector Next <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        )}

        <section className="pt-24">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
               <Award size={150} />
             </div>
             <div className="max-w-2xl space-y-6 relative z-10">
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Advanced Training <span className="text-zinc-600">Modules</span></h2>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs leading-relaxed italic">Explore our specialized sectors for targeted muscle group focus. All equipment is regularly checked for optimal performance.</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Safety Proto</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Flame className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">High Intensity</span>
                  </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
