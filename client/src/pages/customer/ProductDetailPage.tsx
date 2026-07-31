import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Check,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Award,
  Plus,
  Minus,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (view: string, param?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { onStockUpdated } = useSocket();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (productId) fetchDetail();
  }, [productId]);

  // Real-time stock updates
  useEffect(() => {
    if (!product) return;
    const unsubscribe = onStockUpdated(({ productId: id, stockQuantity }) => {
      if (id === product._id) {
        setProduct((prev) => (prev ? { ...prev, stockQuantity } : null));
        if (quantity > stockQuantity && stockQuantity > 0) {
          setQuantity(stockQuantity);
        }
      }
    });
    return () => unsubscribe();
  }, [product, quantity, onStockUpdated]);

  const handleAddToCart = () => {
    if (!product || product.stockQuantity <= 0) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const getStockBadge = () => {
    if (!product) return null;
    if (product.stockQuantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
          <XCircle className="w-4 h-4" /> Currently Out of Stock
        </span>
      );
    }
    if (product.stockQuantity <= product.lowStockThreshold) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <AlertTriangle className="w-4 h-4" /> Low Stock Warning: Only {product.stockQuantity} remaining!
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        <Check className="w-4 h-4" /> In Stock — {product.stockQuantity} available
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SkeletonLoader count={1} type="card" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm"
        >
          Back to Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => onNavigate('shop')}
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image Gallery */}
        <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-800/80 bg-slate-900 aspect-square flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">{getStockBadge()}</div>
        </div>

        {/* Product Info & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-2">
              Brand: <span className="text-white uppercase">{product.brand}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Retail Selling Price</span>
              <div className="text-3xl font-extrabold text-white">
                ₹{product.price.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-400">/ {product.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">GST Status</span>
              <span className="block text-xs font-bold text-emerald-400">18% GST Included</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Application
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description ||
                'Premium quality hardware/paint item formulated and tested for industrial, residential, and architectural excellence.'}
            </p>
          </div>

          {/* Quantity Selector + Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center border border-slate-700 bg-slate-900 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stockQuantity === 0}
                  className="px-3.5 py-3 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2 font-bold text-sm text-white min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                  }
                  disabled={quantity >= product.stockQuantity || product.stockQuantity === 0}
                  className="px-3.5 py-3 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`flex-1 py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : product.stockQuantity === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white shadow-primary-600/30 active:scale-95'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart!
                  </>
                ) : product.stockQuantity === 0 ? (
                  'Sold Out'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Add to Cart — ₹
                    {(product.price * quantity).toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Truck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-slate-200">Express Delivery</span>
              <span className="text-[10px] text-slate-400">Within 24-48 hours</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-slate-200">Brand Warranty</span>
              <span className="text-[10px] text-slate-400">100% Genuine</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-slate-200">Contractor Ready</span>
              <span className="text-[10px] text-slate-400">Bulk rates available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
