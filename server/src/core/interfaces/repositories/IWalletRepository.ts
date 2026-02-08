import { IWallet } from '../../../models/wallet.model';

export interface IWalletRepository {
    findByUserId(userId: string): Promise<IWallet | null>;
    createWallet(userId: string): Promise<IWallet>;
    addTransaction(userId: string, amount: number, type: 'credit' | 'debit', description: string, referenceId?: string): Promise<IWallet>;
    getBalance(userId: string): Promise<number>;
}
