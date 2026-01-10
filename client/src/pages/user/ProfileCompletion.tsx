import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ruler, Scale, Target, Activity, Check, ArrowRight, ArrowLeft, Dumbbell } from "lucide-react";
import { toast } from "react-toastify";
import { updateProfile } from "@/services/userService";
import { updateUser } from "@/redux/slices/userAuthSlice";

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

export default function ProfileCompletion() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        height: "",
        todaysWeight: "",
        goalWeight: "",
        goals: [] as string[],
        activityLevel: "",
        equipment: false,
        gender: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.userAuth.user);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleGoal = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal]
        }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.height || !formData.todaysWeight || !formData.goalWeight || !formData.gender) {
                toast.warn("Please fill in all physical details");
                return;
            }
        }
        if (step === 2) {
            if (formData.goals.length === 0 || !formData.activityLevel) {
                toast.warn("Please select at least one goal and activity level");
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const submitData = new FormData();
            submitData.append('height', formData.height);
            submitData.append('todaysWeight', formData.todaysWeight);
            submitData.append('goalWeight', formData.goalWeight);
            submitData.append('gender', formData.gender);
            submitData.append('goals', JSON.stringify(formData.goals));
            submitData.append('activityLevel', formData.activityLevel);
            submitData.append('equipment', formData.equipment.toString());

            const response = await updateProfile(submitData);
            dispatch(updateUser(response.user));

            toast.success("Profile completed! Now choose your workout plan.");
            navigate("/workout-templates");
        } catch (err: any) {
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="text-center mb-8 space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Let's build your <span className="text-primary italic">profile</span></h1>
                    <p className="text-slate-400">Complete these steps to get personalized templates</p>
                </div>

                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-slate-800'}`}
                        />
                    ))}
                </div>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">
                            {step === 1 && "Physical Details"}
                            {step === 2 && "Goals & Activity"}
                            {step === 3 && "Equipment Access"}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {step === 1 && "These help us calculate your needs"}
                            {step === 2 && "What are you aiming for?"}
                            {step === 3 && "Final check before we begin"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="height" className="text-white">Height (cm)</Label>
                                        <div className="relative">
                                            <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="height"
                                                type="number"
                                                placeholder="175"
                                                className="pl-10 bg-slate-950 border-slate-800 text-white"
                                                value={formData.height}
                                                onChange={(e) => handleInputChange("height", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-white">Gender</Label>
                                        <Select value={formData.gender} onValueChange={(val) => handleInputChange("gender", val)}>
                                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight" className="text-white">Current Weight (kg)</Label>
                                        <div className="relative">
                                            <Scale className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="weight"
                                                type="number"
                                                placeholder="70"
                                                className="pl-10 bg-slate-950 border-slate-800 text-white"
                                                value={formData.todaysWeight}
                                                onChange={(e) => handleInputChange("todaysWeight", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="goalWeight" className="text-white">Goal Weight (kg)</Label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="goalWeight"
                                                type="number"
                                                placeholder="75"
                                                className="pl-10 bg-slate-950 border-slate-800 text-white"
                                                value={formData.goalWeight}
                                                onChange={(e) => handleInputChange("goalWeight", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-3">
                                    <Label className="text-white">Fitness Goals (Select multiple)</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {goalOptions.map(goal => (
                                            <Badge
                                                key={goal}
                                                variant={formData.goals.includes(goal) ? "default" : "outline"}
                                                className={`cursor-pointer py-2 px-3 text-xs justify-center transition-all ${formData.goals.includes(goal)
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                                                    }`}
                                                onClick={() => toggleGoal(goal)}
                                            >
                                                {goal}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="activity" className="text-white flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Activity Level
                                    </Label>
                                    <Select value={formData.activityLevel} onValueChange={(val) => handleInputChange("activityLevel", val)}>
                                        <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                            <SelectValue placeholder="Describe your daily activity" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                            {activityLevels.map(level => (
                                                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Dumbbell className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">Gym Equipment</h4>
                                            <p className="text-slate-500 text-sm">Do you have access to weights?</p>
                                        </div>
                                    </div>
                                    <Checkbox
                                        className="h-6 w-6 border-slate-700 data-[state=checked]:bg-primary"
                                        checked={formData.equipment}
                                        onCheckedChange={(val) => handleInputChange("equipment", !!val)}
                                    />
                                </div>

                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                    <p className="text-sm text-primary flex items-start gap-2">
                                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        We'll use this information to recommend the most effective workout templates for you.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={step === 1 || isSaving}
                                className="text-slate-400 hover:text-white"
                            >
                                {step > 1 && <ArrowLeft className="h-4 w-4 mr-2" />}
                                {step > 1 ? "Back" : ""}
                            </Button>

                            {step < 3 ? (
                                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white">
                                    Next <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-primary hover:bg-primary/90 text-white w-32"
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Done!"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
