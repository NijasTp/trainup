"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, Mail, Phone, Calendar } from "lucide-react"
import API from "@/lib/axios"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader"


interface Client {
  _id: string
  name: string
  email: string
  phone: string
  subscriptionStartDate: string
  profileImage?: string
}

interface PaginatedClients {
  clients: Client[]
  total: number
  page: number
  totalPages: number
}

export default function TrainerClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<PaginatedClients>({ clients: [], total: 0, page: 1, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    document.title = "TrainUp - My Clients"
    fetchClients()
  }, [page, search])

  const fetchClients = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await API.get("/trainer/get-clients", {
        params: { page, limit, search },
      })
      setClients(response.data)
      setIsLoading(false)
    } catch (err: any) {
      console.error("Failed to fetch clients:", err)
      setError("Failed to load clients")
      toast.error("Failed to load clients")
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleViewClient = (clientId: string) => {
    navigate(`/trainer/user/${clientId}`)
  }

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
          </div>
          <p className="text-muted-foreground font-medium text-lg">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Error</h3>
          <p className="text-muted-foreground text-lg">{error}</p>
          <Button
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={fetchClients}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">My Clients</h1>
              <Badge variant="secondary" className="text-sm">
                {clients.total} Total Clients
              </Badge>
            </div>
            <div className="max-w-md">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearchChange}
                className="bg-background/50 border-border/50"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.clients.map((client) => (
                <Card
                  key={client._id}
                  className="bg-background/50 border-border/50 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.profileImage || "/placeholder.svg"} alt={client.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getClientInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">Client</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewClient(client._id)}
                        className="h-8 w-8 p-0 border-border/50 hover:bg-primary/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{client.email}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{client.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Started:{" "}
                          {client.subscriptionStartDate
                            ? new Date(client.subscriptionStartDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {clients.clients.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No clients found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {search ? "Try adjusting your search terms" : "Your clients will appear here once they subscribe"}
                </p>
              </div>
            )}

            
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border-border/50 hover:bg-primary/5"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Page {clients.page} of {clients.totalPages}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {clients.total} total
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  disabled={page === clients.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border-border/50 hover:bg-primary/5"
                >
                  Next
                </Button>
              </div>
          
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
