import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    MapPin,
    Clock,
    Plus,
    Trash2,
    Upload,
    Globe,
    Dumbbell,
    Loader2,
    Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getGymDetails, updateGymProfile } from '@/services/gymService';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gymData, setGymData] = useState<any>({
        name: '',
        address: '',
        geoLocation: { coordinates: [0, 0] },
        openingHours: [],
        description: '',
        images: [],
        profileImage: '',
        logo: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getGymDetails();
            setGymData(data.gym || data);
        } catch (error) {
            toast.error('Failed to fetch profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGymData({ ...gymData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newCoords = [...gymData.geoLocation.coordinates];
        newCoords[index] = parseFloat(e.target.value) || 0;
        setGymData({
            ...gymData,
            geoLocation: { ...gymData.geoLocation, coordinates: newCoords }
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'profileImage' | 'gallery') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (type === 'gallery') {
            const formData = new FormData();
            Array.from(files).forEach(file => formData.append('images', file));

            try {
                toast.loading('Uploading gallery images...', { id: 'upload' });
                const result = await updateGymProfile(formData);
                setGymData(result.gym);
                toast.success('Gallery updated', { id: 'upload' });
            } catch (error) {
                toast.error('Failed to upload images', { id: 'upload' });
            }
        } else {
            const formData = new FormData();
            formData.append(type, files[0]);

            try {
                toast.loading(`Uploading ${type}...`, { id: 'upload' });
                const result = await updateGymProfile(formData);
                setGymData(result.gym);
                toast.success(`${type} updated`, { id: 'upload' });
            } catch (error) {
                toast.error(`Failed to upload ${type}`, { id: 'upload' });
            }
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('name', gymData.name);
            formData.append('address', gymData.address);
            formData.append('description', gymData.description);
            formData.append('geoLocation', JSON.stringify(gymData.geoLocation));
            formData.append('openingHours', JSON.stringify(gymData.openingHours));

            await updateGymProfile(formData);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const removeImage = async (imageUrl: string) => {
        try {
            const updatedImages = gymData.images.filter((img: string) => img !== imageUrl);
            const formData = new FormData();
            // Send updated images list as a JSON string to tell backend to remove one
            formData.append('images', JSON.stringify(updatedImages));

            setGymData({ ...gymData, images: updatedImages });
            await updateGymProfile(formData);
            toast.success('Image removed');
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-zinc-500 font-bold animate-pulse">LOADING PROFILE...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Hidden Inputs */}
            <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'profileImage')} accept="image/*" />
            <input type="file" ref={galleryInputRef} className="hidden" multiple onChange={(e) => handleFileChange(e, 'gallery')} accept="image/*" />

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-1">
                            {gymData.profileImage ? (
                                <img src={gymData.profileImage} alt="Profile" className="w-full h-full object-cover rounded-[20px]" />
                            ) : (
                                <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-4xl text-primary">
                                    {gymData.name?.substring(0, 2).toUpperCase() || 'GY'}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl shadow-lg hover:scale-110 transition-transform text-black"
                        >
                            <Camera size={18} />
                        </button>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white italic">{gymData.name}</h1>
                            {gymData.logo && (
                                <img src={gymData.logo} alt="Logo" className="w-8 h-8 object-contain rounded-md" />
                            )}
                        </div>
                        <p className="text-gray-500 flex items-center gap-2">
                            <MapPin size={16} /> {gymData.address || 'No address set'}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all"
                >
                    {saving ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                        <Save size={18} className="mr-2" />
                    )}
                    Save Changes
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
                                        value={gymData.name || ''}
                                        onChange={handleInputChange}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Gym Logo</label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl hover:bg-white/10"
                                        >
                                            <Upload size={16} className="mr-2" /> Upload Logo
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Full Address</label>
                                <Input
                                    name="address"
                                    value={gymData.address || ''}
                                    onChange={handleInputChange}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Longitude</label>
                                    <Input
                                        type="number"
                                        value={gymData.geoLocation?.coordinates[0] || 0}
                                        onChange={(e) => handleLocationChange(e, 0)}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Latitude</label>
                                    <Input
                                        type="number"
                                        value={gymData.geoLocation?.coordinates[1] || 0}
                                        onChange={(e) => handleLocationChange(e, 1)}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Description & Services</label>
                                <textarea
                                    name="description"
                                    value={gymData.description || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[120px] outline-none focus:border-primary/50 transition-all text-sm text-white"
                                    placeholder="Describe your gym and services..."
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
                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {gymData.images?.map((img: string, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative aspect-video rounded-2xl overflow-hidden group border border-white/10"
                                >
                                    <img src={img} alt="Gym" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => removeImage(img)}
                                            className="p-2 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            <div
                                onClick={() => galleryInputRef.current?.click()}
                                className="aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 transition-all group cursor-pointer bg-white/5"
                            >
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

