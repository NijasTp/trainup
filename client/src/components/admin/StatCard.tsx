import React from "react";
import { motion } from "framer-motion";

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
  const getTrendStyles = () => {
    switch (trendType) {
      case "positive": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "negative": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 transition-all"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={100} className="text-primary" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-primary shadow-xl group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-300">
          <Icon size={28} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border ${getTrendStyles()}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase mb-1">{title}</p>
        <h3 className="text-4xl font-black text-white italic tracking-tight group-hover:text-primary transition-colors">{value}</h3>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
