import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  minOrderValue: number;
  usageLimitTotal: number;
  usageLimitPerCustomer: number;
  usedCount: number;
  applicableCategories: string[]; // e.g. ['all'] or ['paint', 'tools']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' },
    discountValue: { type: Number, required: true, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    minOrderValue: { type: Number, default: 0 },
    usageLimitTotal: { type: Number, default: 100 },
    usageLimitPerCustomer: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    applicableCategories: { type: [String], default: ['all'] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
