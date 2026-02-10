import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

interface PlatformEarningsProps {
    data: any[];
    filter: string;
    setFilter: (f: 'day' | 'week' | 'month' | 'year') => void;
}

export default function PlatformEarnings({ data, filter, setFilter }: PlatformEarningsProps) {
    return (
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all hover:border-white/20 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <DollarSign size={160} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight">PLATFORM EARNINGS</h3>
                    <p className="text-gray-500 font-medium">Monthly revenue performance overview</p>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                    {(['day', 'week', 'month', 'year'] as const).map((f) => (
                        <Button
                            key={f}
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter(f)}
                            className={`rounded-xl px-4 h-9 text-[10px] font-black tracking-widest transition-all ${filter === f
                                ? "bg-primary text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                                }`}
                        >
                            {f.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-[350px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FBFF3D" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#FBFF3D" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                        <XAxis
                            dataKey="date"
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                            fontFamily="inherit"
                        />
                        <YAxis
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                            fontFamily="inherit"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#09090b",
                                borderRadius: "1.5rem",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                                padding: "1rem"
                            }}
                            itemStyle={{ color: "#FBFF3D", fontSize: "12px", fontWeight: "bold" }}
                            labelStyle={{ color: "#71717a", fontSize: "10px", fontWeight: "black", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#FBFF3D"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

