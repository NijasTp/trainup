
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    MapPin,
    Clock,
    Plus,
    Trash2,
    Upload,
    Globe,
    Dumbbell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Profile = () => {
    const [gymData, setGymData] = useState({
        name: 'Elite Fitness Center',
        address: '123 Luxury Lane, Beverly Hills, CA 90210',
        latitude: '34.0736',
        longitude: '-118.4004',
        openingHours: '06:00 AM - 10:00 PM',
        facilities: 'Premium Cardio Zone, Olympic Lifting Platforms, Yoga Studio, Sauna & Spa, Smoothie Bar',
    });

    const [images, setImages] = useState([
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop',
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGymData({ ...gymData, [e.target.name]: e.target.value });
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-primary/50 border border-white/20 p-1">
                            <div className="w-full h-full rounded-[20px] bg-[#030303] flex items-center justify-center font-black text-4xl text-primary">EF</div>
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl shadow-lg hover:scale-110 transition-transform">
                            <Upload size={18} className="text-black" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white italic">{gymData.name}</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <MapPin size={16} /> {gymData.address.split(',')[0]}
                        </p>
                    </div>
                </div>
                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all">
                    <Save size={18} className="mr-2" /> Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Dumbbell size={20} className="text-primary" />
                            General Information
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Gym Name</label>
                                    <Input
                                        name="name"
                                        value={gymData.name}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Opening Hours</label>
                                    <Input
                                        name="openingHours"
                                        value={gymData.openingHours}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Full Address</label>
                                <Input
                                    name="address"
                                    value={gymData.address}
                                    onChange={handleInputChange}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Latitude</label>
                                    <Input
                                        name="latitude"
                                        value={gymData.latitude}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Longitude</label>
                                    <Input
                                        name="longitude"
                                        value={gymData.longitude}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Facilities & Services</label>
                                <textarea
                                    name="facilities"
                                    value={gymData.facilities}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[120px] outline-none focus:border-primary/50 transition-all text-sm"
                                    placeholder="List your available facilities..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Image Gallery */}
                <div className="space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Gym Gallery</h3>
                            <button className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {images.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative aspect-video rounded-2xl overflow-hidden group border border-white/10"
                                >
                                    <img src={img} alt="Gym" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="p-2 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            <div className="aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 transition-all group cursor-pointer bg-white/5">
                                <Upload className="text-gray-500 group-hover:text-primary mb-2 transition-colors" size={24} />
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Add New Image</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
