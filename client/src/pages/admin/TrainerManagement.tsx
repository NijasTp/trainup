import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Loader2, FileText, Plus, Eye, Edit, Trash } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Mock data interfaces based on provided schemas
interface IExercise {
  id: string;
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  time?: string;
  rest?: string;
  notes?: string;
}

interface IWorkoutTemplate {
  _id: string;
  name: string;
  givenBy: "admin";
  exercises: IExercise[];
  goal?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateMeal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string;
  nutritions?: { label: string; value: number; unit?: string }[];
  notes?: string;
}

interface IDietTemplate {
  _id: string;
  title: string;
  description?: string;
  createdBy: string;
  meals: TemplateMeal[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateResponse {
  templates: (IWorkoutTemplate | IDietTemplate)[];
  total: number;
  page: number;
  totalPages: number;
}

// Mock data for diet templates (static)
const mockDietTemplates: IDietTemplate[] = [
  {
    _id: "dt1",
    title: "Balanced Diet Plan",
    description: "General balanced diet for daily nutrition",
    createdBy: "admin1",
    meals: [
      {
        name: "Breakfast Oatmeal",
        calories: 300,
        protein: 10,
        carbs: 45,
        fats: 8,
        time: "08:00",
        notes: "Use skim milk",
      },
      {
        name: "Grilled Chicken Lunch",
        calories: 450,
        protein: 35,
        carbs: 30,
        fats: 15,
        time: "12:30",
      },
    ],
    createdAt: "2025-08-01T09:00:00Z",
    updatedAt: "2025-08-01T09:00:00Z",
  },
  {
    _id: "dt2",
    title: "Keto Diet Plan",
    description: "Low-carb, high-fat diet plan",
    createdBy: "admin1",
    meals: [
      {
        name: "Avocado Egg Breakfast",
        calories: 400,
        protein: 15,
        carbs: 5,
        fats: 35,
        time: "07:30",
      },
    ],
    createdAt: "2025-08-02T11:00:00Z",
    updatedAt: "2025-08-02T11:00:00Z",
  },
];

const TemplateManagement = () => {
  const [templateType, setTemplateType] = useState<"workout" | "diet">("workout");
  const [response, setResponse] = useState<TemplateResponse>({ templates: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<IWorkoutTemplate | IDietTemplate | null>(null);
  const templatesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        if (templateType === "workout") {
          // Dynamic fetch for workout templates
          const apiResponse = await axios.get('/admin/workout-templates', {
            params: {
              page: currentPage,
              limit: templatesPerPage,
              search: searchQuery,
            },
          });
          setResponse({
            templates: apiResponse.data.templates,
            total: apiResponse.data.total,
            page: apiResponse.data.page,
            totalPages: apiResponse.data.totalPages,
          });
        } else {
          // Static for diet templates
          const filteredTemplates = mockDietTemplates.filter(template =>
            template.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const startIndex = (currentPage - 1) * templatesPerPage;
          const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + templatesPerPage);
          setResponse({
            templates: paginatedTemplates,
            total: filteredTemplates.length,
            page: currentPage,
            totalPages: Math.ceil(filteredTemplates.length / templatesPerPage),
          });
        }
      } catch (error: any) {
        console.error("Error fetching templates:", error);
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
    if (e.key === "Enter") {
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
    navigate(`/admin/templates/edit/${template._id}/${templateType}`);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (templateType === "workout") {
      try {
        await axios.delete(`/admin/workout-templates/${id}`);
        // Refetch after delete
        setCurrentPage(1);
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    } else {
      // Static delete for diet (if needed, but since static, perhaps not implemented)
      console.log("Delete diet template not supported as it's static.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-[#4B8B9B]" />
              Template Management
            </h1>
            <p className="text-gray-400">Manage workout and diet templates</p>
          </div>
          <Button onClick={handleAddTemplate} className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80">
            <Plus className="mr-2 h-4 w-4" />
            Add {templateType === "workout" ? "Workout" : "Diet"} Template
          </Button>
        </div>

        {/* Template Type Selector and Search */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <Select onValueChange={(value: "workout" | "diet") => setTemplateType(value)} defaultValue="workout">
                  <SelectTrigger className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white w-40">
                    <SelectValue placeholder="Select Template Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                    <SelectItem value="workout">Workout Templates</SelectItem>
                    <SelectItem value="diet">Diet Templates</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                  <Input
                    placeholder={`Search ${templateType} templates...`}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80">
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">
              {templateType === "workout" ? "Workout" : "Diet"} Templates ({response.templates.length} of {response.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
                <span className="ml-2 text-gray-400">Loading templates...</span>
              </div>
            ) : response.templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No templates found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name/Title</th>
                        {templateType === "workout" ? (
                          <>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Exercises</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Goal</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Meals</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Total Calories</th>
                          </>
                        )}
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Created At</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.templates.map((template) => (
                        <tr key={template._id} className="border-b border-gray-800 hover:bg-[#1F2A44]/30">
                          <td className="py-4 px-4 text-white font-medium">
                            {templateType === "workout" ? (template as IWorkoutTemplate).name : (template as IDietTemplate).title}
                          </td>
                          {templateType === "workout" ? (
                            <>
                              <td className="py-4 px-4 text-gray-300">
                                {(template as IWorkoutTemplate).exercises?.length}
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                {(template as IWorkoutTemplate).goal || "N/A"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 px-4 text-gray-300">
                                {(template as IDietTemplate).meals?.length ?? 0}
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                {(template as IDietTemplate).meals?.reduce((sum, meal) => sum + meal.calories, 0) ?? 0}
                              </td>
                            </>
                          )}
                          <td className="py-4 px-4 text-gray-300">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewTemplate(template)}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteTemplate(template._id)}
                              className="flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <Trash className="h-3 w-3" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {response.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {response.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === response.totalPages}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Template Details Modal */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {templateType === "workout"
                    ? (selectedTemplate as IWorkoutTemplate).name
                    : (selectedTemplate as IDietTemplate).title}
                </DialogTitle>
                <DialogClose className="text-gray-400 hover:text-white" />
              </DialogHeader>
              <div className="mt-4">
                {templateType === "workout" ? (
                  <div>
                    <p className="text-gray-300 mb-2">
                      <span className="font-medium">Goal:</span>{" "}
                      {(selectedTemplate as IWorkoutTemplate).goal || "N/A"}
                    </p>
                    <p className="text-gray-300 mb-4">
                      <span className="font-medium">Notes:</span>{" "}
                      {(selectedTemplate as IWorkoutTemplate).notes || "N/A"}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-2">Exercises</h3>
                    {(selectedTemplate as IWorkoutTemplate).exercises.length === 0 ? (
                      <p className="text-gray-400">No exercises added</p>
                    ) : (
                      <div className="space-y-4">
                        {(selectedTemplate as IWorkoutTemplate).exercises.map((exercise) => (
                          <Card key={exercise.id} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                            <CardContent className="p-4">
                              <h4 className="text-white font-medium">{exercise.name}</h4>
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Sets:</span> {exercise.sets}
                              </p>
                              {exercise.reps && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Reps:</span> {exercise.reps}
                                </p>
                              )}
                              {exercise.time && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Time:</span> {exercise.time}
                                </p>
                              )}
                              {exercise.rest && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Rest:</span> {exercise.rest}
                                </p>
                              )}
                              {exercise.notes && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Notes:</span> {exercise.notes}
                                </p>
                              )}
                              {exercise.image && (
                                <img
                                  src={exercise.image}
                                  alt={exercise.name}
                                  className="mt-2 w-24 h-24 object-cover rounded"
                                />
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-300 mb-2">
                      <span className="font-medium">Description:</span>{" "}
                      {(selectedTemplate as IDietTemplate).description || "N/A"}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-2">Meals</h3>
                    {(selectedTemplate as IDietTemplate).meals.length === 0 ? (
                      <p className="text-gray-400">No meals added</p>
                    ) : (
                      <div className="space-y-4">
                        {(selectedTemplate as IDietTemplate).meals.map((meal, index) => (
                          <Card key={index} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                            <CardContent className="p-4">
                              <h4 className="text-white font-medium">{meal.name}</h4>
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Time:</span> {meal.time}
                              </p>
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Calories:</span> {meal.calories} kcal
                              </p>
                              {meal.protein && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Protein:</span> {meal.protein}g
                                </p>
                              )}
                              {meal.carbs && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Carbs:</span> {meal.carbs}g
                                </p>
                              )}
                              {meal.fats && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Fats:</span> {meal.fats}g
                                </p>
                              )}
                              {meal.nutritions && meal.nutritions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-gray-300 text-sm font-medium">Additional Nutrition:</p>
                                  {meal.nutritions.map((nutrition, idx) => (
                                    <p key={idx} className="text-gray-300 text-sm">
                                      {nutrition.label}: {nutrition.value}
                                      {nutrition.unit && ` ${nutrition.unit}`}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {meal.notes && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Notes:</span> {meal.notes}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default TemplateManagement;