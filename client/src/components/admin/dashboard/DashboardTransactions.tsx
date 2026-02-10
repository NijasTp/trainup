import { DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Transaction {
    _id: string;
    userId: { name: string; profileImage?: string };
    amount: number;
    status: string;
    createdAt: string;
}

interface DashboardTransactionsProps {
    transactions: Transaction[];
}

export default function DashboardTransactions({ transactions }: DashboardTransactionsProps) {
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
                return <CheckCircle2 size={12} className="text-emerald-500" />;
            case 'pending':
                return <Clock size={12} className="text-amber-500" />;
            default:
                return <XCircle size={12} className="text-red-500" />;
        }
    };

    return (
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all hover:border-white/20 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <DollarSign size={160} />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-2xl font-black text-white italic tracking-tight">RECENT ACTIVITY</h3>
                <button className="text-[10px] font-black tracking-[0.2em] text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group/btn uppercase">
                    VIEW ALL TRANSACTIONS
                    <div className="h-0.5 w-4 bg-zinc-800 group-hover/btn:w-8 group-hover/btn:bg-primary transition-all" />
                </button>
            </div>

            <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            <th className="px-6 py-4 rounded-l-2xl">Client</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 rounded-r-2xl">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.slice(0, 6).map((tx, idx) => (
                            <motion.tr
                                key={tx._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group/row hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/row:border-primary/30 transition-colors">
                                            {tx.userId?.profileImage ? (
                                                <img src={tx.userId.profileImage} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-black text-zinc-500">{tx.userId?.name?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                                                {tx.userId?.name || "ANONYMOUS"}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-black text-primary italic">
                                        ₹{tx.amount.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black tracking-widest uppercase ${tx.status === "completed" || tx.status === "success"
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : tx.status === "pending"
                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                        {getStatusIcon(tx.status)}
                                        {tx.status}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs text-zinc-500 font-bold">
                                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

