import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@radix-ui/react-select";
import { Badge, UserIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "react-toastify";
import { Label } from "recharts";
import { z } from "zod";

// Simulated SiteHeader component
const SiteHeader = () => (
    <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">TrainUp</h1>
            <nav>
                <a href="/profile" className="text-gray-600 hover:text-blue-600 mx-2">Profile</a>
                <a href="/edit-profile" className="text-gray-600 hover:text-blue-600 mx-2">Edit Profile</a>
            </nav>
        </div>
    </header>
);

// Zod schema for form validation (aligned with UserResponseDTO)
const UpdateProfileDTO = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    height: z.number().min(50, "Height must be at least 50 cm").optional(),
    weight: z.number().min(20, "Weight must be at least 20 kg").optional(),
    goals: z.array(z.string()).optional(),
    activityLevel: z.enum(["Sedentary", "Light", "Moderate", "Active", "Very Active"]).optional(),
    equipment: z.boolean().optional(),
});

// Type for UserProfile (aligned with UserResponseDTO)
interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "user";
    goals?: string[];
    activityLevel?: string;
    equipment?: boolean;
    height?: number;
    weight?: number;
    assignedTrainer?: string;
    gymId?: string;
    isPrivate?: boolean;
    isBanned: boolean;
    streak?: number;
    xp?: number;
    achievements?: string[];
    createdAt: string;
    updatedAt: string;
}

// Simulated API service
const api = {
    getProfile: async () => {
        // Simulated API call to /api/users/profile
        const response = await fetch("/api/users/profile", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        return response.json();
    },
    updateProfile: async (data: Partial<UserProfile>) => {
        const response = await fetch("/api/users/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update profile");
        return response.json();
    },
};

const EditProfileForm: React.FC<{
    profile: UserProfile | null;
    onSubmit: (data: Partial<UserProfile>) => Promise<void>;
    onCancel: () => void;
}> = ({ profile, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        name: profile?.name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        height: profile?.height,
        weight: profile?.weight,
        goals: profile?.goals || [],
        activityLevel: profile?.activityLevel,
        equipment: profile?.equipment || false,
    });
    const [newGoal, setNewGoal] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "number"
                    ? value === ""
                        ? undefined
                        : Number(value)
                    : value,
        }));
    };

    const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, equipment: e.target.checked }));
    };

    const handleAddGoal = () => {
        if (newGoal.trim()) {
            setFormData((prev) => ({
                ...prev,
                goals: [...(prev.goals || []), newGoal.trim()],
            }));
            setNewGoal("");
        }
    };

    const handleRemoveGoal = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            goals: (prev.goals || []).filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const result = UpdateProfileDTO.safeParse(formData);
            if (!result.success) {
                const fieldErrors = result.error.flatten().fieldErrors;
                setErrors(
                    Object.keys(fieldErrors).reduce((acc, key) => {
                        const typedKey = key as keyof typeof fieldErrors;
                        return {
                            ...acc,
                            [typedKey]: fieldErrors[typedKey]?.[0] || "",
                        };
                    }, {} as Record<keyof typeof fieldErrors, string>)
                );
                setIsSubmitting(false);
                return;
            }

            await onSubmit(result.data);
            toast.success("Profile updated");
        } catch (error: any) {
            toast.error("Failed to update profile", {
                data: error.message || "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Enter your name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div className="space-y-2">
                <Label >Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label >Height (cm)</Label>
                    <Input
                        id="height"
                        name="height"
                        type="number"
                        value={formData.height ?? ""}
                        onChange={handleChange}
                        placeholder="Enter your height"
                    />
                    {errors.height && (
                        <p className="text-red-500 text-sm">{errors.height}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label >Weight (kg)</Label>
                    <Input
                        id="weight"
                        name="weight"
                        type="number"
                        value={formData.weight ?? ""}
                        onChange={handleChange}
                        placeholder="Enter your weight"
                    />
                    {errors.weight && (
                        <p className="text-red-500 text-sm">{errors.weight}</p>
                    )}
                </div>
            </div>
            <div className="space-y-2">
                <Label >Activity Level</Label>
                <Select
                    name="activityLevel"
                    value={formData.activityLevel || ""}
                //   onChange={handleChange}
                >
                    <option value="">Select activity level</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Light">Light</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Active">Active</option>
                    <option value="Very Active">Very Active</option>
                </Select>
                {errors.activityLevel && (
                    <p className="text-red-500 text-sm">{errors.activityLevel}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label>Equipment Available</Label>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="equipment"
                        checked={formData.equipment || false}
                        onChange={handleEquipmentChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label>I have gym equipment</Label>
                </div>
                {errors.equipment && (
                    <p className="text-red-500 text-sm">{errors.equipment}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label>Fitness Goals</Label>
                <div className="flex gap-2">
                    <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add a fitness goal"
                    />
                    <Button type="button" onClick={handleAddGoal}>
                        Add Goal
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {formData.goals?.map((goal, index) => (
                        <Badge
                            key={index}
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => handleRemoveGoal(index)}
                        >
                            {goal} <span className="ml-1">×</span>
                        </Badge>
                    ))}
                </div>
                {errors.goals && <p className="text-red-500 text-sm">{errors.goals}</p>}
            </div>
            <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-100"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

// Main EditProfile component
const EditProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp - Edit Profile";
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.getProfile();
            setProfile(response.user);
        } catch (err) {
            setError("Failed to fetch profile");
            toast.error("Error loading profile", {
                data: "Please try again later",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: Partial<UserProfile>) => {
        try {
            const response = await api.updateProfile(data);
            setProfile(response.user);
        } catch (error) {
            throw error; // Handled in EditProfileForm
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent"></div>
            <SiteHeader />
            <main className="relative container mx-auto px-4 py-12 space-y-8">
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Edit Your Profile</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-blue-600 bg-clip-text text-transparent">
                        Customize Your Fitness Journey
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Update your personal and fitness details to stay on track
                    </p>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-blue-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-gray-600 font-medium">Loading your profile...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full border border-red-200 mb-4">
                            <span className="text-red-600 font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {!isLoading && !error && profile && (
                    <Card className="relative group bg-white/80 backdrop-blur-sm border-gray-200 max-w-4xl mx-auto overflow-hidden hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <CardHeader>
                            <CardTitle className="text-3xl text-gray-900">Edit Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EditProfileForm
                                profile={profile}
                                onSubmit={handleSubmit}
                                onCancel={() => (window.location.href = "/profile")}
                            />
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

// Render the app
const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<EditProfile />);
}