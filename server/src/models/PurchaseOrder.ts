import mongoose, { Schema, Document } from 'mongoose';

export interface IPOItem {
  product: mongoose.Types.ObjectId | string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: mongoose.Types.ObjectId | string;
  supplierName: string;
  items: IPOItem[];
  totalAmount: number;
  amountPaid: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  receivedAt?: Date;
  billImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const POItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
});

const PurchaseOrderSchema: Schema = new Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, required: true },
    items: [POItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'RECEIVED', 'CANCELLED'],
      default: 'PENDING',
    },
    receivedAt: { type: Date },
    billImage: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
