import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWalletTransaction {
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    transactionDate: Date;
    referenceId?: string; // e.g. membershipId or userPlanId
}

export interface IWallet extends Document {
    userId: Types.ObjectId | string;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}

const walletSchema: Schema<IWallet> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        balance: { type: Number, default: 0 },
        transactions: [
            {
                amount: { type: Number, required: true },
                type: { type: String, enum: ['credit', 'debit'], required: true },
                description: { type: String, required: true },
                transactionDate: { type: Date, default: Date.now },
                referenceId: { type: String },
            },
        ],
    },
    { timestamps: true }
);

export const WalletModel = mongoose.model<IWallet>('Wallet', walletSchema);
