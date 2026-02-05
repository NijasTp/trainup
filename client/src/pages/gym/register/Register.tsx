
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Mail,
    Lock,
    MapPin,
    Upload,
    Image as ImageIcon,
    X,
    ChevronRight,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Aurora from '@/components/ui/Aurora';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        gymName: '',
        email: '',
        password: '',
        address: '',
        latitude: '',
        longitude: '',
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0]);
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages([...images, ...Array.from(e.target.files)]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030303] text-white overflow-hidden font-outfit p-4">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Progress Bar */}
                    <div className="h-1 bg-white/5 w-full">
                        <motion.div
                            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black mb-2 italic">PARTNER WITH <span className="text-primary">TRAINUP</span></h1>
                            <p className="text-gray-400">Join our network of elite fitness centers</p>
                        </div>

                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                            <Input
                                                name="gymName"
                                                placeholder="Gym Name"
                                                value={formData.gymName}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 transition-all text-lg"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="Business Email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 transition-all text-lg"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                            <Input
                                                name="password"
                                                type="password"
                                                placeholder="Create Password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 transition-all text-lg"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                        <Input
                                            name="address"
                                            placeholder="Full Address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 transition-all text-lg"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            name="latitude"
                                            placeholder="Latitude"
                                            value={formData.latitude}
                                            onChange={handleInputChange}
                                            className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-primary/50 transition-all"
                                        />
                                        <Input
                                            name="longitude"
                                            placeholder="Longitude"
                                            value={formData.longitude}
                                            onChange={handleInputChange}
                                            className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Gym Logo</label>
                                        <div className="relative flex items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 transition-all group overflow-hidden">
                                            <input
                                                type="file"
                                                onChange={handleLogoChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                            />
                                            {logo ? (
                                                <div className="flex items-center gap-4">
                                                    <CheckCircle2 className="text-primary h-6 w-6" />
                                                    <span className="font-medium text-primary">{logo.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <Upload className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Gym Showcase Images</label>
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            {images.map((img, i) => (
                                                <div key={i} className="relative aspect-square bg-white/5 rounded-xl border border-white/10 overflow-hidden group">
                                                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center hover:border-primary/50 transition-all group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleImagesChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    accept="image/*"
                                                />
                                                <ImageIcon className="text-gray-500 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex gap-4 pt-4">
                                {step > 1 && (
                                    <Button
                                        onClick={prevStep}
                                        variant="outline"
                                        className="flex-1 h-14 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg font-bold"
                                    >
                                        <ChevronLeft className="mr-2" /> Back
                                    </Button>
                                )}
                                <Button
                                    onClick={step === 3 ? () => navigate('/gym/dashboard') : nextStep}
                                    className="flex-[2] h-14 rounded-xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-[1.02]"
                                >
                                    {step === 3 ? 'Complete Registration' : 'Next Step'} <ChevronRight className="ml-2" />
                                </Button>
                            </div>

                            <div className="text-center text-gray-500 text-sm">
                                Already registered? <button onClick={() => navigate('/gym/login')} className="text-primary font-bold hover:underline">Login here</button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
