import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Trophy, ImagePlus, MoreVertical, Edit, Trash2, Eye, Filter, Sparkles, Layout, Dumbbell, Utensils, Box, Layers, Clock, Trash } from "lucide-react";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import type { IDietTemplate, IWorkoutTemplate, TemplateResponse } from "@/interfaces/admin/templateManagement";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const TrainerTemplateManagement = () => {
    const [templateType, setTemplateType] = useState<"workout" | "diet">("workout");
    const [response, setResponse] = useState<TemplateResponse>({ templates: [], total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<IWorkoutTemplate | IDietTemplate | null>(null);

    const { trainer } = useSelector((state: RootState) => state.trainerAuth);
    const navigate = useNavigate();
    const templatesPerPage = 9;

    useEffect(() => {
        const fetchTemplates = async () => {
            if (!trainer?._id) return;
            setLoading(true);
            try {
                const endpoint = templateType === "workout" ? '/template/workout' : '/template/diet';
                const apiResponse = await API.get(endpoint, {
                    params: {
                        page: currentPage,
                        limit: templatesPerPage,
                        search: searchQuery,
                        createdById: trainer._id
                    },
                });
                setResponse({
                    templates: apiResponse.data.templates || [],
                    total: apiResponse.data.total,
                    page: apiResponse.data.page,
                    totalPages: apiResponse.data.totalPages,
                });
            } catch (error: any) {
                console.error("Error fetching trainer templates:", error);
                setResponse({ templates: [], total: 0, page: 1, totalPages: 1 });
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [currentPage, searchQuery, templateType, trainer?._id]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleAddTemplate = () => {
        navigate(`/trainer/templates/new/${templateType}`);
    };

    const handleEditTemplate = (template: IWorkoutTemplate | IDietTemplate) => {
        navigate(`/trainer/templates/${template._id}/${templateType}/edit`);
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            const endpoint = templateType === "workout" ? `/template/workout/${id}` : `/template/diet/${id}`;
            await API.delete(endpoint);
            setSearchQuery("");
            setCurrentPage(1);
        } catch (error) {
            console.error("Error deleting template:", error);
        }
    };

    return (
        <TrainerLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Layers className="text-primary h-10 w-10" />
                            My Blueprint <span className="text-primary">Vault</span>
                        </h1>
                        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] italic">
                            Professional Protocol Library
                        </p>
                    </div>
                    <Button
                        onClick={handleAddTemplate}
                        className="bg-primary hover:bg-primary/90 text-black font-black italic uppercase text-xs px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Design New {templateType === 'workout' ? 'Program' : 'Diet'}
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder={`SEARCH YOUR ${templateType.toUpperCase()}S...`}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-black/40 border-white/10 h-14 pl-12 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 h-14">
                        <button
                            onClick={() => { setTemplateType('workout'); setCurrentPage(1); }}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${templateType === 'workout' ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Dumbbell size={14} /> Training
                        </button>
                        <button
                            onClick={() => { setTemplateType('diet'); setCurrentPage(1); }}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${templateType === 'diet' ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Utensils size={14} /> Nutrition
                        </button>
                    </div>
                    <Button onClick={handleSearch} className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black italic uppercase text-xs hover:bg-white/10">
                        Apply Filters
                    </Button>
                </div>

                {/* Template Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                className="group flex flex-col bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-2xl"
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    {(template as any).image ? (
                                        <img src={(template as any).image} alt={template.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-black flex items-center justify-center">
                                            <Layers size={40} className="text-primary/20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                                    {/* Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Button size="icon" variant="outline" onClick={() => setSelectedTemplate(template)} className="h-12 w-12 bg-white/10 border-white/20 text-white rounded-2xl hover:bg-primary hover:text-black hover:border-primary transition-all"><Eye size={20} /></Button>
                                        <Button size="icon" variant="outline" onClick={() => handleEditTemplate(template)} className="h-12 w-12 bg-white/10 border-white/20 text-white rounded-2xl hover:bg-primary hover:text-black hover:border-primary transition-all"><Edit size={20} /></Button>
                                        <Button size="icon" variant="outline" onClick={() => handleDeleteTemplate(template._id)} className="h-12 w-12 bg-white/10 border-white/20 text-white rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash size={20} /></Button>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 space-y-4">
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight truncate">{template.title}</h3>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold italic text-[10px]">
                                            <Clock size={12} className="text-primary" />
                                            {(template as any).repetitions ? `${(template as any).days.length * (template as any).repetitions} DAYS` : `${(template as any).durationDays || (template as any).duration} DAYS`}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-[10px] font-bold line-clamp-2 uppercase italic leading-relaxed">{template.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="h-80 flex flex-col items-center justify-center gap-4 bg-black/20 rounded-[3rem] border-2 border-dashed border-white/5">
                        <Layers size={48} className="text-gray-800" />
                        <p className="font-black uppercase italic text-gray-600 tracking-[0.3em] text-xs">Library empty / Build your first protocol</p>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
                <DialogContent className="max-w-4xl bg-black border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    {(selectedTemplate as any)?.image && (
                        <div className="aspect-video relative">
                            <img src={(selectedTemplate as any).image} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            <div className="absolute bottom-10 left-10">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter">{(selectedTemplate as any).title}</h2>
                            </div>
                        </div>
                    )}
                    <div className="p-10 space-y-8">
                        <p className="text-gray-400 font-medium italic leading-relaxed">{(selectedTemplate as any)?.description}</p>
                        <div className="flex justify-between items-center pt-8 border-t border-white/10">
                            <Button onClick={() => handleEditTemplate(selectedTemplate!)} className="bg-primary text-black font-black italic rounded-2xl h-14 px-10 hover:shadow-lg transition-all uppercase">Edit Architecture</Button>
                            <Button variant="ghost" onClick={() => setSelectedTemplate(null)} className="text-zinc-500 font-black italic">CLOSE ARCHIVE</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TrainerLayout>
    );
};

export default TrainerTemplateManagement;
