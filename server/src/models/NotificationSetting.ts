import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLogItem {
  timestamp: Date;
  recipient: string;
  channel: 'SMS' | 'WHATSAPP';
  message: string;
  status: 'SENT' | 'FAILED' | 'SIMULATED';
  provider: string;
}

export interface INotificationSetting extends Document {
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
  notificationLog: INotificationLogItem[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogItemSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now },
  recipient: { type: String, required: true },
  channel: { type: String, enum: ['SMS', 'WHATSAPP'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'FAILED', 'SIMULATED'], default: 'SIMULATED' },
  provider: { type: String, default: 'SIMULATED' },
});

const NotificationSettingSchema: Schema = new Schema(
  {
    smsOrderPlaced: { type: Boolean, default: true },
    smsOrderStatusChanged: { type: Boolean, default: true },
    smsNewOrderAdmin: { type: Boolean, default: true },
    smsLowStockAdmin: { type: Boolean, default: true },
    whatsappOrderPlaced: { type: Boolean, default: true },
    whatsappOrderStatusChanged: { type: Boolean, default: true },
    whatsappNewOrderAdmin: { type: Boolean, default: true },
    whatsappLowStockAdmin: { type: Boolean, default: true },
    provider: {
      type: String,
      enum: ['TWILIO', 'GUPSHUP', 'META', 'SIMULATED'],
      default: 'SIMULATED',
    },
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' },
    senderPhone: { type: String, default: '+919876543210' },
    adminPhone: { type: String, default: '+919876543210' },
    notificationLog: { type: [NotificationLogItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotificationSetting>('NotificationSetting', NotificationSettingSchema);
