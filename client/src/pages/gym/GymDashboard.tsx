import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "@/redux/store";
import { getGymDetails } from "@/services/gymService";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Loader2, Dumbbell, Users, Bell, CalendarDays } from "lucide-react";
import { GymNavbar } from "@/components/gym/navs/GymNavbar";


const GymDashboard: React.FC = () => {
  const { gym, isAuthenticated } = useSelector(
    (state: RootState) => state.gymAuth
  );
  const [gymData, setGymData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGymData = async () => {
      if (gym?._id) {
        try {
          setLoading(true);
          const data = await getGymDetails();
          setGymData(data);
        } catch (error) {
          console.error("Error fetching gym data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGymData();
  }, [gym?._id]);

  if (!isAuthenticated || !gym) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-center">
        <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700">
          <h2 className="text-white text-2xl font-semibold mb-3">
            Authentication Required
          </h2>
          <p className="text-gray-400 mb-6">
            Please log in to access your dashboard.
          </p>
          <Link
            to={ROUTES.GYM_LOGIN}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p>Loading your gym data...</p>
        </div>
      </div>
    );
  }

  if (!gymData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="p-6 rounded-xl bg-gray-800 border border-gray-700 text-center text-gray-300">
          <p>Unable to load gym data.</p>
          <button
            onClick={() => navigate(ROUTES.GYM_DASHBOARD)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { gymDetails, members, trainers, announcements } = gymData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <GymNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Gym Info Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-violet-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {gymDetails.name}
            </h1>
            <p className="text-blue-200">{gymDetails.address || "No address provided"}</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.GYM_SUBSCRIPTIONS_NEW)}
            className="mt-4 md:mt-0 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition"
          >
            + Create Plan
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Members</p>
              <h2 className="text-white text-2xl font-bold mt-1">{members?.length || 0}</h2>
            </div>
            <Users className="text-blue-400" size={28} />
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Trainers</p>
              <h2 className="text-white text-2xl font-bold mt-1">{trainers?.length || 0}</h2>
            </div>
            <Dumbbell className="text-purple-400" size={28} />
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Announcements</p>
              <h2 className="text-white text-2xl font-bold mt-1">{announcements?.length || 0}</h2>
            </div>
            <Bell className="text-amber-400" size={28} />
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members List */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-400" /> Members
            </h3>
            {members && members.length > 0 ? (
              <ul className="space-y-3">
                {members.slice(0, 5).map((m: any) => (
                  <li
                    key={m._id}
                    className="flex justify-between items-center bg-gray-700/50 px-4 py-3 rounded-lg"
                  >
                    <span className="text-gray-300">{m.name}</span>
                    <span className="text-sm text-gray-500">{m.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No members found.</p>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarDays size={20} className="text-amber-400" /> Announcements
            </h3>
            {announcements && announcements.length > 0 ? (
              <ul className="space-y-3">
                {announcements.slice(0, 4).map((a: any) => (
                  <li
                    key={a._id}
                    className="bg-gray-700/50 px-4 py-3 rounded-lg border-l-4 border-amber-500"
                  >
                    <h4 className="text-white font-semibold">{a.title}</h4>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {a.message || a.content}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No announcements yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GymDashboard;
