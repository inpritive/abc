import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string; // slug or name
  brand: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  unit: 'piece' | 'liter' | 'kg' | 'meter' | 'box';
  image: string;
  description: string;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    unit: {
      type: String,
      enum: ['piece', 'liter', 'kg', 'meter', 'box'],
      default: 'piece',
    },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
