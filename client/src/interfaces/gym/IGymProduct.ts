
export interface IGymProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    images: string[];
    isAvailable: boolean;
    stock: number;
    isInWishlist?: boolean;
}
