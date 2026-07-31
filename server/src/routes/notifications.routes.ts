import express, { Response } from 'express';
import NotificationSetting from '../models/NotificationSetting';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/notifications/settings (Seller only)
router.get('/settings', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await NotificationSetting.findOne();
    if (!settings) {
      settings = await NotificationSetting.create({
        smsOrderPlaced: true,
        smsOrderStatusChanged: true,
        smsNewOrderAdmin: true,
        smsLowStockAdmin: true,
        whatsappOrderPlaced: true,
        whatsappOrderStatusChanged: true,
        whatsappNewOrderAdmin: true,
        whatsappLowStockAdmin: true,
        provider: 'SIMULATED',
        senderPhone: '+91 98765 43210',
        adminPhone: '+91 98765 43210',
      });
    }
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/settings (Seller only)
router.put('/settings', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await NotificationSetting.findOne();
    if (!settings) {
      settings = new NotificationSetting();
    }

    const {
      smsOrderPlaced,
      smsOrderStatusChanged,
      smsNewOrderAdmin,
      smsLowStockAdmin,
      whatsappOrderPlaced,
      whatsappOrderStatusChanged,
      whatsappNewOrderAdmin,
      whatsappLowStockAdmin,
      provider,
      apiKey,
      apiSecret,
      senderPhone,
      adminPhone,
    } = req.body;

    if (smsOrderPlaced !== undefined) settings.smsOrderPlaced = Boolean(smsOrderPlaced);
    if (smsOrderStatusChanged !== undefined) settings.smsOrderStatusChanged = Boolean(smsOrderStatusChanged);
    if (smsNewOrderAdmin !== undefined) settings.smsNewOrderAdmin = Boolean(smsNewOrderAdmin);
    if (smsLowStockAdmin !== undefined) settings.smsLowStockAdmin = Boolean(smsLowStockAdmin);

    if (whatsappOrderPlaced !== undefined) settings.whatsappOrderPlaced = Boolean(whatsappOrderPlaced);
    if (whatsappOrderStatusChanged !== undefined) settings.whatsappOrderStatusChanged = Boolean(whatsappOrderStatusChanged);
    if (whatsappNewOrderAdmin !== undefined) settings.whatsappNewOrderAdmin = Boolean(whatsappNewOrderAdmin);
    if (whatsappLowStockAdmin !== undefined) settings.whatsappLowStockAdmin = Boolean(whatsappLowStockAdmin);

    if (provider !== undefined) settings.provider = provider;
    if (apiKey !== undefined) settings.apiKey = apiKey;
    if (apiSecret !== undefined) settings.apiSecret = apiSecret;
    if (senderPhone !== undefined) settings.senderPhone = senderPhone;
    if (adminPhone !== undefined) settings.adminPhone = adminPhone;

    await settings.save();

    res.json({ success: true, settings, message: 'Notification settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/log (Seller only)
router.get('/log', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await NotificationSetting.findOne();
    const log = settings ? settings.notificationLog : [];
    res.json({ success: true, count: log.length, log });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
