import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Order } from '../../types';
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface OrderHistoryPageProps {
  newOrder?: Order | null;
  onNavigate: (view: string, param?: any) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({
  newOrder,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { onOrderUpdated } = useSocket();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightOrder, setHighlightOrder] = useState<string | null>(
    newOrder?._id || null
  );

  useEffect(() => {
    const fetchMyOrders = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('procraft_token');
        const res = await fetch('/api/orders/my-orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchMyOrders();
    else setIsLoading(false);
  }, [user]);

  // Real-time order status update from Seller Dashboard
  useEffect(() => {
    const unsubscribe = onOrderUpdated((updatedOrder) => {
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === updatedOrder._id ? { ...ord, ...updatedOrder } : ord
        )
      );
    });
    return () => unsubscribe();
  }, [onOrderUpdated]);

  const getStatusStep = (status: string) => {
    if (status === 'PENDING') return 1;
    if (status === 'PROCESSING') return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    if (status === 'DELIVERED') return 4;
    return 0; // CANCELLED
  };

  const renderTrackerBar = (status: string) => {
    if (status === 'CANCELLED') {
      return (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs font-bold">
          <XCircle className="w-4 h-4" /> This order was cancelled.
        </div>
      );
    }

    const currentStep = getStatusStep(status);
    const steps = [
      { id: 1, label: 'Order Placed', icon: Clock },
      { id: 2, label: 'Processing', icon: Package },
      { id: 3, label: 'Out for Delivery', icon: Truck },
      { id: 4, label: 'Delivered', icon: CheckCircle },
    ];

    return (
      <div className="pt-2">
        <div className="flex items-center justify-between relative">
          {/* Progress bar line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-800 -z-0" />
          <div
            className="absolute top-4 left-6 h-1 bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-700 -z-0"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
            }}
          />

          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id <= currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCurrent
                      ? 'bg-primary-600 border-white text-white shadow-lg shadow-primary-500/50 scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1.5 ${
                    isCurrent
                      ? 'text-primary-400 font-extrabold'
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Please Sign In to View Orders</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm"
        >
          Sign In / Demo Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Real-Time Tracking Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Order History & Status
          </h1>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-primary-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Browse More Hardware
        </button>
      </div>

      {/* New Order Alert Box */}
      {highlightOrder && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-500/40 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-slate-300">
                Your stock reservation is live. As our shop admin processes your order, your status tracker below updates in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setHighlightOrder(null)}
            className="text-xs font-bold text-emerald-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader count={3} type="table" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-500 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your hardware and paint purchases will appear here with live fulfillment tracking.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`glass-card p-6 rounded-2xl border transition-all space-y-6 ${
                highlightOrder === order._id
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Order Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">
                    Order Ref
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    #{order.orderNumber}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-primary-500/20 text-primary-400 border border-primary-500/40 animate-pulse'
                    }`}
                  >
                    Status: {order.orderStatus.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Payment: <strong className="text-white">{order.paymentMethod}</strong> (
                    <strong
                      className={
                        order.paymentStatus === 'PAID'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      {order.paymentStatus}
                    </strong>
                    )
                  </span>
                </div>
              </div>

              {/* Step-by-Step Tracker Bar */}
              {renderTrackerBar(order.orderStatus)}

              {/* Ordered Items Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Items in this Order ({order.items.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-100">{item.productName}</p>
                        <span className="text-slate-400 text-[11px]">
                          {item.quantity} {item.unit} × ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="font-extrabold text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer with Total & Address */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="text-slate-400 max-w-sm">
                  <strong className="text-slate-200">Shipping to:</strong>{' '}
                  {order.shippingAddress}
                </div>

                <div className="text-right">
                  <span className="text-slate-400">Total Paid / Payable</span>
                  <div className="text-xl font-extrabold text-primary-400">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
