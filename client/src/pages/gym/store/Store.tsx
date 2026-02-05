
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit3,
    Heart,
    Package,
    Tag,
    ChevronLeft,
    X,
    Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '../data/mock';
import type { Product } from '../types';

const Store = () => {
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [category, setCategory] = useState('all');

    const filteredProducts = products.filter(p =>
        category === 'all' || p.category === category
    );

    const toggleAvailability = (id: string) => {
        setProducts(products.map(p => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p));
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setView('edit');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            if (view === 'edit') {
                setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
            } else {
                setProducts([...products, { ...editingProduct, id: Date.now().toString() }]);
            }
            setView('list');
            setEditingProduct(null);
        }
    };

    return (
        <div className="space-y-8">
            {view === 'list' ? (
                <>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black text-white italic">GYM STORE</h1>
                            <p className="text-gray-500">Manage products, supplements, and merchandise</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingProduct({
                                    id: '',
                                    name: '',
                                    price: 0,
                                    category: 'supplements',
                                    subcategory: '',
                                    stock: 0,
                                    images: [],
                                    description: '',
                                    isAvailable: true
                                });
                                setView('create');
                            }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                        >
                            <Plus size={18} className="mr-2" /> Add Product
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                            <Input
                                placeholder="Search products..."
                                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                            {['all', 'supplements', 'clothing', 'accessories'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${category === cat
                                        ? 'bg-primary border-primary text-black'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group flex flex-col"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-white/5">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className="bg-black/50 backdrop-blur-md text-white border-white/10 text-[10px] uppercase font-bold px-2">
                                                {product.category}
                                            </Badge>
                                            <Badge className={`${product.isAvailable ? 'bg-green-500/80' : 'bg-red-500/80'} backdrop-blur-md text-white border-0 text-[10px] uppercase font-bold px-2`}>
                                                {product.isAvailable ? 'Available' : 'Out of stock'}
                                            </Badge>
                                        </div>
                                        <button className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:text-primary transition-colors">
                                            <Heart size={16} />
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                                            <p className="text-xl font-black text-primary border-b border-primary/20">${product.price}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-6 flex items-center gap-1 uppercase tracking-widest font-bold">
                                            <Tag size={12} className="text-primary" /> {product.subcategory}
                                        </p>

                                        <div className="mt-auto flex gap-2">
                                            <Button
                                                onClick={() => handleEdit(product)}
                                                variant="outline"
                                                className="flex-1 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                                            >
                                                <Edit3 size={14} className="mr-2" /> Edit
                                            </Button>
                                            <button
                                                onClick={() => toggleAvailability(product.id)}
                                                className={`p-2 rounded-xl border transition-all ${product.isAvailable ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                    }`}
                                            >
                                                <Package size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setView('list')}
                                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-black italic">
                                {view === 'create' ? 'ADD NEW PRODUCT' : `EDIT PRODUCT: ${editingProduct?.name}`}
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Product Name</label>
                                    <Input
                                        value={editingProduct?.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Price ($)</label>
                                        <Input
                                            type="number"
                                            value={editingProduct?.price}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, price: parseInt(e.target.value) })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Stock</label>
                                        <Input
                                            type="number"
                                            value={editingProduct?.stock}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Category</label>
                                        <select
                                            value={editingProduct?.category}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, category: e.target.value as any })}
                                            className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 outline-none focus:border-primary/50 text-sm"
                                        >
                                            <option value="supplements">Supplements</option>
                                            <option value="clothing">Clothing</option>
                                            <option value="accessories">Accessories</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Subcategory</label>
                                        <Input
                                            value={editingProduct?.subcategory}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, subcategory: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                                            placeholder="e.g. Protein, T-Shirts"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Description</label>
                                    <textarea
                                        value={editingProduct?.description}
                                        onChange={(e) => setEditingProduct({ ...editingProduct!, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[120px] outline-none focus:border-primary/50 text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct!, isAvailable: !editingProduct!.isAvailable })}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest ${editingProduct?.isAvailable ? 'bg-primary/20 border-primary text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}
                                    >
                                        {editingProduct?.isAvailable ? 'Currently Available' : 'Currently Unavailable'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Product Images</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {editingProduct?.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setEditingProduct({
                                                    ...editingProduct!,
                                                    images: editingProduct!.images.filter((_, idx) => idx !== i)
                                                })}
                                                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 transition-all group cursor-pointer bg-white/5">
                                        <Upload className="text-gray-500 group-hover:text-primary mb-2" size={24} />
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Upload Image</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => setView('list')}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-lg font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    {view === 'create' ? 'Add Product' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default Store;
