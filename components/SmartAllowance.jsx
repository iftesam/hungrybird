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
    const initialDaily = Math.round(financials.monthlyBudget / 30) || 25;
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
        const newMax = budget >= 30 ? 3 : budget >= 20 ? 2 : 1;
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
    const maxMeals = budget >= 30 ? 3 : budget >= 20 ? 2 : 1;
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
    // Range: 10 to 100
    const MIN = 10;
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
                    <div className="text-3xl font-bold tracking-tight text-gray-900">${budget}</div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Daily Limit</div>
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
            <div className="mb-10 relative h-12 flex items-center select-none">
                <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
                <motion.div
                    className="absolute h-1 bg-black rounded-full"
                    style={{ width: `${percent}%` }}
                    initial={false}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                />
                {[20, 30, 50, 75].map(tick => (
                    <div
                        key={tick}
                        className={cn(
                            "absolute w-1 h-1 rounded-full transform -translate-x-1/2",
                            budget >= tick ? "bg-black/50" : "bg-gray-300"
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
                            "w-5 h-5 bg-white border-2 border-black rounded-full shadow-md transition-transform duration-100 flex items-center justify-center relative",
                            active ? "scale-125" : "scale-100 hover:scale-110"
                        )}
                    >
                        <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 active:opacity-100 transition-opacity scale-150" />
                    </div>
                    <AnimatePresence>
                        {(active) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: -40, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                            >
                                <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1.5 rounded-md shadow-xl whitespace-nowrap">
                                    ${budget}
                                </div>
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 -mt-[1px]" />
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

            <div className="flex justify-between text-[10px] font-bold text-gray-400 -mt-6 mb-6 px-0.5 uppercase tracking-wider">
                <span>${MIN}</span>
                <span>${MAX}</span>
            </div>

            {/* Smart Helper Text */}
            <div className="mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                <div className="mt-0.5 text-blue-500">
                    <Sun className="w-4 h-4" />
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900 block mb-0.5">
                        {budget < 20 ? "1 Meal Unlocked" : budget < 30 ? "2 Meals Unlocked" : "All 3 Meals Unlocked"}
                    </span>
                    {budget < 20 && "Unlocks 1 premium meal. Increase to $20 for 2 slots."}
                    {budget >= 20 && budget < 30 && "Unlocks 2 smart meal slots."}
                    {budget >= 30 && "Unlocks full 3-meal plan flexibility."}
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
                    {isCapped && budget < 30 ? (
                        <div className="text-xs text-orange-600 font-medium">
                            Increase budget to $30<br />to unlock 3rd meal.
                        </div>
                    ) : (
                        <div className="text-xs text-emerald-600 font-medium">
                            Daily Budget Active
                        </div>
                    )}
                </div>
            </div>

        </div >
    );
};

// Helper for classes
function cn(...inputs) { return twMerge(clsx(inputs)); }
