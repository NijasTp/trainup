import { Plus, Edit, Search, Package, AlertCircle, Trash2, LayoutGrid, List } from 'lucide-react';
import GymPageLayout from '@/components/layouts/GymPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'in-stock' | 'out-of-stock';
  image?: string;
}

const mockProducts: Product[] = [
  { id: 1, name: "Whey Protein 2kg", price: 3499, stock: 42, category: "Supplements", status: "in-stock", image: "https://cdn.pixabay.com/photo/2018/01/01/21/25/whey-3055009_1280.jpg" },
  { id: 2, name: "Resistance Bands Set", price: 899, stock: 0, category: "Accessories", status: "out-of-stock", image: "https://cdn.pixabay.com/photo/2016/03/10/16/01/dumbbells-1248742_1280.jpg" },
  { id: 3, name: "Creatine Monohydrate", price: 1299, stock: 15, category: "Supplements", status: "in-stock", image: "https://cdn.pixabay.com/photo/2020/05/26/09/32/shaker-5222384_1280.jpg" },
  { id: 4, name: "Gym Stealth T-Shirt", price: 999, stock: 24, category: "Apparel", status: "in-stock", image: "https://cdn.pixabay.com/photo/2016/11/29/03/42/man-1867121_1280.jpg" },
];

export default function GymStore() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <GymPageLayout
      title="Store Management"
      subtitle="Manage your inventory, pricing, and product visibility."
      actions={
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl flex items-center gap-2">
          <Plus size={20} /> Add Product
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Advanced Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <Input
              placeholder="Search by product name or SKU..."
              className="w-full pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-6 h-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer min-w-[180px]">
              <option className="bg-gray-900">All Categories</option>
              <option className="bg-gray-900">Supplements</option>
              <option className="bg-gray-900">Accessories</option>
              <option className="bg-gray-900">Merchandise</option>
            </select>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn("rounded-lg h-full px-3", viewMode === 'grid' ? "bg-white/10 text-white" : "text-gray-400")}
              >
                <LayoutGrid size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn("rounded-lg h-full px-3", viewMode === 'list' ? "bg-white/10 text-white" : "text-gray-400")}
              >
                <List size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {mockProducts.map(product => (
            <Card key={product.id} className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 group rounded-2xl">
              <div className={cn(
                "flex",
                viewMode === 'grid' ? "flex-col" : "flex-row h-32"
              )}>
                <div className={cn(
                  "relative bg-gray-800",
                  viewMode === 'grid' ? "h-48" : "w-1/4"
                )}>
                  <img
                    src={product.image || "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"}
                    alt={product.name}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                      product.status === 'out-of-stock' && "grayscale opacity-50"
                    )}
                  />
                  {product.status === 'out-of-stock' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500/90 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertCircle size={14} /> OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">{product.category}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      product.stock > 10 ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {product.stock} IN STOCK
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition-colors line-clamp-1">{product.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-black text-white">₹{product.price.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 transition-all h-10 w-10">
                        <Edit size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all h-10 w-10">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State Mock */}
        {mockProducts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-500 max-w-xs">Start adding products to your gym store to begin making sales.</p>
          </div>
        )}
      </div>
    </GymPageLayout>
  );
}
