import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Mail, Phone, Calendar, Filter, MessageSquare, Dumbbell, Search, MousePointer2 } from "lucide-react"
import API from "@/lib/axios"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader"
import { SiteFooter } from "@/components/user/home/UserSiteFooter"
import type { PaginatedClients } from "@/interfaces/trainer/iTrainerDashboard"
import { cn } from "@/lib/utils"

export default function TrainerClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<PaginatedClients>({ clients: [], total: 0, page: 1, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 10


  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await API.get("/trainer/get-clients", {
        params: { page, limit, search, planFilter: planFilter !== 'all' ? planFilter : undefined },
      })
      setClients(response.data)
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to fetch clients:", err)
      setError("Failed to load clients")
      toast.error("Failed to load clients")
      setIsLoading(false)
    fetchClients()
  }, [page, search, planFilter])

  useEffect(() => {
    document.title = "TrainUp - My Clients"
    fetchClients()
  }, [fetchClients])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value)
    setPage(1)
  }

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPlanStyle = (plan?: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'premium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      case 'pro':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]';
      default:
        return 'bg-white/5 text-white/40 border-white/10';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <TrainerSiteHeader />
        <div className="relative container mx-auto px-6 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-cyan-400/30 rounded-full animate-pulse"></div>
          </div>
          <p className="text-white/40 font-black uppercase italic tracking-widest text-sm">Synchronizing Intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <TrainerSiteHeader />
        <div className="relative container mx-auto px-6 py-16 text-center space-y-6">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter">System Error</h3>
          <p className="text-white/40 font-medium max-w-md mx-auto">{error}</p>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 uppercase font-black italic tracking-widest"
            onClick={fetchClients}
          >
            Reboot Interface
          </Button>
        </div>
      </div>
    )
  }

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
          <div className="space-y-2">
             <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 font-black italic uppercase tracking-widest text-[10px]">
              Human Resources
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Client <span className="text-cyan-500">Directory</span>
            </h1>
            <p className="text-white/40 font-medium text-lg max-w-xl">
              Managing {clients.total} active subscribers in your network.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-11 bg-white/[0.03] border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 h-14 rounded-2xl text-sm font-bold placeholder:text-white/10 italic"
                />
            </div>
            <Select value={planFilter} onValueChange={handlePlanFilterChange}>
                <SelectTrigger className="w-full sm:w-48 bg-white/[0.03] border-white/10 h-14 rounded-2xl text-sm font-black uppercase italic tracking-widest px-6 focus:ring-1 focus:ring-cyan-500/20">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-cyan-400" />
                        <SelectValue placeholder="All Plans" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-2xl border-white/10">
                    <SelectItem value="all" className="text-white/60 focus:text-cyan-400 font-bold uppercase italic tracking-widest text-[10px]">All Plans</SelectItem>
                    <SelectItem value="basic" className="text-white/60 focus:text-cyan-400 font-bold uppercase italic tracking-widest text-[10px]">Basic Tier</SelectItem>
                    <SelectItem value="premium" className="text-white/60 focus:text-cyan-400 font-bold uppercase italic tracking-widest text-[10px]">Premium Tier</SelectItem>
                    <SelectItem value="pro" className="text-white/60 focus:text-cyan-400 font-bold uppercase italic tracking-widest text-[10px]">Pro Tier</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.clients.map((client) => (
                <Card 
                    key={client._id}
                    className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500 rounded-[2.5rem]"
                >
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16 border-2 border-white/10 group-hover:border-cyan-500/50 transition-all duration-500">
                                    <AvatarImage src={client.profileImage || "/placeholder.svg"} alt={client.name} className="object-cover" />
                                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400 font-black italic uppercase">
                                        {getClientInitials(client.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">{client.name}</h3>
                                    <Badge className={cn("mt-1 font-black italic uppercase tracking-widest text-[9px] border px-2 py-0.5", getPlanStyle(client.trainerPlan))}>
                                        {client.trainerPlan || 'No Plan'} Tier
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => navigate(`/trainer/user/${client._id}`)}
                                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/30 text-white/40 hover:text-cyan-400 transition-all"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3 text-white/40 hover:text-white transition-colors cursor-default">
                                <Mail className="h-3.5 w-3.5 text-cyan-500" />
                                <span className="text-xs font-bold truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/40 hover:text-white transition-colors cursor-default">
                                <Phone className="h-3.5 w-3.5 text-cyan-500" />
                                <span className="text-xs font-bold">{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/40 hover:text-white transition-colors cursor-default">
                                <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                                <span className="text-xs font-bold">
                                    Since: {client.subscriptionStartDate ? new Date(client.subscriptionStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <Button
                                variant="outline"
                                className="w-full h-12 bg-white/[0.03] border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 font-black italic uppercase tracking-widest text-[10px] rounded-2xl group/chat relative"
                                onClick={() => navigate(`/trainer/chat/${client._id}`)}
                            >
                                <MessageSquare className="h-4 w-4 mr-2 text-cyan-400" />
                                Send Message
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 bg-white/[0.03] border-white/10 hover:bg-white/10 font-black italic uppercase tracking-widest text-[9px] rounded-2xl p-0"
                                    onClick={() => navigate(`/trainer/assign-workout/${client._id}`)}
                                >
                                    Assign Workout
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 bg-white/[0.03] border-white/10 hover:bg-white/10 font-black italic uppercase tracking-widest text-[9px] rounded-2xl p-0"
                                    onClick={() => navigate(`/trainer/assign-diet/${client._id}`)}
                                >
                                    Assign Diet
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {clients.clients.length === 0 && !isLoading && (
          <div className="text-center py-24 space-y-6 opacity-40">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <MousePointer2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">No Units Detected</h3>
                <p className="max-w-xs mx-auto text-sm font-medium">
                  {search || planFilter !== 'all' ? "Try adjusting your search terms or filters" : "Your clients will appear here once they subscribe"}
                </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {clients.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-12 border-t border-white/10">
            <div className="flex items-center gap-4">
                <p className="text-xs font-black italic uppercase tracking-widest text-white/40">
                  Sector {clients.page} of {clients.totalPages}
                </p>
                <Badge variant="outline" className="text-[10px] font-black italic uppercase border-white/10 text-white/20">
                  {clients.total} Total
                </Badge>
            </div>
            <div className="flex gap-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20 font-black italic uppercase tracking-widest text-xs rounded-2xl"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={page === clients.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20 font-black italic uppercase tracking-widest text-xs rounded-2xl"
                >
                  Next
                </Button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div >
  )
}