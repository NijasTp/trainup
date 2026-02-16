import { IGymProduct } from "../../../models/gymProduct.model";

export interface IGymProductRepository {
    create(data: Partial<IGymProduct>): Promise<IGymProduct>;
    findById(id: string): Promise<IGymProduct | null>;
    findOne(query: any): Promise<IGymProduct | null>;
    update(id: string, data: Partial<IGymProduct>): Promise<IGymProduct | null>;
    updateOne(query: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }>;
    find(query: any, page: number, limit: number): Promise<{
        products: IGymProduct[];
        total: number;
        totalPages: number;
    }>;
    countDocuments(query: any): Promise<number>;
}
