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
  ZoomOut
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
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import API from "@/lib/axios";

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
    goalWeight: ""
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
        goalWeight: userProfile.goalWeight?.toString() || ""
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
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Profile Image Upload */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Camera className="h-6 w-6 text-primary" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileImagePreview} />
                  <AvatarFallback className="text-4xl">
                    {formData.name ? formData.name[0]?.toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center gap-4">
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload Photo</span>
                    </div>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </Label>

                  {profileImagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfileImagePreview("");
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`bg-transparent border-border/50 ${errors.name ? 'border-destructive' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`bg-transparent border-border/50 ${errors.phone ? 'border-destructive' : ''}`}
                      placeholder="+91 9876543210"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="font-medium">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className={`bg-transparent border-border/50 ${errors.age ? 'border-destructive' : ''}`}
                      placeholder="25"
                      min="13"
                      max="100"
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive">{errors.age}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="font-medium">Gender</Label>
                    <Select value={formData.gender || undefined} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="bg-transparent border-border/50">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Weight className="h-6 w-6 text-primary" />
                  Physical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="font-medium flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className={`bg-transparent border-border/50 ${errors.height ? 'border-destructive' : ''}`}
                      placeholder="170"
                      min="100"
                      max="250"
                    />
                    {errors.height && (
                      <p className="text-sm text-destructive">{errors.height}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="todaysWeight" className="font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Current Weight (kg)
                    </Label>
                    <Input
                      id="todaysWeight"
                      type="number"
                      step="0.1"
                      value={formData.todaysWeight}
                      onChange={(e) => handleInputChange("todaysWeight", e.target.value)}
                      className={`bg-transparent border-border/50 ${errors.todaysWeight ? 'border-destructive' : ''}`}
                      placeholder="70.5"
                      min="30"
                      max="300"
                    />
                    {errors.todaysWeight && (
                      <p className="text-sm text-destructive">{errors.todaysWeight}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="goalWeight" className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goal Weight (kg)
                    </Label>
                    <Input
                      id="goalWeight"
                      type="number"
                      step="0.1"
                      value={formData.goalWeight}
                      onChange={(e) => handleInputChange("goalWeight", e.target.value)}
                      className={`bg-transparent border-border/50 ${errors.goalWeight ? 'border-destructive' : ''}`}
                      placeholder="65.0"
                      min="30"
                      max="300"
                    />
                    {errors.goalWeight && (
                      <p className="text-sm text-destructive">{errors.goalWeight}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Fitness Information */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Fitness Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="font-medium">Fitness Goals</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.goals!.map((goal, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="font-medium bg-primary/10 hover:bg-primary/20 transition-all duration-300 flex items-center gap-1"
                      >
                        {goal}
                        <button
                          type="button"
                          onClick={() => removeGoal(goal)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a custom goal"
                      className="bg-transparent border-border/50"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                    />
                    <Button type="button" onClick={addGoal} variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Quick add popular goals:</p>
                    <div className="flex flex-wrap gap-2">
                      {goalOptions.filter(goal => !formData.goals!.includes(goal)).map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPredefinedGoal(goal)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityLevel" className="font-medium">Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
                    <SelectTrigger className="bg-transparent border-border/50">
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="equipment"
                      checked={formData.equipment}
                      onCheckedChange={(checked) => handleInputChange("equipment", checked)}
                    />
                    <Label htmlFor="equipment" className="font-medium">
                      I have access to gym equipment
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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

            {/* Privacy Settings */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {formData.isPrivate ? <EyeOff className="h-6 w-6 text-primary" /> : <Eye className="h-6 w-6 text-primary" />}
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
                  />
                  <Label htmlFor="isPrivate" className="font-medium">
                    Make my profile private
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, your profile information will only be visible to you and your assigned trainer.
                </p>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Key className="h-6 w-6 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="hover:bg-primary/5">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
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
                <p className="text-sm text-muted-foreground mt-2">
                  Update your account password for better security
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <SiteHeader />
        <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />

      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Edit Profile</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Update Your Profile
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step <= currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted text-muted-foreground"
                  }`}
              >
                {step < currentStep ? <Check className="h-5 w-5" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground px-2">
            <span>Personal</span>
            <span>Body Metrics</span>
            <span>Fitness</span>
            <span>Account</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {renderStep()}

          <div className="flex gap-4 justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? () => navigate('/profile') : prevStep}
              className="hover:bg-muted/5"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}