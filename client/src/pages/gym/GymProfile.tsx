
import { Share2, MapPin, Phone, Mail, Edit, CheckCircle } from 'lucide-react';
import GymPageLayout from '@/components/layouts/GymPageLayout';

export default function GymProfile() {
    return (
        <GymPageLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Cover & Header */}
                <div className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 group">
                    <div className="h-56 md:h-72 bg-gradient-to-r from-blue-900/50 to-purple-900/50 relative">
                        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Gym Cover" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>

                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="bg-black/30 hover:bg-black/50 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 transition">
                                <Share2 size={20} />
                            </button>
                            <button className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 border border-blue-400/30 transition shadow-lg shadow-blue-900/20">
                                <Edit size={18} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="px-6 md:px-10 pb-8 pt-20 md:pt-4 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-16">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-[#050505] bg-neutral-900 shadow-2xl overflow-hidden flex items-center justify-center shrink-0 z-10 group-hover:rotate-3 transition-transform duration-300">
                            {/* Logo Placeholder */}
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-black w-full h-full flex items-center justify-center tracking-tighter">
                                FIT
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left z-10 mb-2">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h1 className="text-4xl font-bold text-white tracking-tight">Iron Pulse Fitness</h1>
                                <CheckCircle className="text-blue-400 fill-blue-500/20" size={28} />
                            </div>
                            <p className="text-gray-300 mt-2 flex items-center justify-center md:justify-start gap-2 text-lg">
                                <MapPin size={18} className="text-gray-500" /> 123, Wellness Avenue, City Center
                            </p>
                        </div>

                        <div className="flex gap-4 z-10 mb-2">
                            <div className="text-center px-5 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rating</p>
                                <p className="text-2xl font-bold text-white">4.8</p>
                            </div>
                            <div className="text-center px-5 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Members</p>
                                <p className="text-2xl font-bold text-white">1.2K</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">About the Gym</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                Iron Pulse Fitness is a premium fitness center dedicated to helping you achieve your health goals.
                                Equipped with state-of-the-art machinery, a dedicated free weights section, and a variety of group classes
                                ranging from Yoga to HIIT. Our certified trainers are here to guide you every step of the way.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6">Facilities & Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    "Cardio Zone", "Free Weights", "Personal Training",
                                    "Steam & Sauna", "Group Classes", "Locker Rooms",
                                    "Nutrition Bar", "Parking", "WiFi"
                                ].map((facility, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                                        <CheckCircle size={18} className="text-green-400" />
                                        <span className="text-sm font-medium text-gray-200">{facility}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6">Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="aspect-square bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="aspect-square bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="aspect-square bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="aspect-square bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-white/10 transition hover:text-white font-medium">
                                    +12 more
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-6">Contact Info</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4 group">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                                        <MapPin size={20} />
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">123, Wellness Avenue, City Center, Bangalore - 560001</p>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                                        <Phone size={20} />
                                    </div>
                                    <p className="text-sm text-gray-300">+91 98765 43210</p>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                                        <Mail size={20} />
                                    </div>
                                    <p className="text-sm text-gray-300">contact@ironpulse.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-6">Opening Hours</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                    <span className="text-gray-400">Mon - Fri</span>
                                    <span className="font-semibold text-white">05:00 AM - 11:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                    <span className="text-gray-400">Saturday</span>
                                    <span className="font-semibold text-white">06:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                    <span className="text-gray-400">Sunday</span>
                                    <span className="font-semibold text-white">08:00 AM - 02:00 PM</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 flex items-center gap-3 text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20 justify-center">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-sm font-bold tracking-wide uppercase">Open Now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GymPageLayout>
    );
}
