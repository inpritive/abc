import express, { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/coupons (Seller only)
router.get('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coupons (Seller only)
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      startDate,
      endDate,
      minOrderValue,
      usageLimitTotal,
      usageLimitPerCustomer,
      applicableCategories,
    } = req.body;

    if (!code || discountValue === undefined || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Code, discountValue, and endDate are required.',
      });
      return;
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Coupon code already exists.' });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType: discountType || 'FIXED',
      discountValue: Number(discountValue),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      minOrderValue: Number(minOrderValue || 0),
      usageLimitTotal: Number(usageLimitTotal || 100),
      usageLimitPerCustomer: Number(usageLimitPerCustomer || 1),
      applicableCategories: applicableCategories || ['all'],
      isActive: true,
    });

    res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/coupons/validate (Public / Customer Checkout)
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal, category } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
      return;
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
      return;
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      res.status(400).json({ success: false, message: 'This coupon code has expired or is not yet valid.' });
      return;
    }

    if (coupon.usedCount >= coupon.usageLimitTotal) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit.' });
      return;
    }

    if (orderTotal && Number(orderTotal) < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`,
      });
      return;
    }

    // Check category restrictions
    if (
      coupon.applicableCategories &&
      !coupon.applicableCategories.includes('all') &&
      category &&
      !coupon.applicableCategories.includes(category)
    ) {
      res.status(400).json({
        success: false,
        message: `This coupon is not valid for ${category} items.`,
      });
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (Number(orderTotal || 0) * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Never exceed the order total
    if (discountAmount > Number(orderTotal || 0)) {
      discountAmount = Number(orderTotal || 0);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount: Math.round(discountAmount),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/coupons/:id (Seller only)
router.delete('/:id', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
