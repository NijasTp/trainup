// GymStore.jsx
import { Plus, Edit, Search } from 'lucide-react';

const mockProducts = [
  { id: 1, name: "Whey Protein 2kg", price: 3499, stock: 42, category: "Supplements", status: "in-stock" },
  { id: 2, name: "Resistance Bands Set", price: 899, stock: 0, category: "Accessories", status: "out-of-stock" },
  // ... more
];

export default function GymStore() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gym Store Management</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium">
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <select className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Categories</option>
            <option>Supplements</option>
            <option>Accessories</option>
            <option>Merchandise</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                {/* Product image placeholder */}
                {product.status === 'out-of-stock' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-3">₹{product.price.toLocaleString()}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className={product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : "Out of Stock"}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}