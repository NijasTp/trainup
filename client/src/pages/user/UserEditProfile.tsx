import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Ruler,
  Scale,
  Save,
  Plus,
  X,
  Target,
  Camera,
  Upload,
  Weight,
  Activity,
  EyeOff,
  Eye,
  Key,
  Loader2,
  ChevronRight,
  Check,
  ZoomIn,
  ZoomOut,
  ArrowRight
} from "lucide-react";
import Cropper from 'react-easy-crop';
import getCroppedImg from "@/lib/cropImage";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { getProfile, updateProfile } from "@/services/userService";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import API from "@/lib/axios";
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Utensils, HeartPulse, Info, Flame } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  phone: z.string().optional().refine(
    (val) => !val || /^\+?[\d\s-()]{10,}$/.test(val),
    { message: "Please enter a valid phone number" }
  ),
  height: z.string().optional().refine(
    (val) => !val || (Number(val) >= 100 && Number(val) <= 250),
    { message: "Height must be between 100-250 cm" }
  ),
  age: z.string().optional().refine(
    (val) => !val || (Number(val) >= 13 && Number(val) <= 100),
    { message: "Age must be between 13-100 years" }
  ),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  goals: z.array(z.string()).optional(),
  activityLevel: z.string().optional(),
  equipment: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  todaysWeight: z.string().optional().refine(
    (val) => !val || (Number(val) >= 30 && Number(val) <= 300),
    { message: "Current weight must be between 30-300 kg" }
  ),
  goalWeight: z.string().optional().refine(
    (val) => !val || (Number(val) >= 30 && Number(val) <= 300),
    { message: "Goal weight must be between 30-300 kg" }
  ),
  medicalConditions: z.string().max(500, "Medical conditions must be less than 500 characters").optional(),
  dietaryPreferences: z.string().max(500, "Dietary preferences must be less than 500 characters").optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

const goalOptions = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Endurance",
  "General Fitness",
  "Flexibility",
  "Body Toning",
  "Athletic Performance"
];

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise 6-7 days/week)" },
  { value: "extremely_active", label: "Extremely Active (very hard exercise, physical job)" }
];

