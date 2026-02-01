import { Badge } from "@/components/ui/badge";

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
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.slice(0, 6).map((tx) => (
                            <tr key={tx._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-gray-800 overflow-hidden">
                                            {tx.userId?.profileImage ? (
                                                <img src={tx.userId.profileImage} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">{tx.userId?.name?.[0]}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {tx.userId?.name || "Unknown User"}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{tx.amount}
                                </td>
                                <td className="py-4">
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full px-3 py-0.5 text-[10px] font-bold border-0 ${tx.status === "completed" || tx.status === "success"
                                                ? "bg-green-500/10 text-green-500"
                                                : tx.status === "pending"
                                                    ? "bg-yellow-500/10 text-yellow-500"
                                                    : "bg-red-500/10 text-red-500"
                                            }`}
                                    >
                                        {tx.status}
                                    </Badge>
                                </td>
                                <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
