import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: 'STOCK_PURCHASE' | 'LOGISTICS' | 'UTILITIES' | 'SALARY' | 'OTHER';
  notes: string;
  createdAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['STOCK_PURCHASE', 'LOGISTICS', 'UTILITIES', 'SALARY', 'OTHER'],
      default: 'STOCK_PURCHASE',
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
