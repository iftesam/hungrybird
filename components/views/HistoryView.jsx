"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    TrendingUp,
    DollarSign,
    Download,
    ChevronDown,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    ArrowUpRight,
    Receipt,
    DownloadCloud,
    FileText,
    Sparkles,
    TrendingDown,
    Activity
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

import { useAppContext } from "@/components/providers/AppProvider";

const StatusBadge = ({ status }) => {
    const configs = {
        Delivered: {
            bg: "bg-emerald-50 text-emerald-700",
            icon: CheckCircle,
            label: "Delivered",
            tonal: "bg-emerald-100"
        },
        Skipped: {
            bg: "bg-zinc-100 text-zinc-500",
            icon: XCircle,
            label: "Skipped",
            tonal: "bg-zinc-200/50"
        },
        Pending: {
            bg: "bg-amber-50 text-amber-700",
            icon: Clock,
            label: "Processing",
            tonal: "bg-amber-100"
        }
    };

    const config = configs[status] || configs.Pending;
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors",
            config.bg
        )}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

export const HistoryView = () => {
    const [viewMode, setViewMode] = useState("monthly"); // "monthly" | "yearly"
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [visibleCount, setVisibleCount] = useState(15);
    const { history } = useAppContext();
    const now = new Date();

    // Stats calculations
    const stats = useMemo(() => {
        const delivered = history.filter(o => o.status === "Delivered");
        const totalSpent = delivered.reduce((acc, o) => acc + o.total, 0);
        const skippedCount = history.filter(o => o.status === "Skipped").length;
        const avgMeal = delivered.length > 0 ? (totalSpent / delivered.length) : 0;

        return { totalSpent, skippedCount, avgMeal, deliveredCount: delivered.length };
    }, [history]);

    // Filtering logic
    const filteredHistory = useMemo(() => {
        return history.filter(order => {
            const matchesSearch =
                order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = filterStatus === "All" || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [history, searchQuery, filterStatus]);

    // Grouping logic for the list
    const groupedHistory = useMemo(() => {
        const groups = {};
        filteredHistory.slice(0, visibleCount).forEach(order => {
            const d = new Date(order.date);
            const monthYear = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) groups[monthYear] = [];
            groups[monthYear].push(order);
        });
        return groups;
    }, [filteredHistory, visibleCount]);

    // Yearly Data Aggregation
    const yearlyData = useMemo(() => {
        const data = Array(12).fill(0).map((_, i) => ({
            month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
            spent: 0
        }));

        history.forEach(order => {
            const d = new Date(order.date);
            if (!isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && order.status === "Delivered") {
                data[d.getMonth()].spent += order.total;
            }
        });

        return data;
    }, [history]);

    const maxYearlySpent = Math.max(...yearlyData.map(d => d.spent), 100);
    const totalYearlySpent = yearlyData.reduce((acc, d) => acc + d.spent, 0);

    return (
        <div className="space-y-8 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600/60">Insights</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">Order History</h1>
                    <p className="text-gray-500 font-medium mt-1">A detailed record of your nutritional investments.</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                    {["monthly", "yearly"].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all z-10",
                                viewMode === mode ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {viewMode === mode && (
                                <motion.div
                                    layoutId="mode-bg"
                                    className="absolute inset-0 bg-white shadow-sm rounded-xl border border-gray-200"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-20 capitalize">{mode}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Layer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: "Total Invested",
                        value: `$${stats.totalSpent.toLocaleString()}`,
                        icon: DollarSign,
                        color: "text-blue-600",
                        bg: "bg-blue-500/5",
                        accent: "bg-blue-50",
                        desc: "Lifetime Spending"
                    },
                    {
                        label: "Avg per Meal",
                        value: `$${stats.avgMeal.toFixed(2)}`,
                        icon: TrendingUp,
                        color: "text-emerald-600",
                        bg: "bg-emerald-500/5",
                        accent: "bg-emerald-50",
                        desc: "Selection Efficiency"
                    },
                    {
                        label: "Meals Skipped",
                        value: stats.skippedCount,
                        icon: XCircle,
                        color: "text-amber-600",
                        bg: "bg-amber-500/5",
                        accent: "bg-amber-50",
                        desc: "Schedule Flexibility"
                    }
                ].map((card, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={card.label}
                        className="glass-card p-8 rounded-[2.5rem] relative group overflow-hidden border-white/40 shadow-xl shadow-black/5"
                    >
                        {/* Google Accent Background */}
                        <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none", card.bg)} />

                        <div className="relative z-10">
                            <div className={cn("inline-flex p-3 rounded-2xl mb-6 shadow-sm border border-white", card.accent)}>
                                <card.icon className={cn("w-6 h-6", card.color)} />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{card.value}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
                            <p className="text-[10px] text-gray-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase">{card.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* View Content */}
            <AnimatePresence mode="wait">
                {viewMode === "monthly" ? (
                    <motion.div
                        key="monthly-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 group w-full">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                                <input
                                    type="text"
                                    placeholder="Search restaurants, items, or cuisines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm self-stretch md:self-auto overflow-x-auto scrollbar-hide">
                                {["All", "Delivered", "Skipped"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                                            filterStatus === status
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grouped History List */}
                        <div className="space-y-12">
                            {Object.keys(groupedHistory).length > 0 ? (
                                Object.entries(groupedHistory).map(([month, orders], groupIdx) => (
                                    <div key={month} className="space-y-4">
                                        <div className="flex items-center gap-4 px-2">
                                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">{month}</h2>
                                            <div className="h-px flex-1 bg-gray-100" />
                                        </div>

                                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                                            <div className="divide-y divide-gray-50">
                                                {orders.map((order, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        key={order.id}
                                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:p-8 items-center hover:bg-zinc-50/80 transition-all group"
                                                    >
                                                        {/* Date & Time */}
                                                        <div className="md:col-span-2">
                                                            <div className="text-lg font-black text-gray-900 leading-none mb-1">
                                                                {new Date(order.date).toLocaleDateString('en-US', { day: '2-digit' })}
                                                                <span className="text-gray-300 ml-1 font-bold">{new Date(order.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                            </div>
                                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{order.time || "Scheduled"}</div>
                                                        </div>

                                                        {/* Item Details */}
                                                        <div className="md:col-span-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform shrink-0">
                                                                    <FileText className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors uppercase text-sm tracking-wide">{order.restaurant}</h4>
                                                                    <p className="text-xs text-gray-400 font-medium truncate">{order.items.join(", ")}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="md:col-span-2">
                                                            <StatusBadge status={order.status} />
                                                        </div>

                                                        {/* Amount */}
                                                        <div className="md:col-span-2 text-right">
                                                            <div className="text-lg font-black text-gray-900">
                                                                {order.total > 0 ? `$${order.total.toFixed(2)}` : "—"}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inc. Tax</div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="md:col-span-1 flex justify-end">
                                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white hover:scale-110 transition-all shadow-sm">
                                                                <DownloadCloud className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                    <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No matches found</h3>
                                    <p className="text-gray-400 max-w-xs mx-auto mt-2 text-sm">We couldn't find any orders matching your search criteria. Try a different query.</p>
                                    <button
                                        onClick={() => { setSearchQuery(""); setFilterStatus("All"); }}
                                        className="mt-6 text-sm font-bold text-blue-600 hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredHistory.length > visibleCount && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => setVisibleCount(p => p + 15)}
                                    className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-black uppercase tracking-widest text-gray-600 shadow-lg shadow-black/5 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Load More History
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="yearly-view"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-14 shadow-2xl shadow-black/5 relative overflow-hidden group"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-bl-[200px] -mr-12 -mt-12 transition-transform group-hover:scale-110 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{now.getFullYear()} Growth & Spending</h3>
                                    <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mt-1">Total Year to Date: <span className="text-blue-600">${totalYearlySpent.toLocaleString()}</span></p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="flex items-end justify-between h-80 gap-3">
                                {yearlyData.map((data, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center h-full group/bar relative">
                                        <div className="flex-1 w-full flex items-end justify-center relative rounded-t-2xl overflow-hidden bg-gray-50/50">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(data.spent / maxYearlySpent) * 100}%` }}
                                                transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                                                className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 group-hover/bar:brightness-110 transition-all relative rounded-t-lg"
                                            >
                                                {/* Tooltip on bar */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xl">
                                                    ${data.spent.toLocaleString()}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <div className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{data.month}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
