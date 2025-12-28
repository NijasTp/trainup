export interface Meal {
    _id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: string;
    source: "user" | "trainer";
    description?: string;
}

export interface AddMealResponse {
    _id: string;
    user: string;
    date: string;
    meals: Meal[] | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
