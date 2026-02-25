import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Loader2, FileText, Plus, Eye, Edit, Trash, Dumbbell, Utensils, Calendar, Sparkles, Clock, Users, Layers, Trophy } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import type { IDietTemplate, IWorkoutTemplate, TemplateResponse, IExercise, TemplateMeal } from "@/interfaces/admin/templateManagement";
import { KEY } from "@/constants/keyConstants";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const TemplateManagement = () => {
  const [templateType, setTemplateType] = useState<"workout" | "diet">("workout");
  const [response, setResponse] = useState<TemplateResponse>({ templates: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<IWorkoutTemplate | IDietTemplate | null>(null);
  const templatesPerPage = 9; // Grid friendly
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const endpoint = templateType === "workout" ? '/template/workout' : '/template/diet';
        const apiResponse = await API.get(endpoint, {
          params: {
            page: currentPage,
            limit: templatesPerPage,
            search: searchQuery,
          },
        });
        setResponse({
          templates: apiResponse.data.templates || apiResponse.data.meals,
          total: apiResponse.data.total,
          page: apiResponse.data.page,
          totalPages: apiResponse.data.totalPages,
        });
      } catch (error: any) {
        console.error("Error fetching templates:", error);
        setResponse({ templates: [], total: 0, page: 1, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [currentPage, searchQuery, templateType]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === KEY.ENTER) {
      handleSearch();
    }
  };

  const handleAddTemplate = () => {
    navigate(`/admin/templates/new/${templateType}`);
  };

  const handleViewTemplate = (template: IWorkoutTemplate | IDietTemplate) => {
    setSelectedTemplate(template);
  };

  const handleEditTemplate = (template: IWorkoutTemplate | IDietTemplate) => {
    navigate(`/admin/templates/${template._id}/${templateType}/edit`);
  };

  const handleDeleteTemplate = async (id: string | any) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const endpoint = templateType === "workout" ? `/template/workout/${id}` : `/template/diet/${id}`;
      await API.delete(endpoint);
      setSearchQuery(""); // Trigger refetch
      setCurrentPage(1);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <Layers className="text-cyan-500 h-10 w-10" />
              Elite Blueprint <span className="text-cyan-500">Vault</span>
            </h1>
            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] italic">
              Management Core / Template Architecture V2.0
            </p>
          </div>
          <Button
            onClick={handleAddTemplate}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black italic uppercase text-xs px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Synthesize New {templateType === 'workout' ? 'Program' : 'Diet'}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors h-5 w-5" />
            <Input
              placeholder={`SEARCH ${templateType.toUpperCase()} ARCHITECTURE...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/40 border-white/10 h-14 pl-12 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 h-14">
            <button
              onClick={() => { setTemplateType('workout'); setCurrentPage(1); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${templateType === 'workout' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Dumbbell size={14} /> Training
            </button>
            <button
              onClick={() => { setTemplateType('diet'); setCurrentPage(1); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${templateType === 'diet' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Utensils size={14} /> Nutrition
            </button>
          </div>
          <Button onClick={handleSearch} className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black italic uppercase text-xs hover:bg-white/10">
            Filter Search
          </Button>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : response.templates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {response.templates.map((template, idx) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-2xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  {(template as any).image ? (
                    <img src={(template as any).image} alt={template.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-black flex items-center justify-center">
                      <Dumbbell size={40} className="text-cyan-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                  {/* Difficulty Badge */}
                  <div className="absolute top-6 left-6">
                    <Badge className={`font-black italic uppercase text-[8px] tracking-[0.2em] px-4 py-1.5 rounded-full border-0 ${(template as any).difficultyLevel === 'beginner' ? 'bg-green-500/10 text-green-400' :
                        (template as any).difficultyLevel === 'intermediate' ? 'bg-cyan-500/10 text-cyan-400' :
                          'bg-rose-500/10 text-rose-400'
                      }`}>
                      {(template as any).difficultyLevel || 'STANDARD'}
                    </Badge>
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button size="icon" variant="outline" onClick={() => handleViewTemplate(template)} className="h-12 w-12 bg-white/10 border-white/20 text-white rounded-2xl hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all scale-75 group-hover:scale-100"><Eye size={20} /></Button>
                    <Button size="icon" variant="outline" onClick={() => handleEditTemplate(template)} className="h-12 w-12 bg-white/10 border-white/20 text-white rounded-2xl hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all scale-75 group-hover:scale-100 delay-75"><Edit size={20} /></Button>
                    <Button size="icon" variant="outline" onClick={() => handleDeleteTemplate(template._id)} className="h-12 w-12 bg-white/10 border-white/20 text-white rounded-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all scale-75 group-hover:scale-100 delay-150"><Trash size={20} /></Button>
                  </div>
                </div>
                <div className="p-8 flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors truncate">{template.title}</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={12} className="text-cyan-500" />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">{(template as any).durationDays || (template as any).duration} DAYS</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Trophy size={12} className="text-cyan-500" />
                        <span className="text-[10px] font-black uppercase italic tracking-widest">{(template as any).type || 'SESSION'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[10px] font-bold leading-relaxed line-clamp-2 uppercase italic tracking-wide">{template.description || "Experimental blueprint architecture for peak physical output."}</p>
                </div>
                <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-cyan-500/50" />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{(template as any).popularityCount || 0} OPERATORS</span>
                  </div>
                  <span className="text-[9px] font-black text-gray-600 uppercase italic">REF: {template._id?.toString().slice(-6).toUpperCase()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center gap-4 bg-black/20 rounded-[3rem] border-2 border-dashed border-white/5">
            <Layers size={48} className="text-gray-800" />
            <p className="font-black uppercase italic text-gray-600 tracking-[0.3em] text-xs">No assets found in secure vault</p>
          </div>
        )}

        {/* Pagination */}
        {response.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-12">
            {Array.from({ length: response.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-12 w-12 rounded-2xl font-black italic transition-all transform active:scale-95 ${currentPage === i + 1 ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Template Dialog Placeholder - Keeping simple for now to avoid bloat */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl bg-black border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="aspect-video relative">
            <img src={(selectedTemplate as any)?.image} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-10 left-10 space-y-2">
              <Badge className="bg-cyan-500 text-black font-black italic rounded-full px-4 py-1 uppercase text-[10px]">{(selectedTemplate as any)?.difficultyLevel || 'ELITE'}</Badge>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">{(selectedTemplate as any)?.title}</h2>
            </div>
          </div>
          <div className="p-10 space-y-8">
            <p className="text-gray-400 font-medium italic leading-relaxed">{(selectedTemplate as any)?.description}</p>
            <div className="flex justify-between items-center pt-8 border-t border-white/10">
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-xl font-black italic text-cyan-400 uppercase">{(selectedTemplate as any)?.durationDays || (selectedTemplate as any)?.duration} Days</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Architecture</p>
                  <p className="text-xl font-black italic text-cyan-400 uppercase">{(selectedTemplate as any)?.type || 'Series'}</p>
                </div>
              </div>
              <Button onClick={() => handleEditTemplate(selectedTemplate!)} className="bg-white text-black font-black italic rounded-2xl h-14 px-10 hover:bg-cyan-500 transition-colors uppercase">Enter Editor</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TemplateManagement;
