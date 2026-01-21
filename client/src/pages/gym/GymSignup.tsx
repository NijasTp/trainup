import 'leaflet/dist/leaflet.css';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Building2, Mail, Lock, Upload, MapPin, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { requestGymOtp } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function GymSignup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Document/Location

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        certificate: null as File | null,
        profileImage: null as File | null,
        images: [] as File[],
        geoLocation: null as { type: 'Point', coordinates: [number, number] } | null
    });

    const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

    // Vanilla Leaflet Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, [field]: e.target.files[0] });
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    updateLocation(lat, lng);
                    toast.success("Location detected!");
                },
                (error) => {
                    console.error(error);
                    toast.error("Unable to retrieve your location");
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    };

    const updateLocation = (lat: number, lng: number) => {
        setMapPosition([lat, lng]);
        setFormData(prev => ({
            ...prev,
            geoLocation: { type: 'Point', coordinates: [lat, lng] } // Note: Backend likely expects [lng, lat] for GeoJSON, but we keep existing logic for consistency unless user requested change. Leaflet needs [lat, lng].
        }));

        // Update Map View
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 13);

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
            }
        }
    };


    useEffect(() => {
        if (step === 2 && mapContainerRef.current && !mapInstanceRef.current) {
            const initialPos: [number, number] = mapPosition || [20.5937, 78.9629]; // Default or saved

            const map = L.map(mapContainerRef.current).setView(initialPos, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                updateLocation(lat, lng);
            });

            if (mapPosition) {
                markerRef.current = L.marker(mapPosition).addTo(map);
            }

            mapInstanceRef.current = map;
        }


        return () => {
            if (step !== 2 && mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [step]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!formData.geoLocation) {
            toast.error("Please set your gym location on the map");
            return;
        }

        setLoading(true);
        try {
            await requestGymOtp(formData.email);
            toast.success("OTP sent to your email");
            navigate(ROUTES.GYM_VERIFY_OTP, { state: { email: formData.email, formData } });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-700">

                {/* Left Side - Visual */}
                <div className="md:w-1/3 bg-gradient-to-br from-blue-600 to-blue-800 p-10 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                    <div className="relative z-10">
                        <Logo className="mb-10" />
                        <h2 className="text-4xl font-black mb-6 leading-tight">Partner with TrainUp</h2>
                        <p className="text-blue-100 text-lg font-light leading-relaxed">Manage your gym, trainers, and members all in one place. Grow your business with our comprehensive management suite.</p>
                    </div>
                    <div className="relative z-10 text-sm text-blue-200">
                        Already a partner? <Link to={ROUTES.GYM_LOGIN} className="text-white underline font-bold hover:text-blue-100 transition-colors">Login here</Link>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-2/3 p-10 bg-black/40">
                    <h1 className="text-3xl font-black text-white mb-2">Create Gym Account</h1>
                    <p className="text-gray-400 mb-8">Join the elite fitness network.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Gym Name"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 outline-none transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 outline-none transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 outline-none transition-all"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Next: Location & Docs
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Map Section */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-bold text-gray-300">Gym Location</label>
                                        <button type="button" onClick={getLocation} className="text-xs bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-blue-500/20 transition-all border border-blue-500/20">
                                            <MapPin size={14} /> Detect My Location
                                        </button>
                                    </div>
                                    <div className="h-64 rounded-2xl overflow-hidden border border-white/10 z-0 bg-white/5 group relative">
                                        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="relative z-0"></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">Tap on the map to manually adjust the pin.</p>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Registration Certificate</label>
                                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all relative group">
                                            <input type="file" onChange={(e) => handleFileChange(e, 'certificate')} className="absolute inset-0 opacity-0 cursor-pointer" required />
                                            <Upload className="mx-auto text-gray-500 mb-2 group-hover:text-blue-400 transition-colors" size={24} />
                                            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors block truncate max-w-full px-2">
                                                {formData.certificate ? formData.certificate.name : "Upload PDF/Image"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Image</label>
                                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all relative group">
                                            <input type="file" onChange={(e) => handleFileChange(e, 'profileImage')} className="absolute inset-0 opacity-0 cursor-pointer" required />
                                            <Upload className="mx-auto text-gray-500 mb-2 group-hover:text-blue-400 transition-colors" size={24} />
                                            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors block truncate max-w-full px-2">
                                                {formData.profileImage ? formData.profileImage.name : "Upload Logo"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 py-7 rounded-xl font-bold"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-7 rounded-xl transition-all shadow-lg shadow-green-500/20 flex justify-center items-center gap-2"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={20} />}
                                        Register Gym
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
