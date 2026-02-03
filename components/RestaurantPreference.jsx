import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, TrendingUp, Sparkles, Users, Dices, CheckCircle2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const DISCOVERY_MODES = [
    {
        id: "top_tier",
        label: "Top Tier Only",
        desc: "Strictly 4.5★ and above.",
        icon: Star,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
        border: "border-yellow-200"
    },
    {
        id: "cohort",
        label: "Cohort Favorites",
        desc: "Trending with Engineers.",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-50",
        border: "border-blue-200"
    },
    {
        id: "fresh",
        label: "Fresh Drops",
        desc: "New openings (< 30 days).",
        icon: Sparkles,
        color: "text-purple-500",
        bg: "bg-purple-50",
        border: "border-purple-200"
    },
    {
        id: "gems",
        label: "Hidden Gems",
        desc: "Rising stars & local hits.",
        icon: TrendingUp,
        color: "text-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-200"
    }
];

import { useAppContext } from "@/components/providers/AppProvider";

export const RestaurantPreference = () => {
    const { restaurantPrefs, actions } = useAppContext();
    const selected = restaurantPrefs || ["top_tier", "wildcard"]; // Fallback or Alias
    const setSelected = actions.updateRestaurantPrefs; // Alias
    const [showLimitWarning, setShowLimitWarning] = useState(false);

    // Auto-dismiss warning after 4 seconds
    useEffect(() => {
        if (showLimitWarning) {
            const timer = setTimeout(() => setShowLimitWarning(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showLimitWarning]);

    const toggleSelection = (id) => {
        if (id === "wildcard") {
            // If selecting wildcard, clear everything else or just toggle it
            setSelected(prev => {
                const isNowActive = prev.includes("wildcard");
                if (isNowActive) {
                    return prev.filter(x => x !== "wildcard");
                } else {
                    setShowLimitWarning(false); // Clear warning if user follows advice
                    return ["wildcard"]; // Clear others when "Let system decide" is chosen
                }
            });
            return;
        }

        setSelected(prev => {
            const isStandard = prev.filter(x => x !== "wildcard");
            const isActive = prev.includes(id);

            if (isActive) {
                return prev.filter(x => x !== id);
            } else {
                // If "wildcard" was active, clear it when selecting a standard option
                const base = prev.includes("wildcard") ? [] : isStandard;

                if (base.length >= 3) {
                    // Maximum 3 standard options
                    setShowLimitWarning(true);
                    return prev;
                }

                setShowLimitWarning(false);
                return [...base, id];
            }
        });
    };

    const isWildcardActive = selected.includes("wildcard");

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative group overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Restaurant Preference</h3>
                    <p className="text-sm text-gray-500">Select multiple to diversify your weekly menu.</p>
                </div>

                {/* Variety Score Indicator */}
                <div className="flex flex-col items-end">
                    <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(bar => (
                            <div
                                key={bar}
                                className={cn(
                                    "w-1.5 h-4 rounded-full transition-all duration-300",
                                    (isWildcardActive ? 5 : selected.length) >= bar ? "bg-emerald-500" : "bg-gray-100"
                                )}
                            />
                        ))}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Variety Score
                    </div>
                </div>
            </div>

            {/* Selection Limit Warning Banner */}
            <AnimatePresence>
                {showLimitWarning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="mb-6 relative z-10"
                    >
                        <div className="flex items-center gap-3 p-4 bg-orange-50/80 backdrop-blur-sm border border-orange-100 rounded-2xl text-orange-800">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Selection Limit Reached</p>
                                <p className="text-xs text-orange-700/80 font-medium">To include more variety, try <span className="font-bold">Let the System Decide</span> below.</p>
                            </div>
                            <button
                                onClick={() => setShowLimitWarning(false)}
                                className="p-1 hover:bg-orange-100 rounded-full transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard Options */}
                {DISCOVERY_MODES.map((mode) => {
                    const isActive = selected.includes(mode.id);
                    const isOtherDisabled = isWildcardActive;
                    const Icon = mode.icon;

                    return (
                        <button
                            key={mode.id}
                            onClick={() => toggleSelection(mode.id)}
                            className={cn(
                                "relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                                isActive
                                    ? cn(mode.bg, mode.border)
                                    : "bg-white border-transparent hover:bg-gray-50",
                                isOtherDisabled && !isActive && "opacity-40 grayscale-[0.5] cursor-not-allowed"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                isActive ? "bg-white shadow-sm" : "bg-gray-100"
                            )}>
                                <Icon className={cn("w-5 h-5", isActive ? mode.color : "text-gray-400")} />
                            </div>
                            <div>
                                <div className={cn("font-bold text-sm", isActive ? "text-gray-900" : "text-gray-600")}>
                                    {mode.label}
                                </div>
                                <div className="text-xs text-gray-400">{mode.desc}</div>
                            </div>

                            {isActive && (
                                <div className="absolute top-3 right-3">
                                    <CheckCircle2 className={cn("w-4 h-4", mode.color)} />
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* Let the System Decide (Wildcard) */}
                <div className="md:col-span-2 relative">
                    <button
                        onClick={() => toggleSelection("wildcard")}
                        className={cn(
                            "w-full relative flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                            isWildcardActive
                                ? "bg-black border-black text-white shadow-xl scale-[1.01]"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 border-transparent text-gray-500 hover:border-gray-200",
                            !isWildcardActive && selected.length > 0 && "opacity-80" // Subtle hint when other things selected
                        )}
                    >
                        {isWildcardActive && (
                            <motion.div
                                layoutId="sparkles"
                                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
                            />
                        )}

                        <Dices className={cn(
                            "w-6 h-6 transition-transform",
                            isWildcardActive ? "animate-spin-slow text-emerald-400" : "text-gray-400"
                        )} />

                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-base">Let the System Decide</span>
                            <span className="text-xs text-gray-400">
                                {isWildcardActive
                                    ? "System logic automatically selects the best variety for you."
                                    : "Automatically disable manual filters and let us optimize your menu."}
                            </span>
                        </div>

                        {isWildcardActive ? (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="ml-auto bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-400"
                            >
                                ACTIVE
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {showLimitWarning && (
                                    <motion.div
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="ml-auto text-orange-500 animate-pulse font-bold text-xs uppercase tracking-widest bg-orange-100/50 px-3 py-1 rounded-full border border-orange-200"
                                    >
                                        Recommended
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </button>

                    {/* Pulsing Ring when Recommended */}
                    {!isWildcardActive && showLimitWarning && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-orange-400 animate-ping opacity-20 pointer-events-none" />
                    )}
                </div>
            </div>
        </div>
    );
};
