import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit3,
    Tag,
    ChevronLeft,

    X,
    Upload,
    Loader2,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getGymProducts,
    createGymProduct,
    updateGymProduct,
    deleteGymProduct
} from '@/services/gymService';
import { toast } from 'react-hot-toast';

const Store = () => {
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [category, setCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (view === 'list') {
            fetchProducts();
        }
    }, [category, page, view]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getGymProducts(page, 10, searchTerm, category);
            setProducts(data.products);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...urls]);
        }
    };

    const removePreview = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (product: any) => {
        setEditingProduct({ ...product, existingImages: product.images });
        setPreviewUrls([]);
        setImageFiles([]);
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteGymProduct(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editingProduct.name);
            formData.append('description', editingProduct.description);
            formData.append('price', editingProduct.price.toString());
            formData.append('category', editingProduct.category);
            formData.append('subcategory', editingProduct.subcategory);
            formData.append('stock', editingProduct.stock.toString());
            formData.append('isAvailable', editingProduct.isAvailable.toString());

            if (editingProduct.existingImages) {
                editingProduct.existingImages.forEach((img: string) => {
                    formData.append('existingImages', img);
                });
            }

            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            if (view === 'create') {
                await createGymProduct(formData);
                toast.success('Product created');
            } else {
                await updateGymProduct(editingProduct._id, formData);
                toast.success('Product updated');
            }

            setView('list');
            setEditingProduct(null);
            setImageFiles([]);
            setPreviewUrls([]);
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white italic">GYM STORE</h1>
                            <p className="text-gray-500">Manage products, supplements, and merchandise</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingProduct({
                                    name: '',
                                    price: 0,
                                    category: 'supplements',
                                    subcategory: '',
                                    stock: 0,
                                    description: '',
                                    isAvailable: true
                                });
                                setView('create');
                            }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] w-full md:w-auto"
                        >
                            <Plus size={18} className="mr-2" /> Add Product
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                            />
                        </form>
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                            {['all', 'supplements', 'clothing', 'accessories'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setCategory(cat); setPage(1); }}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${category === cat
                                        ? 'bg-primary border-primary text-black'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-gray-500 font-bold tracking-widest uppercase italic">Updating Inventory...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                            <AlertCircle className="text-zinc-600" size={60} />
                            <p className="text-gray-500 font-bold tracking-widest uppercase italic">No products found</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {products.map((product) => (
                                        <motion.div
                                            key={product._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -5 }}
                                            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group flex flex-col border-b-4 border-b-primary/10"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-white/5">
                                                <img
                                                    src={product.images[0] || 'https://via.placeholder.com/400'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                                />
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <Badge className="bg-black/80 backdrop-blur-md text-white border-white/10 text-[10px] uppercase font-black px-2 py-0.5 tracking-tighter">
                                                        {product.category}
                                                    </Badge>
                                                    <Badge className={`${product.isAvailable ? 'bg-green-500/80' : 'bg-red-500/80'} backdrop-blur-md text-white border-0 text-[10px] uppercase font-black px-2 py-0.5 tracking-tighter`}>
                                                        {product.isAvailable ? 'In Stock' : 'Out of stock'}
                                                    </Badge>
                                                </div>
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2 bg-red-500/80 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-colors shadow-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors leading-tight line-clamp-1">{product.name}</h3>
                                                    <p className="text-xl font-black text-primary italic border-b-2 border-primary/20">${product.price}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1 uppercase tracking-widest font-black italic">
                                                    <Tag size={12} className="text-primary" /> {product.subcategory || 'General'}
                                                </p>

                                                <div className="mt-auto flex gap-2">
                                                    <Button
                                                        onClick={() => handleEdit(product)}
                                                        variant="outline"
                                                        className="flex-1 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase italic tracking-widest"
                                                    >
                                                        <Edit3 size={14} className="mr-2" /> Edit
                                                    </Button>
                                                    <Badge className="bg-white/5 border border-white/10 text-zinc-500 font-black italic text-[10px] px-3">
                                                        STOCK: {product.stock}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${page === i + 1
                                                ? 'bg-primary text-black'
                                                : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
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
                                onClick={() => {
                                    setView('list');
                                    setEditingProduct(null);
                                    setPreviewUrls([]);
                                    setImageFiles([]);
                                }}
                                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-xl"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-black italic text-white">
                                {view === 'create' ? 'ADD NEW PRODUCT' : `EDITING: ${editingProduct?.name}`}
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Product Name</label>
                                    <Input
                                        required
                                        value={editingProduct?.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Price ($)</label>
                                        <Input
                                            required
                                            type="number"
                                            value={editingProduct?.price}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, price: parseInt(e.target.value) })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Current Stock</label>
                                        <Input
                                            required
                                            type="number"
                                            value={editingProduct?.stock}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, stock: parseInt(e.target.value) })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Category</label>
                                        <select
                                            value={editingProduct?.category}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, category: e.target.value as any })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 h-12 rounded-xl px-4 outline-none focus:ring-1 focus:ring-primary/30 text-white text-sm font-bold uppercase tracking-tight"
                                        >
                                            <option value="supplements">Supplements</option>
                                            <option value="clothing">Clothing</option>
                                            <option value="accessories">Accessories</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Subcategory</label>
                                        <Input
                                            value={editingProduct?.subcategory}
                                            onChange={(e) => setEditingProduct({ ...editingProduct!, subcategory: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-primary/30"
                                            placeholder="e.g. Protein, T-Shirts"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Full Description</label>
                                    <textarea
                                        required
                                        value={editingProduct?.description}
                                        onChange={(e) => setEditingProduct({ ...editingProduct!, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[120px] outline-none focus:ring-1 focus:ring-primary/30 text-white text-sm font-medium resize-none"
                                        placeholder="Detailed features, benefits, and ingredients..."
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct!, isAvailable: !editingProduct!.isAvailable })}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg ${editingProduct?.isAvailable ? 'bg-primary/10 border-primary text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${editingProduct?.isAvailable ? 'bg-primary' : 'bg-red-500'} animate-pulse`} />
                                        {editingProduct?.isAvailable ? 'Currently Available' : 'Currently Out of stock'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Visual Presentation</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {editingProduct?.existingImages?.map((img: string, i: number) => (
                                        <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-white/5">
                                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setEditingProduct({
                                                    ...editingProduct!,
                                                    existingImages: editingProduct!.existingImages.filter((_: string, idx: number) => idx !== i)
                                                })}
                                                className="absolute top-2 right-2 p-2 bg-black/80 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {previewUrls.map((url, i) => (
                                        <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-primary/30 group bg-white/5">
                                            <img src={url} alt="New" className="w-full h-full object-cover" />
                                            <Badge className="absolute top-2 left-2 bg-primary text-black font-black text-[8px] italic">NEW</Badge>
                                            <button
                                                type="button"
                                                onClick={() => removePreview(i)}
                                                className="absolute top-2 right-2 p-2 bg-black/80 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-primary/50 transition-all group cursor-pointer bg-white/5">
                                        <Upload className="text-gray-500 group-hover:text-primary mb-2" size={24} />
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center px-4 leading-normal">
                                            Drop product<br />images here
                                        </span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => setView('list')}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-[1.25rem] border-white/10 bg-white/5 text-gray-500 hover:text-white font-black uppercase italic tracking-widest transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-black text-lg font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    {view === 'create' ? 'Launch Product' : 'Save Changes'}
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

