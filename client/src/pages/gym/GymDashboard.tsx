import { Users, Dumbbell, CalendarCheck, CreditCard, IndianRupee, Plus, Megaphone, Briefcase, UsersRound } from 'lucide-react';

export default function GymDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gym Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's today's overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,248</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Trainers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18</p>
              </div>
              <Dumbbell className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Attendance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">187</p>
              </div>
              <CalendarCheck className="h-10 w-10 text-purple-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">842</p>
              </div>
              <CreditCard className="h-10 w-10 text-amber-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 flex items-center">
                  <IndianRupee className="h-6 w-6 mr-1" />4.82L
                </p>
              </div>
              <IndianRupee className="h-10 w-10 text-emerald-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition">
              <Plus size={20} /> Create Subscription
            </button>
            <button className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition">
              <Briefcase size={20} /> Post Trainer Hiring
            </button>
            <button className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-lg transition">
              <Megaphone size={20} /> Create Announcement
            </button>
            <button className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg transition">
              <UsersRound size={20} /> View Employees
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}