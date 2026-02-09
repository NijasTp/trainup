import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Lock,
    MapPin,
    Upload,
    Image as ImageIcon,
    X,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    FileText,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Aurora from '@/components/ui/Aurora';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { registerGym } from '@/services/authService';
import ImageCropModal from './components/ImageCropModal';
import OpeningHoursSelector from './components/OpeningHoursSelector';
import type { OpeningHour } from './components/OpeningHoursSelector';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Register = () => {
    const [searchParams] = useSearchParams();
    const rawEmail = searchParams.get('email') || sessionStorage.getItem('verifiedGymEmail') || '';
    const verifiedEmail = rawEmail.trim().toLowerCase();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: verifiedEmail,
        password: '',
        confirmPassword: '',
        address: '',
        description: '',
        lat: '',
        lng: '',
    });

    const [logo, setLogo] = useState<File | null>(null);
    const [croppedLogo, setCroppedLogo] = useState<string | null>(null);
    const [showcaseImages, setShowcaseImages] = useState<File[]>([]);
    const [certifications, setCertifications] = useState<File[]>([]);
    const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
        DAYS.map(day => ({ day, open: '09:00', close: '22:00', isClosed: false }))
    );

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!verifiedEmail) {
            toast.error('Please verify your email first');
            navigate(ROUTES.GYM_REGISTER);
        }
    }, [verifiedEmail, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onCropComplete = (croppedImageBlob: Blob) => {
        const file = new File([croppedImageBlob], 'logo.jpg', { type: 'image/jpeg' });
        setLogo(file);
        setCroppedLogo(URL.createObjectURL(croppedImageBlob));
        setIsCropModalOpen(false);
    };

    const handleShowcaseImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setShowcaseImages([...showcaseImages, ...Array.from(e.target.files)]);
        }
    };

    const handleCertifications = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCertifications([...certifications, ...Array.from(e.target.files)]);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.loading('Detecting location...', { id: 'geo' });
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setFormData(prev => ({
                    ...prev,
                    lat: lat.toString(),
                    lng: lng.toString()
                }));

                try {
                    // Reverse geocoding using Nominatim
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        setFormData(prev => ({
                            ...prev,
                            address: data.display_name
                        }));
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    // Silently fail geocoding, we already have coordinates
                }

                toast.success('Location detected!', { id: 'geo' });
            },
            (error) => {
                toast.error('Failed to detect location: ' + error.message, { id: 'geo' });
            }
        );
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('address', formData.address);
            data.append('description', formData.description);
            data.append('geoLocation', JSON.stringify({
                type: 'Point',
                coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
            }));
            data.append('openingHours', JSON.stringify(openingHours));

            if (logo) data.append('logo', logo);
            showcaseImages.forEach(img => data.append('images', img));
            certifications.forEach(cert => data.append('certifications', cert));

            await registerGym(data);
            toast.success('Registration submitted! waiting for admin approval.');
            navigate('/gym/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.password || !formData.confirmPassword || !formData.address || !formData.lat || !formData.lng) {
                toast.error('Please fill in all basic details');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
        }
        setStep(step + 1);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030303] text-white overflow-hidden font-outfit p-4 lg:p-8">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Progress Control */}
                    <div className="flex border-b border-white/10">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex-1 relative h-2 bg-white/5">
                                <motion.div
                                    className="absolute inset-0 bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: step >= s ? '100%' : '0%' }}
                                    transition={{ duration: 0.5 }}
                                />
                                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest ${step === s ? 'text-primary' : 'text-gray-500'}`}>
                                    Step {s}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 lg:p-12 pt-16">
                        <header className="mb-12">
                            <h1 className="text-4xl font-black mb-3 italic tracking-tight">
                                <span className="text-primary">GYM</span> REGISTRATION
                            </h1>
                            <p className="text-gray-400 font-medium">Step {step}: {
                                step === 1 ? 'General Information' :
                                    step === 2 ? 'Media & Branding' :
                                        step === 3 ? 'Certifications' : 'Opening Hours'
                            }</p>
                        </header>

                        <div className="min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <div className="group space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Gym Name</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                                    <Input name="name" value={formData.name} onChange={handleInputChange} className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary/20" placeholder="Elite Fitness Center" />
                                                </div>
                                            </div>
                                            <div className="group space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                                    <Input name="password" type="password" value={formData.password} onChange={handleInputChange} className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl" placeholder="••••••••" />
                                                </div>
                                            </div>
                                            <div className="group space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Confirm Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                                    <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl" placeholder="••••••••" />
                                                </div>
                                            </div>
                                            <div className="group space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Description</label>
                                                <Textarea name="description" value={formData.description} onChange={handleInputChange} className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-4" placeholder="Tell us about your facilities..." />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="group space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Address</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                                    <Input name="address" value={formData.address} onChange={handleInputChange} className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl" placeholder="123 Street, City" />
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-gray-400 uppercase">Location Detection</span>
                                                    <Button onClick={detectLocation} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                                        <Target className="h-4 w-4 mr-2" /> Detect
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input name="lat" value={formData.lat} onChange={handleInputChange} placeholder="Latitude" className="bg-white/10 border-none h-12" readOnly />
                                                    <Input name="lng" value={formData.lng} onChange={handleInputChange} placeholder="Longitude" className="bg-white/10 border-none h-12" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
                                            <div className="lg:col-span-1 space-y-4">
                                                <label className="text-sm font-bold text-gray-400 uppercase">Brand Logo</label>
                                                <div className="relative aspect-square rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center group overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                                                    {croppedLogo ? (
                                                        <img src={croppedLogo} className="w-full h-full object-cover" alt="Logo" />
                                                    ) : (
                                                        <>
                                                            <Upload className="h-10 w-10 text-gray-500 mb-3 group-hover:text-primary transition-colors" />
                                                            <span className="text-xs text-gray-500">Upload & Crop</span>
                                                        </>
                                                    )}
                                                    <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                                </div>
                                            </div>
                                            <div className="lg:col-span-2 space-y-4">
                                                <label className="text-sm font-bold text-gray-400 uppercase">Showcase Gallery</label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {showcaseImages.map((img, i) => (
                                                        <div key={i} className="relative aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden group">
                                                            <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                                            <button onClick={() => setShowcaseImages(showcaseImages.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="relative aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer group">
                                                        <ImageIcon className="h-8 w-8 text-gray-500 group-hover:text-primary" />
                                                        <input type="file" multiple onChange={handleShowcaseImages} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="p-12 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 text-center group hover:border-primary/50 transition-colors relative">
                                            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4 group-hover:text-primary" />
                                            <h3 className="text-xl font-bold mb-2">Upload Certifications</h3>
                                            <p className="text-gray-500 text-sm max-w-md mx-auto">Upload your business licenses, fitness certifications, and safety permits (PDF, Image)</p>
                                            <input type="file" multiple onChange={handleCertifications} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {certifications.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                                    </div>
                                                    <button onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <OpeningHoursSelector hours={openingHours} onChange={setOpeningHours} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-white/10">
                            {step > 1 && (
                                <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-lg font-bold">
                                    <ChevronLeft className="mr-2" /> Back
                                </Button>
                            )}
                            <Button
                                onClick={step === 4 ? handleSubmit : nextStep}
                                disabled={loading}
                                className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-black shadow-[0_4px_20px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : step === 4 ? 'Submit Application' : 'Continue'}
                                {!loading && <ChevronRight className="ml-2" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {imageToCrop && (
                <ImageCropModal
                    isOpen={isCropModalOpen}
                    image={imageToCrop}
                    onClose={() => setIsCropModalOpen(false)}
                    onCropComplete={onCropComplete}
                />
            )}
        </div>
    );
};

export default Register;
