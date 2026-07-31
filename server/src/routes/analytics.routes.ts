import express, { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Expense from '../models/Expense';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Today's orders & sales
    const todayOrders = await Order.find({
      createdAt: { $gte: todayStart },
      orderStatus: { $ne: 'CANCELLED' },
    });
    const todaySales = todayOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
    const todayOrdersCount = todayOrders.length;

    // Total revenue & total cost
    const allCompletedOrders = await Order.find({
      orderStatus: { $ne: 'CANCELLED' },
    });
    const totalRevenue = allCompletedOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
    const totalCostOfGoods = allCompletedOrders.reduce((sum, ord) => sum + ord.totalCost, 0);

    // Total expenses
    const allExpenses = await Expense.find();
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - totalCostOfGoods - totalExpenses;

    // Low stock items
    const allProducts = await Product.find({ isActive: true });
    const lowStockItems = allProducts.filter((p) => p.stockQuantity <= p.lowStockThreshold);
    const outOfStockCount = allProducts.filter((p) => p.stockQuantity === 0).length;

    // Category breakdown for chart
    const categoryMap: Record<string, number> = {};
    for (const order of allCompletedOrders) {
      for (const item of order.items) {
        const prod = allProducts.find((p) => p._id.toString() === item.product.toString());
        const catName = prod ? prod.category : 'General';
        categoryMap[catName] = (categoryMap[catName] || 0) + item.price * item.quantity;
      }
    }
    const categorySales = Object.entries(categoryMap).map(([category, revenue]) => ({
      category,
      revenue,
    }));

    // 7-day sales trend
    const last7Days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({ date: dateStr, revenue: 0, orders: 0 });
    }

    for (const order of allCompletedOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const dayEntry = last7Days.find((d) => d.date === dateStr);
      if (dayEntry) {
        dayEntry.revenue += order.totalAmount;
        dayEntry.orders += 1;
      }
    }

    // Top selling items
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of allCompletedOrders) {
      for (const item of order.items) {
        if (!productSalesMap[item.productName]) {
          productSalesMap[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productName].quantity += item.quantity;
        productSalesMap[item.productName].revenue += item.price * item.quantity;
      }
    }
    const topSellingItems = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        todaySales,
        todayOrdersCount,
        totalRevenue,
        totalCostOfGoods,
        totalExpenses,
        netProfit,
        lowStockCount: lowStockItems.length,
        outOfStockCount,
        lowStockItems: lowStockItems.slice(0, 5),
        categorySales,
        salesTrend: last7Days,
        topSellingItems,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/stock-report
router.get('/stock-report', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true }).sort({ stockQuantity: 1 });
    let totalStockValue = 0;
    let totalRetailValue = 0;

    const stockItems = products.map((p) => {
      const value = p.stockQuantity * p.costPrice;
      const retailValue = p.stockQuantity * p.price;
      totalStockValue += value;
      totalRetailValue += retailValue;
      return {
        _id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        stockQuantity: p.stockQuantity,
        unit: p.unit,
        costPrice: p.costPrice,
        price: p.price,
        stockValue: value,
        retailValue,
        status:
          p.stockQuantity === 0
            ? 'OUT_OF_STOCK'
            : p.stockQuantity <= p.lowStockThreshold
            ? 'LOW_STOCK'
            : 'IN_STOCK',
      };
    });

    res.json({
      success: true,
      report: {
        totalItems: products.length,
        totalStockValue,
        totalRetailValue,
        potentialProfit: totalRetailValue - totalStockValue,
        items: stockItems,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/customers (CRM view)
router.get('/customers', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    const orders = await Order.find({ orderStatus: { $ne: 'CANCELLED' } });

    const crmData = users.map((u) => {
      const customerOrders = orders.filter((ord) => ord.user?.toString() === u._id.toString());
      const totalSpend = customerOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
      const lastOrder = customerOrders[0]?.createdAt || u.createdAt;

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address,
        totalOrders: customerOrders.length,
        totalSpend,
        lastOrder,
        joinedAt: u.createdAt,
      };
    });

    res.json({ success: true, customers: crmData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
