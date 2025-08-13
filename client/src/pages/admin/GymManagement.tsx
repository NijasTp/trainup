
import type React from "react"
import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search , ChevronLeft, ChevronRight, Loader2, Building2, Ban, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getGyms, toggleGymBan } from "@/services/gymService"
import { getGymApplication } from "@/services/adminService"


interface IGym {
  _id: string
  role: "gym"
  name: string | null
  email: string | null
  password: string | null
  announcements: { title: string; message: string; date: Date }[]
  location: string | null
  certificate: string
  isVerified: boolean
  isBanned?: boolean
  trainers?: string[] | null
  members?: string[] | null
  createdAt: Date | null
  updatedAt: Date | null
  images: string[] | null
  profileImage: string | null
}

interface GymResponse {
  gyms: IGym[]
  total: number
  page: number
  totalPages: number
}

const GymManagement = () => {
  const [response, setResponse] = useState<GymResponse>({ gyms: [], total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const gymsPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true)
      try {
       
        const res = await getGyms(currentPage,gymsPerPage, searchQuery)
        setResponse(res as GymResponse)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching gyms:", err)
        setError(err.response?.data?.message || "Failed to fetch gyms. Please try again.")
        setResponse({ gyms: [], total: 0, page: 1, totalPages: 1 })
      } finally {
        setLoading(false)
      }
    }

    fetchGyms()
  }, [currentPage, searchQuery])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBanToggle = async (gymId: string, currentBanStatus: boolean) => {
    setActionLoading(gymId)
    try {
      await toggleGymBan(gymId,!currentBanStatus)
      const res = await getGyms(currentPage, gymsPerPage, searchQuery)
      setResponse(res as GymResponse)
    } catch (err) {
      console.error("Error updating gym ban status:", err)
    } finally {
      setActionLoading(null)
    }
  }



 const handleViewApplication = async (gymId: string) => {
  try {
    const application = await getGymApplication(gymId);
    navigate(`/admin/gyms/${gymId}/application`, { state: { application } });
  } catch (err) {
    console.error("Error fetching gym application:", err);
  }
};
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Building2 className="mr-3 h-8 w-8 text-[#4B8B9B]" />
            Gym Management
          </h1>
          <p className="text-gray-400">Manage and monitor all registered gyms</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                <Input
                  placeholder="Search gyms by name, email, or location..."
                  value={searchInput}
                  onChange={(e:React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                />
              </div>
              <Button onClick={handleSearch} className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gyms Table */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">
              {/* Gyms ({response.gyms.length} of {response.total}) */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
                <span className="ml-2 text-gray-400">Loading gyms...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : response.gyms.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No gyms found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Members</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Trainers</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.gyms.map((gym) => (
                        <tr key={gym._id} className="border-b border-gray-800 hover:bg-[#1F2A44]/30">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={gym.profileImage || "/placeholder.svg?height=40&width=40&query=gym"}
                                alt={gym.name || "Gym"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-white font-medium">{gym.name || "N/A"}</p>
                                <p className="text-sm text-gray-400">
                                  {new Date(gym.createdAt || "").toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{gym.email || "N/A"}</td>
                          <td className="py-4 px-4 text-gray-300">{gym.members?.length || 0}</td>
                          <td className="py-4 px-4 text-gray-300">{gym.trainers?.length || 0}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  gym.isVerified ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
                                }`}
                              >
                                {gym.isVerified ? "Verified" : "Unverified"}
                              </span>
                              {gym.isBanned && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                                  Banned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant='default'
                                onClick={() => handleBanToggle(gym._id, gym.isBanned || false)}
                                disabled={actionLoading === gym._id}
                                className="flex items-center gap-1 text-xs px-2 py-1"
                              >
                                {actionLoading === gym._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Ban className="h-3 w-3" />
                                )}
                                {gym.isBanned ? "Unban" : "Ban"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleViewApplication(gym._id)}
                                className="flex items-center gap-1 text-xs px-2 py-1"
                              >
                                <FileText className="h-3 w-3" />
                                App
                              </Button>
                              {/* <Button
                                variant="outline"
                                onClick={() => handleViewGym(gym._id)}
                                className="flex items-center gap-1 text-xs px-2 py-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button> */}
                            </div>
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
      </div>
    </AdminLayout>
  )
}

export default GymManagement
