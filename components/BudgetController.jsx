import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import { CreditCard, DollarSign, ShieldCheck, TrendingUp, AlertCircle, Utensils, UtensilsCrossed, Coffee, Sun, Moon, ArrowRightLeft } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const MEAL_TYPES = [
    { id: "breakfast", label: "Breakfast", icon: Coffee },
    { id: "lunch", label: "Lunch", icon: Sun },
    { id: "dinner", label: "Dinner", icon: Moon },
];

import { useAppContext } from "@/components/providers/AppProvider";

export default function BudgetController() {
    const { financials, actions } = useAppContext();
    const budget = financials.monthlyBudget;

    // Wrapper to update global state
    const setBudget = (val) => {
        actions.updateFinancials({ monthlyBudget: val });
    };

    const [selectedMeals, setSelectedMeals] = useState(["lunch", "dinner"]);
    const [viewMode, setViewMode] = useState("daily"); // "daily" | "monthly"

    // LOGIC CONSTANTS
    const TIER_1_THRESHOLD = 300; // 1 Meal ($10/day)
    const TIER_2_THRESHOLD = 600; // 2 Meals ($20/day)
    const TIER_3_THRESHOLD = 900; // 3 Meals ($30/day)
    const MAX_LIMIT = 1200;

    // Derived metrics
    const dailyAmount = budget / 30;
    const isValid = budget >= TIER_1_THRESHOLD;

    // Determine current plan level
    let planLevel = 0;
    if (budget >= TIER_3_THRESHOLD) planLevel = 3;
    else if (budget >= TIER_2_THRESHOLD) planLevel = 2;
    else if (budget >= TIER_1_THRESHOLD) planLevel = 1;

    // --- AUTO-SELECTION LOGIC ---
    useEffect(() => {
        if (planLevel === 3) {
            setSelectedMeals(["breakfast", "lunch", "dinner"]);
        } else if (selectedMeals.length > planLevel && planLevel > 0) {
            setSelectedMeals(prev => prev.slice(0, planLevel));
        }
    }, [planLevel]);

    const handleToggleMeal = (id) => {
        if (planLevel === 3) return;

        if (selectedMeals.includes(id)) {
            if (selectedMeals.length > 1) {
                setSelectedMeals(prev => prev.filter(m => m !== id));
            }
        } else {
            if (selectedMeals.length < planLevel) {
                setSelectedMeals(prev => [...prev, id]);
            }
        }
    };

    // Spring physics for the number display
    // We animate the *displayed* value based on viewMode
    const targetValue = viewMode === "daily" ? dailyAmount : budget;
    const animatedValue = useSpring(targetValue, { stiffness: 100, damping: 20 });

    useEffect(() => {
        animatedValue.set(viewMode === "daily" ? dailyAmount : budget);
    }, [budget, viewMode, dailyAmount, animatedValue]);

    const displayValue = useTransform(animatedValue, (current) => Math.round(current));

    return (
        <div className="w-full font-sans text-[#171717]">

            {/* 1. THE BUDGET SETTER CARD */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden mb-8 transition-colors duration-500">

                {/* Dynamic Background Fills */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <motion.div
                        className={cn("h-full transition-colors duration-300",
                            planLevel === 0 ? "bg-red-500" :
                                planLevel === 1 ? "bg-orange-400" :
                                    planLevel === 2 ? "bg-emerald-500" : "bg-purple-600"
                        )}
                        layoutId="progressBar"
                        style={{ width: `${(budget / MAX_LIMIT) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold tracking-tight">
                                {viewMode === "daily" ? "Daily Allowance" : "Monthly Allowance"}
                            </h2>
                            <button
                                onClick={() => setViewMode(prev => prev === "daily" ? "monthly" : "daily")}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                                title="Switch View"
                            >
                                <ArrowRightLeft className="w-3 h-3" />
                            </button>
                        </div>
                        <motion.div
                            key={planLevel}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("text-xs font-bold mt-1 uppercase tracking-wide px-2 py-0.5 rounded-md inline-block",
                                planLevel === 0 ? "bg-red-100 text-red-700" :
                                    planLevel === 1 ? "bg-orange-100 text-orange-700" :
                                        planLevel === 2 ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                            )}
                        >
                            {planLevel === 0 ? "Invalid Plan (< $10/day)" :
                                planLevel === 1 ? "Tier 1: 1 Meal / Day" :
                                    planLevel === 2 ? "Tier 2: 2 Meals / Day" : "Tier 3: Full Coverage"}
                        </motion.div>
                    </div>
                </div>

                {/* The Big Money Display */}
                <div className="flex items-baseline gap-1 mb-2 justify-center py-4">
                    <span className="text-5xl font-extrabold tracking-tighter text-gray-300">$</span>
                    <motion.span className={cn("text-8xl font-black tracking-tighter",
                        planLevel === 0 ? "text-gray-300" : "text-black"
                    )}>
                        {displayValue}
                    </motion.span>
                    <span className="text-xl text-gray-400 font-medium">
                        {viewMode === "daily" ? "/day" : "/mo"}
                    </span>
                </div>

                {/* Validation Error */}
                <AnimatePresence>
                    {!isValid && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center gap-2 text-red-500 mb-4 bg-red-50 py-2 rounded-lg"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-bold">Minimum budget of $10/day required.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Slider UI */}
                <div className="relative h-20 flex items-center mb-6 pt-6 select-none px-4">
                    {/* Track */}
                    <div className="absolute w-full h-4 bg-gray-100 rounded-full overflow-hidden left-0">
                        <motion.div
                            className={cn("h-full rounded-full",
                                planLevel === 3 ? "bg-purple-600" :
                                    planLevel === 2 ? "bg-emerald-500" : "bg-orange-400"
                            )}
                            style={{ width: `${(budget / MAX_LIMIT) * 100}%` }}
                        />
                    </div>
                    {/* Markers (Snap Points) */}
                    {[30, 600, 900].map((val, i) => {
                        // We use the slider's internal value here, which is Monthly
                        // But we might want to label them Daily if in Daily mode?
                        // Let's stick to the underlying logic for the slider markers to match the position accurately
                        // 300, 600, 900
                        const monthlyVal = (i + 1) * 300;
                        const label = viewMode === "daily" ? `$${monthlyVal / 30}` : `$${monthlyVal}`;

                        return (
                            <div key={monthlyVal} className="absolute top-0 flex flex-col items-center" style={{ left: `${(monthlyVal / MAX_LIMIT) * 100}%` }}>
                                <span className="text-[10px] font-bold text-gray-400 mb-1">{label}</span>
                                <div className="w-0.5 h-10 bg-gray-300 z-0" />
                            </div>
                        );
                    })}
                    <input
                        type="range"
                        min="0"
                        max={MAX_LIMIT}
                        step="30" // Step by $1/day roughly
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="absolute w-full h-12 opacity-0 cursor-pointer z-50 left-0"
                    />
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-4 border-black rounded-full shadow-xl z-20 pointer-events-none flex items-center justify-center"
                        style={{ left: `calc(${(budget / MAX_LIMIT) * 100}% - 20px)` }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 1.1 }}
                    >
                        <div className="w-2 h-2 bg-black rounded-full" />
                    </motion.div>
                </div>

                {/* --- 2. MEAL CONFIGURATION -- */}
                {planLevel > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-8 pt-8 border-t border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Included Meals</h3>
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded",
                                selectedMeals.length === planLevel ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600 animate-pulse"
                            )}>
                                {planLevel === 3 ? "All Included" : `Select ${planLevel} Option${planLevel > 1 ? "s" : ""}`}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {MEAL_TYPES.map((meal) => {
                                const isSelected = selectedMeals.includes(meal.id);
                                const isLocked = planLevel === 3; // Fully automated for Tier 3

                                return (
                                    <button
                                        key={meal.id}
                                        onClick={() => handleToggleMeal(meal.id)}
                                        disabled={isLocked || (!isSelected && selectedMeals.length >= planLevel)}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                                            isSelected
                                                ? "border-black bg-black text-white shadow-lg scale-[1.02]"
                                                : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50",
                                            (isLocked || (!isSelected && selectedMeals.length >= planLevel)) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <meal.icon className={cn("w-6 h-6 mb-2", isSelected ? "text-white" : "text-gray-300")} />
                                        <span className="font-bold text-sm">{meal.label}</span>

                                        {/* Checkmark for Selected */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                                            >
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {planLevel < 3 && selectedMeals.length < planLevel && (
                            <p className="text-center text-xs text-red-500 font-bold mt-4 animate-bounce">
                                Please select {planLevel - selectedMeals.length} more meal{planLevel - selectedMeals.length > 1 ? "s" : ""} to complete your plan.
                            </p>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
