import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "@/lib/axios";

interface AttendanceRecord {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  checkInTime: string;
  isValidLocation: boolean;
}

export default function GymAttendanceView() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, currentPage]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/attendance/gym/${selectedDate}`, {
        params: {
          page: currentPage,
          limit: 20,
        },
      });

      setAttendanceRecords(response.data.attendance || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to fetch attendance:", err);
      toast.error("Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter((record) =>
    record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validAttendance = filteredRecords.filter(r => r.isValidLocation).length;
  const invalidAttendance = filteredRecords.filter(r => !r.isValidLocation).length;

  return (
    <div className="min-h-screen bg-slate-900">

      <div className="flex">

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Member Attendance</h1>
                  <p className="text-gray-400">Track daily member check-ins and attendance</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-900/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Valid Check-ins</p>
                        <p className="text-xl font-bold text-white">{validAttendance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-900/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Invalid Check-ins</p>
                        <p className="text-xl font-bold text-white">{invalidAttendance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Check-ins</p>
                        <p className="text-xl font-bold text-white">{filteredRecords.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6 bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <Button onClick={fetchAttendance} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attendance List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Attendance for {new Date(selectedDate).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading attendance records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No attendance records</h3>
                    <p className="text-gray-400">
                      {searchQuery
                        ? "No members found matching your search"
                        : "No members have checked in for this date"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {filteredRecords.map((record) => (
                        <div
                          key={record._id}
                          className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-500">
                                {record.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{record.userName}</h3>
                              <p className="text-sm text-gray-400">{record.userEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(record.checkInTime).toLocaleTimeString()}</span>
                              </div>
                            </div>

                            <Badge
                              variant={record.isValidLocation ? "default" : "secondary"}
                              className={
                                record.isValidLocation
                                  ? "bg-green-900/30 text-green-400 border-green-800"
                                  : "bg-orange-900/30 text-orange-400 border-orange-800"
                              }
                            >
                              {record.isValidLocation ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Valid
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Invalid Location
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="bg-slate-900 border-slate-600 text-white hover:bg-slate-800"
                        >
                          Previous
                        </Button>

                        <span className="text-sm text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>

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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}