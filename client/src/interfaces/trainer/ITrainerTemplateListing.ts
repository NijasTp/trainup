export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    weight?: string;
    notes?: string;
}

export interface TemplateMeal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: string;
    notes?: string;
}

export interface Template {
    _id: string;
    name?: string;
    title?: string;
    goal?: string;
    description?: string;
    exercises?: Exercise[];
    meals?: TemplateMeal[];
    createdAt: string;
    updatedAt: string;
}

export interface TemplateListResponse {
    templates: Template[];
    total: number;
    page: number;
    totalPages: number;
}
