import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface OrdersTabProps {
  onOpenOrderDetail: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ onOpenOrderDetail }) => {
  const { onOrderCreated, onOrderUpdated } = useSocket();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time socket updates for new orders or status changes!
  useEffect(() => {
    const unsubCreated = onOrderCreated((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    const unsubUpdated = onOrderUpdated((updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
      );
    });

    return () => {
      unsubCreated();
      unsubUpdated();
    };
  }, [onOrderCreated, onOrderUpdated]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) return false;
    if (
      search &&
      !o.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      !o.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !o.customerPhone.includes(search)
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40">
            Cancelled
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            Out for Delivery
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary-500/20 text-primary-400 border border-primary-500/40">
            Processing
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Real-Time Fulfillment
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Customer Orders ({orders.length} total)
          </h2>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name or phone..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-primary-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader count={6} type="table" />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Breakdown</th>
                <th className="p-4">Amount / Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <span className="font-extrabold text-white text-sm">
                      #{ord.orderNumber}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-100">{ord.customerName}</p>
                    <span className="text-[11px] text-slate-400">{ord.customerPhone}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-200">
                      {ord.items.length} item{ord.items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="block text-[10px] text-slate-400 line-clamp-1">
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-sm text-white">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        ord.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {ord.paymentMethod} • {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">{getStatusBadge(ord.orderStatus)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onOpenOrderDetail(ord)}
                      className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-primary-600/20 inline-flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
