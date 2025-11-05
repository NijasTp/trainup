import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  MapPin,
  Star,
  Users,
  Search,
  Filter,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";

interface Gym {
  _id: string;
  name: string;
  profileImage?: string;
  images?: string[];
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  memberCount: number;
  planCount: number;
  minPrice: number;
  rating: number;
  distance?: number;
}

export default function GymsListing() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "TrainUp - Find Your Perfect Gym";

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          toast.info("Location access denied, showing all gyms without distance sorting.");
          setUserLocation(null);
        },
        { timeout: 10000 }
      );
    } else {
      toast.info("Geolocation not supported , showing all gyms.");
      setUserLocation(null);
    }
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [currentPage, searchQuery, userLocation]);

  const fetchGyms = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        search: searchQuery,
      };

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await API.get("/user/gyms", { params });
      
      setGyms(response.data.gyms || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to fetch gyms:", err);
      toast.error("Failed to load gyms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // fetchGyms will be triggered by useEffect
  };

  const handleGymClick = (gymId: string) => {
    navigate(`/gyms/${gymId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Building className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Find Your Perfect Gym</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Premium Gyms Near You
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover state-of-the-art facilities and join a community of fitness enthusiasts
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gyms by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Button type="submit" className="px-6">
                Search
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Gyms Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : gyms.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-16 text-center">
              <Building className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No gyms found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try adjusting your search criteria" 
                  : "No gyms are available in your area at the moment"
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gyms.map((gym) => (
                <Card
                  key={gym._id}
                  className="group relative overflow-hidden bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => handleGymClick(gym._id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={gym.profileImage || gym.images?.[0] || "/placeholder.svg"}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-white text-xs font-medium">{gym.rating}</span>
                      </div>
                    </div>

                    {/* Gym Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-white text-lg mb-1">{gym.name}</h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{gym.memberCount} members</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Distance */}
                      {gym.distance !== undefined && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{gym.distance.toFixed(1)} km away</span>
                        </div>
                      )}

                      {/* Plans and Pricing */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {gym.planCount} plans available
                        </Badge>
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <CreditCard className="h-3 w-3" />
                          <span>₹{gym.minPrice}/mo</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full group/btn" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGymClick(gym._id);
                        }}
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
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