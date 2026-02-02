"use client";

import React, { useState, useEffect } from "react";
import { Timer, Settings2, Sun, Moon, Sunrise, Cloud, Sparkles, UtensilsCrossed, Info, ChevronRight, Zap } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const OrderCountdown = ({ targetDate, label, onAdjust, theme = "dinner" }) => {
    const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });
    const [isUrgent, setIsUrgent] = useState(false);

    // GOOGLE MATERIAL DESIGN 3 TONAL PALETTES
    const THEMES = {
        breakfast: {
            icon: Sunrise,
            color: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-200",
            accent: "bg-amber-500",
            glow: "shadow-amber-500/20",
            decoration: "bg-amber-500/10",
            label: "Breakfast Lock-in",
        },
        lunch: {
            icon: Sun,
            color: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-200",
            accent: "bg-blue-500",
            glow: "shadow-blue-500/20",
            decoration: "bg-blue-500/10",
            label: "Lunch Lock-in",
        },
        dinner: {
            icon: Sparkles,
            color: "text-indigo-700",
            bg: "bg-indigo-50",
            border: "border-indigo-200",
            accent: "bg-indigo-500",
            glow: "shadow-indigo-500/20",
            decoration: "bg-indigo-500/10",
            label: "Dinner Lock-in",
        }
    };

    const currentTheme = THEMES[theme] || THEMES.dinner;
    const Icon = currentTheme.icon;

    useEffect(() => {
        const calculate = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft({ h: "00", m: "00", s: "00" });
                setIsUrgent(false);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
            const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0");

            setTimeLeft({ h, m, s });
            setIsUrgent(diff < 3600000); // Less than 1 hour
        };

        const timer = setInterval(calculate, 1000);
        calculate();
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 group mb-8",
                isUrgent
                    ? "bg-red-50 border-red-200 shadow-xl shadow-red-500/10"
                    : cn(currentTheme.bg, currentTheme.border, "shadow-xl shadow-black/5")
            )}
        >
            {/* Background Decorations */}
            <div className={cn(
                "absolute top-0 right-0 w-64 h-64 rounded-bl-[160px] -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-50",
                isUrgent ? "bg-red-500/10" : currentTheme.decoration
            )} />

            <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-8">

                    {/* Left Section: Context */}
                    <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                        <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:rotate-6",
                            isUrgent ? "bg-red-500 text-white" : cn(currentTheme.accent, "text-white")
                        )}>
                            <Icon className="w-8 h-8" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    isUrgent ? "bg-red-200 text-red-700" : "bg-white/50 text-gray-500 border border-black/5"
                                )}>
                                    Status Check
                                </span>
                                {isUrgent && (
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600 text-white animate-pulse">
                                        <Zap className="w-3 h-3 fill-current" />
                                        Urgent
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                {label || currentTheme.label}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-sm">
                                Swaps and skips will be locked once the timer hits zero.
                                <span className="hidden md:inline"> Adjust your preference now.</span>
                            </p>
                        </div>
                    </div>

                    {/* Middle Section: Timer */}
                    <div className="flex flex-col items-center justify-center px-8 border-y md:border-y-0 lg:border-x border-black/5 py-6 lg:py-0">
                        <div className="flex items-center gap-2">
                            <TimeUnit value={timeLeft.h} label="hours" urgent={isUrgent} themeColor={currentTheme.color} />
                            <span className="text-2xl font-black text-gray-300 mb-6">:</span>
                            <TimeUnit value={timeLeft.m} label="mins" urgent={isUrgent} themeColor={currentTheme.color} />
                            <span className="text-2xl font-black text-gray-300 mb-6">:</span>
                            <TimeUnit value={timeLeft.s} label="secs" urgent={isUrgent} themeColor={currentTheme.color} />
                        </div>
                    </div>

                    {/* Right Section: Action */}
                    <div className="flex items-center justify-center lg:justify-end">
                        <button
                            onClick={onAdjust}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg",
                                isUrgent
                                    ? "bg-red-600 text-white hover:bg-red-700 shadow-red-500/30"
                                    : "bg-white text-gray-900 border border-gray-100 hover:bg-gray-50 hover:shadow-xl"
                            )}
                        >
                            <Settings2 className="w-4 h-4" />
                            Manage Schedule
                            <ChevronRight className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                </div>

                {/* Footer Info Tooltip-like Area */}
                <div className="mt-8 flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-black/5 w-fit px-4 py-2 rounded-full mx-auto md:mx-0">
                    <Info className="w-3.5 h-3.5" />
                    <span>Temporary hold applied on card after lock-in</span>
                </div>
            </div>

            {/* Pulsing indicator for bottom */}
            {isUrgent && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden">
                    <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="h-full w-1/2 bg-red-600 blur-sm"
                    />
                </div>
            )}
        </motion.div>
    );
};

const TimeUnit = ({ value, label, urgent, themeColor }) => (
    <div className="flex flex-col items-center min-w-[3.5rem] md:min-w-[4.5rem]">
        <div className={cn(
            "text-4xl md:text-5xl font-black tracking-tighter tabular-nums",
            urgent ? "text-red-700" : "text-gray-900"
        )}>
            {value}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
            {label}
        </div>
    </div>
);
