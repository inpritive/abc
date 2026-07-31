import express, { Response } from 'express';
import Supplier from '../models/Supplier';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/suppliers
router.get('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json({ success: true, count: suppliers.length, suppliers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/suppliers
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, address, itemsSupplied } = req.body;
    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Supplier name and phone are required.' });
      return;
    }

    const supplier = await Supplier.create({
      name,
      phone,
      address: address || '',
      itemsSupplied: itemsSupplied || [],
      outstandingBalance: 0,
    });

    res.status(201).json({ success: true, supplier });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/suppliers/:id/pay
router.post('/:id/pay', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
      return;
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found.' });
      return;
    }

    supplier.outstandingBalance = Math.max(0, supplier.outstandingBalance - Number(amount));
    await supplier.save();

    res.json({ success: true, supplier, message: `Payment of ₹${amount} recorded successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Supplier removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
