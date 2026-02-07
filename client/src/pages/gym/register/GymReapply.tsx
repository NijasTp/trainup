import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Lock,
    MapPin,
    Upload,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    FileText,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { toast } from 'react-hot-toast';
import { reapplyGym } from '@/services/authService';
import { getGymDetails } from '@/services/gymService';
import ImageCropModal from './components/ImageCropModal';
import OpeningHoursSelector from './components/OpeningHoursSelector';
import type { OpeningHour } from './components/OpeningHoursSelector';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const GymReapply = () => {
    const { gym } = useSelector((state: RootState) => state.gymAuth);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchExistingData = async () => {
            try {
                const data = await getGymDetails();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    address: data.address || '',
                    description: data.description || '',
                    lat: data.geoLocation?.coordinates?.[1]?.toString() || '',
                    lng: data.geoLocation?.coordinates?.[0]?.toString() || '',
                });
                if (data.openingHours && data.openingHours.length > 0) {
                    setOpeningHours(data.openingHours);
                }
                if (data.logo) {
                    setCroppedLogo(data.logo);
                }
            } catch (error) {
                console.error("Failed to pre-fill data", error);
            }
        };
        fetchExistingData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'showcase' | 'cert') => {
        const files = Array.from(e.target.files || []);
        if (type === 'logo' && files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(files[0]);
            setLogo(files[0]);
        } else if (type === 'showcase') {
            setShowcaseImages([...showcaseImages, ...files]);
        } else if (type === 'cert') {
            setCertifications([...certifications, ...files]);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            toast.loading("Detecting your location...", { id: 'geo' });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString()
                    });
                    toast.success("Location detected!", { id: 'geo' });
                },
                () => {
                    toast.error("Location access denied.", { id: 'geo' });
                }
            );
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const data = new FormData();

        // Basic Info
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        // Opening Hours
        data.append('openingHours', JSON.stringify(openingHours));

        // Files
        if (logo) data.append('logo', logo);
        showcaseImages.forEach(file => data.append('images', file));
        certifications.forEach(file => data.append('certifications', file));

        try {
            await reapplyGym(data);
            toast.success("Application resubmitted successfully! Please wait for approval.");
            navigate(ROUTES.GYM_STATUS);
        } catch (error) {
            toast.error("Failed to resubmit application.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white font-outfit relative py-20 px-4">
            {/* aurora background */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <Target className="h-3 w-3" /> Reapply Application
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none italic uppercase">
                        Fix Your <span className="text-primary non-italic">Journey</span>
                    </h1>
                    <p className="text-zinc-400 max-w-lg mx-auto font-medium">
                        Update your information and resubmit your application for approval.
                    </p>
                </header>

                {/* Steps indicator */}
                <div className="flex items-center justify-between max-w-xs mx-auto mb-12">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`h-10 w-10 rounded-[14px] flex items-center justify-center font-black transition-all duration-500 ${step >= s ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' : 'bg-white/5 text-zinc-600 border border-white/10'}`}>
                                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                            {s < 4 && <div className={`w-8 h-[2px] mx-2 ${step > s ? 'bg-primary' : 'bg-white/5'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden transition-all duration-300 min-h-[500px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Primary Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Input name="name" placeholder="Gym Name" value={formData.name} onChange={handleChange} className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-sm font-bold placeholder:font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <Input name="email" placeholder="Business Email" value={formData.email} disabled className="h-14 bg-white/5 border-white/10 rounded-2xl opacity-50 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    <Textarea name="description" placeholder="Short description about your gym..." value={formData.description} onChange={handleChange} className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-sm font-bold" />
                                </section>
                            </motion.div>
                        )}
                        {/* Step 2, 3, 4 shortened for brevity as they are identical to Register.tsx but focused on re-submitting */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Location Details</h3>
                                    <Input name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} className="h-14 bg-white/5 border-white/10 rounded-2xl" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input name="lat" placeholder="Latitude" value={formData.lat} onChange={handleChange} className="h-14 bg-white/5 border-white/10 rounded-2xl" />
                                        <Input name="lng" placeholder="Longitude" value={formData.lng} onChange={handleChange} className="h-14 bg-white/5 border-white/10 rounded-2xl" />
                                    </div>
                                    <Button onClick={detectLocation} variant="outline" className="w-full h-14 rounded-2xl border-dashed border-white/20 hover:bg-white/5 font-bold gap-2">
                                        <MapPin className="h-4 w-4" /> Detect My Location
                                    </Button>
                                </section>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Visuals & Credentials</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-zinc-500">Business Logo</label>
                                            <div className="relative group aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-white/10 hover:border-primary/50 transition-all flex items-center justify-center bg-white/5">
                                                {croppedLogo ? (
                                                    <img src={croppedLogo} className="w-full h-full object-cover" alt="Logo" />
                                                ) : (
                                                    <Upload className="h-8 w-8 text-zinc-500 group-hover:text-primary transition-colors" />
                                                )}
                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-zinc-500">Certifications (PDF/Images)</label>
                                            <div className="h-48 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 relative hover:border-primary/50 transition-all">
                                                <FileText className="h-8 w-8 text-zinc-500 mb-2" />
                                                <span className="text-[10px] font-black uppercase text-zinc-500">Click to upload</span>
                                                <input type="file" multiple accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'cert')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {certifications.map((f, i) => (
                                                    <div key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-primary">{f.name}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <OpeningHoursSelector hours={openingHours} onChange={setOpeningHours} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-auto pt-10 flex gap-4">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={() => setStep(step - 1)}
                                className="h-14 flex-1 rounded-2xl border-white/10 hover:bg-white/5 font-bold"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                        )}
                        <Button
                            className={`h-14 flex-[2] rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest group shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]`}
                            disabled={isSubmitting}
                            onClick={() => step === 4 ? handleSubmit() : setStep(step + 1)}
                        >
                            {isSubmitting ? 'Resubmitting...' : (step === 4 ? 'Complete Resubmission' : 'Continue')}
                            {step < 4 && <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </Button>
                    </div>
                </div>
            </div>

            <ImageCropModal
                isOpen={isCropModalOpen}
                onClose={() => setIsCropModalOpen(false)}
                image={imageToCrop || ''}
                onCropComplete={(croppedImage) => {
                    setCroppedLogo(URL.createObjectURL(croppedImage));
                    // Handle cropped image
                    setIsCropModalOpen(false);
                }}
            />
        </div>
    );
};

export default GymReapply;
