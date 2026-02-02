"use client";

import React, { useState, useEffect } from "react";
import { Timer, Settings2, Sun, Moon, Sunrise, Cloud, Sparkles, UtensilsCrossed, Info } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const OrderCountdown = ({ targetDate, label, onAdjust, theme = "dinner" }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    // GOOGLE MATERIAL DESIGN 3 THEME CONFIGURATION
    const THEMES = {
        breakfast: {
            icon: Sunrise,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            accentColor: "bg-amber-600",
            accentLight: "bg-amber-50",
            leftBorder: "border-l-amber-500",
            label: "Breakfast",
            subLabel: "Lock-in",
        },
        lunch: {
            icon: Sun,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            accentColor: "bg-blue-600",
            accentLight: "bg-blue-50",
            leftBorder: "border-l-blue-500",
            label: "Lunch",
            subLabel: "Lock-in",
        },
        dinner: {
            icon: Sparkles,
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            accentColor: "bg-indigo-600",
            accentLight: "bg-indigo-50",
            leftBorder: "border-l-indigo-500",
            label: "Dinner",
            subLabel: "Lock-in",
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
                setIsUrgent(false);
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
                "relative bg-white rounded-3xl p-6 transition-all duration-200 border-l-4",
                currentTheme.leftBorder,
                isUrgent
                    ? "shadow-[0_2px_8px_rgba(220,38,38,0.12),0_8px_16px_rgba(220,38,38,0.08)] ring-1 ring-red-100 !border-l-red-500"
                    : "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)]"
            )}
        >
            {/* Google-style subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-transparent rounded-3xl pointer-events-none" />

            {/* Urgent state overlay */}
            {isUrgent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-red-50/30 rounded-3xl pointer-events-none"
                />
            )}

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                {/* Left Section: Content */}
                <div className="flex items-start gap-4 flex-1">
                    {/* Icon Container - Google Material Style */}
                    <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        isUrgent
                            ? "bg-red-50 text-red-600"
                            : cn(currentTheme.iconBg, currentTheme.iconColor)
                    )}>
                        <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header with meal type */}
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 tracking-normal">
                                {label || currentTheme.label}
                            </h3>
                            <span className="text-xs font-medium text-gray-400">•</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {currentTheme.subLabel}
                            </span>
                        </div>

                        {/* Description text */}
                        <p className="text-xs text-gray-600 leading-relaxed mb-2.5 max-w-md">
                            Orders lock 30 minutes before delivery. Swap or skip before the timer hits zero.
                        </p>

                        {/* Info badge - Google style */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                            <Info className="w-3 h-3 text-gray-500" strokeWidth={2} />
                            <span className="text-[11px] font-medium text-gray-600">
                                There will be a temporary hold on your credit card after the lock-in
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Timer & Actions */}
                <div className="flex items-center gap-4 sm:border-l sm:border-gray-200 sm:pl-6">
                    {/* Timer Display - Google style monospace */}
                    <div className="text-center">
                        <div className={cn(
                            "text-3xl sm:text-4xl font-semibold font-mono tabular-nums tracking-tight transition-colors",
                            isUrgent ? "text-red-600" : "text-gray-900"
                        )}>
                            {timeLeft}
                        </div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mt-1">
                            Time Remaining
                        </p>
                    </div>

                    {/* Settings button - Google icon button style */}
                    {onAdjust && (
                        <button
                            onClick={onAdjust}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            title="Adjust Settings"
                        >
                            <Settings2 className="w-5 h-5" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            {/* Urgent state: subtle bottom accent */}
            {isUrgent && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-b-3xl"
                />
            )}
        </motion.div>
    );
};
