import React from 'react';
import { ShoppingBag, Star, ArrowRight, ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import { SiteHeader } from '@/components/user/home/UserSiteHeader';
import { SiteFooter } from '@/components/user/home/UserSiteFooter';
import Aurora from "@/components/ui/Aurora";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isAvailable: boolean;
    rating: number;
}

const mockWishlist: WishlistItem[] = [
    {
        id: '1',
        name: 'Premium Whey Protein (2kg)',
        price: 3499,
        image: 'https://cdn.pixabay.com/photo/2018/01/01/21/25/whey-3055009_1280.jpg',
        category: 'Supplements',
        isAvailable: true,
        rating: 4.8
    },
    {
        id: '2',
        name: 'Adjustable Dumbbells Set',
        price: 12999,
        image: 'https://cdn.pixabay.com/photo/2016/03/10/16/01/dumbbells-1248742_1280.jpg',
        category: 'Equipment',
        isAvailable: false,
        rating: 4.5
    },
    {
        id: '3',
        name: 'Gym Stealth T-Shirt',
        price: 999,
        image: 'https://cdn.pixabay.com/photo/2016/11/29/03/42/man-1867121_1280.jpg',
        category: 'Apparel',
        isAvailable: true,
        rating: 4.7
    }
];

const WishlistPage: React.FC = () => {
    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit selection:bg-blue-500/30">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <main className="relative z-10 container mx-auto px-4 py-12 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent mb-2">
                            My Wishlist
                        </h1>
                        <p className="text-gray-400">Save items you love and track their availability.</p>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 h-auto font-bold group">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        View Store
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {mockWishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockWishlist.map((item) => (
                            <Card key={item.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden rounded-2xl">
                                <CardContent className="p-0">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={cn(
                                                "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                                                !item.isAvailable && "grayscale opacity-50"
                                            )}
                                        />
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <span className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    UNAVAILABLE
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <Button variant="secondary" size="icon" className="rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-red-500 hover:text-white transition-all size-10">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{item.category}</span>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="text-xs font-bold">{item.rating}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-4 line-clamp-1">{item.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-white">₹{item.price.toLocaleString()}</span>
                                            <Button
                                                disabled={!item.isAvailable}
                                                className={cn(
                                                    "rounded-full px-6",
                                                    item.isAvailable
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                                                )}
                                            >
                                                {item.isAvailable ? "Add to Cart" : "Out of Stock"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="h-12 w-12 text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-400 mb-8 max-w-sm">Explore our store and find the best supplements and equipment for your journey.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                            Explore Store
                        </Button>
                    </div>
                )}
            </main>

            <SiteFooter />
        </div>
    );
};

export default WishlistPage;
