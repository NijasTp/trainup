import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, Dumbbell, Star, Clock, Trophy } from "lucide-react"
import API from "@/lib/axios"
import { toast } from "sonner"
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader"
import { SiteFooter } from "@/components/user/home/UserSiteFooter"
import { cn } from "@/lib/utils"

interface Template {
  _id: string
  title: string
  description: string
  image: string
  difficultyLevel: string
  type: string
  popularityCount: number
}

export default function TrainerAssignWorkouts() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [client, setClient] = useState<any>(null)
  const [isAssigning, setIsAssigning] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch both trainer's templates and public templates
      const response = await API.get("/template/workout", {
        params: { limit: 100 }
      })
      setTemplates(response.data.templates)
    } catch (err) {
      toast.error("Failed to load templates")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchClientDetails = useCallback(async () => {
    try {
      const response = await API.get(`/trainer/user/${userId}`)
      setClient(response.data)
    } catch (err) {
      toast.error("Failed to load client details")
    }
  }, [userId])

  useEffect(() => {
    fetchTemplates()
    fetchClientDetails()
  }, [fetchTemplates, fetchClientDetails])

  const handleAssign = async (templateId: string) => {
    setIsAssigning(templateId)
    try {
      await API.post("/template/workout/assign", { userId, templateId })
      toast.success("Blueprint assigned successfully!")
      navigate("/trainer/clients")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Assignment failed")
    } finally {
      setIsAssigning(null)
    }
  }

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <TrainerSiteHeader />
      
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative container mx-auto px-6 py-12 space-y-12 z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-white/40 hover:text-cyan-400 p-0 hover:bg-transparent"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">Back to Network</span>
            </Button>
            <div className="space-y-2">
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 font-black italic uppercase tracking-widest text-[10px]">
                    Blueprint Deployment
                </Badge>
                <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                    Assign <span className="text-cyan-500">Workout</span>
                </h1>
                <p className="text-white/40 font-medium text-lg max-w-xl">
                    Deploying architectural training protocols for <span className="text-white font-bold">{client?.name || "Target User"}</span>.
                </p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Filter blueprints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-white/[0.03] border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 h-14 rounded-2xl text-sm font-bold placeholder:text-white/10 italic"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-2 border-white/5 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase italic tracking-widest text-white/20">Accessing Data Library...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTemplates.map((template) => (
                    <Card 
                        key={template._id}
                        className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500 rounded-[2.5rem]"
                    >
                        <div className="aspect-video relative overflow-hidden">
                            <img 
                                src={template.image || "/placeholder.svg"} 
                                alt={template.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                            <Badge className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border-white/10 text-cyan-400 font-black italic uppercase tracking-widest text-[9px] px-3 py-1">
                                {template.difficultyLevel}
                            </Badge>
                        </div>
                        
                        <CardContent className="p-8 space-y-6 -mt-8 relative z-10">
                            <div className="space-y-2">
                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-black italic uppercase">
                                    {template.type} Protocol
                                </Badge>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors uppercase">
                                    {template.title}
                                </h3>
                                <p className="text-white/40 text-xs font-medium line-clamp-2 leading-relaxed italic">
                                    {template.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Star className="h-3 w-3 text-cyan-500" />
                                    <span className="text-[10px] font-black text-white/60 italic">{template.popularityCount || 0} Activations</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-cyan-500" />
                                    <span className="text-[10px] font-black text-white/60 italic uppercase">Optimized</span>
                                </div>
                            </div>

                            <Button
                                className={cn(
                                    "w-full h-14 bg-white text-black hover:bg-cyan-500 hover:text-white font-black italic uppercase tracking-widest text-xs rounded-2xl transition-all duration-300",
                                    isAssigning === template._id && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() => handleAssign(template._id)}
                                disabled={!!isAssigning}
                            >
                                {isAssigning === template._id ? (
                                    <div className="flex items-center gap-2 font-black italic uppercase">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Deploying...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 font-black italic uppercase">
                                        <Trophy className="h-4 w-4" />
                                        Initialize Deployment
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {!isLoading && filteredTemplates.length === 0 && (
            <div className="text-center py-24 space-y-6 opacity-40">
                <Dumbbell className="h-16 w-16 mx-auto text-white/10" />
                <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">No Blueprints Found</h3>
                    <p className="max-w-xs mx-auto text-sm font-medium">Try adjusting your search criteria in the global database.</p>
                </div>
            </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
