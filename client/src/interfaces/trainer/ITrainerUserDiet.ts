export interface Meal {
    _id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: string;
    source: "user" | "trainer" | "admin";
    sourceId?: string;
    usedBy?: string;
    description?: string;
    isEaten?: boolean;
}

export interface IDietDay {
    _id: string;
    user: string;
    date: string;
    meals: Meal[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}
