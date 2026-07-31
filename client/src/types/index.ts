export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'seller';
  address: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  unit: 'piece' | 'liter' | 'kg' | 'meter' | 'box';
  image: string;
  description: string;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  createdAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: 'STOCK_PURCHASE' | 'LOGISTICS' | 'UTILITIES' | 'SALARY' | 'OTHER';
  notes: string;
  createdAt: string;
}

export interface DashboardData {
  todaySales: number;
  todayOrdersCount: number;
  totalRevenue: number;
  totalCostOfGoods: number;
  totalExpenses: number;
  netProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: Product[];
  categorySales: { category: string; revenue: number }[];
  salesTrend: { date: string; revenue: number; orders: number }[];
  topSellingItems: { name: string; quantity: number; revenue: number }[];
}

export interface StockReportItem {
  _id: string;
  name: string;
  category: string;
  brand: string;
  stockQuantity: number;
  unit: string;
  costPrice: number;
  price: number;
  stockValue: number;
  retailValue: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface CRMCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  lastOrder: string;
  joinedAt: string;
}
