import { z } from 'zod';
import { TemplateType, DifficultyLevel } from '../constants/template.constants';

const ExerciseSchema = z.object({
    exerciseId: z.string(),
    name: z.string(),
    image: z.string().optional(),
    sets: z.number().min(1),
    reps: z.string().optional(),
    time: z.string().optional(),
});

const DaySchema = z.object({
    dayNumber: z.number().min(1),
    exercises: z.array(ExerciseSchema),
});

export const CreateWorkoutTemplateSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    type: z.nativeEnum(TemplateType),
    difficultyLevel: z.nativeEnum(DifficultyLevel),
    requiredEquipment: z.array(z.string()).optional(),
    isPublic: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
    repetitions: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
    days: z.preprocess((val) => typeof val === 'string' ? JSON.parse(val) : val, z.array(DaySchema)),
});

export const UpdateWorkoutTemplateSchema = CreateWorkoutTemplateSchema.partial();

const MealNutrientSchema = z.object({
    label: z.string(),
    value: z.number(),
    unit: z.string(),
});

const MealSchema = z.object({
    name: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
    time: z.string(),
    notes: z.string().optional(),
    nutritions: z.array(MealNutrientSchema).optional(),
});

const DietDaySchema = z.object({
    dayNumber: z.number().min(1),
    meals: z.array(MealSchema),
});

export const CreateDietTemplateSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    duration: z.preprocess((val) => Number(val), z.number().min(1)),
    goal: z.string(),
    bodyType: z.string(),
    isPublic: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
    days: z.preprocess((val) => typeof val === 'string' ? JSON.parse(val) : val, z.array(DietDaySchema)),
});

export const UpdateDietTemplateSchema = CreateDietTemplateSchema.partial();
