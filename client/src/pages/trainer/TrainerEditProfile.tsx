import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    User, Award,
    Briefcase, DollarSign, Camera, Check, Loader2,
    ZoomIn, ZoomOut, Upload, ChevronLeft, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { getTrainerDetails, updateTrainerProfile, changeTrainerPassword } from "@/services/trainerService";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";

// Schema for Profile Update
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    bio: z.string().optional().or(z.literal("")),
    location: z.string().min(2, "Location is required"),
    specialization: z.string().min(1, "Specialization is required"),
    experience: z.string().min(1, "Experience is required"),
    price: z.object({
        basic: z.string().min(1, "Basic price is required"),
        premium: z.string().min(1, "Premium price is required"),
        pro: z.string().min(1, "Pro price is required"),
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function TrainerEditProfile() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>("");

    // Crop State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    // Password Change State
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            phone: "",
            bio: "",
            location: "",
            specialization: "",
            experience: "",
            price: {
                basic: "",
                premium: "",
                pro: "",
            }
        }
    });

    const specializationValue = watch("specialization");
    const [isOtherSpecialization, setIsOtherSpecialization] = useState(false);
    const [otherSpecializationValue, setOtherSpecializationValue] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getTrainerDetails();
            const trainer = data.trainer;

            if (!trainer) {
                toast.error("Data node unreachable");
                return;
            }

            if (trainer.price && typeof trainer.price === "string") {
                try {
                    trainer.price = JSON.parse(trainer.price);
                } catch (e) {
                    console.error("Failed to parse price:", e);
                }
            }

            reset({
                name: trainer.name || "",
                phone: trainer.phone || "",
                bio: trainer.bio || "",
                location: trainer.location || "",
                specialization: trainer.specialization || "",
                experience: trainer.experience ? String(trainer.experience).replace(/[^0-9]/g, '') : "",
                price: {
                    basic: trainer.price?.basic != null ? String(trainer.price.basic) : "",
                    premium: trainer.price?.premium != null ? String(trainer.price.premium) : "",
                    pro: trainer.price?.pro != null ? String(trainer.price.pro) : "",
                }
            });

            const predefinedSpecializations = [
                "Weight Training", "Yoga", "Pilates", "Cardio",
                "CrossFit", "Martial Arts", "Zumba"
            ];

            if (trainer.specialization && !predefinedSpecializations.includes(trainer.specialization)) {
                setValue("specialization", "Other");
                setIsOtherSpecialization(true);
                setOtherSpecializationValue(trainer.specialization);
            }

            if (trainer.profileImage) {
                setProfileImagePreview(trainer.profileImage);
            }
            setIsLoading(false);
        } catch (error) {
            toast.error("Failed to initialize profile calibration");
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid visual data format');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const showCroppedImage = async () => {
        try {
            if (!tempImage || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
            if (croppedImage) {
                setProfileImageFile(croppedImage);
                setProfileImagePreview(URL.createObjectURL(croppedImage));
                setIsCropping(false);
                setTempImage(null);
            }
        } catch (e) {
            toast.error("Vison node processing failed");
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("phone", data.phone);
            formData.append("bio", data.bio || "");
            formData.append("location", data.location);
            const finalSpecialization = data.specialization === "Other" ? otherSpecializationValue : data.specialization;
            formData.append("specialization", finalSpecialization);
            formData.append("experience", data.experience);
            formData.append("price", JSON.stringify({
                basic: Number(data.price.basic),
                premium: Number(data.price.premium),
                pro: Number(data.price.pro)
            }));

            if (profileImageFile) {
                formData.append("profileImage", profileImageFile);
            }

            await updateTrainerProfile(formData);
            toast.success("Identity Matrix Updated");
            navigate("/trainer/profile");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Sync collision detected");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Password hash mismatch");
            return;
        }
        setIsChangingPassword(true);
        try {
            await changeTrainerPassword({ currentPassword, newPassword });
            toast.success("Security protocol updated");
            setIsPasswordDialogOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Security breach prevention active");
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <TrainerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                </div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-2">
                        <button onClick={() => navigate("/trainer/profile")} className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-[10px] font-black uppercase italic tracking-widest mb-4">
                            <ChevronLeft size={14} /> Back to Identity
                        </button>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                            Calibrate <span className="text-cyan-400">Profile</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                            Identity Reconfiguration Phase
                        </p>
                    </div>
                    <Button onClick={() => setIsPasswordDialogOpen(true)} variant="outline" className="bg-white/5 border-white/10 text-gray-400 hover:text-cyan-400 rounded-2xl h-14 px-8 font-black italic uppercase text-xs">
                        <ShieldCheck size={16} className="mr-2" /> Security Protocol
                    </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Visual Data (Avatar) */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-10">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="relative group">
                                <Avatar className="w-40 h-40 border-4 border-white/10 group-hover:border-cyan-500/50 transition-all shadow-2xl">
                                    <AvatarImage src={profileImagePreview} className="object-cover" />
                                    <AvatarFallback className="text-5xl font-black italic bg-white/5 text-gray-500">T</AvatarFallback>
                                </Avatar>
                                <Label htmlFor="profileImage" className="absolute bottom-2 right-2 cursor-pointer w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-xl">
                                    <Camera size={18} />
                                    <Input id="profileImage" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </Label>
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Avatar Synchronization</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase italic tracking-widest">Select a high-resolution identity capture for the matrix.</p>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <Label htmlFor="profileImage" className="cursor-pointer">
                                        <div className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-colors text-cyan-400 font-black italic uppercase text-[10px] border border-cyan-500/20">
                                            <Upload className="w-3 h-3" /> New Capture
                                        </div>
                                    </Label>
                                    {profileImagePreview && (
                                        <Button variant="ghost" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-black italic uppercase text-[10px]" onClick={() => setProfileImagePreview("")}>
                                            Wipe Data
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Meta Data Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    <User size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Core Identity</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Operative Label</Label>
                                    <Input {...register("name")} className="bg-black/40 border-white/10 h-14 rounded-xl text-white font-black italic text-sm focus:ring-1 focus:ring-cyan-500/50" />
                                    {errors.name && <p className="text-xs text-rose-500 ml-1 italic">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Comms Frequency</Label>
                                    <Input {...register("phone")} className="bg-black/40 border-white/10 h-14 rounded-xl text-white font-black italic text-sm focus:ring-1 focus:ring-cyan-500/50" />
                                    {errors.phone && <p className="text-xs text-rose-500 ml-1 italic">{errors.phone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Biological Manifest (Bio)</Label>
                                    <Textarea {...register("bio")} className="bg-black/40 border-white/10 min-h-[120px] rounded-xl text-white font-bold text-sm focus:ring-1 focus:ring-cyan-500/50 py-4" />
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-8">
                            <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        <Briefcase size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Proficiency</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Specialized Protocol</Label>
                                        <Select onValueChange={(val) => { setValue("specialization", val); setIsOtherSpecialization(val === "Other"); }} value={specializationValue}>
                                            <SelectTrigger className="bg-black/40 border-white/10 h-14 rounded-xl text-white font-black italic text-sm focus:ring-1 focus:ring-cyan-500/50">
                                                <SelectValue placeholder="Select Specialization" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-black border-white/10">
                                                {["Weight Training", "Yoga", "Pilates", "Cardio", "CrossFit", "Martial Arts", "Zumba", "Other"].map(s => (
                                                    <SelectItem key={s} value={s} className="text-white focus:bg-white/5">{s.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isOtherSpecialization && <Input value={otherSpecializationValue} onChange={(e) => setOtherSpecializationValue(e.target.value)} placeholder="Enter Custom Protocol..." className="bg-black/40 border-white/10 h-14 rounded-xl mt-2 text-white font-black italic text-sm" />}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Temporal Exp</Label>
                                            <Input {...register("experience")} type="number" className="bg-black/40 border-white/10 h-14 rounded-xl text-white font-black italic text-sm focus:ring-1 focus:ring-cyan-500/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Geo Loc</Label>
                                            <Input {...register("location")} className="bg-black/40 border-white/10 h-14 rounded-xl text-white font-black italic text-sm focus:ring-1 focus:ring-cyan-500/50" />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white/5 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <DollarSign size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Compensation Matrix</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {["basic", "premium", "pro"].map((tier) => (
                                        <div key={tier} className="space-y-1">
                                            <Label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">{tier}</Label>
                                            <Input {...register(`price.${tier}` as any)} type="number" className="bg-black/40 border-white/10 h-12 rounded-lg text-white font-black italic text-xs focus:ring-1 focus:ring-cyan-500/50" />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <Button type="submit" size="lg" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black h-16 rounded-2xl font-black italic uppercase italic tracking-widest shadow-lg shadow-cyan-500/20 group" disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform" />}
                            Synchronize Matrix
                        </Button>
                    </div>
                </form>

                {/* Password Dialog */}
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-[2rem] p-10 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">Security Redesign</DialogTitle>
                            <DialogDescription className="text-gray-500 font-bold uppercase italic text-[10px] tracking-widest mt-2">Update credentials through the secure bridge.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleChangePassword} className="space-y-6 py-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Current Hash</Label>
                                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-white/5 border-white/10 h-14 rounded-xl text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">New Entropy</Label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 h-14 rounded-xl text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic ml-1">Verify Entropy</Label>
                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10 h-14 rounded-xl text-white" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black h-14 rounded-xl font-black italic uppercase text-xs" disabled={isChangingPassword}>
                                    {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Overwrite Protocol
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Crop Dialog */}
                <Dialog open={isCropping} onOpenChange={(open) => !open && setTempImage(null)}>
                    <DialogContent className="bg-black/95 backdrop-blur-2xl border-white/10 rounded-[2.5rem] max-w-xl p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">Identity Framing</DialogTitle>
                            <DialogDescription className="text-gray-500 font-bold uppercase italic text-[10px] tracking-widest">Adjust visual boundaries for optimal sync.</DialogDescription>
                        </DialogHeader>
                        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden my-6 border border-white/5 shadow-inner">
                            {tempImage && <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, p) => setCroppedAreaPixels(p)} onZoomChange={setZoom} showGrid={false} />}
                        </div>
                        <div className="flex items-center gap-6 px-4 mb-8">
                            <ZoomOut className="h-4 w-4 text-gray-500" />
                            <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(v) => setZoom(v[0])} className="flex-1" />
                            <ZoomIn className="h-4 w-4 text-cyan-400" />
                        </div>
                        <DialogFooter className="flex gap-4">
                            <Button variant="ghost" className="flex-1 text-gray-500 hover:text-white font-black italic uppercase text-xs" onClick={() => setIsCropping(false)}>Abort</Button>
                            <Button onClick={showCroppedImage} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black italic uppercase text-xs rounded-xl h-12">Commit Crop</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TrainerLayout>
    );
}
