import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    Circle,
    Loader2,
    Upload,
    Search,
    Filter,
    MoreVertical,
    Building2,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import {
    getEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    toggleEquipmentAvailability,
    getCategories,
    createCategory
} from '@/services/gymEquipmentService';
import ImageCropModal from '../register/components/ImageCropModal';

const Equipment = () => {
    const [equipments, setEquipments] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        available: true,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Crop Modal State
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    // Category Creation
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [equipmentData, categoryData] = await Promise.all([
                getEquipments(),
                getCategories()
            ]);
            setEquipments(equipmentData.equipments || []);
            setCategories(categoryData.categories || []);
        } catch (error) {
            toast.error('Failed to load equipment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImage: Blob) => {
        const file = new File([croppedImage], 'equipment.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(croppedImage));
        setIsCropModalOpen(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.categoryId) {
            toast.error('Name and category are required');
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('categoryId', formData.categoryId);
        data.append('available', String(formData.available));
        if (selectedFile) data.append('image', selectedFile);

        try {
            if (editingId) {
                await updateEquipment(editingId, data);
                toast.success('Equipment updated!');
            } else {
                await createEquipment(data);
                toast.success('Equipment added!');
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Failed to save equipment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            categoryId: item.categoryId?._id || item.categoryId,
            available: item.available,
        });
        setPreviewUrl(item.image);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                await deleteEquipment(id);
                toast.success('Equipment deleted');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete equipment');
            }
        }
    };

    const handleToggleAvailability = async (id: string) => {
        try {
            await toggleEquipmentAvailability(id);
            setEquipments(prev => prev.map(item =>
                item._id === id ? { ...item, available: !item.available } : item
            ));
        } catch (error) {
            toast.error('Failed to toggle availability');
        }
    };

    const handleCategoryCreate = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createCategory(newCategoryName);
            toast.success('Category created');
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', categoryId: '', available: true });
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const filteredEquipments = equipments.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || (item.categoryId?._id || item.categoryId) === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 font-outfit">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white italic tracking-tight uppercase">
                        Equipment <span className="text-primary non-italic">Inventory</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">Manage machinery and tools in your facility</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                    >
                        <Plus size={18} className="mr-2" /> Categories
                    </Button>
                    <Button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="h-12 px-8 flex-1 md:flex-none bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all"
                    >
                        <Plus size={20} className="mr-2" /> Add Item
                    </Button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <Input
                        placeholder="Search equipment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white focus:border-primary/50 transition-all"
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : filteredEquipments.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                    <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-600">
                        <Building2 size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">No Equipment Found</h3>
                        <p className="text-zinc-500">Try adjusting your filters or add a new item</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredEquipments.map((item) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`relative group p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${item.available
                                    ? 'bg-white/[0.03] border-white/10 hover:border-primary/30'
                                    : 'bg-zinc-900/50 border-red-500/10 grayscale opacity-60'
                                    }`}
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="aspect-square rounded-3xl overflow-hidden bg-black/40 mb-6 relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                            <Building2 size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <Badge
                                        className={`absolute bottom-3 right-3 text-[10px] font-black uppercase tracking-widest ${item.available ? 'bg-primary text-black' : 'bg-red-500 text-white'}`}
                                    >
                                        {item.available ? 'Available' : 'Out of Order'}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.categoryName || item.categoryId?.name}</p>
                                        <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                                    </div>

                                    <Button
                                        onClick={() => handleToggleAvailability(item._id)}
                                        variant="ghost"
                                        className={`w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border gap-2 transition-all ${item.available
                                            ? 'border-white/10 text-zinc-500 hover:border-red-500/30 hover:text-red-500'
                                            : 'border-white/10 text-primary hover:bg-primary/10'}`}
                                    >
                                        {item.available ? <Circle size={12} /> : <CheckCircle2 size={12} />}
                                        {item.available ? 'Mark Unavailable' : 'Mark Available'}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Equipment Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tight">
                            {editingId ? 'Edit' : 'Add New'} <span className="text-primary non-italic">Equipment</span>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium italic">
                            Fill in the details for your gym equipment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Equipment Image</label>
                            <div
                                className="relative aspect-video rounded-[2rem] border-2 border-dashed border-white/10 hover:border-primary/30 transition-all bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                                onClick={() => document.getElementById('equipment-upload')?.click()}
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="text-primary" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <Upload className="text-zinc-500" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-500">JPG, PNG up to 5MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    id="equipment-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Name</label>
                                <Input
                                    placeholder="e.g. Olympic Barbell"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Category</label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                                >
                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        {categories.map(cat => (
                                            <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-8">
                        <Button
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="h-14 rounded-2xl font-bold text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="h-14 px-8 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                        >
                            {isSubmitting && <Loader2 className="mr-2 animate-spin" size={18} />}
                            {editingId ? 'Save Changes' : 'Create Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">
                            New <span className="text-primary non-italic">Category</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                            />
                            <Button
                                onClick={handleCategoryCreate}
                                className="bg-primary hover:bg-primary/90 text-black font-black"
                            >
                                Add
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map(cat => (
                                <div key={cat._id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <span className="font-bold">{cat.name}</span>
                                    {/* Add delete category if needed */}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ImageCropModal
                isOpen={isCropModalOpen}
                onClose={() => setIsCropModalOpen(false)}
                image={imageToCrop || ''}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default Equipment;


export default Equipment;
