import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Car, Zap, TrendingUp, ShieldCheck,
    Navigation, ArrowRight, Map, CheckCircle2, XCircle, Info
} from "lucide-react";

// --- CONFIGURATION DATA ---
const MODES = {
    green: {
        id: "green",
        label: "Mode A: The Milkman",
        badge: "High Density Cluster",
        color: "emerald",
        icon: Users,
        description: "10+ orders within 500 meters.",
        logistics: "Proximity Batching (500 meters)",
        pricing: "FREE Delivery",
        driverAction: "Per Loop: $25",
        math: {
            revenue: 4.50, // Commission ($4.50) + Fee ($0.00)
            foodCost: 10.50,
            driverCost: 1.67, // $25.00 / 15 orders
            profit: 2.83,     // $4.50 - $1.67
            customerFee: 0.00,
            batchProfit: 42.45 // 15 * 2.83
        },
        comparison: {
            competitorCost: 90.00, // 15 orders * $6.00 mkt avg
            ourCost: 25.00,        // 1 Driver * $25/hr
            savings: 65.00
        }
    },
    yellow: {
        id: "yellow",
        label: "Mode B: The Shuttle",
        badge: "Medium Density",
        color: "amber",
        icon: Car,
        description: "Small batches (4-9 orders).",
        logistics: "Multi-Stop Batch",
        pricing: "$1.99 Fee",
        driverAction: "Per Loop: $25",
        math: {
            revenue: 6.49, // Commission ($4.50) + Fee ($1.99)
            foodCost: 10.50,
            driverCost: 5.00, // $25.00 / 5 orders
            profit: 1.49,     // $6.49 - $5.00
            customerFee: 1.99,
            batchProfit: 7.45 // 5 * 1.49
        },
        comparison: {
            competitorCost: 30.00, // 5 orders * $6.00
            ourCost: 25.00,
            savings: 5.00
        }
    },
    red: {
        id: "red",
        label: "Mode C: The Courier",
        badge: "Low Density",
        color: "rose",
        icon: Zap,
        description: "Direct point-to-point. We charge the true cost of logistics.",
        logistics: "Dedicated Courier",
        pricing: "$7.99 Fee",
        driverAction: "Single Order Dispatch",

        // THE MATH: Why we survive and they bleed
        math: {
            revenue: 22.99, // $15 Food + $7.99 Fee
            foodCost: 10.50, // Restaurant takes 70%
            driverCost: 12.50, // Real cost of 30-min solo delivery
            profit: 0.00,     // BREAKEVEN. (We don't lose money).
            customerFee: 7.99,
            batchProfit: 0.00
        },

        // THE COMPARISON GRAPH
        comparison: {
            competitorLabel: "DoorDash (Standard Fee)",
            // They charge $2.99 fee + $4.50 comm = $7.49 Rev. 
            // Cost is $12.50. They lose $5.01.
            competitorProfit: -5.01,

            ourLabel: "HungryBird (True Cost Fee)",
            // We charge $7.99 fee + $4.50 comm = $12.49 Rev.
            // Cost is $12.50. We break even.
            ourProfit: 0.00,

            // The story text for the graph
            story: "Competitors lose $5/order here. We break even."
        }
    }
};

