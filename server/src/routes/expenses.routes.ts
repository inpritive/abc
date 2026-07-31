import express, { Response } from 'express';
import Expense from '../models/Expense';
import Order from '../models/Order';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';

const router = express.Router();

const getDateFilter = (range?: string, start?: string, end?: string): { $gte?: Date; $lte?: Date } | null => {
  if (!range || range === 'all') return null;

  const now = new Date();
  let gte = new Date();
  let lte = new Date();

  if (range === 'today') {
    gte.setHours(0, 0, 0, 0);
    lte.setHours(23, 59, 59, 999);
  } else if (range === 'week') {
    const day = now.getDay() || 7; // Get current day number, make Sunday (0) -> 7
    gte.setDate(now.getDate() - day + 1);
    gte.setHours(0, 0, 0, 0);
    lte.setHours(23, 59, 59, 999);
  } else if (range === 'month') {
    gte.setDate(1);
    gte.setHours(0, 0, 0, 0);
    lte.setHours(23, 59, 59, 999);
  } else if (range === 'custom' && start && end) {
    gte = new Date(start);
    lte = new Date(end);
    lte.setHours(23, 59, 59, 999);
  } else {
    return null;
  }

  return { $gte: gte, $lte: lte };
};

// GET /api/expenses
router.get('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { range, startDate, endDate } = req.query;
    const filter: any = {};

    const dateQuery = getDateFilter(String(range || 'all'), String(startDate || ''), String(endDate || ''));
    if (dateQuery) {
      filter.expenseDate = dateQuery;
    }

    const expenses = await Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 });
    res.json({ success: true, count: expenses.length, expenses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/expenses
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, amount, category, notes, expenseDate, receiptPhoto } = req.body;
    if (!title || !amount) {
      res.status(400).json({ success: false, message: 'Title and amount are required.' });
      return;
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || 'OTHER',
      notes: notes || '',
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      receiptPhoto: receiptPhoto || '',
    });

    res.status(201).json({ success: true, expense });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/expenses/profit-summary
router.get('/profit-summary', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { range, startDate, endDate } = req.query;
    const orderFilter: any = { orderStatus: { $ne: 'CANCELLED' } };
    const expFilter: any = {};

    const dateQuery = getDateFilter(String(range || 'all'), String(startDate || ''), String(endDate || ''));
    if (dateQuery) {
      orderFilter.createdAt = dateQuery;
      expFilter.expenseDate = dateQuery;
    }

    const orders = await Order.find(orderFilter);
    const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
    const totalCostOfGoods = orders.reduce((sum, ord) => sum + ord.totalCost, 0);

    const expenses = await Expense.find(expFilter);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const grossProfit = totalRevenue - totalCostOfGoods;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    // Build trend chart data for Recharts (Sales vs Expenses vs Net Profit over last 7 or 30 days)
    const daysCount = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 14;
    const trendMap: { [key: string]: { date: string; revenue: number; expenses: number; profit: number } } = {};

    const today = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[dateStr] = { date: label, revenue: 0, expenses: 0, profit: 0 };
    }

    orders.forEach((ord) => {
      const dateStr = new Date(ord.createdAt).toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].revenue += ord.totalAmount;
        trendMap[dateStr].profit += ord.totalAmount - ord.totalCost;
      }
    });

    expenses.forEach((exp) => {
      const dateStr = new Date(exp.expenseDate || exp.createdAt).toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].expenses += exp.amount;
        trendMap[dateStr].profit -= exp.amount;
      }
    });

    const trendData = Object.values(trendMap);

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalCostOfGoods,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin: Number(profitMargin),
      },
      trendData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/expenses/export
router.get('/export', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { range, startDate, endDate } = req.query;
    const orderFilter: any = { orderStatus: { $ne: 'CANCELLED' } };
    const expFilter: any = {};

    const dateQuery = getDateFilter(String(range || 'all'), String(startDate || ''), String(endDate || ''));
    if (dateQuery) {
      orderFilter.createdAt = dateQuery;
      expFilter.expenseDate = dateQuery;
    }

    const orders = await Order.find(orderFilter).sort({ createdAt: -1 });
    const expenses = await Expense.find(expFilter).sort({ expenseDate: -1 });

    const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
    const totalCOGS = orders.reduce((sum, ord) => sum + ord.totalCost, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - (totalCOGS + totalExpenses);

    // Build CSV Content
    let csv = `PROCRAFT HARDWARE & PAINT STUDIO - PROFIT & EXPENSE REPORT\r\n`;
    csv += `Generated On: ${new Date().toLocaleString()}\r\n`;
    csv += `Date Range: ${String(range || 'All Time').toUpperCase()}\r\n\r\n`;

    csv += `SUMMARY METRICS\r\n`;
    csv += `Total Sales Revenue,Rs.${totalRevenue}\r\n`;
    csv += `Cost of Goods Sold (COGS),Rs.${totalCOGS}\r\n`;
    csv += `Logged Shop Expenses,Rs.${totalExpenses}\r\n`;
    csv += `NET PROFIT,Rs.${netProfit}\r\n\r\n`;

    csv += `ITEMIZED EXPENSES\r\n`;
    csv += `Date,Title,Category,Amount (Rs.),Notes\r\n`;
    expenses.forEach((exp) => {
      const dateStr = new Date(exp.expenseDate || exp.createdAt).toLocaleDateString();
      const titleClean = exp.title.replace(/,/g, ' ');
      const notesClean = (exp.notes || '').replace(/,/g, ' ');
      csv += `${dateStr},${titleClean},${exp.category},${exp.amount},${notesClean}\r\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=procraft_profit_report_${range || 'all'}.csv`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
