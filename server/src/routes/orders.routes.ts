import express, { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';
import { emitStockUpdate, emitOrderCreated, emitOrderUpdated } from '../socket/socket';
import {
  notifyCustomerOrderPlaced,
  notifyCustomerOrderStatus,
  notifyAdminNewOrder,
  notifyAdminLowStock,
} from '../services/notification.service';

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
      couponCode,
      discountAmount,
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

      // Check low stock threshold alert
      if (product.stockQuantity <= product.lowStockThreshold) {
        notifyAdminLowStock(product).catch(() => {});
      }

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

    // Apply discount amount if valid
    const finalDiscount = Number(discountAmount || 0);
    const finalTotalAmount = Math.max(0, totalAmount - finalDiscount);

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: String(couponCode).toUpperCase().trim() },
        { $inc: { usedCount: 1 } }
      );
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
      totalAmount: finalTotalAmount,
      totalCost,
      couponCode: couponCode || '',
      discountAmount: finalDiscount,
      isOfflineBill: false,
    });

    // Broadcast new order to Seller Dashboard in real-time
    emitOrderCreated(newOrder);

    // Trigger customer & admin notifications
    notifyCustomerOrderPlaced(newOrder).catch(() => {});
    notifyAdminNewOrder(newOrder).catch(() => {});

    res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders/offline-sync (Seller only - Sync Offline Walk-in Bills)
router.post('/offline-sync', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bills } = req.body;
    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      res.status(400).json({ success: false, message: 'No offline bills provided to sync.' });
      return;
    }

    const createdOrders = [];

    for (const bill of bills) {
      let totalAmount = 0;
      let totalCost = 0;
      const processedItems = [];

      for (const item of bill.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          await product.save();
          emitStockUpdate(product._id.toString(), product.stockQuantity);

          if (product.stockQuantity <= product.lowStockThreshold) {
            notifyAdminLowStock(product).catch(() => {});
          }

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
      }

      const orderNumber = bill.orderNumber || `POS-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = await Order.create({
        orderNumber,
        user: req.user?._id,
        customerName: bill.customerName || 'Walk-in Customer',
        customerEmail: bill.customerEmail || 'walkin@procraft.shop',
        customerPhone: bill.customerPhone || '0000000000',
        shippingAddress: bill.shippingAddress || 'Counter Sale - Offline POS',
        paymentMethod: bill.paymentMethod || 'COD',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        items: processedItems,
        totalAmount: bill.totalAmount || totalAmount,
        totalCost,
        couponCode: bill.couponCode || '',
        discountAmount: bill.discountAmount || 0,
        isOfflineBill: true,
        createdAt: bill.createdAt ? new Date(bill.createdAt) : new Date(),
      });

      emitOrderCreated(newOrder);
      createdOrders.push(newOrder);
    }

    res.json({
      success: true,
      count: createdOrders.length,
      orders: createdOrders,
      message: `Successfully synced ${createdOrders.length} offline bill(s) to inventory & sales ledger.`,
    });
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

    // Trigger status update SMS/WhatsApp alert
    notifyCustomerOrderStatus(order).catch(() => {});

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
