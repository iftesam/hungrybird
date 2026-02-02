import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, DollarSign, Download, ChevronDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

import { useAppContext } from "@/components/providers/AppProvider";



export const HistoryView = () => {
    const [viewMode, setViewMode] = useState("monthly"); // "monthly" | "yearly"
    const [visibleCount, setVisibleCount] = useState(10);
    const { history } = useAppContext();
    const now = new Date();

    // Use TOTAL history for stats to match the list
    const totalSpent = history.reduce((acc, order) => acc + order.total, 0);
    const skippedCount = history.filter(order => order.status === "Skipped").length;
    const deliveredCount = history.filter(order => order.status === "Delivered").length;
    const avgPerMeal = deliveredCount > 0 ? (totalSpent / deliveredCount) : 0;

    // --- YEARLY AGGREGATION ---
    const yearlyData = React.useMemo(() => {
        const data = Array(12).fill(0).map((_, i) => ({
            month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
            spent: 0
        }));

        history.forEach(order => {
            const d = new Date(order.date);
            if (!isNaN(d.getTime()) && d.getFullYear() === now.getFullYear()) {
                data[d.getMonth()].spent += order.total;
            }
        });

        return data;
    }, [history]);

    const maxYearlySpent = Math.max(...yearlyData.map(d => d.spent), 100);
    const totalYearlySpent = yearlyData.reduce((acc, d) => acc + d.spent, 0);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
                    <p className="text-gray-500">Track your nutritional spending and past orders.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode("monthly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            viewMode === "monthly" ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setViewMode("yearly")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            viewMode === "yearly" ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* REMOVED AVG Spending per Day */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg. per Meal</span>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">${avgPerMeal.toFixed(2)}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Meals Skipped</span>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">{skippedCount}</div>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {viewMode === "monthly" ? (
                    <motion.div
                        key="monthly"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
                    >
                        {/* Table Header */}
                        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-12 gap-2 md:gap-4 p-4 bg-gray-50 border-b border-gray-200 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
                            <div className="w-12 md:w-auto md:col-span-2">Date</div>
                            <div className="col-span-1 md:col-span-4 pl-2">Item</div>
                            <div className="col-span-1 md:col-span-2 text-center md:text-left">St</div>
                            <div className="col-span-1 md:col-span-2 text-right">Amt</div>
                            <div className="col-span-1 md:col-span-2 text-center">Rcpt</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-100">
                            {history.slice(0, visibleCount).map((order) => (
                                <div key={order.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] md:grid-cols-12 gap-2 md:gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">

                                    {/* 1. Date */}
                                    <div className="w-12 md:w-auto md:col-span-2 shrink-0">
                                        <div className="font-bold text-gray-900 text-xs md:text-base leading-tight">
                                            {/* Short Date on Mobile */}
                                            <span className="md:hidden">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <span className="hidden md:inline">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                        </div>
                                        <div className="text-[9px] md:text-xs text-gray-400 hidden md:block">{order.time || "-"}</div>
                                    </div>

                                    {/* 2. Restaurant & Item */}
                                    <div className="col-span-1 md:col-span-4 min-w-0 pl-2">
                                        {/* Truncate on mobile */}
                                        <div className="font-bold text-gray-900 text-xs md:text-base truncate">{order.restaurant}</div>
                                        <div className="text-[10px] md:text-xs text-gray-500 truncate">{order.items.join(", ")}</div>
                                    </div>

                                    {/* 3. Status (Icons on mobile) */}
                                    <div className="col-span-1 md:col-span-2 shrink-0 flex justify-center md:justify-start">
                                        <StatusBadge status={order.status} compactMobile />
                                    </div>

                                    {/* 4. Amount */}
                                    <div className="col-span-1 md:col-span-2 text-right font-mono font-bold text-gray-900 text-xs md:text-base whitespace-nowrap">
                                        {order.total > 0 ? `$${order.total.toFixed(2)}` : "—"}
                                    </div>

                                    {/* 5. Receipt (Visible Mobile) */}
                                    <div className="col-span-1 md:col-span-2 flex justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Button */}
                        {visibleCount < history.length && (
                            <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                                <button
                                    onClick={() => {
                                        if (visibleCount === 10) setVisibleCount(20);
                                        else setVisibleCount(history.length);
                                    }}
                                    className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all hover:scale-105 active:scale-95"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                    {visibleCount === 10 ? "View More" : "View All"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="yearly"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">{now.getFullYear()} Spending Overview</h3>
                            <span className="text-sm font-mono text-gray-500">Total: ${totalYearlySpent.toFixed(2)}</span>
                        </div>

                        {/* Dynamic Bar Chart */}
                        <div className="flex items-end justify-between h-64 gap-2">
                            {yearlyData.map((data, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center h-full group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-black text-white text-xs font-bold py-1 px-2 rounded mb-2 transition-opacity pointer-events-none whitespace-nowrap z-10 left-1/2 -translate-x-1/2">
                                        ${data.spent.toFixed(2)}
                                    </div>

                                    {/* Plot Area */}
                                    <div className="flex-1 w-full flex items-end justify-center relative overflow-hidden rounded-t-lg">
                                        <div
                                            className="w-full bg-gray-100 group-hover:bg-gray-200 transition-colors relative"
                                            style={{ height: `${(data.spent / maxYearlySpent) * 100}%` }}
                                        >
                                            <div className="absolute bottom-0 w-full bg-black/80" style={{ height: "100%" }} />
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className="mt-3 text-xs font-bold text-gray-400 uppercase">{data.month}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatusBadge = ({ status, compactMobile }) => {
    if (status === "Delivered") {
        return (
            <>
                {/* Mobile: Simple Tick */}
                <div className={cn("text-emerald-500", compactMobile ? "md:hidden" : "hidden")}>
                    <CheckCircle className="w-5 h-5" />
                </div>
                {/* Desktop: Full Badge */}
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700", compactMobile ? "hidden md:inline-flex" : "inline-flex")}>
                    <CheckCircle className="w-3 h-3" />
                    Delivered
                </span>
            </>
        );
    }
    if (status === "Skipped") {
        return (
            <>
                {/* Mobile: Simple Cross */}
                <div className={cn("text-gray-400", compactMobile ? "md:hidden" : "hidden")}>
                    <XCircle className="w-5 h-5" />
                </div>
                {/* Desktop: Full Badge */}
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500", compactMobile ? "hidden md:inline-flex" : "inline-flex")}>
                    <XCircle className="w-3 h-3" />
                    Skipped
                </span>
            </>
        );
    }
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700", compactMobile ? "text-[10px] px-1.5 py-0.5 md:text-xs md:px-2.5 md:py-1" : "")}>
            <Clock className="w-3 h-3" />
            <span className={cn(compactMobile ? "hidden md:inline" : "inline")}>Pending</span>
            <span className={cn("md:hidden", compactMobile ? "inline" : "hidden")}>...</span>
        </span>
    );
};
