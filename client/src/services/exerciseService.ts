import axios from "axios";
import type { IExerciseDb } from "@/interfaces/exercise/IExerciseDb";

const EXERCISEDB_BASE_URL = import.meta.env.VITE_EXERCISEDB_URL || "https://oss.exercisedb.dev/api/v1";

const exerciseApi = axios.create({
    baseURL: EXERCISEDB_BASE_URL,
    timeout: 10000,
});

export const searchExercises = async (query: string): Promise<IExerciseDb[]> => {
    // Standard Fuzzy name matching directly on the public URL
    const url = `/exercises?name=${encodeURIComponent(query)}&limit=25`;
    console.log(`[ExerciseDB API Call] URL: ${EXERCISEDB_BASE_URL}${url}`);
    try {
        const res = await exerciseApi.get<{ success: boolean; data: IExerciseDb[] }>(url);
        console.log(`[ExerciseDB API Response] Success: ${res.data.success}, Count: ${res.data.data?.length || 0}`, res.data.data);
        return res.data.data || [];
    } catch (errorVal) { const error = errorVal as SafeAny;
        console.error("[ExerciseDB API Error] Failed to fetch exercises directly:", error);
        throw error;
    }
};

export const getAllMuscles = async (): Promise<string[]> => {
    const url = "/muscles";
    console.log(`[ExerciseDB API Call] URL: ${EXERCISEDB_BASE_URL}${url}`);
    try {
        const res = await exerciseApi.get<{ success: boolean; data: string[] }>(url);
        console.log(`[ExerciseDB API Response] Success: ${res.data.success}, Count: ${res.data.data?.length || 0}`);
        return res.data.data || [];
    } catch (_error) {
        console.warn("[ExerciseDB API Warning] Direct muscles call failed, using high-fidelity local static fallback.");
        return ["biceps", "triceps", "pectorals", "lats", "quadriceps", "hamstrings", "glutes", "calves", "shoulders", "abs"];
    }
};

export const getAllEquipments = async (): Promise<string[]> => {
    const url = "/equipments";
    console.log(`[ExerciseDB API Call] URL: ${EXERCISEDB_BASE_URL}${url}`);
    try {
        const res = await exerciseApi.get<{ success: boolean; data: string[] }>(url);
        console.log(`[ExerciseDB API Response] Success: ${res.data.success}, Count: ${res.data.data?.length || 0}`);
        return res.data.data || [];
    } catch (_error) {
        console.warn("[ExerciseDB API Warning] Direct equipments call failed, using high-fidelity local static fallback.");
        return ["barbell", "dumbbell", "kettlebell", "cables", "machine", "body weight", "stability ball", "band"];
    }
};