export default function EditProfile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    phone: "",
    height: "",
    age: "",
    gender: null,
    goals: [],
    activityLevel: "",
    equipment: false,
    isPrivate: false,
    todaysWeight: "",
    goalWeight: "",
    medicalConditions: "",
    dietaryPreferences: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [newGoal, setNewGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Cropping State
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const showCroppedImage = async () => {
    try {
      if (!tempImage || !croppedAreaPixels) return
      const croppedImage = await getCroppedImg(
        tempImage,
        croppedAreaPixels
      )
      if (croppedImage) {
        setProfileImageFile(croppedImage)
        setProfileImagePreview(URL.createObjectURL(croppedImage))
        setIsCropping(false)
        setTempImage(null)
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to crop image")
    }
  }

  const closeCrop = () => {
    setIsCropping(false)
    setTempImage(null)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post("/user/change-password", {
        currentPassword,
        newPassword,
        confirmPassword
      })
      toast.success("Password changed successfully!")
      setOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    document.title = "TrainUp - Edit Profile";
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setIsLoading(true);
    try {
      const response = await getProfile();
      console.log(response)
      const userProfile = response.user;
      setFormData({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        height: userProfile.height?.toString() || "",
        age: userProfile.age?.toString() || "",
        gender: userProfile.gender || null,
        goals: userProfile.goals || [],
        activityLevel: userProfile.activityLevel || "",
        equipment: userProfile.equipment || false,
        isPrivate: userProfile.isPrivate || false,
        todaysWeight: userProfile.currentWeight?.toString() || "",
        goalWeight: userProfile.goalWeight?.toString() || "",
        medicalConditions: userProfile.medicalConditions === "haven't given" ? "" : (userProfile.medicalConditions || ""),
        dietaryPreferences: userProfile.dietaryPreferences === "haven't given" ? "" : (userProfile.dietaryPreferences || "")
      });
      setProfileImagePreview(userProfile.profileImage || "");
    } catch (err) {
      console.error("API error:", err);
      toast.error("Error loading profile");
      navigate("/profile");
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = profileSchema.parse(formData);
      setErrors({});

      setIsSaving(true);

      const submitData = new FormData();

      submitData.append('name', validatedData.name);
      if (validatedData.phone) submitData.append('phone', validatedData.phone);
      if (validatedData.height) submitData.append('height', validatedData.height);
      if (validatedData.age) submitData.append('age', validatedData.age);
      if (validatedData.gender) submitData.append('gender', validatedData.gender);
      if (validatedData.goals) {
        submitData.append('goals', JSON.stringify(validatedData.goals));
      }
      if (validatedData.activityLevel) submitData.append('activityLevel', validatedData.activityLevel);
      submitData.append('equipment', validatedData.equipment?.toString() || 'false');
      submitData.append('isPrivate', validatedData.isPrivate?.toString() || 'false');
      if (validatedData.todaysWeight) submitData.append('todaysWeight', validatedData.todaysWeight);
      if (validatedData.goalWeight) submitData.append('goalWeight', validatedData.goalWeight);
      if (validatedData.medicalConditions) submitData.append('medicalConditions', validatedData.medicalConditions);
      if (validatedData.dietaryPreferences) submitData.append('dietaryPreferences', validatedData.dietaryPreferences);
      if (profileImageFile) {
        submitData.append('profileImage', profileImageFile);
      }


      const response = await updateProfile(submitData);
      dispatch(updateUser({
        name: response.user.name,
        phone: response.user.phone,
        height: response.user.height,
        age: response.user.age,
        gender: response.user.gender,
        goals: response.user.goals,
        activityLevel: response.user.activityLevel,
        equipment: response.user.equipment,
        isPrivate: response.user.isPrivate,
        weight: response.user.currentWeight,
        goalWeight: response.user.goalWeight,
        profileImage: response.user.profileImage,
      }));

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        err.issues.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as keyof ProfileFormData] = error.message;
          }
        });
        setErrors(newErrors);
        toast.error("Please fix the errors in the form");
      } else {
        console.error("Update error:", err);
        toast.error("Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addGoal = () => {
    if (newGoal.trim() && !formData.goals!.includes(newGoal)) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals!, newGoal]
      }));
      setNewGoal("");
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals!.filter(goal => goal !== goalToRemove)
    }));
  };

  const addPredefinedGoal = (goal: string) => {
    if (!formData.goals!.includes(goal)) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals!, goal]
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Profile Image Upload */}
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  Identity Image
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors" />
                  <Avatar className="h-40 w-40 relative border-4 border-[#030303] shadow-2xl">
                    <AvatarImage src={profileImagePreview} className="object-cover" />
                    <AvatarFallback className="text-4xl font-black italic bg-gradient-to-br from-primary/20 to-accent/20">
                      {formData.name ? formData.name[0]?.toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="profileImage" className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-[#030303]">
                    <Upload className="h-5 w-5" />
                    <Input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                  </label>
                </div>

                <div className="flex flex-col items-center gap-2">
                  {profileImagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProfileImagePreview("")}
                      className="text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-500/10 rounded-full px-6"
                    >
                      Remove Photo
                    </Button>
                  )}
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Optimal format: JPG or PNG (max. 5MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  Personal Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold placeholder:text-gray-700 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-xs font-bold text-red-500 uppercase tracking-widest">{errors.name}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Network</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold placeholder:text-gray-700 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+91 9876543210"
                    />
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-xs font-bold text-red-500 uppercase tracking-widest">{errors.phone}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="age" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Biological Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className={`h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold placeholder:text-gray-700 ${errors.age ? 'border-red-500' : ''}`}
                      placeholder="25"
                    />
                    <AnimatePresence>
                      {errors.age && (
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-xs font-bold text-red-500 uppercase tracking-widest">{errors.age}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="gender" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gender Identity</Label>
                    <Select value={formData.gender || undefined} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary focus:border-primary shadow-none">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-white rounded-2xl p-2 font-bold">
                        <SelectItem value="male" className="rounded-xl hover:bg-primary/20">Male</SelectItem>
                        <SelectItem value="female" className="rounded-xl hover:bg-primary/20">Female</SelectItem>
                        <SelectItem value="other" className="rounded-xl hover:bg-primary/20">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Physical Information */}
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Weight className="h-6 w-6 text-primary" />
                  </div>
                  Physical Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="height" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className={`h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold ${errors.height ? 'border-red-500' : ''}`}
                      placeholder="170"
                    />
                    <AnimatePresence>
                      {errors.height && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xs font-bold text-red-500 uppercase tracking-widest">{errors.height}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="todaysWeight" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      Current Weight (kg)
                    </Label>
                    <Input
                      id="todaysWeight"
                      type="number"
                      step="0.1"
                      value={formData.todaysWeight}
                      onChange={(e) => handleInputChange("todaysWeight", e.target.value)}
                      className={`h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold ${errors.todaysWeight ? 'border-red-500' : ''}`}
                      placeholder="70.5"
                    />
                    <AnimatePresence>
                      {errors.todaysWeight && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xs font-bold text-red-500 uppercase tracking-widest">{errors.todaysWeight}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="goalWeight" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Goal Weight (kg)
                    </Label>
                    <Input
                      id="goalWeight"
                      type="number"
                      step="0.1"
                      value={formData.goalWeight}
                      onChange={(e) => handleInputChange("goalWeight", e.target.value)}
                      className={`h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold ${errors.goalWeight ? 'border-red-500' : ''}`}
                      placeholder="65.0"
                    />
                    <AnimatePresence>
                      {errors.goalWeight && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xs font-bold text-red-500 uppercase tracking-widest">{errors.goalWeight}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Label htmlFor="medicalConditions" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    Medical Conditions & Injuries
                  </Label>
                  <textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    className="w-full min-h-[120px] p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-200 font-medium placeholder:text-gray-600 transition-all resize-none"
                    placeholder="List any injuries, chronic conditions, or medications your trainer should know about... (e.g., Lower back pain, Asthma)"
                  />
                  <div className="flex items-start gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
                    <Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    This information helps us tailor your workouts for safety and effectiveness.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  Optimization Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="space-y-6">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-primary" /> Selective Objectives
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {formData.goals!.map((goal, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <Badge
                            className="h-10 px-5 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-primary text-black flex items-center gap-2 hover:bg-white transition-colors"
                          >
                            {goal}
                            <button
                              type="button"
                              onClick={() => removeGoal(goal)}
                              className="hover:scale-125 transition-transform"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Define custom objective..."
                      className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold placeholder:text-gray-700"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                    />
                    <Button type="button" onClick={addGoal} className="h-14 w-14 bg-white text-black hover:bg-gray-200 rounded-2xl flex items-center justify-center shrink-0">
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Standard Protocols:</p>
                    <div className="flex flex-wrap gap-2">
                      {goalOptions.filter(goal => !formData.goals!.includes(goal)).map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPredefinedGoal(goal)}
                          className="h-9 px-4 border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all bg-transparent"
                        >
                          <Plus className="h-3 w-3 mr-1 text-primary" />
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <Label htmlFor="activityLevel" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" /> Metabolic Activity
                    </Label>
                    <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold focus:ring-primary focus:border-primary shadow-none">
                        <SelectValue placeholder="Select activity intensity" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-white rounded-2xl p-2 font-bold max-w-[400px]">
                        {activityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="rounded-xl hover:bg-primary/20 whitespace-normal p-3">
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label htmlFor="dietaryPreferences" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-green-500" />
                      Dietary Preferences & Allergies
                    </Label>
                    <textarea
                      id="dietaryPreferences"
                      value={formData.dietaryPreferences}
                      onChange={(e) => handleInputChange("dietaryPreferences", e.target.value)}
                      className="w-full min-h-[120px] p-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-200 font-medium placeholder:text-gray-600 transition-all resize-none"
                      placeholder="List any preferences (Vegan, Keto, etc.) or allergies (Nuts, Shellfish)..."
                    />
                  </div>

                  <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-3xl border border-white/10 group/check hover:border-primary/50 transition-all">
                    <Checkbox
                      id="equipment"
                      checked={formData.equipment}
                      onCheckedChange={(checked) => handleInputChange("equipment", checked)}
                      className="h-6 w-6 rounded-lg border-2 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="equipment" className="text-sm font-bold uppercase tracking-widest cursor-pointer group-hover/check:text-primary transition-colors">
                      Full Hardware Access (Gym Equipment)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Privacy Settings */}
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    {formData.isPrivate ? <EyeOff className="h-6 w-6 text-primary" /> : <Eye className="h-6 w-6 text-primary" />}
                  </div>
                  System Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-3xl border border-white/10 group/priv hover:border-primary/50 transition-all">
                  <Checkbox
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
                    className="h-6 w-6 rounded-lg border-2 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="isPrivate" className="text-sm font-bold uppercase tracking-widest cursor-pointer group-hover/priv:text-primary transition-colors">
                    stealth mode (Private Profile)
                  </Label>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  Visibility Restricted: When enabled, your profile metrics and history will only be accessible to your assigned coach and system administrators.
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  Cyber Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(true)}
                  type="button"
                  className="h-14 w-full md:w-auto px-8 border-white/10 rounded-2xl font-black italic uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Rotate Password
                </Button>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Recommendation: Update credentials bi-monthly for maximum network security.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
        <div className="absolute inset-0 z-0">
          <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        </div>
        <SiteHeader />
        <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6 z-10">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-black italic uppercase tracking-widest animate-pulse">Retrieving Profile Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0 text-white shadow-inner">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-4 py-12 space-y-12 z-10">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary uppercase font-black italic tracking-widest text-[10px]"
          >
            <User className="h-3 w-3" /> Profile Synchronization
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Refine Your <span className="text-primary">Identity</span>
          </h1>

          <p className="text-lg text-gray-400 font-medium italic max-w-2xl mx-auto">
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? "Personal Profile" :
                currentStep === 2 ? "Body Dimensions" :
                  currentStep === 3 ? "Fitness Protocol" :
                    "System Security"
            }
          </p>
        </div>

        {/* Dynamic Stepper */}
        <div className="max-w-3xl mx-auto relative px-8 py-4">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/5 -translate-y-1/2 rounded-full" />
          <div
            className="absolute top-1/2 left-8 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
            style={{ width: `calc(${((currentStep - 1) / (totalSteps - 1)) * 100}% - 4px)` }}
          />
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${step <= currentStep
                  ? "bg-primary border-primary text-black scale-110 shadow-2xl"
                  : "bg-[#111] border-white/5 text-gray-600"
                  }`}
              >
                {step < currentStep ? <Check className="h-6 w-6 stroke-[4]" /> : <span className="font-black italic text-lg">{step}</span>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {renderStep()}

          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 pt-12 pb-24">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1 || isSaving}
              className="h-16 px-10 rounded-2xl font-black italic uppercase tracking-widest text-gray-500 hover:text-white transition-all disabled:opacity-0"
            >
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-gray-200 transition-all font-black italic uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-3"
              >
                Next Protocol <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSaving}
                className="h-16 px-16 rounded-2xl bg-primary text-black hover:bg-white transition-all font-black italic uppercase tracking-widest shadow-[0_0_30px_rgba(var(--primary),0.3)] disabled:opacity-50 flex items-center gap-3"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Commit Changes <Check className="h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </main>

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

      {/* Change Password Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Make sure your new password is strong and unique.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}