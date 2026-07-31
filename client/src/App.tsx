import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider, useSocket } from './context/SocketContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { LoginPage } from './pages/customer/LoginPage';
import { SellerDashboard } from './pages/seller/SellerDashboard';

import { RefreshCw, X, Bell } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { onStockUpdated, onOrderCreated } = useSocket();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<any>(null);

  // Global live notification toast state
  const [liveNotification, setLiveNotification] = useState<{
    title: string;
    message: string;
    type: 'stock' | 'order';
  } | null>(null);

  const handleNavigate = (view: string, param?: any) => {
    setCurrentView(view);
    setViewParam(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real-time stock & order banner notification
  useEffect(() => {
    const unsubStock = onStockUpdated(({ stockQuantity }) => {
      setLiveNotification({
        title: 'Real-Time Inventory Alert',
        message: `Product stock level was instantly updated to ${stockQuantity} units via Socket.IO!`,
        type: 'stock',
      });
      setTimeout(() => setLiveNotification(null), 4500);
    });

    const unsubOrder = onOrderCreated((order) => {
      if (user?.role === 'seller') {
        setLiveNotification({
          title: 'New Customer Order Received!',
          message: `Order #${order.orderNumber} placed for ₹${order.totalAmount.toLocaleString(
            'en-IN'
          )}!`,
          type: 'order',
        });
        setTimeout(() => setLiveNotification(null), 6000);
      }
    });

    return () => {
      unsubStock();
      unsubOrder();
    };
  }, [onStockUpdated, onOrderCreated, user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Live Notification Toast */}
      {liveNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full glass-card bg-slate-900/95 border border-primary-500/50 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-slide-up">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              liveNotification.type === 'order'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-primary-500/20 text-primary-400'
            }`}
          >
            <Bell className="w-5 h-5 animate-bounce-short" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white">
                {liveNotification.title}
              </h4>
              <button
                onClick={() => setLiveNotification(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {liveNotification.message}
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-bold text-primary-400 uppercase tracking-widest">
              Live Socket.IO Sync
            </span>
          </div>
        </div>
      )}

      {/* Render Customer Navbar unless in Seller Dashboard view */}
      {currentView !== 'seller-dashboard' && (
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
      )}

      {/* Main screen area */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentView === 'shop' && (
          <ShopPage initialFilter={viewParam} onNavigate={handleNavigate} />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage productId={viewParam} onNavigate={handleNavigate} />
        )}

        {currentView === 'cart' && <CartPage onNavigate={handleNavigate} />}

        {currentView === 'my-orders' && (
          <OrderHistoryPage
            newOrder={viewParam?.newOrder || null}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'profile' && <ProfilePage onNavigate={handleNavigate} />}

        {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}

        {currentView === 'seller-dashboard' && (
          <SellerDashboard onNavigate={handleNavigate} />
        )}
      </main>

      {/* Render Customer Footer unless in Seller Dashboard view */}
      {currentView !== 'seller-dashboard' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
