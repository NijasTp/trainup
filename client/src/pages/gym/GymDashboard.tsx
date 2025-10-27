import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store'; 
import { getGymDetails } from '@/services/gymService'; 
import { Link } from 'react-router-dom';

interface GymData {
  gymDetails: {
    name: string;
    address: string;
    profileImage?: string;
    description?: string;
    operatingHours?: string;
    contactEmail?: string;
  };
  members: Array<{ id: string; name: string; joinDate: string; status: string; avatar?: string }>;
  trainers: Array<{ id: string; name: string; specialty: string; experience: number; avatar?: string }>;
  announcements: Array<{ id: string; title: string; content: string; date: string }>;
  metrics: {
    monthlyRevenue: number;
    newMembers: number;
    attendanceRate: number;
  };
}

// Enhanced Dashboard Header
const DashboardHeader: React.FC<{ gymName: string }> = ({ gymName }) => (
  <header className="mb-8 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl opacity-90"></div>
    <div className="relative z-10 p-6">
      <h1 className="text-4xl font-bold text-white">Welcome to Your Gym Dashboard</h1>
      <p className="text-blue-300 mt-2 font-medium text-lg">{gymName}</p>
      <div className="mt-4 h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
    </div>
  </header>
);

// Enhanced Stats Card
const StatsCard: React.FC<{ 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  trend?: string;
  trendValue?: string;
}> = ({ title, value, icon, trend, trendValue }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 shadow-xl border border-gray-700 transition-all hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-white text-2xl font-bold mt-1">{value}</p>
        {trend && (
          <div className={`mt-2 flex items-center ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg">
        {icon}
      </div>
    </div>
  </div>
);

// Enhanced Profile Card
const ProfileCard: React.FC<{ details: GymData['gymDetails'] }> = ({ details }) => (
  <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-700 top-6">
    <div className="flex flex-col items-center mb-4">
      {details.profileImage ? (
        <div className="relative">
          <img 
            src={details.profileImage} 
            alt="Gym Logo" 
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/30" 
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
        </div>
      ) : (
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
          <span className="text-2xl">🏋️</span>
        </div>
      )}
      <div className="mt-4 text-center">
        <h2 className="text-2xl font-bold text-white">{details.name}</h2>
        <p className="text-gray-400 mt-1">{details.address}</p>
        <div className="mt-3 bg-gray-700 rounded-lg px-3 py-2">
          <p className="text-sm text-gray-300">⭐ 4.8 (128 reviews)</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6 space-y-4">
      <div>
        <p className="text-gray-500 text-sm">Operating Hours</p>
        <p className="text-gray-300">{details.operatingHours || '6:00 AM - 10:00 PM'}</p>
      </div>
      <div>
        <p className="text-gray-500 text-sm">Contact</p>
        <p className="text-gray-300">{details.contactEmail || 'contact@gym.com'}</p>
      </div>
    </div>
    
    <p className="mt-6 text-gray-300 italic border-t border-gray-700 pt-4">
      {details.description || 'Premium fitness center with state-of-the-art equipment and professional trainers'}
    </p>
    
    <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-3 rounded-xl transition-all shadow-lg">
      Edit Profile
    </button>
  </div>
);

// Enhanced Quick Actions
const QuickActionsSection: React.FC = () => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-700">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <span className="bg-gradient-to-r from-blue-600 to-indigo-700 w-2 h-2 rounded-full"></span>
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border border-gray-600 shadow-md">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
          <span>👤</span>
        </div>
        <span>Add Member</span>
      </button>
      <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border border-gray-600 shadow-md">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full">
          <span>💪</span>
        </div>
        <span>Add Trainer</span>
      </button>
      <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border border-gray-600 shadow-md">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-full">
          <span>📢</span>
        </div>
        <span>Announcement</span>
      </button>
      <button className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 border border-gray-600 shadow-md">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full">
          <span>📊</span>
        </div>
        <span>View Reports</span>
      </button>
    </div>
  </div>
);

// Enhanced Announcements
const AnnouncementsSection: React.FC<{ announcements: GymData['announcements'] }> = ({ announcements }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-700">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 w-2 h-2 rounded-full"></span>
        Recent Announcements
      </h3>
      <button className="text-blue-400 text-sm hover:text-blue-300 transition">View All</button>
    </div>
    
    {announcements.length === 0 ? (
      <div className="bg-gray-800/50 rounded-xl p-8 text-center border-2 border-dashed border-gray-700">
        <p className="text-gray-500">No announcements yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div 
            key={ann.id} 
            className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-5 rounded-xl border border-gray-600 hover:border-blue-500/30 transition-all"
          >
            <div className="flex gap-3">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 w-1 rounded-full"></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="text-blue-400 font-bold">{ann.title}</h4>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                    {ann.date}
                  </span>
                </div>
                <p className="text-gray-300 mt-2 text-sm">{ann.content}</p>
                <div className="mt-3 flex gap-2">
                  <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded">General</span>
                  <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded">Members</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Enhanced List Section
const ListSection: React.FC<{
  title: string;
  items: Array<any>;
  renderItem: (item: any) => React.ReactNode;
  viewAllLink?: string;
}> = ({ title, items, renderItem, viewAllLink }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-700">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <span className={`bg-gradient-to-r ${title === 'Members' ? 'from-cyan-500 to-blue-500' : 'from-purple-500 to-indigo-500'} w-2 h-2 rounded-full`}></span>
        {title}
      </h3>
      {viewAllLink && (
        <button className="text-blue-400 text-sm hover:text-blue-300 transition">View All</button>
      )}
    </div>
    
    {items.length === 0 ? (
      <div className="bg-gray-800/50 rounded-xl p-8 text-center border-2 border-dashed border-gray-700">
        <p className="text-gray-500">No {title.toLowerCase()} yet</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600 hover:border-blue-500/30 transition-all"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Main Dashboard Component
const GymDashboard: React.FC = () => {
  const { gym, isAuthenticated } = useSelector((state: RootState) => state.gymAuth);
  const [gymData, setGymData] = useState<GymData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGymData = async () => {
      if (gym?._id) {
        try {
          setLoading(true);
          const data = await getGymDetails();
          setGymData({
            ...data,
            metrics: {
              monthlyRevenue: 12420,
              newMembers: 24,
              attendanceRate: 78
            }
          });
        } catch (error) {
          console.error('Error fetching gym data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGymData();
  }, [gym?._id]);

  if (!isAuthenticated || !gym) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 text-center border border-gray-700 max-w-md w-full">
          <div className="mb-5 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Authentication Required</h3>
          <p className="text-gray-400 mb-6">Please log in to view your dashboard</p>
          <Link to='/gym/login' className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-xl w-full">
            Login to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🏋️</span>
            </div>
          </div>
          <p className="mt-4 text-gray-400">Loading your gym data...</p>
        </div>
      </div>
    );
  }

  if (!gymData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 text-center border border-gray-700 max-w-md w-full">
          <div className="mb-5 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-orange-700 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Data Load Error</h3>
          <p className="text-gray-400 mb-6">We couldn't load your gym data</p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-xl w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader gymName={gymData.gymDetails.name} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Profile */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard details={gymData.gymDetails} />
            
            {/* Metrics Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 w-2 h-2 rounded-full"></span>
                Monthly Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-white">${gymData.metrics.monthlyRevenue.toLocaleString()}</p>
                  <div className="flex items-center text-green-400 text-sm mt-1">
                    <span>↑ 12.5%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">New Members</p>
                  <p className="text-2xl font-bold text-white">+{gymData.metrics.newMembers}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Attendance Rate</p>
                  <div className="flex items-center mt-1">
                    <p className="text-2xl font-bold text-white">{gymData.metrics.attendanceRate}%</p>
                    <div className="ml-3 bg-gray-700 rounded-full h-2 flex-1">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full" 
                        style={{ width: `${gymData.metrics.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatsCard 
                title="Total Members" 
                value={gymData.members.length} 
                icon={<span className="text-xl">👥</span>}
                trend="up"
                trendValue="+12 this month"
              />
              <StatsCard 
                title="Active Trainers" 
                value={gymData.trainers.length} 
                icon={<span className="text-xl">💪</span>}
              />
              <StatsCard 
                title="Classes This Week" 
                value="42" 
                icon={<span className="text-xl">📅</span>}
                trend="up"
                trendValue="+5 from last week"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActionsSection />
              
              {/* Upcoming Events Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 w-2 h-2 rounded-full"></span>
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="bg-gradient-to-br from-blue-600/30 to-indigo-700/30 p-3 rounded-xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">25</p>
                        <p className="text-sm text-blue-300">JUN</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Yoga Workshop</h4>
                      <p className="text-gray-400 text-sm">9:00 AM - 11:00 AM</p>
                      <div className="flex mt-2">
                        <div className="flex -space-x-2">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800"></div>
                          ))}
                        </div>
                        <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                          +12 more
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="bg-gradient-to-br from-amber-600/30 to-orange-700/30 p-3 rounded-xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">28</p>
                        <p className="text-sm text-amber-300">JUN</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">CrossFit Challenge</h4>
                      <p className="text-gray-400 text-sm">4:00 PM - 6:00 PM</p>
                      <div className="mt-2">
                        <span className="text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-2 py-1 rounded-full">
                          Registration open
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="mt-6 w-full bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 py-3 rounded-xl hover:text-white transition">
                  View All Events
                </button>
              </div>
            </div>

            <AnnouncementsSection announcements={gymData.announcements} />

            {/* Members and Trainers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ListSection
                title="Members"
                items={gymData.members.slice(0, 5)}
                renderItem={(member) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-blue-500/30 flex items-center justify-center">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg">👤</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{member.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.status === 'Active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {member.status}
                        </span>
                        <span className="text-xs text-gray-500">{member.joinDate}</span>
                      </div>
                    </div>
                  </div>
                )}
                viewAllLink="/members"
              />
              
              <ListSection
                title="Trainers"
                items={gymData.trainers.slice(0, 5)}
                renderItem={(trainer) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-purple-500/30 flex items-center justify-center">
                      {trainer.avatar ? (
                        <img src={trainer.avatar} alt={trainer.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg">👨‍🏫</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{trainer.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                          {trainer.specialty}
                        </span>
                        <div className="flex items-center">
                          <span className="text-xs text-amber-400 mr-1">★</span>
                          <span className="text-xs text-gray-400">{trainer.experience} yrs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                viewAllLink="/trainers"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDashboard;