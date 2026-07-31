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
  couponCode?: string;
  discountAmount?: number;
  isOfflineBill?: boolean;
  createdAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category:
    | 'RENT'
    | 'ELECTRICITY'
    | 'SALARY'
    | 'TRANSPORT'
    | 'STOCK_PURCHASE'
    | 'LOGISTICS'
    | 'UTILITIES'
    | 'MISC'
    | 'OTHER';
  notes: string;
  expenseDate?: string;
  receiptPhoto?: string;
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

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  usageLimitTotal: number;
  usageLimitPerCustomer: number;
  usedCount: number;
  applicableCategories: string[];
  isActive: boolean;
}

export interface Supplier {
  _id: string;
  name: string;
  phone: string;
  address: string;
  itemsSupplied: string[];
  outstandingBalance: number;
}

export interface POItem {
  product: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplier: string;
  supplierName: string;
  items: POItem[];
  totalAmount: number;
  amountPaid: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  receivedAt?: string;
  billImage?: string;
  createdAt: string;
}

export interface NotificationLogItem {
  timestamp: string;
  recipient: string;
  channel: 'SMS' | 'WHATSAPP';
  message: string;
  status: 'SENT' | 'FAILED' | 'SIMULATED';
  provider: string;
}

export interface NotificationSetting {
  _id: string;
  smsOrderPlaced: boolean;
  smsOrderStatusChanged: boolean;
  smsNewOrderAdmin: boolean;
  smsLowStockAdmin: boolean;
  whatsappOrderPlaced: boolean;
  whatsappOrderStatusChanged: boolean;
  whatsappNewOrderAdmin: boolean;
  whatsappLowStockAdmin: boolean;
  provider: 'TWILIO' | 'GUPSHUP' | 'META' | 'SIMULATED';
  apiKey: string;
  apiSecret: string;
  senderPhone: string;
  adminPhone: string;
  notificationLog: NotificationLogItem[];
}

