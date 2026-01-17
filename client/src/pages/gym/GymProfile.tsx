import { Share2, MapPin, Phone, Mail, Edit, CheckCircle } from 'lucide-react';

export default function GymProfile() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Cover & Header */}
                <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Gym Cover" className="w-full h-full object-cover opacity-40" />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-lg transition">
                                <Share2 size={20} />
                            </button>
                            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
                                <Edit size={18} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="px-6 md:px-10 pb-8 pt-16 md:pt-0 relative">
                        <div className="absolute -top-16 left-6 md:left-10 w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 bg-white shadow-md overflow-hidden flex items-center justify-center">
                            {/* Logo Placeholder */}
                            <div className="bg-black text-white text-3xl font-bold w-full h-full flex items-center justify-center">
                                FIT
                            </div>
                        </div>

                        <div className="md:ml-36 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Iron Pulse Fitness</h1>
                                    <CheckCircle className="text-blue-500 fill-blue-500/10" size={24} />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                    <MapPin size={16} /> 123, Wellness Avenue, City Center
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Rating</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">4.8</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Members</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">1.2K</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About the Gym</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Iron Pulse Fitness is a premium fitness center dedicated to helping you achieve your health goals.
                                Equipped with state-of-the-art machinery, a dedicated free weights section, and a variety of group classes
                                ranging from Yoga to HIIT. Our certified trainers are here to guide you every step of the way.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Facilities & Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    "Cardio Zone", "Free Weights", "Personal Training",
                                    "Steam & Sauna", "Group Classes", "Locker Rooms",
                                    "Nutrition Bar", "Parking", "WiFi"
                                ].map((facility, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{facility}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    +12 more
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-blue-500 mt-1" size={18} />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">123, Wellness Avenue, City Center, Bangalore - 560001</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-blue-500" size={18} />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">+91 98765 43210</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="text-blue-500" size={18} />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">contact@ironpulse.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Opening Hours</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Mon - Fri</span>
                                    <span className="font-medium text-gray-900 dark:text-white">05:00 AM - 11:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                                    <span className="font-medium text-gray-900 dark:text-white">06:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                                    <span className="font-medium text-gray-900 dark:text-white">08:00 AM - 02:00 PM</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-sm font-medium">Open Now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
