import { Search, Filter } from 'lucide-react';

const mockEmployees = [
    {
        id: 1,
        name: "Alex Johnson",
        role: "Senior Trainer",
        status: "Active",
        members: 24,
        image: "https://i.pravatar.cc/150?u=1",
        joined: "Aug 2023"
    },
    {
        id: 2,
        name: "Sarah Williams",
        role: "Yoga Instructor",
        status: "On Leave",
        members: 18,
        image: "https://i.pravatar.cc/150?u=2",
        joined: "Jan 2024"
    },
    {
        id: 3,
        name: "Michael Chen",
        role: "Nutritionist",
        status: "Active",
        members: 42,
        image: "https://i.pravatar.cc/150?u=3",
        joined: "Nov 2022"
    },
    {
        id: 4,
        name: "Emily Davis",
        role: "Strength Coach",
        status: "Active",
        members: 15,
        image: "https://i.pravatar.cc/150?u=4",
        joined: "Mar 2024"
    },
];

export default function GymEmployees() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gym Employees</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your trainers and staff members.</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm">
                        Add New Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or role..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition">
                            <Filter size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
                        </div>
                        <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none">
                            <option>All Roles</option>
                            <option>Trainer</option>
                            <option>Nutritionist</option>
                            <option>Staff</option>
                        </select>
                    </div>
                </div>

                {/* Employee List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockEmployees.map((employee) => (
                        <div key={employee.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition group">
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <img src={employee.image} alt={employee.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 dark:border-gray-700 shadow-sm" />
                                    <span className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${employee.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{employee.name}</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{employee.role}</p>

                                <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Members</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{employee.members}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{employee.joined}</p>
                                    </div>
                                </div>

                                <div className="w-full flex gap-3">
                                    <button className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-medium transition">
                                        Profile
                                    </button>
                                    <button className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 rounded-lg text-sm font-medium transition">
                                        Assign
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