const NumberTicker = ({ value, prefix = "", color = "text-gray-900" }) => {
    return (
        <motion.span
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-mono font-bold tracking-tight ${color}`}
        >
            {prefix}{value.toFixed(2)}
        </motion.span>
    );
};

export const LogisticsEngineView = () => {
    const [activeMode, setActiveMode] = useState("green");
    const mode = MODES[activeMode];

    const themeColor = {
        bg: activeMode === 'green' ? 'bg-emerald-50' : activeMode === 'yellow' ? 'bg-amber-50' : 'bg-rose-50',
        text: activeMode === 'green' ? 'text-emerald-600' : activeMode === 'yellow' ? 'text-amber-600' : 'text-rose-600',
        border: activeMode === 'green' ? 'border-emerald-200' : activeMode === 'yellow' ? 'border-amber-200' : 'border-rose-200',
        ring: activeMode === 'green' ? 'ring-emerald-500' : activeMode === 'yellow' ? 'ring-amber-500' : 'ring-rose-500',
        fill: activeMode === 'green' ? 'bg-emerald-500' : activeMode === 'yellow' ? 'bg-amber-500' : 'bg-rose-500',
        stroke: activeMode === 'green' ? '#10b981' : activeMode === 'yellow' ? '#d97706' : '#be123c',
    };

    return (
        <div className="pb-12 md:pb-24 max-w-6xl mx-auto space-y-8 md:space-y-16">

            {/* --- HEADER --- */}
            <div className="space-y-6 pt-6 md:pt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                            Hybrid Logistics <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-900">Engine.</span>
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed">
                            By locking orders <span className="text-gray-900 font-bold">60 minutes early</span>, we eliminate randomness.
                            Everyone within 500 meters ordering from the <span className="text-gray-900 font-bold">same/nearby restaurant</span> is batched together.
                        </p>
                    </div>

                    {/* Key Metric Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full md:w-auto min-w-[240px]">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Net Profit / Order</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-gray-900">
                                <NumberTicker value={mode.math.profit} prefix="$" color={mode.math.profit > 3 ? "text-emerald-600" : "text-gray-900"} />
                            </span>
                            <span className="text-sm font-medium text-gray-400">avg</span>
                        </div>
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {activeMode === 'green' ? 'High Margin' : activeMode === 'yellow' ? 'Good Margin' : 'Breakeven'}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- THE SIMULATOR --- */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch h-auto lg:min-h-[700px]">

                {/* LEFT: CONTROLS */}
                {/* LEFT: CONTROLS - RE-DESIGNED STATE OF THE ART */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        {Object.values(MODES).map((m) => {
                            const isActive = activeMode === m.id;

                            // Dynamic Styles based on state
                            const activeGradient = m.id === 'green' ? 'from-emerald-500/10 to-emerald-500/5' :
                                m.id === 'yellow' ? 'from-amber-500/10 to-amber-500/5' :
                                    'from-rose-500/10 to-rose-500/5';

                            const activeBorder = m.id === 'green' ? 'border-emerald-500' :
                                m.id === 'yellow' ? 'border-amber-500' :
                                    'border-rose-500';

                            const iconColor = m.id === 'green' ? 'text-emerald-600 bg-emerald-100' :
                                m.id === 'yellow' ? 'text-amber-600 bg-amber-100' :
                                    'text-rose-600 bg-rose-100';

                            return (
                                <motion.button
                                    key={m.id}
                                    onClick={() => setActiveMode(m.id)}
                                    layout
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative p-5 rounded-3xl border-2 text-left transition-all duration-300 overflow-hidden ${isActive
                                        ? `bg-white ${activeBorder} shadow-xl ring-4 ring-opacity-20 ${m.id === 'green' ? 'ring-emerald-500' : m.id === 'yellow' ? 'ring-amber-500' : 'ring-rose-500'
                                        }`
                                        : "bg-white/60 border-gray-100 hover:border-gray-200 hover:bg-white"
                                        }`}
                                >
                                    {/* Active Gradient Background */}
                                    {isActive && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${activeGradient} opacity-100`} />
                                    )}

                                    <div className="relative z-10">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${isActive ? iconColor : 'bg-gray-100 text-gray-400'}`}>
                                                    <m.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className={`text-base font-bold leading-none ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {m.label}
                                                    </h3>
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${m.id === 'green' ? 'text-emerald-600' :
                                                                m.id === 'yellow' ? 'text-amber-600' :
                                                                    'text-rose-600'
                                                                }`}
                                                        >
                                                            {m.badge}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Selection Radio Circle */}
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isActive
                                                ? `${activeBorder} bg-white`
                                                : "border-gray-200 bg-gray-50"
                                                }`}>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeRadio"
                                                        className={`w-3 h-3 rounded-full ${m.id === 'green' ? 'bg-emerald-500' :
                                                            m.id === 'yellow' ? 'bg-amber-500' :
                                                                'bg-rose-500'
                                                            }`}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className={`text-xs leading-relaxed mb-4 ${isActive ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                            {m.description}
                                        </p>

                                        {/* Metrics Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Driver Model</span>
                                                <span className={`text-xs font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{m.driverAction}</span>
                                            </div>

                                            <div className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold border shadow-sm ${isActive
                                                ? 'bg-white border-gray-100 text-gray-900'
                                                : 'bg-gray-50 border-gray-100 text-gray-400'
                                                }`}>
                                                {m.pricing}
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Mode C Insight Card (Google-style UX) */}
                    <AnimatePresence>
                        {activeMode === 'red' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: 10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: 10 }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 rounded-3xl bg-rose-50 border border-rose-100 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-[0.05]">
                                        <Zap className="w-24 h-24 text-rose-900" />
                                    </div>

                                    <div className="relative z-10 flex gap-4">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500 border border-rose-100">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-rose-900 mb-1">Industry Reality</h4>
                                            <p className="text-xs text-rose-800 leading-relaxed font-medium">
                                                Traditional food delivery apps <span className="font-black underline decoration-rose-400/50">lose money</span> when the order amount is small.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: THE DIGITAL TWIN (VISUALIZER) */}
                <div className="lg:col-span-8 bg-gray-900 rounded-3xl p-4 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                    {/* 1. VISUAL MAP LOGIC */}
                    <div className="relative flex-1 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeMode}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative w-full h-full bg-gray-800/50 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden"
                            >
                                {/* Center Hub (Restaurant) */}
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 z-30">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center relative">
                                        <Car className="w-6 h-6 text-gray-900" />
                                        {/* Hub Pulse */}
                                        <div className={`absolute inset-0 rounded-xl animate-ping opacity-30 ${themeColor.bg}`}></div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-white font-mono text-center opacity-60">Fulfiller</div>
                                </div>

                                {/* --- GREEN MODE VISUALS --- */}
                                {activeMode === 'green' && (
                                    <>
                                        {/* The 500m Radius & Shared Drop Zone */}
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center z-10">

                                            {/* Label */}
                                            <div className="absolute -top-3 z-20">
                                                <div className="text-[10px] text-emerald-400 font-bold bg-gray-900 border border-emerald-500/30 px-2 py-1 rounded-full shadow-lg">
                                                    500 meters High Density
                                                </div>
                                            </div>

                                            {/* Pulse Ring */}
                                            <div className="absolute inset-0 rounded-full animate-pulse bg-emerald-400/5"></div>

                                            {/* Scattered Orders (Deterministic Chaos) */}
                                            {[...Array(15)].map((_, i) => {
                                                // Create a deterministic "scatter" using polar coordinates
                                                // Golden angle approx for even distribution without grid look
                                                const angle = i * 2.399;
                                                // Radius dist: roughly proportional to sqrt of index to maintain even density
                                                const radius = 20 + (Math.sqrt(i) * 6); // 20% min offset, up to ~45%

                                                // Convert to Cartesian % (Center is 50, 50)
                                                // Use some variance in the formula to make it look less like a perfect spiral
                                                const x = 50 + (radius * Math.cos(angle));
                                                const y = 50 + (radius * Math.sin(angle));

                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: i * 0.03, type: "spring" }}
                                                        style={{ left: `${x}%`, top: `${y}%` }}
                                                        className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981] z-20"
                                                    >
                                                        {/* Tiny connector line to center to imply 'milkman' route connection (optional, maybe too messy) */}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                        {/* The Path */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} x1="15%" y1="50%" x2="75%" y2="50%" stroke={themeColor.stroke} strokeWidth="2" strokeDasharray="5,5" />
                                        </svg>
                                    </>
                                )}

                                {/* --- YELLOW MODE VISUALS (FIXED: Multi-Stop) --- */}
                                {activeMode === 'yellow' && (
                                    <>
                                        {/* The 500 meters Radius (Yellow Mode) */}
                                        {/* The 500 meters Radius (Yellow Mode) */}
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-amber-500/30 bg-amber-500/5 flex items-center justify-center z-10">
                                            {/* Label */}
                                            <div className="absolute -top-3 z-20">
                                                <div className="text-[10px] text-amber-400 font-bold bg-gray-900 border border-amber-500/30 px-2 py-1 rounded-full shadow-lg">
                                                    500 meters Medium Density
                                                </div>
                                            </div>
                                            {/* Pulse Ring */}
                                            <div className="absolute inset-0 rounded-full animate-pulse bg-amber-400/5"></div>

                                            {/* Stops Inside the Radius (Relative Positioning) */}
                                            {/* Stop 1 */}
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute left-[20%] top-[30%] z-20">
                                                <div className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-full shadow-[0_0_10px_#d97706]"></div>
                                                <div className="text-[7px] text-amber-400 absolute top-4 -left-1">1</div>
                                            </motion.div>
                                            {/* Stop 2 */}
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute left-[60%] top-[25%] z-20">
                                                <div className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-full shadow-[0_0_10px_#d97706]"></div>
                                                <div className="text-[7px] text-amber-400 absolute top-4 -left-1">2</div>
                                            </motion.div>
                                            {/* Stop 3 (Center-ish) */}
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} className="absolute left-[45%] top-[55%] z-20">
                                                <div className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-full shadow-[0_0_10px_#d97706]"></div>
                                                <div className="text-[7px] text-amber-400 absolute top-4 -left-1">3</div>
                                            </motion.div>
                                            {/* Stop 4 */}
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} className="absolute left-[70%] top-[65%] z-20">
                                                <div className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-full shadow-[0_0_10px_#d97706]"></div>
                                                <div className="text-[7px] text-amber-400 absolute top-4 -left-1">4</div>
                                            </motion.div>
                                            {/* Stop 5 */}
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4 }} className="absolute left-[30%] top-[75%] z-20">
                                                <div className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-full shadow-[0_0_10px_#d97706]"></div>
                                                <div className="text-[7px] text-amber-400 absolute top-4 -left-1">5</div>
                                            </motion.div>

                                            {/* Internal Daisy Chain Paths Removed per user request */}
                                        </div>

                                        {/* Main Connection Path (Hub -> Circle Edge) - SOLID HIGH VISIBILITY */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <motion.path
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.8 }}
                                                d="M 15 50 L 75 50"
                                                stroke={themeColor.stroke}
                                                strokeWidth="0.5"
                                                fill="none"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute bottom-4 right-4 bg-amber-900/80 text-amber-400 text-xs px-3 py-1.5 rounded-full font-bold border border-amber-500/50 backdrop-blur-md">
                                            Multi-Stop Route
                                        </div>
                                    </>
                                )}

                                {/* --- RED MODE VISUALS (FIXED: Long Direct) --- */}
                                {activeMode === 'red' && (
                                    <>
                                        {/* The Inefficient Path (Long Curve) */}
                                        <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none z-0"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                        >
                                            <motion.path
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                                // Start near Hub (approx 15, 50) -> extended curve -> End (adjustable)
                                                d="M 15 50 Q 50 10 90 20"
                                                stroke={themeColor.stroke}
                                                strokeWidth="1"
                                                vectorEffect="non-scaling-stroke"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray="1,1"
                                            />
                                        </svg>

                                        {/* The Lonely Destination - Aligned to Path End (90%, 20%) */}
                                        <div className="absolute left-[90%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-20">
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="w-4 h-4 bg-rose-500 border-2 border-rose-700 rounded-full relative z-10 shadow-[0_0_20px_#be123c]" />
                                            <div className="w-4 h-4 bg-rose-500 rounded-full animate-ping absolute inset-0 opacity-50" />
                                            <div className="text-[8px] text-rose-400 absolute top-5 -left-4 w-20 text-center">Distant Drop</div>
                                        </div>

                                        <div className="absolute bottom-10 right-10 bg-rose-900/80 text-rose-400 text-xs px-3 py-1.5 rounded-full font-bold border border-rose-500/50 backdrop-blur-md">
                                            High Cost / Low Efficiency
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* 2. THE COMPARATIVE COST CHART (THE ROI) */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 overflow-visible flex-shrink-0 min-h-[180px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                <Map className="w-4 h-4 text-emerald-400" />
                                {activeMode === 'red' ? 'Financial Discipline' : 'Batching Efficiency'}
                            </h4>
                            <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-1 rounded">Scenario: {activeMode === 'green' ? '15 Orders' : activeMode === 'yellow' ? '5 Orders' : '1 Order'}</span>
                        </div>

                        {activeMode === 'red' ? (
                            <div className="py-0 flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="w-8 h-8 text-rose-500 mb-1" />
                                <p className="text-lg text-white font-bold max-w-md mx-auto leading-tight">
                                    100% At-Cost Delivery.<br />
                                    <span className="text-sm font-medium text-rose-200 opacity-90">You charge exactly what it costs to get it to you.</span>
                                </p>
                            </div>
                        ) : (
                            /* Standard Bar Chart for Green/Yellow */
                            <div className="grid grid-cols-2 gap-8">
                                {/* Competitor Side */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Traditional App ({activeMode === 'green' ? 15 : 5} Drivers)</span>
                                        <span className="text-rose-400 font-bold"><NumberTicker value={mode.comparison.competitorCost || 0} prefix="$" color="text-rose-400" /> Cost</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((mode.comparison.competitorCost || 0) / Math.max(mode.comparison.competitorCost || 1, mode.comparison.ourCost || 1)) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-rose-500"
                                        />
                                    </div>
                                </div>

                                {/* Our Side */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>HungryBird ({activeMode === 'green' ? '1 Driver' : '1 Driver'})</span>
                                        <span className="text-emerald-400 font-bold"><NumberTicker value={mode.comparison.ourCost || 0} prefix="$" color="text-emerald-400" /> Cost</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((mode.comparison.ourCost || 0) / Math.max(mode.comparison.competitorCost || 1, mode.comparison.ourCost || 1)) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.4 }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeMode !== 'red' && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Operational Result (1 Hr)</span>
                                <span className={`text-2xl font-black ${mode.math.batchProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                    {mode.math.batchProfit >= 0 ? '+' : ''}<NumberTicker value={mode.math.batchProfit} prefix="$" color="currentColor" />
                                    <span className="text-sm font-normal text-gray-500 ml-2">{mode.math.batchProfit >= 0 ? 'Margin' : 'Loss'}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 3. UNIT ECONOMICS ROW */}
                    <div className={`grid grid-cols-3 ${activeMode === 'red' ? 'md:grid-cols-3' : 'md:grid-cols-5'} gap-2 md:gap-2 gap-y-4 md:gap-y-0 text-center md:divide-x divide-white/10 border-t border-white/10 pt-6`}>
                        <div className="col-span-1">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Customer Pays</div>
                            <div className="text-white font-mono text-sm">
                                <span className="text-[10px] text-gray-500">$15 + </span>
                                <NumberTicker value={mode.math.customerFee} prefix="$" color="text-white font-bold" />
                            </div>
                        </div>

                        {activeMode !== 'red' && (
                            <>
                                <div className="col-span-1">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Logistics Cost</div>
                                    <div className={`font-mono text-sm ${activeMode === 'green' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <NumberTicker value={mode.math.driverCost} prefix="$" color="currentColor" />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                        Food Cost
                                        <div className="text-[8px] normal-case opacity-70 font-normal">(Standard 30% Commission)</div>
                                    </div>
                                    <div className="text-gray-400 font-mono text-sm">
                                        <NumberTicker value={mode.math.foodCost} prefix="$" color="text-gray-400" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="col-span-3 md:col-span-2 bg-emerald-500/10 rounded-lg py-1 border border-emerald-500/20">
                            <div className={`text-[10px] uppercase tracking-wider mb-1 font-bold ${themeColor.text}`}>Hourly Profit</div>
                            <div className={`font-mono text-3xl md:text-4xl font-black ${mode.math.batchProfit >= 0 ? themeColor.text : 'text-rose-500'}`}>
                                <NumberTicker value={mode.math.batchProfit} prefix="$" color="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: THE NUDGE (UI MOCKUP) --- */}
            <div className="grid md:grid-cols-2 gap-12 items-center py-12">
                <div className="order-2 md:order-1 relative">
                    {/* Abstract Phone UI Representation */}
                    <div className="bg-white border-8 border-gray-900 rounded-[2.5rem] p-4 shadow-2xl max-w-sm mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                        <div className="bg-gray-50 rounded-2xl h-full overflow-hidden">
                            {/* App Header */}
                            <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-bold text-gray-900">Tomorrow's Lunch</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">11:30 AM Lock</span>
                            </div>
                            <div className="p-4 space-y-3">
                                {/* Green Option */}
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex gap-3 relative overflow-hidden">
                                    <div className="w-12 h-12 bg-emerald-200 rounded-lg shrink-0 flex items-center justify-center">
                                        <Users className="text-emerald-600 w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-emerald-700 uppercase mb-0.5">Recommended</div>
                                        <div className="font-bold text-gray-900 text-sm">Popeyes Chicken</div>
                                        <div className="text-xs text-emerald-600 font-bold mt-1">15 Neighbors within 500 meters</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 text-sm">$12</div>
                                        <div className="text-xs font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm">FREE DEL</div>
                                    </div>
                                </div>
                                {/* Red Option */}
                                <div className="bg-white border border-gray-100 p-3 rounded-xl flex gap-3 opacity-60">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center">
                                        <Zap className="text-gray-400 w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 text-sm">Sushi King</div>
                                        <div className="text-xs text-gray-400 mt-1">Solo Run</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 text-sm">$14</div>
                                        <div className="text-xs text-gray-500">+$7.99 Fee</div>
                                    </div>
                                </div>
                            </div>
                            {/* Button */}
                            <div className="p-4 mt-4">
                                <div className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-center shadow-lg shadow-emerald-200 text-sm">
                                    Join Batch & Save $7.99
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-1 md:order-2 space-y-6">
                    <div className="inline-flex items-center gap-2 text-orange-600 font-bold uppercase tracking-widest text-xs">
                        <Navigation className="w-4 h-4" /> Behavioral Economics
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900">
                        We don't force users.<br />
                        We <span className="text-orange-500">guide</span> them.
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        80% of logistics cost is caused by "randomness." We use UI cues to herd users into "High Density" clusters (500 meters range).
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="p-1 bg-emerald-100 rounded text-emerald-600 mt-1"><ShieldCheck className="w-4 h-4" /></div>
                            <div>
                                <strong className="block text-gray-900">The Price Anchor</strong>
                                <span className="text-gray-500">We show the $7.99 fee for custom orders to make the FREE fee for batched orders look like a steal.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* --- SECTION 3: THE FLYWHEEL --- */}
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">The "Red-to-Green" Flywheel</h2>
                    <p className="text-gray-500 mt-2">How we conquer a new neighborhood without burning cash.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { step: "01", title: "The Seed", desc: "We only charge user the breakeven operation fee. We fulfill it via regular method. We acquire the customer.", color: "text-rose-500", bg: "bg-rose-100" },
                        { step: "02", title: "The Unlock", desc: "App notifies user: 'Get 3 neighbors to join, and we unlock lower delivery for everyone.'", color: "text-amber-500", bg: "bg-amber-100" },
                        { step: "03", title: "The Flip", desc: "Neighbors join. Density hits 3+. The zone flips to lower delivery. We switch to internal fleet. Profit spikes.", color: "text-emerald-500", bg: "bg-emerald-100" }
                    ].map((item, i) => (
                        <div key={i} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center font-black text-xl mb-4`}>
                                {item.step}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            {i < 2 && (
                                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                                    <ArrowRight className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
