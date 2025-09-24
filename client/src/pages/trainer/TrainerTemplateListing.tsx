import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Apple, 
  Trash2, 
  Plus, 
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface Template {
  _id: string;
  name?: string; 
  title?: string;
  goal?: string; 
  description?: string; 
  exercises?: any[];
  meals?: any[]; 
  createdAt: string;
  updatedAt: string;
}

interface TemplateListResponse {
  templates: Template[];
  total: number;
  page: number;
  totalPages: number;
}

export default function TrainerTemplateList() {
  const navigate = useNavigate();
  const [workoutTemplates, setWorkoutTemplates] = useState<TemplateListResponse>({
    templates: [],
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [dietTemplates, setDietTemplates] = useState<TemplateListResponse>({
    templates: [],
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [activeTab, setActiveTab] = useState<'workout' | 'diet'>('workout');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workoutPage, setWorkoutPage] = useState(1);
  const [dietPage, setDietPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    document.title = "TrainUp - My Templates";
    fetchTemplates();
  }, [workoutPage, dietPage, searchQuery]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const [workoutRes, dietRes] = await Promise.all([
        API.get(`/workout/trainer/workout-templates?page=${workoutPage}&limit=${limit}&search=${searchQuery}`),
        API.get(`/diet/trainer/diet-templates?page=${dietPage}&limit=${limit}&search=${searchQuery}`)
      ]);

      setWorkoutTemplates(workoutRes.data);
      setDietTemplates(dietRes.data);
    } catch (error: any) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string, type: 'workout' | 'diet') => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      await API.delete(`/${type}/trainer/${type}-templates/${id}`);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error: any) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    }
  };

  const getTemplateName = (template: Template, type: 'workout' | 'diet') => {
    return type === 'workout' ? template.name : template.title;
  };

  const getTemplateDescription = (template: Template, type: 'workout' | 'diet') => {
    return type === 'workout' ? template.goal : template.description;
  };

  const getTemplateCount = (template: Template, type: 'workout' | 'diet') => {
    if (type === 'workout') {
      return `${template.exercises?.length || 0} exercises`;
    }
    return `${template.meals?.length || 0} meals`;
  };

  const currentTemplates = activeTab === 'workout' ? workoutTemplates : dietTemplates;
  const currentPage = activeTab === 'workout' ? workoutPage : dietPage;
  const setCurrentPage = activeTab === 'workout' ? setWorkoutPage : setDietPage;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
          </div>
          <p className="text-muted-foreground font-medium text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/trainer/dashboard")}
              className="group hover:bg-primary/5 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground">My Templates</h1>
          </div>
          <div className="flex gap-4">
            <Link to="/trainer/templates/workout/new">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <Dumbbell className="h-4 w-4 mr-2" />
                New Workout
              </Button>
            </Link>
            <Link to="/trainer/templates/diet/new">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <Apple className="h-4 w-4 mr-2" />
                New Diet
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-card/40 backdrop-blur-sm p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'workout'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            <span>Workout Templates ({workoutTemplates.total})</span>
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'diet'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>Diet Templates ({dietTemplates.total})</span>
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentTemplates.templates.map((template) => (
            <Card key={template._id} className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {getTemplateName(template, activeTab)}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {getTemplateCount(template, activeTab)}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template._id, activeTab)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {getTemplateDescription(template, activeTab) || "No description available"}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                    <span>Modified: {new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {currentTemplates.templates.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
              {activeTab === 'workout' ? (
                <Dumbbell className="h-12 w-12 text-muted-foreground" />
              ) : (
                <Apple className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No {activeTab} templates found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? `No templates match "${searchQuery}". Try adjusting your search.`
                : `Create your first ${activeTab} template to get started.`
              }
            </p>
            <Link to={`/trainer/templates/${activeTab}/new`}>
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Create {activeTab === 'workout' ? 'Workout' : 'Diet'} Template
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {currentTemplates.templates.length > 0 && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-border/50 hover:bg-primary/5"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {currentTemplates.page} of {currentTemplates.totalPages}
              </span>
              <Badge variant="outline" className="text-xs">
                {currentTemplates.total} total
              </Badge>
            </div>
            <Button
              variant="outline"
              disabled={currentPage === currentTemplates.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-border/50 hover:bg-primary/5"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}