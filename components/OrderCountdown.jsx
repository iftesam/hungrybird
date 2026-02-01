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
            // initial={{ opacity: 0, scale: 0.95 }} // Removed to prevent blink
            // animate={{ opacity: 1, scale: 1 }}     // Removed to prevent blink
            className={cn("py-3 px-4 rounded-xl shadow-lg shadow-gray-200/50 relative overflow-hidden group transition-all duration-500 flex items-center", currentTheme.bg)}
        >
            {/* Theme Animation Background */}
            {currentTheme.animation}

            {/* Central Plate Animation */}
            <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full flex items-center justify-center pointer-events-none z-0",
                    currentTheme.plateColor
                )}
            >
                <div className={cn("w-32 h-32 rounded-full border-4 border-current opacity-30 flex items-center justify-center", currentTheme.plateIconColor)}>
                    <UtensilsCrossed className="w-16 h-16 opacity-50" />
                </div>
            </motion.div>

            {/* Urgent State Overlay (Red Pulse) */}
            {isUrgent && (
                <motion.div
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-500 pointer-events-none z-0"
                />
            )}

            {/* Content Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 w-full">
                <div className="flex items-start gap-3">
                    <div className={cn(
                        "p-2.5 rounded-lg backdrop-blur-sm shrink-0 mt-0.5",
                        isUrgent ? "bg-red-500/20 text-red-50 animate-pulse" : currentTheme.accentColor,
                        currentTheme.iconColor
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest opacity-80", currentTheme.textColor)}>
                                {currentTheme.subLabel}
                            </h4>
                            <span className={cn("text-[10px] opacity-50", currentTheme.textColor)}>|</span>
                            <p className={cn("text-lg font-bold tracking-tight leading-none", currentTheme.textColor)}>
                                {label || currentTheme.label}
                            </p>
                        </div>

                        <p className={cn("text-[10px] leading-tight font-medium opacity-80 max-w-[260px]", currentTheme.textColor)}>
                            Orders lock 30 minutes before delivery. Swap or skip meal before the timer hits zero.
                        </p>
                        <div className={cn("flex items-center gap-1.5 mt-0.5 opacity-60", currentTheme.textColor)}>
                            <div className="w-1 h-1 rounded-full bg-current shrink-0" />
                            <span className="text-[9px] font-medium tracking-wide leading-tight">Your card will have a temporary hold when order locks.</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:pl-4 sm:border-l sm:border-white/10 self-end sm:self-auto">
                    <div className={cn("text-right", isUrgent ? "border-red-500/30" : "")}>
                        <div className={cn(
                            "text-3xl font-mono font-bold tracking-tighter tabular-nums leading-none",
                            isUrgent ? "text-red-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : currentTheme.textColor
                        )}>
                            {timeLeft}
                        </div>
                        <p className={cn("text-[9px] font-medium uppercase tracking-wider text-right opacity-70 mt-0.5", currentTheme.textColor)}>
                            Remaining
                        </p>
                    </div>

                    {onAdjust && (
                        <button
                            onClick={onAdjust}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-md group/btn"
                            title="Adjust Settings"
                        >
                            <Settings2 className={cn("w-4 h-4 group-hover/btn:scale-110 transition-transform", currentTheme.textColor, "opacity-70 group-hover/btn:opacity-100")} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
