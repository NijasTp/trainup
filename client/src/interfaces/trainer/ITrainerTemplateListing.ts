export interface Template {
    _id: string;
    name?: string;
    title?: string;
    goal?: string;
    description?: string;
    exercises?: any[];
    meals?: any[];
    createdAt: string;
    updatedAt: string;
}

export interface TemplateListResponse {
    templates: Template[];
    total: number;
    page: number;
    totalPages: number;
}
