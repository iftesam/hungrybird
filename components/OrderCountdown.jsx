"use client";

import React, { useState, useEffect } from "react";
import { Timer, Settings2, Sun, Moon, Sunrise, Cloud, Sparkles, UtensilsCrossed } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const OrderCountdown = ({ targetDate, label, onAdjust, theme = "dinner" }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    // THEME CONFIGURATION
    const THEMES = {
        breakfast: {
            bg: "bg-gradient-to-br from-orange-400 to-amber-500",
            icon: Sunrise,
            iconColor: "text-amber-50",
            textColor: "text-white",
            accentColor: "bg-white/20",
            plateColor: "bg-amber-100/20",
            plateIconColor: "text-amber-100",
            label: "Breakfast",
            subLabel: "Lock-in",
            animation: (
                <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl -mb-10 -mr-10 opacity-60 pointer-events-none"
                />
            )
        },
        lunch: {
            bg: "bg-gradient-to-br from-sky-400 to-blue-500",
            icon: Sun,
            iconColor: "text-blue-50",
            textColor: "text-white",
            accentColor: "bg-white/20",
            plateColor: "bg-white/20",
            plateIconColor: "text-blue-50",
            label: "Lunch",
            subLabel: "Lock-in",
            animation: (
                <>
                    <motion.div
                        animate={{ x: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-40 pointer-events-none"
                    />
                    <motion.div
                        animate={{ x: [0, -30, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-0 left-20 w-56 h-56 bg-sky-300 rounded-full blur-3xl opacity-30 pointer-events-none"
                    />
                </>
            )
        },
        dinner: {
            bg: "bg-gray-950", // Deepest Dark
            icon: Sparkles,
            iconColor: "text-indigo-200",
            textColor: "text-white",
            accentColor: "bg-indigo-900/50",
            plateColor: "bg-white/10",
            plateIconColor: "text-indigo-200",
            label: "Dinner",
            subLabel: "Lock-in",
            animation: (
                <>
                    <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-4 right-10 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                    />
                    <motion.div
                        animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-10 left-10 w-3 h-3 bg-indigo-400 rounded-full blur-[2px] pointer-events-none"
                    />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
                    />
                </>
            )
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
                setTimeLeft("00h 00m 00s");
                setIsUrgent(false); // or true depending on desired behavior for expired
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h}h ${m}m ${s}s`);
            setIsUrgent(diff < 3600000); // Less than 1 hour
        };

        const timer = setInterval(calculate, 1000);
        calculate();
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "py-6 px-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-700 flex items-center",
                currentTheme.bg,
                isUrgent ? "shadow-red-500/20" : "shadow-black/5"
            )}
        >
            {/* Theme Animation Background */}
            {currentTheme.animation}

            {/* Central Plate Animation */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full flex items-center justify-center pointer-events-none z-0",
                    currentTheme.plateColor
                )}
            >
                <div className={cn("w-48 h-48 rounded-full border-[6px] border-current opacity-20 flex items-center justify-center", currentTheme.plateIconColor)}>
                    <UtensilsCrossed className="w-24 h-24 opacity-30" />
                </div>
            </motion.div>

            {/* Urgent State Overlay (Red Pulse) */}
            {isUrgent && (
                <motion.div
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-600 pointer-events-none z-0"
                />
            )}

            {/* Content Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 w-full">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "p-4 rounded-2xl backdrop-blur-xl shrink-0 shadow-lg",
                        isUrgent ? "bg-red-500/30 text-white animate-pulse" : currentTheme.accentColor,
                        currentTheme.iconColor
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-80", currentTheme.textColor)}>
                                {currentTheme.subLabel}
                            </h4>
                            <span className={cn("text-[10px] opacity-30", currentTheme.textColor)}>|</span>
                            <p className={cn("text-xl font-black tracking-tight leading-none", currentTheme.textColor)}>
                                {label || currentTheme.label}
                            </p>
                        </div>

                        <p className={cn("text-xs leading-relaxed font-medium opacity-80 max-w-[320px]", currentTheme.textColor)}>
                            Orders lock 30 minutes before delivery. Swap or skip before the timer hits zero.
                        </p>
                        <div className={cn("flex items-center gap-2 mt-2 opacity-50", currentTheme.textColor)}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
                            <span className="text-[10px] font-bold tracking-wide uppercase">Hold active during lock-in</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 sm:pl-8 sm:border-l sm:border-white/10 self-end sm:self-auto">
                    <div className="text-right">
                        <div className={cn(
                            "text-4xl md:text-5xl font-black font-mono tracking-tighter tabular-nums leading-none",
                            isUrgent ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" : currentTheme.textColor
                        )}>
                            {timeLeft}
                        </div>
                        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-right opacity-70 mt-2", currentTheme.textColor)}>
                            TIME REMAINING
                        </p>
                    </div>

                    {onAdjust && (
                        <button
                            onClick={onAdjust}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md group/btn ring-1 ring-white/10 hover:ring-white/30"
                            title="Adjust Settings"
                        >
                            <Settings2 className={cn("w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500", currentTheme.textColor, "opacity-70 group-hover/btn:opacity-100")} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
