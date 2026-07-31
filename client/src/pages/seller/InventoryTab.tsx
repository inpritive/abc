import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface InventoryTabProps {
  categories: Category[];
  onOpenProductModal: (product?: Product | null) => void;
  onOpenBulkStockModal: (product: Product) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  categories,
  onOpenProductModal,
  onOpenBulkStockModal,
}) => {
  const { onStockUpdated, onProductUpdated } = useSocket();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/products?sortBy=name', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Real-time updates
  useEffect(() => {
    const unsubStock = onStockUpdated(({ productId, stockQuantity }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, stockQuantity } : p
        )
      );
    });

    const unsubProd = onProductUpdated((updated) => {
      if (updated.deleted) {
        setProducts((prev) => prev.filter((p) => p._id !== updated._id));
      } else {
        setProducts((prev) => {
          const exists = prev.some((p) => p._id === updated._id);
          if (exists) {
            return prev.map((p) =>
              p._id === updated._id ? { ...p, ...updated } : p
            );
          }
          return [updated, ...prev];
        });
      }
    });

    return () => {
      unsubStock();
      unsubProd();
    };
  }, [onStockUpdated, onProductUpdated]);

  const handleDelete = async (prod: Product) => {
    if (!window.confirm(`Are you sure you want to remove "${prod.name}" from inventory?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/products/${prod._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== prod._id));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.category !== selectedCat) return false;
    if (lowStockOnly && p.stockQuantity > p.lowStockThreshold) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.brand.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top filter & Search row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Real-Time Stock Master
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Hardware & Paint Inventory ({products.length} total)
          </h2>
        </div>

        <button
          onClick={() => onOpenProductModal(null)}
          className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or brand..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-primary-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-amber-500 bg-slate-900 border-slate-700"
            />
            <span>Low Stock Alerts Only</span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <SkeletonLoader count={6} type="table" />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Item & Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Cost / Selling (₹)</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Stock Valuation</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map((prod) => {
                const isLow = prod.stockQuantity <= prod.lowStockThreshold;
                const isOut = prod.stockQuantity === 0;

                return (
                  <tr
                    key={prod._id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-100">{prod.name}</p>
                          <span className="text-[10px] uppercase font-bold text-primary-400">
                            {prod.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 uppercase font-semibold text-slate-300">
                      {prod.category}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-100">
                        ₹{prod.price.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-500">/ {prod.unit}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Cost: ₹{prod.costPrice.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          {prod.stockQuantity} {prod.unit}
                        </span>
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 text-red-400">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400">
                            Low
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400">
                            Healthy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      ₹{(prod.price * prod.stockQuantity).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenBulkStockModal(prod)}
                          className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                          title="Quick restock / adjust quantity"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Stock</span>
                        </button>
                        <button
                          onClick={() => onOpenProductModal(prod)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                          title="Edit product details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-900/40 text-slate-400 hover:text-red-400"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
