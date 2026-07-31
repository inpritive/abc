import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId | string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: 'COD' | 'ONLINE' | 'CASH' | 'UPI' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  items: IOrderItem[];
  totalAmount: number;
  totalCost: number;
  couponCode?: string;
  discountAmount?: number;
  isOfflineBill?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'piece' },
});

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE', 'CASH', 'UPI', 'CARD'],
      default: 'COD',
    },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    isOfflineBill: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
