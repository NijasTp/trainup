import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

interface UserGrowthProps {
    data: any[];
    filter: string;
    setFilter: (f: 'day' | 'week' | 'month' | 'year') => void;
}

export default function UserGrowth({ data, filter, setFilter }: UserGrowthProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full flex flex-col transition-all hover:shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Growth</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration statistics</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                    {(['day', 'week', 'month', 'year'] as const).map((f) => (
                        <Button
                            key={f}
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter(f)}
                            className={`rounded-lg px-3 py-1 text-[10px] font-bold transition-all ${filter === f
                                    ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            {f.charAt(0).toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#18181b" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#18181b" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.02)" }}
                            contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="url(#barGradient)"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
