import React, { useState, useEffect } from 'react';
import { FilterSidebar } from '../../components/customer/FilterSidebar';
import { ProductCard } from '../../components/customer/ProductCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Product, Category } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface ShopPageProps {
  initialFilter?: { category?: string; search?: string };
  onNavigate: (view: string, param?: any) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialFilter, onNavigate }) => {
  const { onStockUpdated, onProductUpdated } = useSocket();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilter?.category || 'all'
  );
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState(initialFilter?.search || '');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load categories and brands
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/products/categories'),
          fetch('/api/products/brands'),
        ]);
        if (catRes.ok && brandRes.ok) {
          const catData = await catRes.json();
          const brandData = await brandRes.json();
          setCategories(catData.categories);
          setBrands(brandData.brands);
        }
      } catch (err) {
        console.error('Error fetching categories and brands:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch products based on filters
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedBrand && selectedBrand !== 'all') {
        params.append('brand', selectedBrand);
      }
      if (inStockOnly) {
        params.append('inStockOnly', 'true');
      }
      if (minPrice) {
        params.append('minPrice', minPrice);
      }
      if (maxPrice) {
        params.append('maxPrice', maxPrice);
      }
      if (search) {
        params.append('search', search);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    selectedBrand,
    inStockOnly,
    minPrice,
    maxPrice,
    search,
    sortBy,
  ]);

  // Real-time stock & product updates
  useEffect(() => {
    const unsubscribeStock = onStockUpdated(({ productId, stockQuantity }) => {
      setProducts((prev) =>
        prev.map((prod) =>
          prod._id === productId ? { ...prod, stockQuantity } : prod
        )
      );
    });

    const unsubscribeProduct = onProductUpdated((updatedProd) => {
      if (updatedProd.deleted) {
        setProducts((prev) => prev.filter((p) => p._id !== updatedProd._id));
      } else {
        setProducts((prev) => {
          const exists = prev.some((p) => p._id === updatedProd._id);
          if (exists) {
            return prev.map((p) =>
              p._id === updatedProd._id ? { ...p, ...updatedProd } : p
            );
          }
          return [updatedProd, ...prev];
        });
      }
    });

    return () => {
      unsubscribeStock();
      unsubscribeProduct();
    };
  }, [onStockUpdated, onProductUpdated]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar with Title, Search & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            ProCraft Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hardware, Paints & Tools Marketplace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary-500" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none"
            >
              <option value="newest" className="bg-slate-900">Newest First</option>
              <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
              <option value="name" className="bg-slate-900">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            inStockOnly={inStockOnly}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
            onInStockToggle={setInStockOnly}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Sheet */}
        {mobileFilterOpen && (
          <div className="lg:hidden">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              inStockOnly={inStockOnly}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={setSelectedCategory}
              onBrandChange={setSelectedBrand}
              onInStockToggle={setInStockOnly}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Products Display Area */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{products.length}</strong> items
            </span>
            {(selectedCategory !== 'all' || selectedBrand !== 'all' || search) && (
              <button
                onClick={handleResetFilters}
                className="text-primary-400 hover:underline font-bold"
              >
                Clear all filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader count={6} type="card" />
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No products matched your search</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your category, price range, or clearing filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onSelect={(id) => onNavigate('product-detail', id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
