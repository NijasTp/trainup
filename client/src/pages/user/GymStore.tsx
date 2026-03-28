import { useEffect, useState } from "react";
import { 
    ShoppingBag, 
    Search, 
    Heart, 
    Tag, 
    ArrowLeft, 
    AlertCircle, 
    Loader2,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
    getUserGymProducts, 
    getMyGym 
} from "@/services/gymService";
import API from "@/lib/axios";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface Product {
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

export default function UserGymStore() {
    const [products, setProducts] = useState<Product[]>([]);
    const [gym, setGym] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");
    const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp | Gym Store";
        fetchStoreData();
    }, [category]);

    const fetchStoreData = async () => {
        setIsLoading(true);
        try {
            const [gymResponse, productsResponse] = await Promise.all([
                getMyGym(),
                getUserGymProducts(1, 20, searchTerm, category)
            ]);
            setGym(gymResponse.gym);
            setProducts(productsResponse.products);
        } catch (error) {
            console.error("Store error:", error);
            toast.error("Failed to load store data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStoreData();
    };

    const toggleWishlist = async (productId: string) => {
        setWishlistLoading(productId);
        try {
            const res = await API.post(`/user/gym-products/wishlist/${productId}`);
            const isAdded = res.data.isAdded;
            
            setProducts(prev => prev.map(p => 
                p._id === productId ? { ...p, isInWishlist: isAdded } : p
            ));
            
            toast.success(isAdded ? "Added to wishlist" : "Removed from wishlist");
        } catch (error) {
            toast.error("Failed to update wishlist");
        } finally {
            setWishlistLoading(null);
        }
    };

    if (isLoading && products.length === 0) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-8 space-y-12 flex-1 z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <Link to={ROUTES.USER_GYM_DASHBOARD} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-4 group">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                                <ShoppingBag className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-pre-wrap leading-tight">
                                    {gym?.name} <span className="text-primary italic">STORE</span>
                                </h1>
                                <p className="text-gray-400 font-medium">Exclusive merchandise & supplements</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input 
                            placeholder="Search showcase..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/30 text-lg transition-all"
                        />
                    </form>
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {["all", "supplements", "clothing", "accessories"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all whitespace-nowrap shadow-xl ${
                                category === cat
                                ? 'bg-primary border-primary text-black'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-md">
                        <AlertCircle className="text-gray-600 h-20 w-20" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-gray-500 italic uppercase tracking-widest">No products in showcase</p>
                            <p className="text-gray-500 mt-2 font-medium">Try a different category or search term</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <AnimatePresence mode="popLayout">
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group"
                                >
                                    <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden group-hover:border-primary/30 transition-all duration-500 shadow-2xl backdrop-blur-md h-full flex flex-col">
                                        {/* Image Area */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                                            <img 
                                                src={product.images[0] || "/placeholder-product.jpg"} 
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                            
                                            {/* Action Floatings */}
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-black/80 backdrop-blur-md text-white border-white/10 text-[9px] uppercase font-black px-3 py-1 tracking-widest italic">
                                                    {product.category}
                                                </Badge>
                                            </div>

                                            <button 
                                                onClick={() => toggleWishlist(product._id)}
                                                disabled={!!wishlistLoading}
                                                className="absolute top-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:text-black transition-all shadow-xl group/btn"
                                            >
                                                {wishlistLoading === product._id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Heart className={`h-5 w-5 ${product.isInWishlist ? 'fill-current text-primary group-hover/btn:text-black' : ''}`} />
                                                )}
                                            </button>

                                            {/* Availability Badge */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                {!product.isAvailable || product.stock === 0 ? (
                                                    <div className="inline-flex items-center gap-2 bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/30">
                                                        <XCircle className="h-4 w-4 text-white" />
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Out of Stock</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 bg-green-500/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-green-500/30">
                                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">In Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Area */}
                                        <div className="p-8 space-y-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1 italic line-clamp-1">
                                                        {product.subcategory || "GYM AUTHENTIC"}
                                                    </p>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                                <p className="text-2xl font-black italic text-primary border-b-2 border-primary/20 leading-none">
                                                    ${product.price}
                                                </p>
                                            </div>
                                            
                                            <p className="text-gray-400 text-xs font-medium leading-relaxed line-clamp-3">
                                                {product.description}
                                            </p>

                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-3 w-3 text-primary" />
                                                    <span className="text-[10px] uppercase font-black tracking-widest italic">{product.category}</span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-tighter">Availability Only System</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Info Bar */}
                <Card className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 mt-12 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12">
                        <ShoppingBag size={120} className="text-primary" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-black italic uppercase">Store Info</h3>
                            <p className="max-w-xl text-gray-400 font-medium">
                                Visit <span className="text-white font-bold">{gym?.name}</span>'s reception to purchase these items. 
                                High quality supplements and premium gear verified by professional trainers.
                            </p>
                        </div>
                        <Button className="h-14 px-12 rounded-2xl bg-white text-black font-black uppercase italic tracking-widest hover:bg-primary transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            Contact Reception
                        </Button>
                    </div>
                </Card>
            </main>

            <SiteFooter />
        </div>
    );
}

