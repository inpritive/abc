import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'SALARY'
  | 'TRANSPORT'
  | 'STOCK_PURCHASE'
  | 'LOGISTICS'
  | 'UTILITIES'
  | 'MISC'
  | 'OTHER';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: ExpenseCategory;
  notes: string;
  expenseDate: Date;
  receiptPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        'RENT',
        'ELECTRICITY',
        'SALARY',
        'TRANSPORT',
        'STOCK_PURCHASE',
        'LOGISTICS',
        'UTILITIES',
        'MISC',
        'OTHER',
      ],
      default: 'OTHER',
    },
    notes: { type: String, default: '' },
    expenseDate: { type: Date, default: Date.now },
    receiptPhoto: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
