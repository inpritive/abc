import express, { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';
import { emitStockUpdate, emitOrderCreated, emitOrderUpdated } from '../socket/socket';

const router = express.Router();

// POST /api/orders
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
    } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
      return;
    }

    let totalAmount = 0;
    let totalCost = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(400).json({ success: false, message: `Product not found: ${item.productName}` });
        return;
      }
      if (product.stockQuantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
        });
        return;
      }

      // Decrement stock
      product.stockQuantity -= item.quantity;
      await product.save();

      // Emit live Socket.IO stock update to all connected tabs!
      emitStockUpdate(product._id.toString(), product.stockQuantity);

      totalAmount += product.price * item.quantity;
      totalCost += product.costPrice * item.quantity;

      processedItems.push({
        product: product._id,
        productName: product.name,
        price: product.price,
        costPrice: product.costPrice,
        quantity: item.quantity,
        unit: product.unit,
      });
    }

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await Order.create({
      orderNumber,
      user: req.user?._id,
      customerName: customerName || req.user?.name,
      customerEmail: customerEmail || req.user?.email,
      customerPhone: customerPhone || req.user?.phone,
      shippingAddress: shippingAddress || req.user?.address,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
      orderStatus: 'PENDING',
      items: processedItems,
      totalAmount,
      totalCost,
    });

    // Broadcast new order to Seller Dashboard in real-time
    emitOrderCreated(newOrder);

    res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/my-orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders (Seller only)
router.get('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    let filter: any = {};
    if (status && status !== 'ALL') {
      filter.orderStatus = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: String(search), $options: 'i' } },
        { customerName: { $regex: String(search), $options: 'i' } },
        { customerEmail: { $regex: String(search), $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Check permission
    if (req.user?.role !== 'seller' && order.user?.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      return;
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:id/status (Seller only)
router.put('/:id/status', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // Emit real-time order update to customer tracking page and seller dashboard
    emitOrderUpdated(order);

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
