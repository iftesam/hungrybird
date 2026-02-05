"use client";

import React, { useState, useEffect } from "react";
import { Timer, Calendar, Sun, Moon, Sunrise, Cloud, Sparkles, UtensilsCrossed, Info, ChevronRight, Zap, X, Clock } from "lucide-react";

import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const OrderCountdown = ({ targetDate, label, onAdjust, theme = "dinner", onDismiss }) => {
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
            label: "Breakfast",
        },
        lunch: {
            icon: Sun,
            color: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-200",
            accent: "bg-blue-500",
            glow: "shadow-blue-500/20",
            decoration: "bg-blue-500/10",
            label: "Lunch",
        },
        dinner: {
            icon: Sparkles,
            color: "text-indigo-700",
            bg: "bg-indigo-50",
            border: "border-indigo-200",
            accent: "bg-indigo-500",
            glow: "shadow-indigo-500/20",
            decoration: "bg-indigo-500/10",
            label: "Dinner",
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
                "relative overflow-hidden rounded-[2rem] border transition-all duration-300 group mb-8",
                isUrgent
                    ? "bg-red-50 border-red-200 shadow-xl shadow-red-500/10"
                    : cn(currentTheme.bg, currentTheme.border, "shadow-xl shadow-black/5")
            )}
        >
            {/* Background Decorations */}
            <div className={cn(
                "absolute top-0 right-0 w-48 h-48 rounded-bl-[120px] -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-110 pointer-events-none opacity-40",
                isUrgent ? "bg-red-500/10" : currentTheme.decoration
            )} />

            {/* Google Material-You Dismiss Button */}
            {onDismiss && (
                <motion.button
                    onClick={onDismiss}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border shadow-lg group/dismiss",
                        isUrgent
                            ? "bg-white/80 hover:bg-white border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 shadow-red-500/20"
                            : "bg-white/60 hover:bg-white/90 border-gray-200/50 hover:border-gray-300 text-gray-600 hover:text-gray-900 shadow-black/10"
                    )}
                    aria-label="Dismiss lock-in"
                >
                    <X className="w-3 h-3 transition-transform group-hover/dismiss:rotate-90" strokeWidth={2.5} />
                </motion.button>
            )}

            <div className="relative z-10 p-5 md:p-6">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">

                    {/* Left Section: Context */}
                    <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:rotate-6",
                            isUrgent ? "bg-red-500 text-white" : cn(currentTheme.accent, "text-white")
                        )}>
                            <Icon className="w-7 h-7" />
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    isUrgent ? "bg-red-200 text-red-700" : "bg-white/50 text-gray-400 border border-black/5"
                                )}>
                                    Lock-in
                                </span>
                                {isUrgent && (
                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-600 text-white animate-pulse">
                                        <Zap className="w-2.5 h-2.5 fill-current" />
                                        Urgent
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
                                {label || currentTheme.label}
                            </h2>
                            <p className="text-[11px] font-medium text-gray-400 leading-snug max-w-[240px] text-center md:text-left group-hover:text-gray-500 transition-colors">
                                Orders are finalized exactly <span className="text-gray-900 font-bold">60 minutes</span> prior to delivery to ensure kitchen and logistics precision.
                            </p>
                        </div>
                    </div>

                    {/* Middle Section: Timer */}
                    <div className="flex flex-col items-center justify-center px-6 border-y md:border-y-0 lg:border-x border-black/5 py-4 lg:py-0">
                        <div className="flex items-center gap-1.5">
                            <TimeUnit value={timeLeft.h} label="hours" urgent={isUrgent} themeColor={currentTheme.color} />
                            <span className="text-xl font-black text-gray-300 mb-5">:</span>
                            <TimeUnit value={timeLeft.m} label="mins" urgent={isUrgent} themeColor={currentTheme.color} />
                            <span className="text-xl font-black text-gray-300 mb-5">:</span>
                            <TimeUnit value={timeLeft.s} label="secs" urgent={isUrgent} themeColor={currentTheme.color} />
                        </div>
                    </div>

                    {/* Right Section: Action */}
                    {onAdjust && (
                        <div className="flex items-center justify-center lg:justify-end">
                            <button
                                onClick={onAdjust}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-md hover:shadow-lg",
                                    isUrgent
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-red-500/20"
                                        : "bg-white text-gray-900 border border-gray-100 hover:bg-gray-50"
                                )}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Schedule
                                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                            </button>
                        </div>
                    )}
                </div>


                {/* Footer Info Area */}
                <div className="mt-6 flex items-center justify-center md:justify-start gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-black/5 w-fit px-3 py-1.5 rounded-full mx-auto md:mx-0">
                    <Info className="w-3 h-3" />
                    <span>Temporary hold applies on card after lock-in.</span>
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
    <div className="flex flex-col items-center min-w-[3rem] md:min-w-[4rem]">
        <div className={cn(
            "text-3xl md:text-4xl font-black tracking-tighter tabular-nums",
            urgent ? "text-red-700" : "text-gray-900"
        )}>
            {value}
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
            {label}
        </div>
    </div>
);
