import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Target, Clock, Play, Info, CheckCircle2, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { getWorkoutTemplates, toggleWorkoutTemplate, startWorkoutTemplate } from "@/services/templateService";
import { toast } from "sonner";
import Aurora from "@/components/ui/Aurora";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";
import type { RootState } from "@/redux/store";
import API from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function WorkoutTemplates() {
  const [templates, setTemplates] = useState<IWorkoutTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IWorkoutTemplate | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.userAuth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "TrainUp - Workout Templates";
    fetchTemplates();
  }, [search]);

  async function fetchTemplates() {
    setIsLoading(true);
    try {
      const response = await getWorkoutTemplates({ search, limit: 20 });
      setTemplates(response?.templates || []);
    } catch (err) {
      toast.error("Failed to fetch workout templates");
    } finally {
      setIsLoading(false);
    }
  }

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
      const isActive = isTemplateActive(selectedTemplate._id);
      const action = isActive ? "stopped" : "started";

      await toggleWorkoutTemplate(selectedTemplate._id);
      await refreshProfile();

      toast.success(`Successfully ${action} ${selectedTemplate.title}!`);
      setIsToggleModalOpen(false);
    } catch (err) {
      toast.error("Failed to update template status");
    }
  };

  const handleStartOneTime = async (templateId: string) => {
    try {
      const res = await startWorkoutTemplate(templateId);
      if (res.sessionId) {
        toast.success("Workout session created!");
        navigate(`/workouts/${res.sessionId}/start`);
      } else {
        toast.success("Program added to your active sessions!");
      }
    } catch (err) {
      toast.error("Failed to start workout");
    }
  };

  const isTemplateActive = (templateId: string) => {
    return user?.activeWorkoutTemplates?.some(t => t.templateId === templateId) || user?.activeWorkoutTemplate === templateId;
  };

  const difficultyColors = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  const oneTimeTemplates = templates.filter(t => t.type === 'one-time');
  const seriesTemplates = templates.filter(t => t.type === 'series');

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit selection:bg-primary/30">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>
      <SiteHeader />

      <section className="relative py-16 overflow-hidden z-10">
        <div className="container mx-auto px-4 text-center space-y-8">
          <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
            Professional Workout Library
          </Badge>
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              FIND YOUR <span className="text-primary italic">PERFECTION</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400">
              Discover expertly crafted routines for any goal, from single sessions to 12-week transformations.
            </p>
          </div>

          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search goals, equipment, or body focus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-7 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-lg rounded-2xl backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-24 relative z-10 space-y-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-[2.5rem] bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-500">
              <Dumbbell className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">No Templates Found</h2>
            <Button onClick={() => setSearch("")} variant="outline" className="border-slate-800">Clear Search</Button>
          </div>
        ) : (
          <>
            {/* Quick Sessions */}
            {oneTimeTemplates.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-3xl font-black italic uppercase tracking-tight">Quick Sessions</h2>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5">One-Time</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {oneTimeTemplates.map(template => (
                    <TemplateCard 
                      key={template._id} 
                      template={template} 
                      isActive={isTemplateActive(template._id)}
                      onStart={() => handleStartOneTime(template._id)}
                      onView={() => navigate(`/workouts/details/${template._id}`)}
                      difficultyColors={difficultyColors}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Training Programs */}
            {seriesTemplates.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-primary rounded-full" />
                  <h2 className="text-3xl font-black italic uppercase tracking-tight">Training Programs</h2>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">Recurring</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {seriesTemplates.map(template => (
                    <TemplateCard 
                      key={template._id} 
                      template={template} 
                      isActive={isTemplateActive(template._id)}
                      onStart={() => {
                        setSelectedTemplate(template);
                        setIsToggleModalOpen(true);
                      }}
                      onView={() => navigate(`/workouts/details/${template._id}`)}
                      difficultyColors={difficultyColors}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Toggle Confirmation Modal */}
      <Dialog open={isToggleModalOpen} onOpenChange={setIsToggleModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white rounded-[2rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic">
              {selectedTemplate && isTemplateActive(selectedTemplate._id) ? 'STOP PROGRAM?' : 'START PROGRAM?'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedTemplate && isTemplateActive(selectedTemplate._id)
                ? `Confirm to stop "${selectedTemplate.title}". You can restart it anytime from this library.`
                : `Add "${selectedTemplate?.title}" to your active programs? It will appear in your "My Workouts" schedule.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsToggleModalOpen(false)} className="text-slate-400 hover:bg-white/5 font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleToggleTemplate}
              className={cn(
                "rounded-xl px-8 font-black italic tracking-widest text-white shadow-lg",
                selectedTemplate && isTemplateActive(selectedTemplate._id) 
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/20" 
                  : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              CONFIRM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateCard({ template, isActive, onStart, onView, difficultyColors }: { 
  template: IWorkoutTemplate; 
  isActive: boolean; 
  onStart: () => void; 
  onView: () => void;
  difficultyColors: any;
}) {
  return (
    <Card className="group relative bg-[#0a0a10]/60 border-slate-800/50 hover:border-primary/40 transition-all duration-500 overflow-hidden rounded-[2.5rem] flex flex-col shadow-xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={template.image || "https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=800&auto=format&fit=crop"}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-[#0a0a10]/40 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
          <Badge className={cn("uppercase text-[10px] font-black tracking-widest px-3 py-1 border-0 shadow-lg", difficultyColors[template.difficultyLevel] || difficultyColors.intermediate)}>
            {template.difficultyLevel}
          </Badge>
          {isActive && (
            <Badge className="bg-emerald-500 text-white font-black tracking-widest text-[10px] uppercase shadow-lg shadow-emerald-900/30">
              ACTIVE
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-8 flex flex-col flex-1 space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors leading-none">
            {template.title}
          </h3>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {template.days?.length} Sessions</span>
            <span className="flex items-center gap-1.5"><Target className="h-4 w-4 text-primary" /> {template.type === 'one-time' ? 'Quick' : 'Program'}</span>
          </div>
          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
            {template.description || "Achieve your peak performance with this specialized training regime."}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between gap-4">
          <Button 
            onClick={onView}
            variant="ghost" 
            className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-0"
          >
            Learn More <Info className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            onClick={onStart}
            className={cn(
              "h-12 rounded-xl px-6 font-black italic tracking-widest text-white transition-all shadow-lg",
              isActive 
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/20" 
                : "bg-primary hover:bg-primary/90 shadow-primary/20"
            )}
          >
            {isActive ? "STOP" : template.type === 'one-time' ? "DO IT NOW" : "START"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}