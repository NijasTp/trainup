import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    User, Phone, MapPin, Award,
    Briefcase, DollarSign, Camera, Check, Loader2,
    ZoomIn, ZoomOut, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

// Schema for Profile Update
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
    location: z.string().min(2, "Location is required"),
    specialization: z.string().min(2, "Specialization is required"),
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

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getTrainerDetails();
            const trainer = data.trainer;

            setValue("name", trainer.name);
            setValue("phone", trainer.phone);
            setValue("bio", trainer.bio || "");
            setValue("location", trainer.location || "");
            setValue("specialization", trainer.specialization || "");
            setValue("experience", trainer.experience || "");
            setValue("price.basic", trainer.price?.basic?.toString() || "");
            setValue("price.premium", trainer.price?.premium?.toString() || "");
            setValue("price.pro", trainer.price?.pro?.toString() || "");

            setProfileImagePreview(trainer.profileImage || "");
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile");
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
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

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
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
            console.error(e);
            toast.error("Failed to crop image");
        }
    };

    const closeCrop = () => {
        setIsCropping(false);
        setTempImage(null);
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'price') {
                    formData.append(key, JSON.stringify(value));
                } else if (value) {
                    formData.append(key, value as string);
                }
            });

            if (profileImageFile) {
                formData.append("profileImage", profileImageFile);
            }

            await updateTrainerProfile(formData);
            toast.success("Profile updated successfully");
            navigate("/trainer/profile");
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error("Current password is required");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error("Password must include uppercase, lowercase, numbers, and special characters");
            return;
        }

        if (newPassword === currentPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            await changeTrainerPassword({
                currentPassword,
                newPassword
            });
            toast.success("Password changed successfully");
            setIsPasswordDialogOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to change password");
            console.error('Password change error:', error);
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex flex-col">
                <TrainerSiteHeader />
                <div className="flex items-center justify-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex flex-col">
            <TrainerSiteHeader />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <main className="relative container mx-auto px-4 py-8 space-y-8 flex-1 max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Edit Profile
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Update your personal details and public profile
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/trainer/profile")}>
                        Cancel
                    </Button>
                </div>

                <div className="grid gap-8">
                    {/* Profile Image Section */}
                    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-primary" />
                                Profile Picture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6">
                            <Avatar className="w-32 h-32 border-4 border-primary/10">
                                <AvatarImage src={profileImagePreview} />
                                <AvatarFallback className="text-4xl bg-primary/5">T</AvatarFallback>
                            </Avatar>

                            <div className="flex items-center gap-4">
                                <Label htmlFor="profileImage" className="cursor-pointer">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary font-medium">
                                        <Upload className="w-4 h-4" />
                                        Upload Photo
                                    </div>
                                    <Input
                                        id="profileImage"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </Label>
                                {profileImagePreview && (
                                    <Button variant="ghost" className="text-destructive hover:text-destructive/90" onClick={() => setProfileImagePreview("")}>
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...register("name")} className="pl-9" placeholder="John Doe" />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...register("phone")} className="pl-9" placeholder="1234567890" />
                                    </div>
                                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Bio</Label>
                                    <Textarea {...register("bio")} placeholder="Tell us about yourself..." className="min-h-[100px]" />
                                    {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Professional Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Specialization</Label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...register("specialization")} className="pl-9" placeholder="e.g. Yoga, HIIT" />
                                    </div>
                                    {errors.specialization && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Experience</Label>
                                    <Select onValueChange={(val) => setValue("experience", val)} defaultValue={undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select experience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                                            <SelectItem value="1–3 years">1–3 years</SelectItem>
                                            <SelectItem value="3–5 years">3–5 years</SelectItem>
                                            <SelectItem value="5–10 years">5–10 years</SelectItem>
                                            <SelectItem value="10+ years">10+ years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.experience && <p className="text-xs text-destructive">{errors.experience.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...register("location")} className="pl-9" placeholder="City, Country" />
                                    </div>
                                    {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <Label>Pricing (Monthly Fees ₹)</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Basic Plan</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input {...register("price.basic")} className="pl-9" type="number" placeholder="Basic Fee" />
                                            </div>
                                            {errors.price?.basic && <p className="text-xs text-destructive">{errors.price.basic.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Premium Plan</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input {...register("price.premium")} className="pl-9" type="number" placeholder="Premium Fee" />
                                            </div>
                                            {errors.price?.premium && <p className="text-xs text-destructive">{errors.price.premium.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Pro Plan</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input {...register("price.pro")} className="pl-9" type="number" placeholder="Pro Fee" />
                                            </div>
                                            {errors.price?.pro && <p className="text-xs text-destructive">{errors.price.pro.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button type="submit" size="lg" className="flex-1" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setIsPasswordDialogOpen(true)}>
                                Change Password
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Change Password Dialog */}
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Enter your current password to set a new one.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsPasswordDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isChangingPassword}>
                                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Update Password
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Crop Dialog */}
                <Dialog open={isCropping} onOpenChange={(open) => !open && closeCrop()}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Adjust Image</DialogTitle>
                            <DialogDescription>
                                Drag to position and use the slider to zoom.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="relative w-full h-96 bg-black/5 rounded-lg overflow-hidden my-4">
                            {tempImage && (
                                <Cropper
                                    image={tempImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    showGrid={false}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-4 px-4">
                            <ZoomOut className="h-4 w-4 text-muted-foreground" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value) => setZoom(value[0])}
                                className="flex-1"
                            />
                            <ZoomIn className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <DialogFooter className="flex justify-between gap-2 sm:justify-between">
                            <Button variant="ghost" onClick={closeCrop}>
                                Cancel
                            </Button>
                            <Button onClick={showCroppedImage}>
                                <Check className="w-4 h-4 mr-2" />
                                Apply Crop
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
            <SiteFooter />
        </div>
    );
}
