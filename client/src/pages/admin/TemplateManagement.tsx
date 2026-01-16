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
import API from "@/lib/axios";
import type { IDietTemplate, IWorkoutTemplate, TemplateResponse } from "@/interfaces/admin/templateManagement";
import { KEY } from "@/constants/keyConstants";

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
        console.log('response:', apiResponse)
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
    try {
      const endpoint = templateType === "workout"
        ? `/template/workout/${id}`
        : `/template/diet/${id}`;
      await API.delete(endpoint);
      setCurrentPage(1);
      // Refetch templates after deletion
      const apiResponse = await API.get(templateType === "workout"
        ? '/template/workout'
        : '/template/diet', {
        params: {
          page: 1,
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
    } catch (error) {
      console.error("Error deleting template:", error);
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

        <Card className="bg-[#111827] border border-[#4B8B9B]/30 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <Select onValueChange={(value: "workout" | "diet") => setTemplateType(value)} defaultValue="workout">
                  <SelectTrigger className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white w-40">
                    <SelectValue placeholder="Select Template Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                    <SelectItem value="workout">Workout</SelectItem>
                    <SelectItem value="diet">Diet</SelectItem>
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
                            {templateType === "workout" ? (template as IWorkoutTemplate).title : (template as IDietTemplate).title}
                          </td>
                          {templateType === "workout" ? (
                            <>
                              <td className="py-4 px-4 text-gray-300">
                                {((template as IWorkoutTemplate).days || []).reduce((acc, day) => acc + (day.exercises?.length || 0), 0)}
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                {(template as IWorkoutTemplate).goal || "N/A"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 px-4 text-gray-300">
                                {((template as IDietTemplate).days || []).reduce((acc, day) => acc + (day.meals?.length || 0), 0)}
                              </td>
                              <td className="py-4 px-4 text-gray-300">
                                {((template as IDietTemplate).days || []).reduce((acc, day) => acc + (day.meals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0), 0)}
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
                    ? (selectedTemplate as IWorkoutTemplate).title
                    : (selectedTemplate as IDietTemplate).title}
                </DialogTitle>
                <DialogClose className="text-gray-400 hover:text-white" />
              </DialogHeader>
              <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
                {templateType === "workout" ? (
                  <div>
                    <p className="text-gray-300 mb-2">
                      <span className="font-medium">Goal:</span>{" "}
                      {(selectedTemplate as IWorkoutTemplate).goal || "N/A"}
                    </p>
                    <p className="text-gray-300 mb-4">
                      <span className="font-medium">Description:</span>{" "}
                      {(selectedTemplate as IWorkoutTemplate).description || "N/A"}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-2">Structure</h3>
                    {!(selectedTemplate as IWorkoutTemplate).days || (selectedTemplate as IWorkoutTemplate).days.length === 0 ? (
                      <p className="text-gray-400">No days added</p>
                    ) : (
                      <div className="space-y-6">
                        {(selectedTemplate as IWorkoutTemplate).days.map((day, dIdx) => (
                          <div key={dIdx} className="space-y-2">
                            <h4 className="text-[#4B8B9B] font-bold">Day {day.dayNumber || dIdx + 1}</h4>
                            <div className="space-y-3">
                              {day.exercises.map((exercise, eIdx) => (
                                <Card key={eIdx} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                                  <CardContent className="p-4">
                                    <h5 className="text-white font-medium">{exercise.name}</h5>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <p className="text-gray-300 text-sm">
                                        <span className="font-medium">Sets:</span> {exercise.sets}
                                      </p>
                                      {exercise.reps && (
                                        <p className="text-gray-300 text-sm">
                                          <span className="font-medium">Reps:</span> {exercise.reps}
                                        </p>
                                      )}
                                      {exercise.rest && (
                                        <p className="text-gray-300 text-sm">
                                          <span className="font-medium">Rest:</span> {exercise.rest}
                                        </p>
                                      )}
                                      {exercise.notes && (
                                        <p className="text-gray-300 text-sm col-span-2">
                                          <span className="font-medium">Notes:</span> {exercise.notes}
                                        </p>
                                      )}
                                    </div>
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
                          </div>
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
                    <h3 className="text-lg font-semibold text-white mb-2">Structure</h3>
                    {!(selectedTemplate as IDietTemplate).days || (selectedTemplate as IDietTemplate).days.length === 0 ? (
                      <p className="text-gray-400">No days added</p>
                    ) : (
                      <div className="space-y-6">
                        {(selectedTemplate as IDietTemplate).days.map((day, dIdx) => (
                          <div key={dIdx} className="space-y-2">
                            <h4 className="text-[#4B8B9B] font-bold">Day {day.dayNumber || dIdx + 1}</h4>
                            <div className="space-y-3">
                              {day.meals.map((meal, mIdx) => (
                                <Card key={mIdx} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between">
                                      <h5 className="text-white font-medium">{meal.name}</h5>
                                      <span className="text-xs text-[#4B8B9B] bg-[#4B8B9B]/10 px-2 py-1 rounded">{meal.time}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">
                                      <span className="font-medium">Calories:</span> {meal.calories} kcal
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-400">
                                      {meal.protein && <div>Protein: {meal.protein}g</div>}
                                      {meal.carbs && <div>Carbs: {meal.carbs}g</div>}
                                      {meal.fats && <div>Fats: {meal.fats}g</div>}
                                    </div>

                                    {meal.nutritions && meal.nutritions.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-gray-300 text-sm font-medium">Additional Nutrition:</p>
                                        {meal.nutritions.map((nutrition, idx) => (
                                          <p key={idx} className="text-gray-300 text-sm max-w-full truncate">
                                            {nutrition.label}: {nutrition.value}
                                            {nutrition.unit && ` ${nutrition.unit}`}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                    {meal.notes && (
                                      <p className="text-gray-300 text-sm mt-2">
                                        <span className="font-medium">Notes:</span> {meal.notes}
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
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