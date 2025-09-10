import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { completeProfile } from '@/redux/slices/userAuthSlice';
import { completeUserProfile } from '@/services/userService';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { SiteHeader } from '@/components/user/home/UserSiteHeader';
import type { ProfileFormData } from '@/interfaces/user/completeProfile';



export default function CompleteProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.userAuth.user);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form without Zod resolver, using built-in validation
    const form = useForm<ProfileFormData>({
        defaultValues: {
            height: user?.height ? String(user.height) : '',
            weight: user?.weight ? String(user.weight) : '',
            activityLevel: user?.activityLevel ?? undefined,
            equipmentAvailability: user?.equipmentAvailability ?? false,
            goals: user?.goals ?? [],
        },
    });

    // Manual validation function for submission
    const validateForm = (data: ProfileFormData): boolean => {
        let isValid = true;

        // Height validation
        const heightNum = parseFloat(data.height);
        if (!data.height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
            form.setError('height', { message: 'Height must be a valid number between 100 and 250 cm' });
            isValid = false;
        } else {
            form.clearErrors('height');
        }

        // Weight validation
        const weightNum = parseFloat(data.weight);
        if (!data.weight || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
            form.setError('weight', { message: 'Weight must be a valid number between 30 and 300 kg' });
            isValid = false;
        } else {
            form.clearErrors('weight');
        }

        // Activity level validation
        if (!data.activityLevel) {
            form.setError('activityLevel', { message: 'Please select an activity level' });
            isValid = false;
        } else {
            form.clearErrors('activityLevel');
        }

        // Goals validation
        if (data.goals.length === 0) {
            form.setError('goals', { message: 'Please select at least one goal' });
            isValid = false;
        } else {
            form.clearErrors('goals');
        }

        return isValid;
    };

    const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
        // Run manual validation
        if (!validateForm(data)) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);
        try {
            const profileData = {
                height: data.height,
                weight: data.weight,
                activityLevel: data.activityLevel!,
                equipmentAvailability: data.equipmentAvailability,
                goals: data.goals,
            };

            await completeUserProfile(profileData);
            dispatch(completeProfile(profileData));
            toast.success('Profile updated successfully!');
            navigate('/');
        } catch (error: any) {
            console.error('Failed to complete profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Define goals array with explicit type
    const fitnessGoals: Array<'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'General Fitness'> = [
        'Weight Loss',
        'Muscle Gain',
        'Endurance',
        'General Fitness',
    ];

    // Handle activity level change to clear errors
    const handleActivityLevelChange = (value: string) => {
        form.setValue('activityLevel', value as ProfileFormData['activityLevel']);
        form.clearErrors('activityLevel');
    };

    // Handle goals change to clear errors
    const handleGoalChange = (goal: ProfileFormData['goals'][number], checked: boolean) => {
        const currentGoals = form.getValues('goals') || [];
        let newGoals: ProfileFormData['goals'];
        if (checked) {
            newGoals = [...currentGoals, goal];
        } else {
            newGoals = currentGoals.filter((g) => g !== goal);
        }
        form.setValue('goals', newGoals);
        if (newGoals.length > 0) {
            form.clearErrors('goals');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <SiteHeader />
            <main className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto bg-card/40 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                        </div>
                        <p className="text-muted-foreground">
                            Please provide the following details to personalize your fitness journey.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Height */}
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height (cm)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter height in cm"
                                                    {...field}
                                                    onBlur={() => {
                                                        const heightNum = parseFloat(field.value);
                                                        if (!field.value || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
                                                            form.setError('height', { message: 'Height must be a valid number between 100 and 250 cm' });
                                                        } else {
                                                            form.clearErrors('height');
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Weight */}
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter weight in kg"
                                                    {...field}
                                                    onBlur={() => {
                                                        const weightNum = parseFloat(field.value);
                                                        if (!field.value || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
                                                            form.setError('weight', { message: 'Weight must be a valid number between 30 and 300 kg' });
                                                        } else {
                                                            form.clearErrors('weight');
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Activity Level */}
                                <FormField
                                    control={form.control}
                                    name="activityLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Activity Level</FormLabel>
                                            <Select onValueChange={handleActivityLevelChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select activity level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                                                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                                                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                                                    <SelectItem value="Very Active">Very Active</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Equipment Availability */}
                                <FormField
                                    control={form.control}
                                    name="equipmentAvailability"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-medium">
                                                I have access to gym equipment
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />

                                {/* Goals */}
                                <FormField
                                    control={form.control}
                                    name="goals"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fitness Goals</FormLabel>
                                            <div className="space-y-2">
                                                {fitnessGoals.map((goal) => (
                                                    <div key={goal} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={field.value?.includes(goal) || false}
                                                            onCheckedChange={(checked) => handleGoalChange(goal, !!checked)}
                                                        />
                                                        <FormLabel className="text-sm font-medium">{goal}</FormLabel>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}