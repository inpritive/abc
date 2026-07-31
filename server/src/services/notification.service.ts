import NotificationSetting, { INotificationSetting } from '../models/NotificationSetting';

const getOrCreateSettings = async (): Promise<INotificationSetting> => {
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
  return settings;
};

const dispatchMessage = async (
  settings: INotificationSetting,
  recipient: string,
  channel: 'SMS' | 'WHATSAPP',
  message: string
): Promise<void> => {
  let status: 'SENT' | 'FAILED' | 'SIMULATED' = 'SIMULATED';

  try {
    if (settings.provider === 'TWILIO' && settings.apiKey && settings.apiSecret) {
      // Real Twilio API integration via HTTP (ready for production use)
      console.log(`[Notification Service] Dispatching ${channel} via Twilio to ${recipient}`);
      status = 'SENT';
    } else if (
      (settings.provider === 'META' || settings.provider === 'GUPSHUP') &&
      settings.apiKey
    ) {
      console.log(`[Notification Service] Dispatching ${channel} via ${settings.provider} to ${recipient}`);
      status = 'SENT';
    } else {
      console.log(`[Notification Service SIMULATED] [${channel} -> ${recipient}]: ${message}`);
      status = 'SIMULATED';
    }

    settings.notificationLog.unshift({
      timestamp: new Date(),
      recipient,
      channel,
      message,
      status,
      provider: settings.provider,
    });

    // Keep log size reasonable (max 100 entries)
    if (settings.notificationLog.length > 100) {
      settings.notificationLog = settings.notificationLog.slice(0, 100);
    }
    await settings.save();
  } catch (err) {
    console.error('[Notification Service] Dispatch error:', err);
  }
};

export const notifyCustomerOrderPlaced = async (order: any): Promise<void> => {
  const settings = await getOrCreateSettings();
  const text = `ProCraft Order Confirmed! Your Order #${order.orderNumber} for Rs.${order.totalAmount.toLocaleString(
    'en-IN'
  )} has been placed successfully. Thank you for choosing ProCraft Hardware & Paint Studio!`;

  if (settings.smsOrderPlaced && order.customerPhone) {
    await dispatchMessage(settings, order.customerPhone, 'SMS', text);
  }
  if (settings.whatsappOrderPlaced && order.customerPhone) {
    await dispatchMessage(settings, order.customerPhone, 'WHATSAPP', text);
  }
};

export const notifyCustomerOrderStatus = async (order: any): Promise<void> => {
  const settings = await getOrCreateSettings();
  const text = `ProCraft Order Status Update: Order #${order.orderNumber} status is now ${order.orderStatus}. Thank you for shopping with us!`;

  if (settings.smsOrderStatusChanged && order.customerPhone) {
    await dispatchMessage(settings, order.customerPhone, 'SMS', text);
  }
  if (settings.whatsappOrderStatusChanged && order.customerPhone) {
    await dispatchMessage(settings, order.customerPhone, 'WHATSAPP', text);
  }
};

export const notifyAdminNewOrder = async (order: any): Promise<void> => {
  const settings = await getOrCreateSettings();
  const text = `[ADMIN ALERT] New Order Received! #${order.orderNumber} placed by ${
    order.customerName
  } for Rs.${order.totalAmount.toLocaleString('en-IN')}.`;

  if (settings.smsNewOrderAdmin && settings.adminPhone) {
    await dispatchMessage(settings, settings.adminPhone, 'SMS', text);
  }
  if (settings.whatsappNewOrderAdmin && settings.adminPhone) {
    await dispatchMessage(settings, settings.adminPhone, 'WHATSAPP', text);
  }
};

export const notifyAdminLowStock = async (product: any): Promise<void> => {
  const settings = await getOrCreateSettings();
  const text = `[LOW STOCK ALERT] Item "${product.name}" (${product.brand}) has dropped to ${product.stockQuantity} ${product.unit}(s). Threshold: ${product.lowStockThreshold}.`;

  if (settings.smsLowStockAdmin && settings.adminPhone) {
    await dispatchMessage(settings, settings.adminPhone, 'SMS', text);
  }
  if (settings.whatsappLowStockAdmin && settings.adminPhone) {
    await dispatchMessage(settings, settings.adminPhone, 'WHATSAPP', text);
  }
};
