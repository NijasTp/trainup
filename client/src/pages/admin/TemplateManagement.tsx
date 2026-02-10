import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Loader2, FileText, Plus, Eye, Edit, Trash, Dumbbell, Utensils, Calendar, Sparkles } from "lucide-react";
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
  const templatesPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const endpoint = templateType === "workout"
          ? '/template/workout'
          : '/template/diet';
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

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const endpoint = templateType === "workout"
        ? `/template/workout/${id}`
        : `/template/diet/${id}`;
      await API.delete(endpoint);
      setSearchQuery(""); // Trigger refetch
      setCurrentPage(1);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white italic tracking-tight">TEMPLATE ASSETS</h1>
            <p className="text-gray-500 font-medium">Manage master workout and nutrition blueprints</p>
          </div>
          <Button
            onClick={handleAddTemplate}
            className="bg-primary hover:bg-primary/90 text-black font-black italic rounded-2xl h-12 px-8 shadow-[0_10px_20px_rgba(var(--primary),0.2)]"
          >
            <Plus className="mr-2 h-5 w-5" />
            CREATE NEW {templateType.toUpperCase()}
          </Button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/10 flex flex-col lg:flex-row gap-6 items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2 p-1.5 bg-zinc-900/50 rounded-2xl border border-white/5 w-full lg:w-auto">
              <button
                onClick={() => { setTemplateType("workout"); setCurrentPage(1); }}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${templateType === "workout" ? "bg-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
              >
                <Dumbbell size={14} />
                WORKOUTS
              </button>
              <button
                onClick={() => { setTemplateType("diet"); setCurrentPage(1); }}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${templateType === "diet" ? "bg-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
              >
                <Utensils size={14} />
                DIETS
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full lg:flex-1 lg:max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                <Input
                  placeholder={`Search ${templateType} templates...`}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-zinc-900/50 border-white/5 h-12 pl-12 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <Button onClick={handleSearch} className="bg-white/5 hover:bg-white/10 text-white font-black italic rounded-2xl h-12 px-8 border border-white/5">
                FILTER
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[450px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[450px] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-zinc-500 font-black animate-pulse tracking-widest uppercase">Fetching Blueprints...</p>
              </div>
            ) : response.templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[450px] gap-4">
                <FileText className="text-zinc-700" size={60} />
                <p className="text-zinc-500 font-black tracking-widest uppercase">No templates found</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <th className="px-8 py-5">Blueprint Details</th>
                    {templateType === "workout" ? (
                      <>
                        <th className="px-8 py-5">Composition</th>
                        <th className="px-8 py-5">Goal Focus</th>
                      </>
                    ) : (
                      <>
                        <th className="px-8 py-5">Meal Count</th>
                        <th className="px-8 py-5">Energy Density</th>
                      </>
                    )}
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {response.templates.map((template, idx) => (
                      <motion.tr
                        layout
                        key={template._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => handleViewTemplate(template)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-primary shadow-xl group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all shrink-0">
                              {templateType === "workout" ? <Dumbbell size={20} /> : <Utensils size={20} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-white italic tracking-tight uppercase truncate">
                                {templateType === "workout" ? (template as IWorkoutTemplate).title : (template as IDietTemplate).title}
                              </p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} />
                                {new Date(template.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {templateType === "workout" ? (
                          <>
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-gray-400">
                                {((template as IWorkoutTemplate).days || []).reduce((acc, day) => acc + (day.exercises?.length || 0), 0)} EXERCISES
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <Badge className="bg-zinc-900 text-primary border-primary/20 font-black text-[10px] tracking-widest">
                                {(template as IWorkoutTemplate).goal?.toUpperCase() || "GENERAL"}
                              </Badge>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-gray-400">
                                {((template as IDietTemplate).days || []).reduce((acc, day) => acc + (day.meals?.length || 0), 0)} MEALS
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-black text-white italic">
                                {((template as IDietTemplate).days || []).reduce((acc, day) => acc + (day.meals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0), 0)} KCAL
                              </span>
                            </td>
                          </>
                        )}

                        <td className="px-8 py-6">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-0 font-black text-[10px]">
                            VERIFIED
                          </Badge>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleViewTemplate(template); }}
                              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template._id); }}
                              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 text-red-500 transition-all flex items-center justify-center"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && response.totalPages > 1 && (
            <div className="p-8 border-t border-white/10 flex items-center justify-between bg-white/[0.01]">
              <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">
                PAGE {currentPage} OF {response.totalPages}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-black"
                >
                  <ChevronLeft size={16} className="mr-2" /> PREV
                </Button>
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === response.totalPages}
                  className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all font-black"
                >
                  NEXT <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Template Details Dialog */}
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0b] border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="relative p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 font-black text-[10px] tracking-widest uppercase mb-2">
                    {templateType === "workout" ? "WORKOUT ARCHIVE" : "NUTRITION PLAN"}
                  </Badge>
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tight">
                    {templateType === "workout" ? (selectedTemplate as IWorkoutTemplate)?.title : (selectedTemplate as IDietTemplate)?.title}
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {templateType === "workout" ? (selectedTemplate as IWorkoutTemplate)?.description : (selectedTemplate as IDietTemplate)?.description || "Complete platform master blueprint for elite training results."}
                  </p>
                </div>
                <DialogClose className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                  <Trash className="rotate-45 h-6 w-6" />
                </DialogClose>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Sparkles size={18} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Overview Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-black uppercase">Goal focus</p>
                      <p className="text-lg font-black italic text-white uppercase">{(selectedTemplate as any)?.goal || "OPTIMIZE"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-black uppercase">Complexity</p>
                      <p className="text-lg font-black italic text-emerald-500 uppercase">ELITE</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Calendar size={18} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Internal Ref</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-black uppercase">Blueprint ID</p>
                      <p className="text-xs font-mono text-zinc-400 truncate">{selectedTemplate?._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-black uppercase">Last Updated</p>
                      <p className="text-xs font-bold text-zinc-400">{new Date(selectedTemplate?.createdAt || "").toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase whitespace-nowrap">Program Structure</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="space-y-8">
                  {selectedTemplate?.days?.map((day: any, dIdx: number) => (
                    <div key={dIdx} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-black font-black italic">
                          D{day.dayNumber || dIdx + 1}
                        </div>
                        <h4 className="text-lg font-black text-white italic uppercase">Protocol Phase {day.dayNumber}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templateType === "workout" ? (
                          (day.exercises || []).map((exercise: IExercise, eIdx: number) => (
                            <motion.div
                              key={eIdx}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: eIdx * 0.1 }}
                              className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group/card"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <h5 className="text-white font-black italic uppercase group-hover:text-primary transition-colors">{exercise.name}</h5>
                                <Badge className="bg-primary/10 text-primary border-0 rounded-lg text-[9px] font-black">{exercise.sets} SETS</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                                  <p className="text-[9px] text-zinc-500 font-black uppercase mb-0.5 tracking-tighter">Resistance</p>
                                  <p className="text-xs font-bold text-white tracking-widest uppercase">{exercise.reps || "MAX"}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                                  <p className="text-[9px] text-zinc-500 font-black uppercase mb-0.5 tracking-tighter">Recovery</p>
                                  <p className="text-xs font-bold text-white tracking-widest uppercase">{exercise.rest || "60S"}</p>
                                </div>
                              </div>
                              {exercise.notes && <p className="text-[10px] text-zinc-500 font-medium italic">"{exercise.notes}"</p>}
                            </motion.div>
                          ))
                        ) : (
                          (day.meals || []).map((meal: TemplateMeal, mIdx: number) => (
                            <motion.div
                              key={mIdx}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: mIdx * 0.1 }}
                              className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group/card"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black text-primary tracking-widest uppercase">{meal.time}</span>
                                  <h5 className="text-white font-black italic uppercase group-hover:text-primary transition-colors">{meal.name}</h5>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-0 rounded-lg text-[9px] font-black tracking-widest">{meal.calories} KCAL</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                                  <p className="text-[8px] text-zinc-500 font-black uppercase mb-0.5">PRO</p>
                                  <p className="text-[10px] font-bold text-emerald-500">{meal.protein}g</p>
                                </div>
                                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                                  <p className="text-[8px] text-zinc-500 font-black uppercase mb-0.5">CAR</p>
                                  <p className="text-[10px] font-bold text-amber-500">{meal.carbs}g</p>
                                </div>
                                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                                  <p className="text-[8px] text-zinc-500 font-black uppercase mb-0.5">FAT</p>
                                  <p className="text-[10px] font-bold text-red-500">{meal.fats}g</p>
                                </div>
                              </div>
                              {meal.notes && <p className="text-[10px] text-zinc-500 font-medium italic">"{meal.notes}"</p>}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <Button
                  onClick={() => handleEditTemplate(selectedTemplate!)}
                  className="bg-primary hover:bg-primary/90 text-black font-black italic rounded-2xl h-14 px-10 text-lg shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  INITIALIZE EDITOR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TemplateManagement;
