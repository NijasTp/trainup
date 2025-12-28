export interface USDAFood {
    fdcId: number;
    description: string;
    ingredients?: string;
    foodNutrients: {
        nutrientId: number;
        nutrientName: string;
        unitName: string;
        value: number;
    }[];
    foodAttributes?: {
        id: number;
        name: string;
        value: string;
    }[];
}

export interface USDAResponse {
    totalHits: number;
    currentPage: number;
    totalPages: number;
    foods: USDAFood[];
}
