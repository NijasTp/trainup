import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trendType) {
      case "positive": return "text-green-500";
      case "negative": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
          <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </div>
        {trend && (
          <span className={`text-xs font-bold ${getTrendColor()}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}