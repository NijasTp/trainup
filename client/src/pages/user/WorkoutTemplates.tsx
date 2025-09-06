import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Dumbbell, Target, FileText, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { fetchAdminWorkoutSessions } from "@/services/workoutService";
import api from "@/lib/axios";
import { toast } from "react-toastify";

type WorkoutTemplate = {
  _id: string;
  name: string;
  exercises: { id: string; name: string; image: string; sets: number; reps: string }[];
  goal: string;
  notes: string;
  createdAt: string;
};

export default function WorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");


  useEffect(() => {
    document.title = "TrainUp - Public Workout Templates";
    const debounce = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  async function fetchTemplates() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminWorkoutSessions()
      setTemplates(response.templates || [])
    } catch (err) {
      setError("Failed to fetch workout templates");
      console.error("API error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCardClick = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setIsSessionModalOpen(true);
  };

  const handleAddSession = () => {
    setIsSessionModalOpen(false);
    setIsAddSessionModalOpen(true);
  }

  const handleSubmitSession = async () => {
    try {
      let sendData = { givenBy: 'admin', date: sessionDate, time: sessionTime, exercises: selectedTemplate?.exercises, name: selectedTemplate?.name, goal: selectedTemplate?.goal, notes: selectedTemplate?.notes }
      const res = await api.post('/workout/sessions', sendData)
      console.log("Session scheduled:", res.data);
      setIsAddSessionModalOpen(false);
      setSessionDate("");
      setSessionTime("");
    } catch (error: any) {
      console.error("Error scheduling session:", error);
      toast.error("Failed to schedule session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin-Created Workouts</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Explore Workout Templates
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover professionally designed workout plans to kickstart your fitness journey
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
                    placeholder="Search by workout name or goal..."
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
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Loading workout templates...</p>
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
        {!isLoading && !error && templates.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No workout templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or check back later</p>
          </div>
        )}

        {/* Workout Templates Grid */}
        {!isLoading && !error && templates.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template, index) => (
              <WorkoutTemplateCard
                key={template._id}
                template={template}
                index={index}
                onClick={() => handleCardClick(template)}
              />
            ))}
          </div>
        )}

        {/* Workout Details Modal */}
        <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
          <DialogContent className="sm:max-w-[800px] bg-card/90 backdrop-blur-sm border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTemplate?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <span className="text-base font-medium">{selectedTemplate?.goal}</span>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Exercises:</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedTemplate?.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
                      <img
                        src={exercise.image}
                        alt={exercise.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="space-y-1">
                        <h5 className="text-base font-semibold text-foreground">{exercise.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} set{exercise.sets > 1 ? "s" : ""}, {exercise.reps} reps
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedTemplate?.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                  <p className="text-base text-muted-foreground leading-relaxed">{selectedTemplate.notes}</p>
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                onClick={handleAddSession}
              >
                Add to Your Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddSessionModalOpen} onOpenChange={setIsAddSessionModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-sm border-border/50">
            <DialogHeader>
              <DialogTitle>Schedule Your Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                onClick={handleSubmitSession}
                disabled={!sessionDate || !sessionTime}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function WorkoutTemplateCard({ template, index, onClick }: { template: WorkoutTemplate; index: number; onClick: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 cursor-pointer`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "slideUp 0.6s ease-out forwards",
      }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="relative w-full h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        <img
          src={template.exercises[0]?.image || "https://example.com/fallback-image.jpg"}
          alt={template.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{template.name}</h3>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{template.goal}</span>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Exercises:</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {template.exercises.map((exercise) => (
                <li key={exercise.id}>
                  {exercise.name} - {exercise.sets} set{exercise.sets > 1 ? "s" : ""}, {exercise.reps} reps
                </li>
              ))}
            </ul>
          </div>
          {template.notes && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-1" />
              <p className="text-sm text-muted-foreground leading-relaxed">{template.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}