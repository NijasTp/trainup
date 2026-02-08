import { injectable } from 'inversify';
import { IWalletRepository } from '../core/interfaces/repositories/IWalletRepository';
import { WalletModel, IWallet } from '../models/wallet.model';

@injectable()
export class WalletRepository implements IWalletRepository {
    async findByUserId(userId: string): Promise<IWallet | null> {
        return await WalletModel.findOne({ userId });
    }

    async createWallet(userId: string): Promise<IWallet> {
        const wallet = new WalletModel({ userId, balance: 0, transactions: [] });
        return await wallet.save();
    }

    async addTransaction(
        userId: string,
        amount: number,
        type: 'credit' | 'debit',
        description: string,
        referenceId?: string
    ): Promise<IWallet> {
        let wallet = await this.findByUserId(userId);
        if (!wallet) {
            wallet = await this.createWallet(userId);
        }

        const newBalance = type === 'credit' ? wallet.balance + amount : wallet.balance - amount;

        wallet.balance = newBalance;
        wallet.transactions.push({
            amount,
            type,
            description,
            transactionDate: new Date(),
            referenceId,
        });

        return await wallet.save();
    }

    async getBalance(userId: string): Promise<number> {
        const wallet = await this.findByUserId(userId);
        return wallet ? wallet.balance : 0;
    }
}
