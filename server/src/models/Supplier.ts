import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  phone: string;
  address: string;
  itemsSupplied: string[];
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    itemsSupplied: { type: [String], default: [] },
    outstandingBalance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
