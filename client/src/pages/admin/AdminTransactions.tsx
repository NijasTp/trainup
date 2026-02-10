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
import { Download, Search, ChevronLeft, ChevronRight, Wallet, History, Sparkles, Filter, ArrowUpRight, DollarSign } from "lucide-react";
import { getAdminTransactions, downloadSaleReport } from "@/services/adminService";
import { unparse } from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={120} className="text-primary rotate-12" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <History size={20} />
                            </div>
                            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                                LEDGER OVERVIEW
                            </Badge>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black text-white italic tracking-tight uppercase">
                            FINANCIAL <span className="text-primary">ARCHIVE</span>
                        </h1>
                        <p className="text-zinc-500 font-medium">Monitoring platform-wide capital flow and revenue streams</p>
                    </div>

                    <div className="relative z-10 w-full xl:w-auto">
                        <Button
                            onClick={handleDownloadReport}
                            className="w-full xl:w-auto bg-primary hover:bg-primary/90 text-black font-black italic rounded-2xl h-14 px-10 shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <Download size={20} />
                            EXPORT SALES REPORT
                            <Sparkles size={16} />
                        </Button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
                    <div className="md:col-span-5 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SEARCH BY ORDER ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 pl-12 bg-zinc-900/50 border-white/5 rounded-2xl text-white font-bold italic tracking-wide placeholder:text-zinc-600 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl text-white font-black italic px-6 focus:ring-1 focus:ring-primary/20">
                                <div className="flex items-center gap-3">
                                    <Filter size={16} className="text-primary" />
                                    <SelectValue placeholder="STATUS" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                                <SelectItem value="all" className="font-black italic focus:bg-primary focus:text-black">ALL STATUS</SelectItem>
                                <SelectItem value="completed" className="font-black italic focus:bg-primary focus:text-black text-emerald-500">COMPLETED</SelectItem>
                                <SelectItem value="pending" className="font-black italic focus:bg-primary focus:text-black text-amber-500">PENDING</SelectItem>
                                <SelectItem value="failed" className="font-black italic focus:bg-primary focus:text-black text-red-500">FAILED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-4">
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="h-14 bg-zinc-900/50 border-white/5 rounded-2xl text-white font-black italic px-6 focus:ring-1 focus:ring-primary/20">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={16} className="text-primary" />
                                    <SelectValue placeholder="SORT SEQUENCE" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                                <SelectItem value="newest" className="font-black italic">NEWEST SESSIONS</SelectItem>
                                <SelectItem value="oldest" className="font-black italic">LEGACY SESSIONS</SelectItem>
                                <SelectItem value="amount_high" className="font-black italic">MAXIMUM CAPITAL</SelectItem>
                                <SelectItem value="amount_low" className="font-black italic">MINIMUM CAPITAL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/5 hover:bg-transparent h-20">
                                <TableHead className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase pl-10">ORDER IDENTITY</TableHead>
                                <TableHead className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">PARTICIPANTS</TableHead>
                                <TableHead className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase text-center">CAPITAL</TableHead>
                                <TableHead className="text-[10px] font-black tracking-[0.2em] text-primary uppercase text-center italic">PLATFORM REVENUE</TableHead>
                                <TableHead className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase text-center">STATUS</TableHead>
                                <TableHead className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase text-right pr-10">TIMESTAMP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={7} className="h-96">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase animate-pulse">Synchronizing Ledger...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : transactions.length === 0 ? (
                                    <TableRow className="border-none">
                                        <TableCell colSpan={7} className="h-96 text-center">
                                            <div className="space-y-2 opacity-20">
                                                <History size={60} className="mx-auto text-zinc-500" />
                                                <p className="text-zinc-500 font-black italic uppercase">No Transaction Data Found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((t, idx) => (
                                        <motion.tr
                                            key={t._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group h-24"
                                        >
                                            <TableCell className="pl-10">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black italic tracking-wider group-hover:text-primary transition-colors">#{t.razorpayOrderId.slice(-8).toUpperCase()}</span>
                                                    <span className="text-[8px] text-zinc-600 font-black font-mono tracking-tighter truncate w-32 uppercase">{t.razorpayOrderId}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-black italic text-sm leading-tight uppercase">{t.userId?.name || "ANONYMOUS"}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-zinc-500 font-medium">To:</span>
                                                            <span className="text-[10px] text-zinc-400 font-black italic uppercase tracking-tighter">{t.trainerId?.name || "TRAINER"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="text-white font-black italic text-lg tracking-tighter">₹{t.amount.toLocaleString()}</span>
                                                    <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[8px] font-black h-4">TOTAL</Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center relative">
                                                    <div className="flex items-center gap-1 text-primary font-black italic text-[20px] tracking-tighter scale-110">
                                                        <span>₹{t.platformFee || 0}</span>
                                                        <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    </div>
                                                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">10% COMMISSION</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5">
                                                    <div className={`h-2 w-2 rounded-full animate-pulse ${t.status === "completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                                            t.status === "failed" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                                                                "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                                        }`} />
                                                    <span className={`text-[10px] font-black italic uppercase tracking-widest ${t.status === "completed" ? "text-emerald-500" :
                                                            t.status === "failed" ? "text-red-500" :
                                                                "text-amber-500"
                                                        }`}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right pr-10">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-zinc-500 font-black italic text-[11px] uppercase tracking-tighter">
                                                        {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-700 font-medium">
                                                        {new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 pb-10">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Chronicle Page</span>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <span className="text-primary font-black italic">{page}</span>
                        <span className="text-zinc-700 font-black italic px-1">/</span>
                        <span className="text-white font-black italic">{totalPages}</span>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-white"
                        >
                            <ChevronLeft size={24} />
                        </Button>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-white"
                        >
                            <ChevronRight size={24} />
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
