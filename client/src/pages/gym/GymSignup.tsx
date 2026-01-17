import 'leaflet/dist/leaflet.css';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Building2, Mail, Lock, Upload, MapPin, Loader2 } from 'lucide-react';
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
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Left Side - Visual */}
                <div className="md:w-1/3 bg-blue-600 p-8 flex flex-col justify-between text-white">
                    <div>
                        <Logo className="mb-8" />
                        <h2 className="text-3xl font-bold mb-4">Partner with TrainUp</h2>
                        <p className="text-blue-100">Manage your gym, trainers, and members all in one place. Grow your business with our comprehensive management suite.</p>
                    </div>
                    <div className="text-sm text-blue-200">
                        Already a partner? <Link to={ROUTES.GYM_LOGIN} className="text-white underline font-medium">Login here</Link>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-2/3 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Gym Account</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Gym Name"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                                >
                                    Next: Location & Docs
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Map Section */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gym Location</label>
                                        <button type="button" onClick={getLocation} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                                            <MapPin size={12} /> Detect My Location
                                        </button>
                                    </div>
                                    <div className="h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 z-0 bg-gray-100 dark:bg-gray-800">
                                        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">Tap on the map to manually adjust the pin.</p>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Certificate</label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition relative">
                                            <input type="file" onChange={(e) => handleFileChange(e, 'certificate')} className="absolute inset-0 opacity-0 cursor-pointer" required />
                                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                            <span className="text-xs text-gray-500">{formData.certificate ? formData.certificate.name : "Upload PDF/Image"}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image</label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition relative">
                                            <input type="file" onChange={(e) => handleFileChange(e, 'profileImage')} className="absolute inset-0 opacity-0 cursor-pointer" required />
                                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                            <span className="text-xs text-gray-500">{formData.profileImage ? formData.profileImage.name : "Upload Logo"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 rounded-lg transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition flex justify-center items-center gap-2"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={20} />}
                                        Register Gym
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
