
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAdminTransactions, downloadSaleReport } from "@/services/adminService";
import { unparse } from "papaparse";

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("newest");
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await getAdminTransactions(page, limit, search, status, sort);
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, limit, search, status, sort]);

    const handleDownloadReport = async () => {
        try {
            const data = await downloadSaleReport();
            const csv = unparse(data);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "sales_report.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download report", error);
        }
    };

    return (
        <AdminLayout>
            <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
                        <p className="text-gray-400">Manage and view all website transactions.</p>
                    </div>
                    <Button
                        onClick={handleDownloadReport}
                        className="bg-[#4B8B9B] hover:bg-[#3A6F7C] text-white flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download Sale Report
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#111827] p-4 rounded-lg border border-[#4B8B9B]/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by Order ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-gray-800 border-gray-700 text-white"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="amount_high">Highest Amount</SelectItem>
                            <SelectItem value="amount_low">Lowest Amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="bg-[#111827] rounded-lg border border-[#4B8B9B]/30 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-700 hover:bg-transparent">
                                <TableHead className="text-gray-400">Order ID</TableHead>
                                <TableHead className="text-gray-400">User</TableHead>
                                <TableHead className="text-gray-400">Trainer</TableHead>
                                <TableHead className="text-gray-400">Total Amount</TableHead>
                                <TableHead className="text-[#4B8B9B]">Profit (10%)</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-white">
                                        Loading transactions...
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                        <TableCell className="text-white font-medium">
                                            {t.razorpayOrderId}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            <div>
                                                <p className="font-medium">{t.userId?.name || "Unknown"}</p>
                                                <p className="text-xs text-gray-500">{t.userId?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {t.trainerId?.name || "Unknown"}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            ₹{t.amount}
                                        </TableCell>
                                        <TableCell className="text-[#4B8B9B] font-bold">
                                            ₹{t.platformFee || 0}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${t.status === "completed"
                                                    ? "bg-green-500/10 text-green-500"
                                                    : t.status === "failed"
                                                        ? "bg-red-500/10 text-red-500"
                                                        : "bg-yellow-500/10 text-yellow-500"
                                                    }`}
                                            >
                                                {t.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4">
                    <p className="text-sm text-gray-400">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-gray-700 text-white hover:bg-gray-800"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="border-gray-700 text-white hover:bg-gray-800"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
