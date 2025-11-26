import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  isActive: boolean;
}

export default function GymAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TrainUp - Gym Announcements";
    fetchAnnouncements();
  }, [currentPage, searchQuery]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/user/gym-announcements", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchQuery,
        },
      });

      setAnnouncements(response.data.announcements || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to fetch announcements:", err);
      if (err.response?.status === 404) {
        toast.error("You don't have an active gym membership");
        navigate("/gyms");
      } else {
        toast.error("Failed to load announcements");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAnnouncements();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <SiteHeader />

      {/* Navigation */}
      <div className="relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/gyms/my-gym")} className="text-gray-300 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Gym
          </Button>
        </div>
      </div>

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 rounded-full border border-blue-800">
            <Bell className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Gym Announcements</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Latest Updates
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Stay informed with the latest news and updates from your gym
          </p>
        </div>

        {/* Search */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-gray-500"
                />
              </div>
              <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700 text-white">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Announcements */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-16 text-center">
              <Bell className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No announcements found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "No announcements are available at the moment"
                }
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                    fetchAnnouncements();
                  }}
                  className="bg-slate-900 border-slate-600 text-white hover:bg-slate-800"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <Card
                  key={announcement._id}
                  className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:shadow-lg transition-all duration-300 hover:bg-slate-800"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {announcement.image && (
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-900">
                            <img
                              src={announcement.image}
                              alt={announcement.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {announcement.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                              </div>
                              <Badge variant={announcement.isActive ? "default" : "secondary"} className={announcement.isActive ? "bg-green-900/30 text-green-400 hover:bg-green-900/40" : "bg-gray-700 text-gray-300"}>
                                {announcement.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>

                          {!announcement.image && (
                            <div className="p-3 bg-blue-900/20 rounded-lg">
                              <Bell className="h-6 w-6 text-blue-500" />
                            </div>
                          )}
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                          {announcement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="bg-slate-900 border-slate-600 text-white hover:bg-slate-800"
                >
                  Previous
                </Button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-900 border-slate-600 text-white hover:bg-slate-800"}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="bg-slate-900 border-slate-600 text-white hover:bg-slate-800"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}