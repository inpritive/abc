import React from 'react';
import { Filter, RefreshCw, Check } from 'lucide-react';
import { Category } from '../../types';

interface FilterSidebarProps {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  inStockOnly: boolean;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (slug: string) => void;
  onBrandChange: (brand: string) => void;
  onInStockToggle: (checked: boolean) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  inStockOnly,
  minPrice,
  maxPrice,
  onCategoryChange,
  onBrandChange,
  onInStockToggle,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6 glass-card p-5 rounded-2xl border border-slate-800/80 self-start">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Filter className="w-4 h-4 text-primary-500" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
              selectedCategory === 'all'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Selector */}
      {brands.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-2 pt-3 border-t border-slate-800">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
          <span className="text-slate-500 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-3 border-t border-slate-800">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
            In-Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockToggle(e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 bg-slate-900 border-slate-700 focus:ring-primary-500 focus:ring-offset-slate-900"
          />
        </label>
      </div>
    </aside>
  );
};
