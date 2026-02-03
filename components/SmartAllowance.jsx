import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Sun, Moon, Lock, HelpCircle, AlertCircle, CheckCircle2, RefreshCw, Clock, CreditCard } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { useAppContext } from "@/components/providers/AppProvider";

export const SmartAllowance = () => {
    const { financials, actions, mealPrefs, deliverySchedule, profile } = useAppContext();
    const selectedMeals = mealPrefs; // Alias to minimize refactor
    const setSelectedMeals = actions.updateMealPrefs; // Alias

    // Initialize logic
    const initialDaily = Math.round(financials.monthlyBudget / 30) || 30;
    const [budget, setBudget] = useState(initialDaily);
    const [active, setActive] = useState(false); // For visual state on drag

    // Recurrence Logic synced to Profile
    const recurrence = profile.recurrence || { isActive: true, days: 7 };
    const isRecurring = recurrence.isActive;
    const recurringDays = recurrence.days;

    const setIsRecurring = (val) => {
        actions.setRecurrenceMode(val);
    };
    const setRecurringDays = (val) => {
        actions.updateProfile({ recurrence: { ...recurrence, days: val } });
    };

    // Sync to global
    useEffect(() => {
        actions.updateFinancials({ monthlyBudget: budget * 30 });

        // Auto-Reset logic if budget drops
        const newMax = budget >= 45 ? 3 : budget >= 30 ? 2 : 1;
        if (selectedMeals.length > newMax) {
            setSelectedMeals([]);
        }
    }, [budget]);

    // Time Sensitivity Logic
    const getMealStatus = (mealId) => {
        const now = new Date();
        const currentHour = now.getHours();
        // Debug/Demo: Uncomment to simulate time
        // const currentHour = 14; // e.g., 2 PM (Past Breakfast)

        // Cutoff times (24h format)
        const CUTOFFS = {
            breakfast: 10, // 10:00 AM
            lunch: 17,     // 5:00 PM
            dinner: 29     // Allows until 5 AM next day (effectively never 'past' today)
        };

        const isPast = currentHour >= CUTOFFS[mealId];

        if (!isPast) return "available";

        if (isRecurring) return "warning"; // Available but skipped for today
        return "disabled"; // Cannot order for today
    };

    // Logic
    const maxMeals = budget >= 45 ? 3 : budget >= 30 ? 2 : 1;
    const isCapped = selectedMeals.length >= maxMeals;

    // Buying Power Logic
    const spendPerMeal = selectedMeals.length > 0
        ? (budget / selectedMeals.length).toFixed(2)
        : "0.00";

    const toggleMeal = (meal) => {
        const status = getMealStatus(meal);

        if (status === "disabled") {
            // Show toast or alert (visual shake handled via disabled prop usually)
            return;
        }

        if (selectedMeals.includes(meal)) {
            setSelectedMeals(selectedMeals.filter(m => m !== meal));
        } else {
            if (!isCapped) {
                setSelectedMeals([...selectedMeals, meal]);
            }
        }
    };

    const meals = [
        { id: "breakfast", label: "Breakfast", icon: Coffee, desc: "5 AM - 10 AM" },
        { id: "lunch", label: "Lunch", icon: Sun, desc: "10 AM - 5 PM" },
        { id: "dinner", label: "Dinner", icon: Moon, desc: "5 PM - 5 AM" },
    ];

    // Math for Slider
    // Range: 15 to 100
    const MIN = 15;
    const MAX = 100;
    const percent = ((budget - MIN) / (MAX - MIN)) * 100;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Daily Allowance
                        <InfoTooltip
                            title="Daily Allowance"
                            desc="This sets your maximum spending limit per day. It unlocks more meal slots (2x, 3x) as you increase it."
                            align="left"
                        />
                    </h3>
                    <p className="text-sm text-gray-500">Adjust your daily budget to unlock more meal slots.</p>
                </div>
                <div className="text-right">
                    <div className={cn(
                        "text-3xl font-bold tracking-tight transition-colors duration-300",
                        budget >= 45 ? "text-emerald-600" : budget >= 30 ? "text-amber-500" : "text-blue-600"
                    )}>${budget}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Daily Cap</div>
                </div>
            </div>

            {/* Order Type Toggle (Compact & Professional) */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-full flex items-center shadow-inner">
                    <button
                        onClick={() => setIsRecurring(false)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                            !isRecurring ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        One-time
                    </button>
                    <div
                        role="button"
                        onClick={() => setIsRecurring(true)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                            isRecurring ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Recurring
                        {isRecurring && (
                            <InfoTooltip
                                title="Recurring vs One-time"
                                desc="Recurring sets this plan for every day forward. One-time only applies to today's order."
                                className="opacity-50 hover:opacity-100"
                                iconClassName="w-3 h-3"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Recurring Days Selector & Validation */}
            <AnimatePresence>
                {isRecurring && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency (Days/Week)</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setRecurringDays(d)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                            recurringDays === d
                                                ? "bg-black text-white shadow-md scale-110"
                                                : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {(() => {
                            const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            const activeDaysCount = DAYS.filter(day => {
                                if (mealPrefs.length === 0) return false;
                                return mealPrefs.every(meal => {
                                    const key = `${day}_${meal}`;
                                    return deliverySchedule[key] && deliverySchedule[key].locationId;
                                });
                            }).length;

                            // Only warn if there is a mismatch AND we have some active days (to avoid warning on empty init)
                            if (activeDaysCount > 0 && activeDaysCount !== recurringDays) {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-3 flex items-start gap-3 text-[11px] text-orange-700 bg-orange-50 p-3 rounded-xl border border-orange-100"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                                        <div className="leading-relaxed">
                                            <span className="font-bold block mb-0.5">Schedule Mismatch</span>
                                            Target: <strong>{recurringDays} days</strong> • Actual: <strong>{activeDaysCount} days</strong>.
                                            <br />
                                            Kindly select/deselect days in the <strong>Logistics</strong> section below to match.
                                        </div>
                                    </motion.div>
                                );
                            }
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MATERIAL DESIGN SLIDER */}
            <div className="mb-10 relative">
                {/* Labels above slider */}
                <div className="relative h-4 mb-2">
                    <div
                        className="absolute text-[10px] font-bold text-blue-600 uppercase tracking-tight -translate-x-1/2"
                        style={{ left: "0%" }}
                    >
                        Stage 1
                    </div>
                    <div
                        className={cn(
                            "absolute text-[10px] font-bold uppercase tracking-tight -translate-x-1/2 transition-all duration-300",
                            budget >= 30 ? "text-amber-600 opacity-100" : "text-gray-300 opacity-50"
                        )}
                        style={{ left: `${((30 - MIN) / (MAX - MIN)) * 100}%` }}
                    >
                        Stage 2
                    </div>
                    <div
                        className={cn(
                            "absolute text-[10px] font-bold uppercase tracking-tight -translate-x-1/2 transition-all duration-300",
                            budget >= 45 ? "text-emerald-600 opacity-100" : "text-gray-300 opacity-50"
                        )}
                        style={{ left: `${((45 - MIN) / (MAX - MIN)) * 100}%` }}
                    >
                        Stage 3
                    </div>
                </div>

                <div className="relative h-12 flex items-center select-none">
                    <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className={cn(
                                "absolute h-full transition-colors duration-500",
                                budget >= 45 ? "bg-emerald-500" : budget >= 30 ? "bg-amber-400" : "bg-blue-500"
                            )}
                            style={{ width: `${percent}%` }}
                            initial={false}
                            animate={{ width: `${percent}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                        />
                    </div>

                    {[30, 45].map(tick => (
                        <div
                            key={tick}
                            className={cn(
                                "absolute w-2 h-2 rounded-full transform -translate-x-1/2 z-10 transition-colors border-2",
                                budget >= tick ? "bg-white border-transparent" : "bg-white border-gray-200"
                            )}
                            style={{ left: `${((tick - MIN) / (MAX - MIN)) * 100}%` }}
                        />
                    ))}

                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                        style={{ left: `${percent}%` }}
                        initial={false}
                        animate={{ left: `${percent}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                    >
                        <div
                            className={cn(
                                "w-6 h-6 bg-white border-4 rounded-full shadow-lg transition-all duration-300 relative flex items-center justify-center",
                                budget >= 45 ? "border-emerald-500" : budget >= 30 ? "border-amber-400" : "border-blue-500",
                                active ? "scale-125 shadow-xl" : "scale-100 hover:scale-110"
                            )}
                        >
                            {active && (
                                <div className={cn(
                                    "absolute inset-0 rounded-full animate-ping opacity-25",
                                    budget >= 45 ? "bg-emerald-500" : budget >= 30 ? "bg-amber-400" : "bg-blue-500"
                                )} />
                            )}
                        </div>
                        <AnimatePresence>
                            {(active) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: -45, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                                >
                                    <div className={cn(
                                        "text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl whitespace-nowrap transition-colors",
                                        budget >= 45 ? "bg-emerald-600" : budget >= 30 ? "bg-amber-500" : "bg-blue-600"
                                    )}>
                                        ${budget}
                                    </div>
                                    <div className={cn(
                                        "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] -mt-[1px]",
                                        budget >= 45 ? "border-t-emerald-600" : budget >= 30 ? "border-t-amber-500" : "border-t-blue-600"
                                    )} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    <input
                        type="range"
                        min={MIN}
                        max={MAX}
                        step="1"
                        value={budget}
                        onPointerDown={() => setActive(true)}
                        onPointerUp={() => setActive(false)}
                        onChange={(e) => setBudget(parseInt(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-30"
                    />
                </div>
            </div>

            <div className="flex justify-between text-[10px] font-bold text-gray-400 -mt-6 mb-6 px-0.5 uppercase tracking-wider">
                <span>${MIN}</span>
                <span>${MAX}</span>
            </div>

            {/* Smart Helper Text */}
            <div className={cn(
                "mb-6 p-4 rounded-2xl border transition-all duration-500 flex items-start gap-4",
                budget >= 45 ? "bg-emerald-50 border-emerald-100" : budget >= 30 ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
            )}>
                <div className={cn(
                    "mt-0.5 p-2 rounded-lg transition-colors",
                    budget >= 45 ? "bg-emerald-100 text-emerald-600" : budget >= 30 ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                )}>
                    {budget >= 45 ? <CheckCircle2 className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="text-xs leading-relaxed">
                    <span className={cn(
                        "font-bold block mb-1 text-sm",
                        budget >= 45 ? "text-emerald-900" : budget >= 30 ? "text-amber-900" : "text-blue-900"
                    )}>
                        {budget < 30 ? "Discovery Mode" : budget < 45 ? "Comfort Mode" : "Freedom Mode"}
                    </span>
                    <p className="text-gray-600 font-medium">
                        {budget < 30 && "Enjoy 1 meal daily with smart logistics."}
                        {budget >= 30 && budget < 45 && "Unlocked 2 meal slots. Balanced fulfillment active."}
                        {budget >= 45 && "All 3 meal slots unlocked. Maximum variety and luxury."}
                    </p>
                </div>
            </div>

            {/* Meal Selectors with Time Sensitivity */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {meals.map((m) => {
                    const status = getMealStatus(m.id);
                    const isPast = status === "disabled" || status === "warning";
                    const isSelected = selectedMeals.includes(m.id);
                    const Icon = m.icon;
                    const isDisabled = (status === "disabled") || (!isSelected && isCapped);

                    return (
                        <button
                            key={m.id}
                            onClick={() => toggleMeal(m.id)}
                            disabled={isDisabled}
                            className={cn(
                                "relative flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-200 group text-center",
                                isSelected
                                    ? "bg-black text-white border-black shadow-lg"
                                    : isDisabled
                                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            )}
                        >
                            {/* Disabled Overlay Icon */}
                            {status === "disabled" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-xl z-20">
                                    <Clock className="w-6 h-6 text-gray-300" />
                                </div>
                            )}

                            {/* Warning Indicator (Recurring but past) */}
                            {status === "warning" && isSelected && (
                                <div className="absolute top-2 right-2 text-orange-500 z-20">
                                    <AlertCircle className="w-3 h-3" />
                                </div>
                            )}

                            {/* Lock for Budget Cap */}
                            {isDisabled && status !== "disabled" && !isSelected && (
                                <div className="absolute top-2 right-2 text-gray-300">
                                    <Lock className="w-3 h-3" />
                                </div>
                            )}

                            <Icon className={cn("w-5 h-5 mb-2", isSelected ? "text-white" : "text-gray-400")} />
                            <span className="text-sm font-semibold">{m.label}</span>
                            <span className={cn("text-[9px] mt-1 font-medium", isSelected ? "text-gray-300" : "text-gray-400")}>{m.desc}</span>

                            {/* Tooltip for Time Warning */}
                            {status === "warning" && isSelected && (
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-700 text-[9px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                    Skips Today. Window Closed {m.id === "breakfast" ? "(10 AM)" : m.id === "lunch" ? "(5 PM)" : "(5 AM)"}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Payment Disclaimer */}
            {/* Payment / Visa Card Professional UI */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
                    {/* Card Icon */}
                    <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center relative shadow-sm overflow-hidden">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full -mr-4 -mt-4"></div>
                        <span className="text-white text-[10px] font-bold italic tracking-wider z-10">VISA</span>
                    </div>

                    {/* Card Info */}
                    <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            Visa Signature
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                            4892 •••• •••• 8812
                        </div>
                    </div>

                    {/* Status Text - "Professional Way" */}
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Payment Method
                        </div>
                        <div className="text-xs text-emerald-600 font-medium">
                            Auto-Charge Active
                        </div>
                    </div>
                </div>

                {/* Professional Disclaimer */}
                <div className="flex items-start gap-2 mt-3 px-1 opacity-60">
                    <CheckCircle2 className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-gray-400 leading-tight">
                        Your Visa card ending in 8812 will be charged automatically upon successful delivery.
                        A temporary hold may be placed at the time of order confirmation.
                    </p>
                </div>
            </div>

            {/* Buying Power Feedback */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between mt-6">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                        Buying Power
                        <InfoTooltip
                            title="Buying Power"
                            desc="This is the max price allocated for one meal. We optimize your order to stay within this limit."
                            iconClassName="w-3 h-3"
                        />
                    </div>
                    <div className="font-mono text-lg font-bold text-gray-900">
                        ${spendPerMeal} <span className="text-sm text-gray-400 font-normal">/ meal</span>
                    </div>
                </div>

                <div className="text-right">
                    {isCapped && budget < 45 ? (
                        <div className="text-[11px] text-amber-600 font-bold leading-tight">
                            Unlock {budget < 30 ? "2nd" : "3rd"} Meal<br />
                            <span className="font-normal opacity-70">Add ${budget < 30 ? 30 - budget : 45 - budget} to daily limit</span>
                        </div>
                    ) : (
                        <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" />
                            Plan Active
                        </div>
                    )}
                </div>
            </div>

        </div >
    );
};

// Helper for classes
function cn(...inputs) { return twMerge(clsx(inputs)); }
