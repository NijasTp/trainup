
import { Share2, MapPin, Phone, Mail, Edit, CheckCircle, Camera, Instagram, Globe } from 'lucide-react';
import GymPageLayout from '@/components/layouts/GymPageLayout';
import { Button } from '@/components/ui/button';

export default function GymProfile() {
    return (
        <GymPageLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                {/* Header Section */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="relative flex flex-col md:flex-row items-center gap-10">
                        {/* Profile Image */}
                        <div className="relative shrink-0 group/img">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl transition-transform duration-500 group-hover/img:scale-[1.03]">
                                <img
                                    src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop"
                                    className="w-full h-full object-cover"
                                    alt="Gym Logo"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white" size={32} />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-blue-600 p-4 rounded-2xl shadow-xl border-4 border-black">
                                <CheckCircle className="text-white" size={24} />
                            </div>
                        </div>

                        {/* Gym Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                <h1 className="text-5xl font-black text-white tracking-tighter">Iron Pulse Fitness</h1>
                                <div className="flex gap-2 justify-center md:justify-start">
                                    <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-500/30">Verified Partner</span>
                                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-500/30">Open Now</span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-8 font-medium">
                                The ultimate destination for high-performance training. State-of-the-art equipment, world-class trainers, and an atmosphere that pushes you to your limits.
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-10">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <MapPin size={20} className="text-blue-500" />
                                    <span className="font-bold">Downtown Center, NY</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Phone size={20} className="text-blue-500" />
                                    <span className="font-bold">+1 (555) 0123-456</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Mail size={20} className="text-blue-500" />
                                    <span className="font-bold">hq@ironpulse.fit</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-blue-500/20 text-lg">
                                    <Edit size={20} className="mr-2" /> Edit Profile
                                </Button>
                                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-black px-8 h-14 rounded-2xl">
                                    <Share2 size={20} />
                                </Button>
                                <div className="flex gap-2 ml-auto items-center">
                                    <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"><Instagram size={20} /></button>
                                    <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"><Globe size={20} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Gallery Section */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-2xl font-black text-white">Gym Gallery</h2>
                                <button className="text-blue-400 font-bold hover:underline text-sm uppercase tracking-widest">View All 16 Photos</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {[
                                    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600",
                                    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600",
                                    "https://images.unsplash.com/photo-1541534741688-6078c64b5913?q=80&w=600",
                                    "https://images.unsplash.com/photo-1599058917233-35f91f1b964e?q=80&w=600",
                                    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600",
                                    "https://images.unsplash.com/photo-1574673130142-26154562086e?q=80&w=600"
                                ].map((url, idx) => (
                                    <div key={idx} className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-lg cursor-pointer">
                                        <img src={url} alt={`Facility ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
                            <h2 className="text-2xl font-black text-white mb-8">Premium Facilities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: "Olympic Racks", active: true },
                                    { name: "Recovery Spa", active: true },
                                    { name: "Personal Training", active: true },
                                    { name: "Fuel Bar", active: true },
                                    { name: "24/7 Access", active: true },
                                    { name: "Premium WiFi", active: true },
                                    { name: "Smart Lockers", active: true },
                                    { name: "Indoor Track", active: false }
                                ].map((facility, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border transition-all ${facility.active ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'opacity-40 border-dashed border-white/5'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${facility.active ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`} />
                                            <span className="text-sm font-bold text-white tracking-tight">{facility.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-10">
                        <div className="bg-gradient-to-br from-blue-600/10 to-transparent backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
                            <h3 className="text-xl font-black text-white mb-8">Growth Stats</h3>
                            <div className="space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Members</p>
                                        <h4 className="text-3xl font-black text-white">1,248</h4>
                                    </div>
                                    <div className="text-green-400 text-xs font-black flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded-lg">+12%</div>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full w-[75%] rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Trainers</p>
                                        <h4 className="text-xl font-black text-white">18</h4>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Daily Traffic</p>
                                        <h4 className="text-xl font-black text-white"> ~240</h4>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
                            <h3 className="text-xl font-black text-white mb-8">Access Hours</h3>
                            <div className="space-y-6">
                                {[
                                    { day: "Weekdays", hours: "05:00 - 23:00" },
                                    { day: "Saturdays", hours: "06:00 - 21:00" },
                                    { day: "Sundays", hours: "08:00 - 15:00" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-bold">{item.day}</span>
                                        <span className="text-white font-black bg-white/5 px-4 py-2 rounded-xl border border-white/5">{item.hours}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GymPageLayout>
    );
}
