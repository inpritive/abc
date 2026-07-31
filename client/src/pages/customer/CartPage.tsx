import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from '../../components/customer/CheckoutModal';
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    shipping,
    total,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleOrderSuccess = (order: any) => {
    setIsCheckoutOpen(false);
    onNavigate('my-orders', { newOrder: order });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Your Shopping Cart is Empty
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Discover premium paints, professional drills, electrical switches, and plumbing fittings in our catalog.
          </p>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-primary-600/30 transition-all inline-flex items-center gap-2"
        >
          <span>Browse Full Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Review Your Order
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product._id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-900 shrink-0 cursor-pointer"
                  onClick={() => onNavigate('product-detail', product._id)}
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary-400">
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => onNavigate('product-detail', product._id)}
                    className="text-sm font-bold text-slate-100 hover:text-primary-400 cursor-pointer transition-colors"
                  >
                    {product.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    ₹{product.price.toLocaleString('en-IN')} / {product.unit}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                {/* Quantity Control */}
                <div className="flex items-center border border-slate-700 bg-slate-900 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(product._id, quantity - 1)}
                    className="px-2.5 py-1.5 hover:bg-slate-800 text-slate-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1 font-bold text-xs text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product._id, quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                    className="px-2.5 py-1.5 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[5rem]">
                  <span className="text-sm font-extrabold text-white">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(product._id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>

        {/* Price Breakdown Sidebar */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-white">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (18%)</span>
              <span className="font-bold text-white">
                ₹{tax.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Delivery</span>
              <span className="font-bold text-white">
                {shipping === 0 ? (
                  <span className="text-emerald-400 font-extrabold">FREE</span>
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-[10px] text-primary-400 font-semibold">
                Add ₹{(2001 - subtotal).toLocaleString('en-IN')} more for FREE express shipping!
              </p>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold text-white">
              <span>Total Amount</span>
              <span className="text-primary-400 text-lg">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-500 shrink-0" />
              <span>Cash on Delivery & Instant Cards Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Genuine Hardware with GST Invoice</span>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
};
