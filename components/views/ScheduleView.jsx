import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, DollarSign, XCircle, PlusCircle, Clock, Timer, ChevronDown, ChevronUp, MapPin, Search, Lock, Sparkles } from "lucide-react";
import { MEALS } from "@/data/meals";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/components/providers/AppProvider";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Mapping for Context -> Data Tags
const CUISINE_MAP = {
    "us": "American",
    "mx": "Mexican",
    "it": "Italian",
    "cn": "Chinese",
    "jp": "Japanese",
    "bq": "BBQ",
    "sh": "Steakhouse",
    "th": "Thai",
    "in": "Indian",
    "md": "Mediterranean",
    "vt": "Vietnamese",
    "kr": "Korean",
    "cj": "Cajun",
    "lb": "Lebanese",
    "pk": "Pakistani",
    "bd": "Bangladeshi",
    "np": "Nepalese"
};


const MEAL_ORDER = ["breakfast", "lunch", "dinner"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

import { OrderCountdown } from "@/components/OrderCountdown";
import { findSmartSwap, isMealSafe } from "@/utils/SwapLogistics";
import { getLogisticsInfo } from "@/utils/LogisticsSimulation";
import { MealCard } from "@/components/MealCard";
import { BudgetModal } from "@/components/BudgetModal";


const QA_MODE = false; // Enable QA Mode for testing

export const ScheduleView = () => {
    // 1. Context & State Hooks
    const { profile, cuisines, mealPrefs, restaurantPrefs, financials, addresses, skipped, actions, deliverySchedule, mealPlan, isLoaded, isConfigured, missingConfig, priorityNotes, reviews } = useAppContext();

    const [isAllOrdersLocked, setIsAllOrdersLocked] = useState(false);
    const [budgetModal, setBudgetModal] = useState({ isOpen: false, data: null });

    // Constants for hooks
    const TAX_RATE = 0.08875;
    const TARGET_DAILY = profile?.dailyAllowance || 60;

    // 2. Effect Hooks
    useEffect(() => {
        if (!isLoaded) return;

        const checkAllLocked = () => {
            if (QA_MODE) {
                setIsAllOrdersLocked(false);
                return;
            }

            const now = new Date();
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const currentDayStr = days[now.getDay()];

            const hasPending = mealPrefs.some(type => {
                if (skipped.includes(type)) return false;

                const key = `${currentDayStr}_${type}`;
                const scheduleEntry = deliverySchedule[key];
                if (!scheduleEntry) return false;

                const [h, m] = scheduleEntry.time.split(':').map(Number);
                const startTime = new Date(now);
                startTime.setHours(h, m, 0, 0);
                const lockTime = new Date(startTime.getTime() - 60 * 60000); // 1 hour

                return now < lockTime;
            });

            setIsAllOrdersLocked(!hasPending);
        };

        const i = setInterval(checkAllLocked, 1000);
        checkAllLocked();
        return () => clearInterval(i);
    }, [isLoaded, mealPrefs, skipped, deliverySchedule]);

    // 3. Memoized Logic Hooks (Re-ordered to top)
    const validMeals = useMemo(() => {
        if (!isLoaded) return [];
        if (cuisines.length === 0) return MEALS;

        return MEALS.filter(meal => {
            if (reviews[meal.name]?.liked === false) return false;

            const activeCuisines = cuisines.map(c => CUISINE_MAP[c]);
            const matchesCuisine = activeCuisines.some(c =>
                c && (meal.cuisine.includes(c) || meal.tags.includes(c))
            );
            if (!matchesCuisine) return false;

            if (!isMealSafe(meal, profile.allergies)) return false;

            if (profile.diet.includes("Vegan") && !meal.dietary.vegan) return false;
            if (profile.diet.includes("Vegetarian") && !meal.dietary.vegetarian) return false;
            if (profile.diet.includes("Halal") && !meal.dietary.halal) return false;
            if (profile.diet.includes("Gluten-Free") && !meal.dietary.gluten_free) return false;
            if (profile.diet.includes("Keto") && !meal.tags.includes("Keto-Friendly")) return false;
            if (profile.diet.includes("Spicy") && !meal.tags.includes("Spicy")) return false;

            const hasWildcard = restaurantPrefs.includes("wildcard");
            if (!hasWildcard) {
                const matchesTier = restaurantPrefs.some(pref => {
                    if (pref === "top_tier") return meal.tags.includes("Top Tier");
                    if (pref === "gems") return meal.tags.includes("Hidden Gem");
                    return false;
                });
                if (!matchesTier) return false;
            }

            return true;
        });
    }, [profile, cuisines, restaurantPrefs, reviews, isLoaded]);

    const schedule = mealPlan?.items || {};
    const swapCounts = mealPlan?.meta?.swapCounts || {};

    const swapOptionsMap = useMemo(() => {
        if (!isLoaded) return {};
        const map = {};
        const context = { profile, financials, cuisines, restaurantPrefs, mealPrefs };
        MEAL_ORDER.forEach(type => {
            const candidates = findSmartSwap(type, schedule, context);
            map[type] = candidates?.length || 1;

            const itemsInSlot = schedule[type] || [];
            itemsInSlot.forEach(item => {
                if (item.role === "guest") {
                    const host = itemsInSlot.find(i => i.role === "host") || itemsInSlot[0];
                    const guestCandidates = findSmartSwap(type, schedule, { ...context, requiredRestaurant: host.vendor.name });
                    map[item.id] = guestCandidates?.length || 1;
                } else {
                    map[item.id] = map[type];
                }
            });
        });
        return map;
    }, [schedule, profile, financials, cuisines, restaurantPrefs, mealPrefs, isLoaded]);

    // Calculate Logistics (Delivery Fees & Neighbors) - Memoized for stability
    const logisticsMap = useMemo(() => {
        const map = {};
        Object.entries(schedule).forEach(([slot, slotItems]) => {
            if (!slotItems) return;
            slotItems.forEach(item => {
                const totalOptions = swapOptionsMap[item.id] || 5; // Default to 5 if unknown
                const currentSwapCount = swapCounts[item.id] || 0;
                // Calculate "Effective Index" based on modulo to ensure it cycles correctly visually
                const effectiveIndex = currentSwapCount % totalOptions;

                // Calculate Guests (Batch Size - Self)
                const restaurantName = item.vendor?.name || item.restaurant;
                const sameRestaurantItems = slotItems.filter(i => (i.vendor?.name || i.restaurant) === restaurantName);
                const extraGuests = Math.max(0, sameRestaurantItems.length - 1);

                map[item.id] = getLogisticsInfo(
                    item.id,
                    restaurantName || "Unknown",
                    "today",
                    effectiveIndex,
                    totalOptions,
                    extraGuests
                );
            });
        });
        return map;
    }, [schedule, swapCounts, swapOptionsMap]);

    // 4. Generation Effect Hook (Re-ordered to top)
    useEffect(() => {
        if (!isLoaded) return;

        if (validMeals.length === 0) {
            if (Object.keys(schedule).length > 0) actions.updateMealPlan({ items: {}, meta: { budget: 0 } });
            return;
        }

        const activeSlots = mealPrefs.length;
        if (activeSlots === 0) return;

        const maxPreTaxTotal = TARGET_DAILY / (1 + TAX_RATE);
        const budgetPerSlot = maxPreTaxTotal / activeSlots;

        const currentBudgetHash = Math.round(maxPreTaxTotal);
        const savedBudgetHash = Math.round(mealPlan.meta?.budget || 0);

        const hasValidSchedule = Object.keys(schedule).length > 0;
        const budgetUnchanged = currentBudgetHash === savedBudgetHash;
        const hasSwapHistory = swapCounts && Object.keys(swapCounts).length > 0;

        const hasIllegalMeal = Object.values(schedule).flat().some(meal => !isMealSafe(meal, profile.allergies));

        if (!hasIllegalMeal && ((hasValidSchedule && budgetUnchanged) || hasSwapHistory)) {
            return;
        }

        // --- GENERATION START ---
        let newSchedule = {};
        let strategy = "balanced";
        if (maxPreTaxTotal < 35) strategy = "value";
        else if (maxPreTaxTotal > 70) strategy = "feast";
        else strategy = "anchor";

        const sortedPool = [...validMeals].sort((a, b) => a.price - b.price);

        const pickMeal = (type, targetPrice, variance = 5) => {
            let candidates = sortedPool.filter(m =>
                m.meal_time.includes(type) &&
                Math.abs(m.price - targetPrice) <= variance
            );

            if (candidates.length === 0) {
                candidates = sortedPool.filter(m => m.meal_time.includes(type));
            }

            if (candidates.length === 0) {
                candidates = MEALS.filter(m => {
                    if (!m.meal_time.includes(type)) return false;
                    if (reviews[m.name]?.liked === false) return false;
                    if (!isMealSafe(m, profile.allergies)) return false;
                    if (profile.diet.includes("Vegan") && !m.dietary.vegan) return false;
                    if (profile.diet.includes("Vegetarian") && !m.dietary.vegetarian) return false;
                    if (profile.diet.includes("Halal") && !m.dietary.halal) return false;
                    return true;
                });

                if (candidates.length > 0) {
                    const priceMatches = candidates.filter(m => Math.abs(m.price - targetPrice) <= variance);
                    if (priceMatches.length > 0) candidates = priceMatches;
                }
            }

            if (candidates.length === 0) return null;

            const favorites = candidates.filter(m => reviews[m.name]?.isFavorite);
            if (favorites.length > 0) {
                favorites.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
                const limit = Math.min(favorites.length, 3);
                return favorites[Math.floor(Math.random() * limit)];
            }

            const liked = candidates.filter(m => reviews[m.name]?.liked === true);
            if (liked.length > 0) {
                liked.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
                const limit = Math.min(liked.length, 5);
                return liked[Math.floor(Math.random() * limit)];
            }

            candidates.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
            const limit = Math.min(candidates.length, 5);
            return candidates[Math.floor(Math.random() * limit)];
        };

        if (strategy === "value") {
            mealPrefs.forEach(type => {
                let cheapest = sortedPool.filter(m => m.meal_time.includes(type))[0];
                if (!cheapest) {
                    cheapest = MEALS.filter(m => m.meal_time.includes(type)).sort((a, b) => a.price - b.price)[0];
                }
                const basePrice = cheapest ? cheapest.price : budgetPerSlot;
                newSchedule[type] = pickMeal(type, basePrice, 2);
            });
        }
        else if (strategy === "anchor") {
            const heroSlot = mealPrefs.includes("dinner") ? "dinner" : (mealPrefs.includes("lunch") ? "lunch" : "breakfast");
            const saverSlots = mealPrefs.filter(p => p !== heroSlot);
            const heroBudget = Math.min(maxPreTaxTotal * 0.6, 40);

            const heroCandidates = sortedPool.filter(m =>
                m.meal_time.includes(heroSlot) &&
                (m.price >= 20 || m.tags.includes("Top Tier")) &&
                m.price <= heroBudget + 5
            );

            if (heroCandidates.length > 0) {
                newSchedule[heroSlot] = heroCandidates[Math.floor(Math.random() * heroCandidates.length)];
            } else {
                newSchedule[heroSlot] = pickMeal(heroSlot, heroBudget);
            }

            const heroPrice = newSchedule[heroSlot] ? newSchedule[heroSlot].price : 0;
            const remainingBudget = maxPreTaxTotal - heroPrice;
            const saverBudget = Math.max(0, remainingBudget / saverSlots.length);

            saverSlots.forEach(type => {
                newSchedule[type] = pickMeal(type, Math.min(saverBudget, 12), 3);
            });
        }
        else {
            mealPrefs.forEach(type => {
                newSchedule[type] = pickMeal(type, budgetPerSlot, 10);
            });
        }

        mealPrefs.forEach(type => {
            if (!newSchedule[type]) {
                newSchedule[type] = MEALS.filter(m => m.meal_time.includes(type)).sort((a, b) => a.price - b.price)[0];
            }
        });

        const context = { profile, financials, cuisines, restaurantPrefs, mealPrefs };
        mealPrefs.forEach(type => {
            const candidates = findSmartSwap(type, newSchedule, context);
            if (candidates && candidates.length > 0) {
                newSchedule[type] = candidates[0];
            }
        });

        let currentTotal = Object.values(newSchedule).reduce((a, b) => a + (b?.price || 0), 0);
        let optimizationPasses = 0;
        const MAX_PASSES = 20;

        while (currentTotal > maxPreTaxTotal && optimizationPasses < MAX_PASSES) {
            const currentSelection = mealPrefs
                .map(type => ({ type, ...newSchedule[type] }))
                .filter(item => item.id)
                .sort((a, b) => b.price - a.price);

            let changedSomething = false;
            for (const item of currentSelection) {
                const type = item.type;
                const currentPrice = item.price;
                const cheaperOptions = sortedPool
                    .filter(m => m.meal_time.includes(type) && m.price < currentPrice)
                    .sort((a, b) => a.price - b.price);

                if (cheaperOptions.length > 0) {
                    const adoption = cheaperOptions[0];
                    newSchedule[type] = adoption;
                    currentTotal -= (currentPrice - adoption.price);
                    changedSomething = true;
                    break;
                }
            }
            if (!changedSomething) break;
            optimizationPasses++;
        }

        const activeOverrides = priorityNotes.filter(n => n.status === "approved" && n.logic);
        activeOverrides.forEach(note => {
            const targetTime = note.logic.time;
            const forcedMeal = note.logic.meal;
            if (forcedMeal && mealPrefs.includes(targetTime)) {
                newSchedule[targetTime] = forcedMeal;
            }
        });

        const arrayBasedItems = {};
        Object.keys(newSchedule).forEach(slot => {
            if (newSchedule[slot]) {
                arrayBasedItems[slot] = [{
                    ...newSchedule[slot],
                    id: `${slot}_main`,
                    role: "host",
                    status: "scheduled"
                }];
            } else {
                arrayBasedItems[slot] = [];
            }
        });

        actions.updateMealPlan({
            items: arrayBasedItems,
            meta: {
                ...mealPlan.meta,
                budget: maxPreTaxTotal
            }
        });
    }, [mealPrefs, validMeals, TARGET_DAILY, mealPlan.meta?.budget, isLoaded, priorityNotes, reviews]);

    // 5. Early Return Guards
    if (!isLoaded) return null;

    if (!isConfigured) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Setup Required</h2>
                <p className="text-gray-500 max-w-sm mb-8">
                    We need a bit more info to generate your schedule. Please complete your profile to continue.
                </p>

                <div className="w-full max-w-xs space-y-3 mb-8">
                    {missingConfig.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                            <XCircle className="w-4 h-4 shrink-0" />
                            Missing {item}
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-400">
                    Visit the <span className="font-bold text-gray-600">Profile Tab</span> to update your settings.
                </p>
            </div>
        );
    }

    // 6. Final Calculations for Render
    const items = mealPlan?.items || {};

    const preTaxTotal = Object.entries(items).reduce((acc, [type, slotItems]) => {
        if (skipped.includes(type)) return acc;
        return acc + (slotItems?.reduce((slotAcc, item) => {
            const itemPrice = item?.price || 0;
            const fee = logisticsMap[item.id]?.deliveryFee || 0;
            return slotAcc + itemPrice + fee;
        }, 0) || 0);
    }, 0);
    const taxAmount = preTaxTotal * TAX_RATE;
    const finalTotal = preTaxTotal + taxAmount;
    const isOverBudget = finalTotal > (mealPlan?.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY) + 0.50;

    const { updateMealPlan, addGuestMeal, removeGuestMeal, swapSpecificMeal, toggleSkip } = actions;

    const handleSwap = (slotId, itemId) => {
        const slotItems = items[slotId] || [];
        const currentItem = slotItems.find(i => i.id === itemId);
        if (!currentItem) return;

        // 1. Determine Next Candidate
        const context = { profile, financials, cuisines, restaurantPrefs, mealPrefs };
        let candidates = [];

        if (currentItem.role === "guest") {
            const host = slotItems.find(i => i.role === "host") || slotItems[0];
            candidates = findSmartSwap(slotId, items, { ...context, requiredRestaurant: host.vendor.name });
        } else {
            candidates = findSmartSwap(slotId, items, context);
        }

        if (!candidates || candidates.length === 0) return;

        const currentCount = swapCounts[itemId] || 0;
        const nextIndex = (currentCount + 1) % candidates.length;
        const nextItem = candidates[nextIndex];

        // 2. Calculate Financial Impact
        // Remove Current Item Impact
        const currentFee = logisticsMap[itemId]?.deliveryFee || 0;
        const currentCostWithTax = (currentItem.price + currentFee) * (1 + TAX_RATE);

        // Add Next Item Impact (With Safety Net Fee of $7.99)
        const SAFETY_FEE = 7.99;
        const nextCostWithTax = (nextItem.price + SAFETY_FEE) * (1 + TAX_RATE);

        const projectedTotal = finalTotal - currentCostWithTax + nextCostWithTax;
        const currentLimit = mealPlan?.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY;

        // 3. Check Constraint
        if (projectedTotal > currentLimit + 0.10) { // Small float buffer
            setBudgetModal({
                isOpen: true,
                data: {
                    type: "swap", // Custom type handling in modal
                    slotId,
                    itemId,
                    currentLimit,
                    newTotal: projectedTotal,
                    mealCost: nextItem.price,
                    onConfirm: () => swapSpecificMeal(slotId, itemId) // Allow override if modal permits
                }
            });
        } else {
            swapSpecificMeal(slotId, itemId);
        }
    };

    const handleAddGuest = (slotId) => {
        const itemsInSlot = items[slotId] || [];
        if (itemsInSlot.length === 0) return;

        const hostItem = itemsInSlot[0];
        const hostLogistics = logisticsMap[hostItem.id];
        const fee = hostLogistics?.deliveryFee || 0;

        // Fee is taxed if included in preTaxTotal logic above, so we mimic that structure
        const itemCostWithTax = hostItem.price * (1 + TAX_RATE);
        const feeWithTax = fee * (1 + TAX_RATE);
        const newTotal = finalTotal + itemCostWithTax + feeWithTax;
        const currentLimit = mealPlan?.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY;

        if (newTotal > currentLimit + 0.50) {
            setBudgetModal({
                isOpen: true,
                data: {
                    type: "guest",
                    slotId,
                    currentLimit,
                    newTotal,
                    mealCost: hostItem.price,
                    onConfirm: () => addGuestMeal(slotId)
                }
            });
        } else {
            addGuestMeal(slotId);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-4 pb-8">
            {/* Header Section */}
            {/* Header Section - Enhanced Google Material Design */}
            <div className="flex flex-col gap-6 mb-2">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">
                            Schedule
                        </h1>
                        <p className="text-gray-500 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Visual Status Indicator */}
                    <div className={cn(
                        "hidden md:flex px-4 py-2 rounded-full border items-center gap-2 font-bold text-xs uppercase tracking-wider backdrop-blur-md",
                        isOverBudget
                            ? "bg-red-50/50 border-red-200 text-red-700"
                            : "bg-emerald-50/50 border-emerald-200 text-emerald-700"
                    )}>
                        {isOverBudget ? (
                            <> <AlertCircle className="w-4 h-4" /> Over Budget </>
                        ) : (
                            <> <CheckCircle2 className="w-4 h-4" /> On Track </>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Card 1: Daily Spend */}
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-16 h-16 text-gray-900" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spend</div>
                            <div className={cn("text-3xl font-black tracking-tight", isOverBudget ? "text-red-600" : "text-gray-900")}>
                                ${finalTotal.toFixed(2)}
                            </div>
                            <div className="text-xs font-medium text-gray-500 mt-1">
                                incl. tax & fees
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Budget Limit */}
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Lock className="w-16 h-16 text-indigo-900" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Limit</div>
                            <div className="text-3xl font-black text-indigo-600 tracking-tight">
                                ${(mealPlan?.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY).toFixed(2)}
                            </div>
                            {/* Visual Progress Line */}
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (finalTotal / (mealPlan?.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY)) * 100)}%` }}
                                    className={cn("h-full rounded-full", isOverBudget ? "bg-red-500" : "bg-emerald-500")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Nutrition (Calories) */}
                    <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-16 h-16 text-orange-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nutrition</div>
                            <div className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-1">
                                {Object.values(items).reduce((acc, slot) => acc + (slot ? slot.reduce((sAcc, m) => sAcc + (m.nutrition?.cals || 0), 0) : 0), 0)}
                                <span className="text-sm text-gray-400 font-bold">kcal</span>
                            </div>
                            <div className="text-xs font-medium text-orange-500 mt-1">
                                Estimated Total
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Banners */}
            <AnimatePresence>
                {isAllOrdersLocked && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] shadow-xl shadow-emerald-500/5 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group max-w-4xl mx-auto w-full"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[80px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 relative z-10">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <div className="flex-1 text-center md:text-left relative z-10">
                            <h3 className="font-black text-xl text-emerald-900 tracking-tight">All Orders Locked & Processed</h3>
                        </div>


                    </motion.div>
                )}
            </AnimatePresence>

            {validMeals.length === 0 && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    No meals found matching your profile.
                </div>
            )}

            <div className="space-y-6">
                <AnimatePresence>
                    {MEAL_ORDER.filter(type => mealPrefs.includes(type)).map((type, i) => {
                        const slotItems = items[type] || [];
                        const isSkipped = skipped.includes(type);

                        const now = new Date();
                        now.setSeconds(0, 0);

                        const currentDayStr = DAYS[now.getDay()];
                        const deliveryKey = `${currentDayStr}_${type}`;
                        const scheduleEntry = deliverySchedule[deliveryKey];

                        let deliveryInfo = null;
                        let isLocked = false;
                        let isDelivered = false;

                        if (scheduleEntry) {
                            const addrObj = addresses.find(a => a.id === scheduleEntry.locationId);
                            const locationLabel = addrObj ? `${addrObj.label} (${addrObj.address})` : "Unknown Location";
                            const [h, m] = scheduleEntry.time.split(':').map(Number);
                            const startTime = new Date(now);
                            startTime.setHours(h, m, 0, 0);
                            const endTime = new Date(startTime);
                            endTime.setHours(h + 1);
                            const lockTime = new Date(startTime.getTime() - 60 * 60000); // 1 hour

                            isLocked = QA_MODE ? false : now >= lockTime;
                            isDelivered = QA_MODE ? false : now >= endTime;
                            const fmt = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            deliveryInfo = {
                                time: `${fmt(startTime)} - ${fmt(endTime)}`,
                                locationLabel: locationLabel,
                                lockTime: lockTime
                            };
                        }

                        return (
                            <React.Fragment key={type}>
                                {!isSkipped && !isLocked && deliveryInfo?.lockTime && (
                                    <div className="mb-4">
                                        <OrderCountdown
                                            targetDate={deliveryInfo.lockTime}
                                            theme={type}
                                        />
                                    </div>
                                )}

                                <div className="space-y-3 relative group/slot">
                                    {slotItems.length > 1 && (
                                        <div className="absolute left-[20px] top-[80px] bottom-[60px] w-1 z-0 pointer-events-none">
                                            <div className="absolute inset-0 bg-indigo-500/10 blur-sm rounded-full" />
                                            <div className="h-full w-full bg-gradient-to-b from-gray-200 via-indigo-100 to-gray-200 rounded-full relative">
                                                <motion.div
                                                    animate={{ y: ["0%", "100%", "0%"] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                    className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-indigo-400 to-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {slotItems.map((meal, index) => {
                                        const hostMeal = slotItems.find(m => m.role === "host") || slotItems[0];
                                        const isSplitRestaurant = meal.role === "guest" && meal.restaurant !== hostMeal.restaurant;

                                        return (
                                            <motion.div
                                                key={meal.id}
                                                initial={{ opacity: 0, x: index > 0 ? 20 : 0, scale: index > 0 ? 0.95 : 1 }}
                                                animate={{ opacity: 1, x: 0, scale: index > 0 ? 0.96 : 1 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20,
                                                    delay: index * 0.1
                                                }}
                                                className={cn(
                                                    index > 0 && "ml-10 origin-top shadow-indigo-100/50"
                                                )}
                                            >
                                                <MealCard
                                                    type={type}
                                                    meal={meal}
                                                    isSkipped={isSkipped}
                                                    onSkip={() => toggleSkip(type)}
                                                    onSwap={() => handleSwap(type, meal.id)}
                                                    onRemove={() => removeGuestMeal(type, meal.id)}
                                                    onAddGuest={() => handleAddGuest(type)}
                                                    deliveryInfo={deliveryInfo}
                                                    swapIndex={(mealPlan?.meta?.swapCounts?.[meal.id] || 0) % (swapOptionsMap[meal.id] || 1)}
                                                    totalSwaps={swapOptionsMap[meal.id] || 1}
                                                    isLocked={isLocked}
                                                    isDelivered={isDelivered}
                                                    role={meal.role}
                                                    isSplitRestaurant={isSplitRestaurant}
                                                    logistics={logisticsMap[meal.id]}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="text-center text-xs text-gray-300 font-medium pb-8">
                Generating from {validMeals.length} valid options based on your profile.
            </div>

            <BudgetModal
                isOpen={budgetModal.isOpen}
                onClose={() => setBudgetModal({ isOpen: false, data: null })}
                onConfirm={() => {
                    actions.authorizeBudgetIncrease(new Date().toDateString(), budgetModal.data.newTotal);
                    if (budgetModal.data?.onConfirm) {
                        budgetModal.data.onConfirm();
                    } else {
                        // Fallback/Legacy behavior if onConfirm is missing
                        addGuestMeal(budgetModal.data.slotId);
                    }
                    setBudgetModal({ isOpen: false, data: null });
                }}
                currentLimit={budgetModal.data?.currentLimit || 0}
                newTotal={budgetModal.data?.newTotal || 0}
                mealCost={budgetModal.data?.mealCost || 0}
            />
        </div>
    );
};
