import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Utensils, FileText, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import type { DietTemplate } from "@/interfaces/user/IBrowseDietTemplates";
import { useNavigate } from "react-router-dom";


export default function DietTemplates() {
  const [templates, setTemplates] = useState<DietTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DietTemplate | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "TrainUp - Public Diet Templates";
    const debounce = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  async function fetchTemplates() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/diet/admin/templates', {
        params: { search },
      });
      setTemplates(response.data.templates || []);
    } catch (err) {
      setError("Failed to fetch diet templates");
      console.error("API error:", err);
      toast.error("Failed to load diet templates");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCardClick = (template: DietTemplate) => {
    setSelectedTemplate(template);
    console.log("Selected template:", template);
    setIsSessionModalOpen(true);
  };

  const handleAddSession = () => {
    setIsSessionModalOpen(false);
    setIsAddSessionModalOpen(true);
  };

const handleSubmitSession = async () => {
  try {
    const mappedMeals = selectedTemplate?.templates.map((templateMeal) => ({
      name: templateMeal.name,
      calories: templateMeal.calories,
      protein: templateMeal.protein || 0,
      carbs: templateMeal.carbs || 0,
      fats: templateMeal.fats || 0,
      time: templateMeal.time,
      nutritions: templateMeal.nutritions || [],
      notes: templateMeal.notes || '',
      isEaten: false,
      source: 'user',
    }));

    const sendData = {
      givenBy: 'user',
      date: sessionDate,
      meals: mappedMeals,
      title: selectedTemplate?.title,
      description: selectedTemplate?.description,
      notes: selectedTemplate?.notes,
    };

    const res = await api.post(`/diet/${sessionDate}/add-session`, sendData);
    console.log("Session scheduled:", res.data);
    toast.success("Diet session scheduled successfully");
    setIsAddSessionModalOpen(false);
    setSessionDate("");
    navigate('/diets');
  } catch (error) {
    console.error("Error scheduling session:", error);
    toast.error("Failed to schedule diet session");
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Utensils className="h-4 w-4 text-[#4B8B9B]" />
            <span className="text-sm font-medium text-[#4B8B9B]">Admin-Created Diets</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Explore Diet Templates
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover professionally designed diet plans to support your fitness journey
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4B8B9B]/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-card/80 backdrop-blur-sm border border-[#4B8B9B]/50 rounded-xl p-1 shadow-lg">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-[#4B8B9B] transition-colors" />
                  <Input
                    placeholder="Search by diet title or description..."
                    value={search}
                    onChange={handleSearch}
                    className="pl-12 pr-4 py-6 bg-transparent border-0 text-base font-medium placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-[#4B8B9B]/30"
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
              <div className="w-12 h-12 border-4 border-[#4B8B9B]/20 border-t-[#4B8B9B] rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Loading diet templates...</p>
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
            <h3 className="text-xl font-semibold text-foreground">No diet templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or check back later</p>
          </div>
        )}

        {/* Diet Templates Grid */}
        {!isLoading && !error && templates.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template, index) => (
              <DietTemplateCard
                key={template._id}
                template={template}
                index={index}
                onClick={() => handleCardClick(template)}
              />
            ))}
          </div>
        )}

        {/* Diet Details Modal */}
        <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto bg-card/90 backdrop-blur-sm border-[#4B8B9B]/50">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTemplate?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedTemplate?.description && (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#4B8B9B]" />
                  <span className="text-base font-medium">{selectedTemplate.description}</span>
                </div>
              )}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Meals:</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedTemplate?.templates.map((meal) => (
                    <div key={meal.id} className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="space-y-1">
                        <h5 className="text-base font-semibold text-foreground">{meal.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          Time: {meal.time} • {meal.calories} kcal
                          {meal.protein && ` • Protein: ${meal.protein}g`}
                          {meal.carbs && ` • Carbs: ${meal.carbs}g`}
                          {meal.fats && ` • Fats: ${meal.fats}g`}
                        </p>
                        {meal.nutritions && meal.nutritions.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {meal.nutritions
                              .filter((n) => ["Protein", "Carbs", "Fats", "Calories"].includes(n.label))
                              .map((nutrition, idx) => (
                                <p key={idx}>
                                  {nutrition.label}: {nutrition.value}
                                  {nutrition.unit && ` ${nutrition.unit}`}
                                </p>
                              ))}
                          </div>
                        )}
                        {meal.notes && (
                          <p className="text-sm text-muted-foreground">Notes: {meal.notes}</p>
                        )}
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
                className="w-full bg-gradient-to-r from-[#4B8B9B] to-[#4B8B9B]/90 hover:from-[#4B8B9B]/90 hover:to-[#4B8B9B] shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleAddSession}
              >
                Add to Your Diet Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Diet Session Modal */}
        <Dialog open={isAddSessionModalOpen} onOpenChange={setIsAddSessionModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-sm border-[#4B8B9B]/50">
            <DialogHeader>
              <DialogTitle>Schedule Your Diet Plan</DialogTitle>
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
              <Button
                className="w-full bg-gradient-to-r from-[#4B8B9B] to-[#4B8B9B]/90 hover:from-[#4B8B9B]/90 hover:to-[#4B8B9B] shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleSubmitSession}
                disabled={!sessionDate}
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

function DietTemplateCard({ template, index, onClick }: { template: DietTemplate; index: number; onClick: () => void }) {
  return (
    <Card
      className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-[#4B8B9B]/50 hover:border-[#4B8B9B] transition-all duration-500 hover:shadow-2xl hover:shadow-[#4B8B9B]/10 hover:-translate-y-2 cursor-pointer`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "slideUp 0.6s ease-out forwards",
      }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#4B8B9B]/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="relative w-full h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>

        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center">
          <Utensils className="h-12 w-12 text-muted-foreground/30" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{template.title}</h3>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          {template.description && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#4B8B9B]" />
              <span className="text-sm font-medium">{template.description}</span>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Meals:</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              {template.templates.map((meal) => (
                <li key={meal.id}>
                  {meal.name} - {meal.time}, {meal.calories} kcal
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