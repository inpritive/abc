import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  User as UserIcon,
  ShieldCheck,
  Package,
  Wrench,
  LogOut,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, demoLogin, logout } = useAuth();
  const { itemCount, isCartBouncing } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onNavigate('shop', { search: searchQuery });
  };

  const handleSelectSuggestion = (prod: Product) => {
    setShowDropdown(false);
    setSearchQuery('');
    onNavigate('product-detail', prod._id);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner for instant role testing */}
      <div className="bg-gradient-to-r from-primary-600 via-amber-600 to-orange-600 px-4 py-1.5 text-xs font-semibold text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
          <span>PRO DEMO MODE: Test Real-Time Stock Updates Across Customer & Seller Tabs!</span>
        </div>
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <button
                onClick={() => demoLogin('customer')}
                className="bg-black/20 hover:bg-black/40 px-2.5 py-0.5 rounded transition-all underline"
              >
                1-Click Demo Customer
              </button>
              <button
                onClick={() => demoLogin('seller')}
                className="bg-black/20 hover:bg-black/40 px-2.5 py-0.5 rounded transition-all underline"
              >
                1-Click Demo Admin (Seller)
              </button>
            </>
          )}
          {user && user.role === 'seller' && (
            <button
              onClick={() => onNavigate('seller-dashboard')}
              className="bg-black/30 hover:bg-black/50 px-2.5 py-0.5 rounded font-bold flex items-center gap-1.5 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Go to Seller ERP Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
              ProCraft<span className="text-primary-500">.</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Hardware & Paint Studio
            </span>
          </div>
        </div>

        {/* Live Search Bar with Instant Autocomplete */}
        <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search paints, drills, plumbing valves, switches..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                Instant Product Suggestions
              </div>
              {suggestions.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => handleSelectSuggestion(prod)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-800/80 cursor-pointer transition-colors border-b border-slate-800/50 last:border-0"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {prod.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-primary-400 font-bold">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span>•</span>
                      <span>{prod.brand}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prod.stockQuantity > prod.lowStockThreshold
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : prod.stockQuantity > 0
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {prod.stockQuantity > 0 ? `${prod.stockQuantity} in stock` : 'Out of Stock'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm font-semibold transition-colors ${
              currentView === 'home' ? 'text-primary-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className={`text-sm font-semibold transition-colors ${
              currentView === 'shop' ? 'text-primary-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            Catalog
          </button>
          {user && (
            <button
              onClick={() => onNavigate('my-orders')}
              className={`text-sm font-semibold transition-colors ${
                currentView === 'my-orders'
                  ? 'text-primary-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              My Orders
            </button>
          )}

          {/* Cart Icon Button with Animated Badge */}
          <button
            onClick={() => onNavigate('cart')}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all text-slate-200"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md shadow-primary-500/50 ${
                  isCartBouncing ? 'animate-bounce-short' : ''
                }`}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth Menu */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-bold text-slate-200 leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] text-primary-400 uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => demoLogin('customer')}
                className="bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-primary-600/30 transition-all"
              >
                Demo Login
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
