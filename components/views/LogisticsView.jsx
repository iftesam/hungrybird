"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Users, DollarSign, TrendingUp, Lock, MapPin, Zap } from "lucide-react";

export const LogisticsView = () => {
    // Interactive State for the "Simulator"
    const [activeMode, setActiveMode] = useState("green");

    const modes = {
        green: {
            title: "Mode A: The Milkman (Green)",
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            desc: "High Density Clusters (Dorms/Apts)",
            logic: "1 Driver • 15 Orders • 1 Stop",
            math: { revenue: 15.00, foodCost: 10.50, driverCost: 1.50, profit: 3.00 }
        },
        yellow: {
            title: "Mode B: The Shuttle (Yellow)",
            icon: Truck,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
            desc: "Medium Density (Multi-Stop)",
            logic: "1 Driver • 5 Orders • 3 Stops",
            math: { revenue: 17.99, foodCost: 10.50, driverCost: 4.00, profit: 3.49 }
        },
        red: {
            title: "Mode C: The Courier (Red)",
            icon: Zap,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
            desc: "Low Density (Suburbs)",
            logic: "1 Driver • 1 Order • Direct",
            math: { revenue: 23.00, foodCost: 10.50, driverCost: 11.00, profit: 1.50 }
        }
    };

    const current = modes[activeMode];

    return (
        <div className="pb-24 space-y-12 max-w-5xl mx-auto p-6">
            {/* HERO */}
            <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-4 h-4" /> Operational Engine
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                    The <span className="text-blue-600">Hybrid</span> Logistics Model
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    We don't just deliver food. We <span className="text-gray-900 font-bold underline decoration-blue-500 decoration-4 underline-offset-4">engineer density</span>.
                    <br />
                    <span className="text-sm text-gray-400 font-medium mt-2 block italic text-center">Select a mode below to see the unit economics.</span>
                </p>
            </div>

            {/* INTERACTIVE TRAFFIC LIGHT */}
            <div className="grid md:grid-cols-3 gap-6">
                {Object.keys(modes).map((key) => {
                    const mode = modes[key];
                    const isActive = activeMode === key;
                    const Icon = mode.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveMode(key)}
                            className={`relative p-8 rounded-[2rem] border-2 transition-all duration-500 text-left group ${isActive
                                    ? `${mode.border} ${mode.bg} shadow-2xl scale-[1.02] ring-4 ring-${mode.color.split('-')[1]}-400/10`
                                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:-translate-y-1"
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${isActive ? "bg-white shadow-lg rotate-6" : "bg-gray-50 group-hover:rotate-3"}`}>
                                <Icon className={`w-7 h-7 ${mode.color}`} />
                            </div>
                            <h3 className={`font-black text-xl tracking-tight mb-2 ${mode.color}`}>{mode.title}</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">{mode.desc}</p>
                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute top-6 right-6"
                                >
                                    <div className={`w-4 h-4 rounded-full bg-current animate-ping opacity-25 ${mode.color}`} />
                                    <div className={`absolute inset-0 w-4 h-4 rounded-full bg-current ${mode.color}`} />
                                </motion.div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* THE UNIT ECONOMICS CALCULATOR */}
            <motion.div
                key={activeMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-[#0F172A] text-white rounded-[3rem] p-8 md:p-16 shadow-2xl overflow-hidden relative border border-white/5"
            >
                {/* Advanced Background Decorations */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform rotate-12 scale-150">
                    <DollarSign className="w-96 h-96" />
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

                <div className="grid lg:grid-cols-5 gap-12 relative z-10">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${current.bg} bg-opacity-20 backdrop-blur-md border border-white/10`}>
                                <current.icon className={`w-8 h-8 ${current.color}`} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">{current.title}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-400 border border-white/5 uppercase tracking-widest">{current.logic}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xl text-gray-400 leading-relaxed font-medium">
                            {activeMode === 'green' && "The Holy Grail of Logistics. By batching 15 orders to one building, we slash logistics costs by 90%. This allows us to offer Free Delivery while maintaining the highest margin."}
                            {activeMode === 'yellow' && "The middle ground. Used for townhouses or office parks. We batch smaller groups, charging a modest fee to offset the extra stops and time."}
                            {activeMode === 'red' && "The 'DoorDash' mode. Low density means high delivery cost. We charge a premium fee to cover it, ensuring we never lose money on an order."}
                        </p>

                        <div className="pt-6 border-t border-white/5">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Operational Protocol</div>
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                <Lock className="w-5 h-5 text-orange-500" />
                                <span className="font-mono text-lg font-bold text-orange-400 tracking-tighter">11:30 AM (Strict 1-Hour Lock)</span>
                            </div>
                        </div>
                    </div>

                    {/* The Math Box (Glassmorphism) */}
                    <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 space-y-6 flex flex-col justify-center shadow-inner">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">Unit Economics (Per Order)</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-400 group-hover:text-white transition-colors">Customer Pays</span>
                                <span className="font-mono text-xl text-emerald-400 font-bold">${current.math.revenue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-400 group-hover:text-white transition-colors">Food Cost (70%)</span>
                                <span className="font-mono text-xl text-red-500/80 font-bold">-${current.math.foodCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-400 group-hover:text-white transition-colors">Logistics Cost</span>
                                <span className="font-mono text-xl text-red-500/80 font-bold">-${current.math.driverCost.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-6 border-t border-white/10 flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest block">Net Profit</span>
                                <span className="text-xs text-gray-500">fully burdened margin</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-5xl font-black text-emerald-400 tracking-tighter">${current.math.profit.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* THE FLYWHEEL SECTION */}
            <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-10 md:p-16 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />

                <div className="space-y-8 relative z-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">The Viral Flywheel</h3>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            How do we turn a "Red" neighborhood into a "Green" one? We <span className="text-gray-900 font-bold italic">gamify density</span>.
                        </p>
                    </div>

                    <ul className="space-y-6 pt-4">
                        {[
                            { step: 1, color: "red", title: "The Seed", text: "A user pays $7.99 for a 'Red Mode' direct courier delivery." },
                            { step: 2, color: "amber", title: "The Nudge", text: "System offer: 'Invite 2 neighbors to unlock Free Delivery forever for everyone.'" },
                            { step: 3, color: "emerald", title: "The Flip", text: "Density hits 3+ concurrent orders. The zone flips to Green. Unit profit spikes." }
                        ].map((item) => (
                            <li key={item.step} className="flex items-start gap-4 group">
                                <span className={`w-8 h-8 rounded-xl bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center text-sm font-black shrink-0 transition-transform group-hover:scale-110`}>
                                    {item.step}
                                </span>
                                <div className="space-y-1">
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{item.title}</span>
                                    <p className="text-gray-500 font-medium leading-snug">{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gray-50 rounded-[2.5rem] p-12 border border-inset border-gray-100 flex items-center justify-center shadow-inner group">
                    <div className="text-center space-y-8 w-full max-w-[300px]">
                        <div className="flex justify-center -space-x-4">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-16 h-16 rounded-3xl border-4 border-white bg-red-500 flex items-center justify-center text-white font-black text-sm shadow-xl z-20"
                            >
                                YOU
                            </motion.div>
                            <div className="w-16 h-16 rounded-3xl border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400 font-black text-sm shadow-md transition-all group-hover:translate-x-2">
                                +1
                            </div>
                            <div className="w-16 h-16 rounded-3xl border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400 font-black text-sm shadow-md transition-all group-hover:translate-x-4">
                                +2
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                                <span>Density Progress</span>
                                <span className="text-red-500">33%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 p-1 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "33.333%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full shadow-lg"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Needs 2 more to flip to emerald</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
