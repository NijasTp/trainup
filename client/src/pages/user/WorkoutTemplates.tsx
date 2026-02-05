import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Target, Clock, Star, Play, Info, CheckCircle2, X } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { getWorkoutTemplates, toggleWorkoutTemplate } from "@/services/templateService";
import { toast } from "react-toastify";
import Aurora from "@/components/ui/Aurora";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";
import type { RootState } from "@/redux/store";
import API from "@/lib/axios";

export default function WorkoutTemplates() {
  const [templates, setTemplates] = useState<IWorkoutTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IWorkoutTemplate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  const user = useSelector((state: RootState) => state.userAuth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "TrainUp - Workout Templates";
    fetchTemplates();
  }, [search]);

  async function fetchTemplates() {
    setIsLoading(true);
    try {
      const response = await getWorkoutTemplates({ search, limit: 12 });
      setTemplates(response.templates || []);
    } catch (err) {
      toast.error("Failed to fetch workout templates");
    } finally {
      setIsLoading(false);
    }
  }

  // Refresh profile to get updated active templates
  const refreshProfile = async () => {
    try {
      const res = await API.get('/user/get-profile');
      if (res.data.user) {
        dispatch(updateUser(res.data.user));
      }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  }

  const handleToggleTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const isActive = user?.activeWorkoutTemplates?.some(t => t.templateId === selectedTemplate._id);
      const action = isActive ? "stopped" : "started";

      await toggleWorkoutTemplate(selectedTemplate._id);

      await refreshProfile();

      toast.success(`Successfully ${action} ${selectedTemplate.name}!`);
      setIsToggleModalOpen(false);
      setIsDetailModalOpen(false);
    } catch (err) {
      toast.error("Failed to update template status");
    }
  };

  const isTemplateActive = (templateId: string) => {
    // Check array
    if (user?.activeWorkoutTemplates?.some(t => t.templateId === templateId)) return true;
    // Check legacy
    if (user?.activeWorkoutTemplate === templateId) return true;
    return false;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit selection:bg-primary/30">
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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="container relative mx-auto px-4 text-center space-y-8">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5 animate-fade-in">
            New Templates Added Weekly
          </Badge>
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              TRANSFORM YOUR <span className="text-primary italic">ROUTINE</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400">
              Professional training programs designed for every goal. Choose a plan, stay consistent, and see the results.
            </p>
          </div>

          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by goal, equipment, or body type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-7 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-lg rounded-2xl backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-24">
        {/* Active Templates Section */}
        {user?.activeWorkoutTemplates && user.activeWorkoutTemplates.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              Active Programs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.activeWorkoutTemplates.map(at => {
                const t = templates.find(temp => temp._id === at.templateId);
                if (!t) return null; // Or fetch detailed info if not in list
                return (
                  <div key={at.templateId} className="p-6 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-md flex flex-col justify-between gap-4 hover:bg-primary/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(t);
                      setIsDetailModalOpen(true);
                    }}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-white">{t.name}</h4>
                        <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">Active</Badge>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Started: {new Date(at.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Explore Programs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((template) => {
                const isActive = isTemplateActive(template._id);
                return (
                  <Card
                    key={template._id}
                    className={`group relative bg-slate-900/40 border-slate-800 hover:border-primary/50 transition-all duration-500 overflow-hidden rounded-3xl cursor-pointer ${isActive ? 'ring-2 ring-primary/40' : ''}`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-white/10 uppercase tracking-widest text-[10px] font-bold">
                        {template.difficulty || 'Intermediate'}
                      </Badge>
                      {isActive && (
                        <Badge className="bg-green-500 text-white shadow-lg shadow-green-500/20 gap-1 pl-1">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>

                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>
                      <img
                        src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
                        alt={template.title || template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute bottom-6 left-6 z-20">
                        <h3 className="text-2xl font-bold text-white mb-1">{template.title || template.name}</h3>
                        <div className="flex items-center gap-4 text-slate-300 text-sm">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {template.duration} Days</span>
                          <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {template.goal}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 relative">
                      <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                        {template.description || "Achieve your peak performance with this specialized training program."}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bold">4.9</span>
                          <span className="text-slate-500 text-xs font-normal">(1.2k)</span>
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl">
                          Learn More <Info className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-500">
              <Dumbbell className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">No Templates Found</h2>
              <p className="text-slate-400">Try searching for something else or browse all programs.</p>
            </div>
            <Button onClick={() => setSearch("")} variant="outline" className="border-slate-800 text-white">
              Clear Search
            </Button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-white overflow-hidden p-0 rounded-3xl">
          <div className="relative h-64 md:h-80">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
            <img
              src={selectedTemplate?.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
              alt={selectedTemplate?.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4 z-20 hover:bg-white/10 text-white rounded-full h-10 w-10 p-0"
              onClick={() => setIsDetailModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-6 left-8 z-20 space-y-2">
              <Badge className="bg-primary text-white border-0">{selectedTemplate?.difficulty || 'Intermediate'}</Badge>
              <h2 className="text-4xl font-black">{selectedTemplate?.name}</h2>
            </div>
          </div>

          <div className="p-8 grid md:grid-cols-[1fr_300px] gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" /> Overview
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  {selectedTemplate?.description || "This program is designed to target your specific goals with progressive overload and functional movements."}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Weekly Schedule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedTemplate?.days?.map((day: any) => (
                    <div key={day.dayNumber} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {day.dayNumber}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{day.name}</p>
                          <p className="text-xs text-slate-500">{day.workoutName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-950 border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="text-white font-medium">{selectedTemplate?.duration || 7} Days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Goal</span>
                    <span className="text-white font-medium">{selectedTemplate?.goal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Equipment</span>
                    <span className="text-white font-medium">{selectedTemplate?.equipmentNeeded?.join(', ') || 'Standard Gym'}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  {selectedTemplate && isTemplateActive(selectedTemplate._id) ? (
                    <Button
                      className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
                      onClick={() => setIsToggleModalOpen(true)}
                    >
                      <X className="h-5 w-5 mr-2" /> Stop Program
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                      onClick={() => setIsToggleModalOpen(true)}
                    >
                      <Play className="h-5 w-5 mr-2" /> Start This Program
                    </Button>
                  )}
                </div>
              </Card>

              <p className="text-[10px] text-center text-slate-500 px-4 leading-relaxed">
                You can have multiple active programs at once. Manage them from your profile or here.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isToggleModalOpen} onOpenChange={setIsToggleModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTemplate && isTemplateActive(selectedTemplate._id) ? 'Stop Program?' : 'Start Program?'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedTemplate && isTemplateActive(selectedTemplate._id)
                ? `Are you sure you want to stop following "${selectedTemplate.name}"? This will remove it from your active programs.`
                : `Do you want to start following "${selectedTemplate?.name}"? It will be added to your active programs.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-0 mt-6">
            <Button variant="ghost" onClick={() => setIsToggleModalOpen(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button
              onClick={handleToggleTemplate}
              className={selectedTemplate && isTemplateActive(selectedTemplate._id) ? "bg-destructive hover:bg-destructive/90 text-white rounded-xl px-8" : "bg-primary hover:bg-primary/90 text-white rounded-xl px-8"}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}