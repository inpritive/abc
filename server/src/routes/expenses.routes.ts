import express, { Response } from 'express';
import Expense from '../models/Expense';
import Order from '../models/Order';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/expenses
router.get('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, expenses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/expenses
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, amount, category, notes } = req.body;
    if (!title || !amount) {
      res.status(400).json({ success: false, message: 'Title and amount are required.' });
      return;
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || 'STOCK_PURCHASE',
      notes: notes || '',
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
    const orders = await Order.find({ orderStatus: { $ne: 'CANCELLED' } });
    const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
    const totalCostOfGoods = orders.reduce((sum, ord) => sum + ord.totalCost, 0);

    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const grossProfit = totalRevenue - totalCostOfGoods;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

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
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
