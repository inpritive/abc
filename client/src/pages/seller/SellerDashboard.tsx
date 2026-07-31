import React, { useState, useEffect } from 'react';
import { SellerHeader } from '../../components/seller/SellerHeader';
import { SellerSidebar } from '../../components/seller/SellerSidebar';
import { DashboardOverview } from './DashboardOverview';
import { InventoryTab } from './InventoryTab';
import { OrdersTab } from './OrdersTab';
import { ReportsTab } from './ReportsTab';
import { CRMTab } from './CRMTab';
import { ExpensesTab } from './ExpensesTab';

import { ProductFormModal } from '../../components/seller/ProductFormModal';
import { BulkStockModal } from '../../components/seller/BulkStockModal';
import { ExpenseModal } from '../../components/seller/ExpenseModal';
import { OrderDetailModal } from '../../components/seller/OrderDetailModal';

import { Product, Category, Order } from '../../types';
import { useSocket } from '../../context/SocketContext';

interface SellerDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate }) => {
  const { onStockUpdated } = useSocket();

  const [currentTab, setCurrentTab] = useState('overview');
  const [categories, setCategories] = useState<Category[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(
    null
  );

  const [isBulkStockModalOpen, setIsBulkStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] =
    useState<Product | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load categories and initial low stock count
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/products/categories'),
          fetch('/api/products'),
        ]);
        if (catRes.ok && prodRes.ok) {
          const catData = await catRes.json();
          const prodData = await prodRes.json();
          setCategories(catData.categories);

          const lowCount = prodData.products.filter(
            (p: Product) => p.stockQuantity <= p.lowStockThreshold
          ).length;
          setLowStockCount(lowCount);
        }
      } catch (err) {
        console.error('Error loading seller dashboard meta:', err);
      }
    };
    fetchMeta();
  }, []);

  // Update lowStockCount dynamically if stock updates via Socket.IO
  useEffect(() => {
    const unsubscribe = onStockUpdated(() => {
      // Re-fetch low stock count silently
      fetch('/api/products')
        .then((r) => r.json())
        .then((d) => {
          if (d.products) {
            const count = d.products.filter(
              (p: Product) => p.stockQuantity <= p.lowStockThreshold
            ).length;
            setLowStockCount(count);
          }
        })
        .catch(() => {});
    });
    return () => unsubscribe();
  }, [onStockUpdated]);

  const handleOpenProductModal = (product?: Product | null) => {
    setSelectedProductForEdit(product || null);
    setIsProductModalOpen(true);
  };

  const handleOpenBulkStockModal = (product: Product) => {
    setSelectedProductForStock(product);
    setIsBulkStockModalOpen(true);
  };

  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <SellerHeader
        lowStockCount={lowStockCount}
        onNavigate={onNavigate}
        onAlertClick={() => setCurrentTab('inventory')}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <SellerSidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {currentTab === 'overview' && (
            <DashboardOverview
              onNavigateTab={setCurrentTab}
              onOpenProductModal={() => handleOpenProductModal(null)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryTab
              categories={categories}
              onOpenProductModal={handleOpenProductModal}
              onOpenBulkStockModal={handleOpenBulkStockModal}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersTab onOpenOrderDetail={handleOpenOrderDetail} />
          )}

          {currentTab === 'reports' && <ReportsTab />}

          {currentTab === 'crm' && <CRMTab />}

          {currentTab === 'expenses' && (
            <ExpensesTab onOpenExpenseModal={() => setIsExpenseModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProductForEdit}
        categories={categories}
        onSuccess={() => {
          // Trigger re-render or notification
        }}
      />

      <BulkStockModal
        isOpen={isBulkStockModalOpen}
        onClose={() => setIsBulkStockModalOpen(false)}
        product={selectedProductForStock}
        onSuccess={() => {
          // Socket will handle live UI update
        }}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          // Updated Ledger
        }}
      />

      <OrderDetailModal
        isOpen={isOrderDetailModalOpen}
        onClose={() => setIsOrderDetailModalOpen(false)}
        order={selectedOrder}
        onStatusUpdated={() => {
          // Live Socket broadcast
        }}
      />
    </div>
  );
};
