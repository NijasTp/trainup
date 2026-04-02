import { 
    ArrowLeft,
    ShoppingCart, 
    Trash2, 
    AlertCircle,
    Loader2,
    Shield
} from 'lucide-react';
import { SiteHeader } from '@/components/user/home/UserSiteHeader';
import { SiteFooter } from '@/components/user/home/UserSiteFooter';
import Aurora from "@/components/ui/Aurora";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getUserWishlist, toggleWishlist } from '@/services/gymService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

import type { IGymProduct as Product } from "@/interfaces/gym/IGymProduct";

const WishlistPage: React.FC = () => {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        document.title = "TrainUp | My Wishlist";
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        setIsLoading(true);
        try {
            const res = await getUserWishlist();
            setWishlist(res.products || []);
        } catch (error) {
            console.error("Wishlist error:", error);
            toast.error("Failed to load wishlist");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        setDeletingId(productId);
        try {
            await toggleWishlist(productId);
            setWishlist(prev => prev.filter(p => p._id !== productId));
            toast.success("Item removed from wishlist");
        } catch (error) {
            toast.error("Failed to remove item");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-x-hidden font-outfit">
            {/* Background Visuals */}
            <div className="fixed inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
            </div>

            <SiteHeader />

            <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 py-12 flex-1 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b border-white/5">
                    <div className="space-y-4">
                        <Link to={ROUTES.USER_GYM_DASHBOARD} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-cyan-400 transition-all">
                             <ArrowLeft className="h-3 w-3" /> DASHBOARD / WISHLIST
                        </Link>
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20 shadow-[0_0_40px_rgba(217,70,239,0.15)]">
                                <Shield className="h-10 w-10 text-fuchsia-400" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
                                    My <span className="text-zinc-500">Wishlist</span>
                                </h1>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] italic">SAVED ITEMS FOR QUICK PURCHASE</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl">
                        <div className="text-center">
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Total Items</p>
                            <p className="text-5xl font-black text-fuchsia-400 italic tabular-nums">{wishlist.length}</p>
                        </div>
                        <Link to={ROUTES.USER_GYM_SHOP}>
                           <Button className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-cyan-500 hover:text-black font-black uppercase italic tracking-widest transition-all">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Browse Products
                           </Button>
                        </Link>
                    </div>
                </header>

                {isLoading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">Loading your wishlist...</p>
                    </div>
                ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {wishlist.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group"
                                >
                                    <Card className="bg-black/40 border-white/5 rounded-[3rem] overflow-hidden group-hover:border-fuchsia-500/30 transition-all duration-500 shadow-2xl backdrop-blur-3xl relative">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={item.images[0] || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000"}
                                                alt={item.name}
                                                className={cn(
                                                    "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                                                    !item.isAvailable && "grayscale brightness-50"
                                                )}
                                            />
                                            
                                            {/* Status Badge - User Request: RED if unavailable */}
                                            {!item.isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-[2px]">
                                                    <span className="bg-red-500 text-white font-black px-6 py-2 rounded-full flex items-center gap-2 text-xs italic tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                                        <AlertCircle className="h-4 w-4" /> UNAVAILABLE: OUT OF STOCK
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute top-6 right-6">
                                                <Button 
                                                    variant="secondary" 
                                                    size="icon" 
                                                    disabled={deletingId === item._id}
                                                    onClick={() => handleRemove(item._id)}
                                                    className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 hover:bg-red-600 hover:text-white transition-all size-12 shadow-xl group/del"
                                                >
                                                    {deletingId === item._id ? <Loader2 className="animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <CardContent className="p-10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                     <Badge className="bg-white/5 text-zinc-500 border-0 text-[8px] font-black uppercase tracking-[0.2em]">{item.category}</Badge>
                                                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-fuchsia-400 transition-colors">{item.name}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-fuchsia-400 italic">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                <Button
                                                    disabled={!item.isAvailable}
                                                    className={cn(
                                                        "flex-1 h-14 rounded-2xl font-black uppercase italic tracking-widest text-[11px] transition-all",
                                                        item.isAvailable
                                                            ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_10px_20px_rgba(6,182,212,0.2)]"
                                                            : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5"
                                                    )}
                                                >
                                                    {item.isAvailable ? <><ShoppingCart className="mr-3 h-4 w-4" /> Add to Cart</> : "Currently Unavailable"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[4rem]"
                    >
                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 group relative">
                            <Shield className="h-16 w-16 text-zinc-700 group-hover:text-fuchsia-500 transition-colors" />
                            <div className="absolute inset-0 rounded-full border border-zinc-800 animate-ping" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Your Wishlist is Empty</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-10 max-w-sm mx-auto leading-relaxed">Save items from the store to see them here.</p>
                        <Link to={ROUTES.USER_GYM_SHOP}>
                           <Button className="h-16 px-12 rounded-2xl bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.3)] font-black uppercase italic tracking-widest hover:scale-105 transition-all">
                                Go to Shop
                           </Button>
                        </Link>
                    </motion.div>
                )}
            </main>

            <SiteFooter />
        </div>
    );
};

export default WishlistPage;
