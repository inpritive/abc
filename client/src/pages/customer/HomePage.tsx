import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Wrench,
  Palette,
  Hammer,
  Zap,
  Droplets,
  Award,
} from 'lucide-react';
import { ProductCard } from '../../components/customer/ProductCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Product, Category } from '../../types';

interface HomePageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?inStockOnly=true'),
          fetch('/api/products/categories'),
        ]);

        if (prodRes.ok && catRes.ok) {
          const prodData = await prodRes.json();
          const catData = await catRes.json();
          setFeaturedProducts(prodData.products.slice(0, 8));
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'paint':
        return <Palette className="w-6 h-6" />;
      case 'tools':
        return <Hammer className="w-6 h-6" />;
      case 'hardware':
        return <Wrench className="w-6 h-6" />;
      case 'electrical':
        return <Zap className="w-6 h-6" />;
      case 'plumbing':
        return <Droplets className="w-6 h-6" />;
      case 'safety':
        return <ShieldCheck className="w-6 h-6" />;
      default:
        return <Wrench className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl mx-4 sm:mx-8 mt-6">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Synchronized Hardware Store</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Craft. Build. Paint with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-400 to-orange-500">
                Precision.
              </span>
            </h1>

            <p className="text-base text-slate-300 max-w-lg leading-relaxed">
              Explore India’s premium hardware and paint studio. Asian Paints, Bosch drills, Stanley toolkits, and Legrand electricals—all in one place with instant stock tracking.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-sm px-7 py-4 rounded-2xl shadow-xl shadow-primary-600/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop', { category: 'paint' })}
                className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-sm px-6 py-4 rounded-2xl transition-all"
              >
                Paint & Color Studio
              </button>
            </div>

            {/* Trust badges */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 font-semibold border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Brands</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary-400" />
                <span>Express Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>GST Invoicing</span>
              </div>
            </div>
          </div>

          {/* Hero visual composition */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden glass-card border-2 border-slate-700/50 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&q=80"
                alt="Hardware and Tools Showcase"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase font-bold text-primary-400 tracking-widest">
                  Featured Equipment
                </span>
                <h3 className="text-xl font-bold text-white">
                  Stanley 65-Piece Mechanical Tool Kit
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  High-strength chrome vanadium steel sockets and ratchets for every project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
              Department Store
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SkeletonLoader count={6} type="card" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => onNavigate('shop', { category: cat.slug })}
                className="group glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-primary-500/50 cursor-pointer transition-all flex flex-col items-center text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                  {getCategoryIcon(cat.slug)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-primary-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-900 via-amber-900 to-slate-900 border border-primary-500/30 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
              Contractor & Builder Discount
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Flat 15% OFF on Bulk Asian Paints Emulsion
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Equip your job site with Royale Luxury and WeatherCoat exterior paint. Free color consultation included!
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop', { category: 'paint' })}
            className="shrink-0 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-all"
          >
            Claim Offer Now
          </button>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
              Handpicked Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Featured Products & Tools
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            See Full Catalog ({featuredProducts.length}+ items){' '}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <SkeletonLoader count={4} type="card" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={(id) => onNavigate('product-detail', id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
