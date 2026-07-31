import React, { useState } from 'react';
import { ShoppingCart, Check, AlertTriangle, XCircle, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const getStockBadge = () => {
    if (product.stockQuantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (product.stockQuantity <= product.lowStockThreshold) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3" /> Only {product.stockQuantity} left!
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <Check className="w-3 h-3" /> In Stock ({product.stockQuantity})
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(product._id)}
      className="group glass-card rounded-2xl overflow-hidden border border-slate-800/80 hover:border-primary-500/40 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Box */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 z-10">{getStockBadge()}</div>

        {/* Brand pill */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-wider border border-slate-800">
          {product.brand}
        </div>

        {/* Quick View overlay button */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product._id);
            }}
            className="bg-white/90 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xl hover:bg-white transition-colors"
          >
            <Eye className="w-4 h-4" /> Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">
            {product.category}
          </span>
          <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mt-0.5 group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Price / {product.unit}</span>
            <div className="text-lg font-extrabold text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white scale-95'
                : product.stockQuantity === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/30 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {product.stockQuantity === 0 ? 'Sold Out' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
