import { Calendar, Mail, Phone, MapPin, Award, UserCheck, Clock, Shield } from 'lucide-react';

export default function GymEmployeeDetails() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header / Basic Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                    <div className="h-32 bg-blue-600"></div>
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6">
                        <img src="https://i.pravatar.cc/150?u=1" alt="Profile" className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-md bg-white" />

                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alex Johnson</h1>
                            <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">Senior Trainer</p>
                        </div>

                        <div className="flex gap-3 mb-2">
                            <button className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                Message
                            </button>
                            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Personal Info & Stats */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <UserCheck size={20} className="text-blue-500" /> Personal Info
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-gray-400" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">alex.johnson@fitgym.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-gray-400" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">+91 98765 43210</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-gray-400" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">42, Green Park, Bangalore</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-gray-400" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Joined Date</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">August 12, 2023</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Award size={20} className="text-amber-500" /> Certifications
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {['ACE CPT', 'CrossFit L1', 'CPR/AED', 'Sports Nutrition'].map(cert => (
                                    <span key={cert} className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium border border-amber-100 dark:border-amber-800">
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Schedule & Performance */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock size={20} className="text-purple-500" /> Working Schedule
                                </h2>
                                <button className="text-sm text-blue-600 font-medium hover:underline">Edit Schedule</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-center">
                                    <thead>
                                        <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 font-medium">Day</th>
                                            <th className="pb-3 font-medium">Shift Start</th>
                                            <th className="pb-3 font-medium">Shift End</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-900 dark:text-white">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                            <tr key={day} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <td className="py-3 text-left pl-4 font-medium">{day}</td>
                                                <td className="py-3">06:00 AM</td>
                                                <td className="py-3">02:00 PM</td>
                                                <td className="py-3">
                                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">Active</span>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="py-3 text-left pl-4 font-medium text-gray-500">Sunday</td>
                                            <td className="py-3 text-gray-400">-</td>
                                            <td className="py-3 text-gray-400">-</td>
                                            <td className="py-3">
                                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded text-xs font-medium">Off</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Shield size={20} className="text-green-500" /> Assigned Members (42)
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((member) => (
                                    <div key={member} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <img src={`https://i.pravatar.cc/150?u=${member + 10}`} alt="Member" className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Member Name</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Plan: Gold Package</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 font-medium text-sm">
                                    View All Members
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
