import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, DollarSign, XCircle, PlusCircle, Clock, Timer, ChevronDown, ChevronUp, MapPin, Search, Lock } from "lucide-react";
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

import { OrderCountdown } from "@/components/OrderCountdown";
import { findSmartSwap } from "@/utils/SwapLogistics";
import { MealCard } from "@/components/MealCard";

// --- SMART TIMER HOOK REMOVED (Logic moved to per-meal basis) ---

// --- RICH MEAL CARD COMPONENT ---


export const ScheduleView = () => {
    const { profile, cuisines, mealPrefs, restaurantPrefs, financials, addresses, skipped, actions, deliverySchedule, mealPlan, isLoaded, isConfigured, missingConfig, priorityNotes } = useAppContext();

    if (!isLoaded) return null; // Wait for hydration

    // --- SETUP REQUIRED STATE ---
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

    // Timer Logic: Check if everything is processed for specific "All Done" state
    // We re-use this check in the render, but we can memoize the global status if needed.
    const [isAllOrdersLocked, setIsAllOrdersLocked] = useState(false);

    useEffect(() => {
        const checkAllLocked = () => {
            const now = new Date();
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const currentDayStr = days[now.getDay()];

            // Check if ANY meal is still pending (unlocked)
            const hasPending = mealPrefs.some(type => {
                if (skipped.includes(type)) return false; // Skipped doesn't count as pending

                const key = `${currentDayStr}_${type}`;
                const scheduleEntry = deliverySchedule[key];
                if (!scheduleEntry) return false; // Default unlocked? Or treat as no order? Treat as processed/ignore.

                const [h, m] = scheduleEntry.time.split(':').map(Number);
                const startTime = new Date(now);
                startTime.setHours(h, m, 0, 0);
                const lockTime = new Date(startTime.getTime() - 30 * 60000);

                return now < lockTime;
            });

            setIsAllOrdersLocked(!hasPending);
        };

        const i = setInterval(checkAllLocked, 1000);
        checkAllLocked();
        return () => clearInterval(i);
    }, [mealPrefs, skipped, deliverySchedule]);

    // Financial Constants
    const TAX_RATE = 0.08875; // ~8.8-9% Tax
    const TARGET_DAILY = financials.monthlyBudget / 30; // e.g. $25.00

    // --- SMART FILTERING ENGINE ---
    const validMeals = useMemo(() => {
        // Strict Mode: If no cuisines selected, show everything (or show nothing? Let's assume everything if empty selection, but user said 'strict').
        // AppProvider initializes cuisines with default.
        if (cuisines.length === 0) return MEALS;

        return MEALS.filter(meal => {
            // 1. Cuisine Check
            const activeCuisines = cuisines.map(c => CUISINE_MAP[c]);
            // Check both strict cuisine field and tags for flexibility
            // We use optional chaining and strict matching
            const matchesCuisine = activeCuisines.some(c =>
                c && (meal.cuisine.includes(c) || meal.tags.includes(c))
            );
            if (!matchesCuisine) return false;

            // 2. Strict Dietary & Allergy Check

            // A. Allergies (MUST NOT contain)
            if (profile.allergies && profile.allergies.length > 0) {
                const hasAllergy = profile.allergies.some(allergy => {
                    return meal.allergens.includes(allergy);
                });
                if (hasAllergy) return false;
            }

            // B. Diet Constraints
            if (profile.diet.includes("Vegan") && !meal.dietary.vegan) return false;
            if (profile.diet.includes("Vegetarian") && !meal.dietary.vegetarian) return false;
            if (profile.diet.includes("Halal") && !meal.dietary.halal) return false;
            if (profile.diet.includes("Gluten-Free") && !meal.dietary.gluten_free) return false;
            if (profile.diet.includes("Keto") && !meal.tags.includes("Keto-Friendly")) return false;
            if (profile.diet.includes("Spicy") && !meal.tags.includes("Spicy")) return false;

            // 3. Restaurant Preference Check
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
    }, [profile, cuisines, restaurantPrefs]);

    const { updateMealPlan, toggleSkip } = actions;

    // Alias explicitly for clarity
    const schedule = mealPlan.items || {};
    // const swapIndices = mealPlan.meta?.swapIndices || {}; 
    // We now use swapCounts (monotonic increment)
    const swapCounts = mealPlan.meta?.swapCounts || {};

    // --- DYNAMIC OPTION COUNTING ---
    // Calculate how many swap options exist for each slot (Current + Alternatives)
    const swapOptionsMap = useMemo(() => {
        const map = {};
        // Context for calculations
        const ctx = { profile, financials, cuisines, restaurantPrefs, mealPrefs };

        mealPrefs.forEach(type => {
            // Find alternatives
            // findSmartSwap returns [Alt1, Alt2...]
            const alts = findSmartSwap(type, schedule, ctx);
            const altCount = alts ? alts.length : 0;

            // Total options = Current Meal + Alternatives
            // If current meal is invalid/missing, we just have alternatives. 
            // But realistically schedule[type] should exist if validMeals > 0
            map[type] = altCount + 1;
        });
        return map;
    }, [schedule, profile, financials, cuisines, restaurantPrefs, mealPrefs]);

    // --- SMART GENERATION LOGIC ---
    useEffect(() => {
        // Wait for localStorage to load before generating
        if (!isLoaded) return;

        // 1. Strict Mode Validation
        if (validMeals.length === 0) {
            if (Object.keys(schedule).length > 0) updateMealPlan({ items: {}, meta: { budget: 0 } });
            return;
        }

        const activeSlots = mealPrefs.length;
        if (activeSlots === 0) return;

        const maxPreTaxTotal = TARGET_DAILY / (1 + TAX_RATE);
        const budgetPerSlot = maxPreTaxTotal / activeSlots;

        // PERSISTENCE CHECK:
        // Only regenerate if:
        // 1. Plan is empty
        // 2. Budget has changed significantly (using integer check to avoid float noise)
        // 3. Current meals are invalid? (Optional, but let's trust the meta check first)

        const currentBudgetHash = Math.round(maxPreTaxTotal);
        const savedBudgetHash = Math.round(mealPlan.meta?.budget || 0);

        const hasValidSchedule = Object.keys(schedule).length > 0;
        const budgetUnchanged = currentBudgetHash === savedBudgetHash;
        const hasSwapHistory = swapCounts && Object.keys(swapCounts).length > 0;

        // If we have a valid schedule and budget hasn't changed, DO NOT REGENERATE.
        // Also protect if user has swap history (manual swaps).
        // This preserves manual swaps across refreshes.
        if ((hasValidSchedule && budgetUnchanged) || hasSwapHistory) {
            return;
        }

        // --- GENERATION START ---
        let newSchedule = {};

        // STRATEGY SELECTION
        // "Value" (<$35): Focus on Budget Savers (<$12)
        // "Anchor" ($35-$70): 1 Hero Item ($20+) + Savers
        // "Feast" (>$70): Anything goes

        let strategy = "balanced";
        if (maxPreTaxTotal < 35) strategy = "value";
        else if (maxPreTaxTotal > 70) strategy = "feast";
        else strategy = "anchor";

        // Sort pools for efficiency
        // Cheap -> Expensive
        const sortedPool = [...validMeals].sort((a, b) => a.price - b.price);

        // Helper: Get best meal for a target price with some variety
        const pickMeal = (type, targetPrice, variance = 5) => {
            // 1. Try Strict Match in Filtered Pool (Cuisine + Time + Price)
            let candidates = sortedPool.filter(m =>
                m.meal_time.includes(type) &&
                Math.abs(m.price - targetPrice) <= variance
            );

            // 2. Fallback: Strict Match in Filtered Pool (Cuisine + Time Only)
            if (candidates.length === 0) {
                candidates = sortedPool.filter(m => m.meal_time.includes(type));
            }

            // 3. Global Fallback: If Filtered Pool has NO items for this time (e.g. data gap for Cuisine)
            // Go to Global MEALS but Enforce Diet/Allergy + Time
            if (candidates.length === 0) {
                // We need to re-apply basic diet filters to the global list for safety
                candidates = MEALS.filter(m => {
                    if (!m.meal_time.includes(type)) return false;

                    // Re-run basic diet checks from the main filter
                    // (We can assume if they weren't in sortedPool, it was due to Cuisine or Diet)
                    // We want to relax Cuisine but KEEP Diet.
                    if (profile.allergies && profile.allergies.some(a => m.allergens.includes(a))) return false;
                    if (profile.diet.includes("Vegan") && !m.dietary.vegan) return false;
                    if (profile.diet.includes("Vegetarian") && !m.dietary.vegetarian) return false;
                    if (profile.diet.includes("Halal") && !m.dietary.halal) return false;

                    return true;
                });

                // If we found global candidates, filter by price if possible
                if (candidates.length > 0) {
                    const priceMatches = candidates.filter(m => Math.abs(m.price - targetPrice) <= variance);
                    if (priceMatches.length > 0) candidates = priceMatches;
                }
            }

            // 4. Critical Fail-safe: Just return null if truly nothing exists (should be impossible with rich data)
            if (candidates.length === 0) return null;

            // Randomize slightly from top results to avoid repetition
            // Sort by price proximity to target first
            candidates.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));

            const limit = Math.min(candidates.length, 5);
            return candidates[Math.floor(Math.random() * limit)];
        };

        if (strategy === "value") {
            // Strategy: STRICT Value
            // Calculate minimum possible cost for the slots
            // If budget is tight, we shouldn't aim for 'average', we should aim for 'floor'

            mealPrefs.forEach(type => {
                // Find cheapest possible meal for this slot to start with
                // Try from sortedPool first, then global fallback if necessary
                let cheapest = sortedPool.filter(m => m.meal_time.includes(type))[0];
                if (!cheapest) {
                    // Global fallback for base price check
                    cheapest = MEALS.filter(m => m.meal_time.includes(type)).sort((a, b) => a.price - b.price)[0];
                }

                const basePrice = cheapest ? cheapest.price : budgetPerSlot;

                // Pick something very close to the floor price
                newSchedule[type] = pickMeal(type, basePrice, 2);
            });
        }
        else if (strategy === "anchor") {
            // Strategy: Pick ONE "Hero" meal (Dinner -> Lunch -> Breakfast priority)
            // Allocate 50-60% of budget to Hero, rest to others

            const heroSlot = mealPrefs.includes("dinner") ? "dinner" : (mealPrefs.includes("lunch") ? "lunch" : "breakfast");
            const saverSlots = mealPrefs.filter(p => p !== heroSlot);

            // 1. Pick Hero (Aim for top 30% of price range or ~$25-35)
            const heroBudget = Math.min(maxPreTaxTotal * 0.6, 40);

            // Hero Logic: Explicitly look for "Top Tier" or expensive items
            const heroCandidates = sortedPool.filter(m =>
                m.meal_time.includes(heroSlot) &&
                (m.price >= 20 || m.tags.includes("Top Tier")) &&
                m.price <= heroBudget + 5 // Don't blow the WHOLE budget
            );

            if (heroCandidates.length > 0) {
                newSchedule[heroSlot] = heroCandidates[Math.floor(Math.random() * heroCandidates.length)];
            } else {
                newSchedule[heroSlot] = pickMeal(heroSlot, heroBudget);
            }

            // 2. Fill Savers with REMAINING budget
            const heroPrice = newSchedule[heroSlot] ? newSchedule[heroSlot].price : 0;
            const remainingBudget = maxPreTaxTotal - heroPrice;
            const saverBudget = Math.max(0, remainingBudget / saverSlots.length);

            saverSlots.forEach(type => {
                // Force cheap picks for savers
                // Use a small variance to stick to the budget
                newSchedule[type] = pickMeal(type, Math.min(saverBudget, 12), 3);
            });

        }
        else {
            // Strategy: Feast (Random High Quality)
            mealPrefs.forEach(type => {
                // Just pick nice things around the generous average
                newSchedule[type] = pickMeal(type, budgetPerSlot, 10);
            });
        }

        // Final Validation: Remove any accidental nulls (sanity check)
        mealPrefs.forEach(type => {
            if (!newSchedule[type]) {
                // Last ditch effort: Grab absolute cheapest ANY meal for this time
                newSchedule[type] = MEALS.filter(m => m.meal_time.includes(type)).sort((a, b) => a.price - b.price)[0];
            }
        });

        // --- "SWAP POLISH" (Fix for Default Values) ---
        // As requested: "Swap once by default".
        // We run the Smart Swap engine on the draft schedule to enforce strict constraints and "smartness".
        const context = { profile, financials, cuisines, restaurantPrefs, mealPrefs };

        // Iterate through slots and refine them using the Swap Engine
        mealPrefs.forEach(type => {
            // function findSmartSwap(currentMealType, currentSchedule, context)
            const candidates = findSmartSwap(type, newSchedule, context);

            // If swap engine finds valid candidates, upgrade the slot
            // This ensures strict filtering (Cuisine/Diet) is respected exactly like the manual swap button
            if (candidates && candidates.length > 0) {
                // Pick the top scored candidate
                newSchedule[type] = candidates[0];
            }
        });

        let currentTotal = Object.values(newSchedule).reduce((a, b) => a + b.price, 0);

        // Optimization Loop - STRICT BUDGET ENFORCEMENT
        // We iterate repeatedly as long as we are over budget
        let optimizationPasses = 0;
        const MAX_PASSES = 20;

        while (currentTotal > maxPreTaxTotal && optimizationPasses < MAX_PASSES) {
            // 1. Sort current selection by price (Desc) to target expensive ones first
            const currentSelection = mealPrefs
                .map(type => ({ type, ...newSchedule[type] }))
                .filter(item => item.id) // check valid
                .sort((a, b) => b.price - a.price);

            let changedSomething = false;

            // 2. Iterate through selection to find ANY swap that reduces cost
            for (const item of currentSelection) {
                const type = item.type;
                const currentPrice = item.price;

                // Find strictly cheaper options from the valid pool for this specific time slot
                // Sort by price ascending (cheapest first) to maximize impact
                const cheaperOptions = sortedPool
                    .filter(m => m.meal_time.includes(type) && m.price < currentPrice)
                    .sort((a, b) => a.price - b.price);

                if (cheaperOptions.length > 0) {
                    // Swap to the cheapest available option
                    const adoption = cheaperOptions[0];
                    newSchedule[type] = adoption;
                    currentTotal -= (currentPrice - adoption.price);
                    changedSomething = true;

                    // Break inner loop to re-evaluate 'currentTotal' against 'maxPreTaxTotal'
                    break;
                }
            }

            if (!changedSomething) {
                break; // Hard floor reached
            }
            optimizationPasses++;
        }

        // --- PRIORITY NOTES OVERRIDE (GATEKEEPER) ---
        // Check for any "Approved" overrides and apply them forcefully
        const activeOverrides = priorityNotes.filter(n => n.status === "approved" && n.logic);

        activeOverrides.forEach(note => {
            // For Demo: We assume the current view IS the target day (or ignored)
            // In a real app, we'd check if (note.logic.day === currentDay)

            const targetTime = note.logic.time; // "dinner"
            const forcedMeal = note.logic.meal;

            if (forcedMeal && mealPrefs.includes(targetTime)) {
                newSchedule[targetTime] = forcedMeal;
            }
        });

        // SAVE TO CONTEXT (PERSISTANCE)
        updateMealPlan({
            items: newSchedule,
            meta: { budget: maxPreTaxTotal }
        });
    }, [mealPrefs, validMeals, TARGET_DAILY, mealPlan.meta?.budget, isLoaded, priorityNotes]);

    // Calculate Active Total (Excluding Skipped & Past Cutoff)
    // Smart Logic: If the meal time has passed ("I didn't order"), it removes from the *Plan* total to show remaining liability.
    const activeMeals = Object.entries(schedule).filter(([type]) => {
        // 1. Check Skipped
        if (skipped.includes(type)) return false;

        // 2. Check Time Cutoff
        // Logic: Calculate Lock Time (Delivery Time - 30 minutes)
        // If current time >= Lock Time, the meal is "Processed/Locked" and counts as "Spent".
        // It remains in activeMeals so it shows up in the total.

        return true;
    });

    const preTaxTotal = activeMeals.reduce((acc, [_, meal]) => acc + (meal?.price || 0), 0);
    const taxAmount = preTaxTotal * TAX_RATE;
    const finalTotal = preTaxTotal + taxAmount;
    const isOverBudget = finalTotal > TARGET_DAILY + 0.50;

    // Updated Smart Swap Logic
    const handleSwap = (mealType) => {
        // Prepare Context
        const context = {
            profile,
            financials,
            cuisines,
            restaurantPrefs,
            mealPrefs
        };

        const candidates = findSmartSwap(mealType, schedule, context);

        if (!candidates || candidates.length === 0) {
            alert("No other items match your strict Filters (Cuisine/Diet/Allergy). Try enabling 'Wildcard' in settings.");
            return;
        }

        // Cyclic Logic with Monotonic Counter
        // 1. Get current swap count (default 0)
        const currentCount = swapCounts[mealType] || 0;

        // 2. Increment
        const nextCount = currentCount + 1;

        // 3. Select Candidate
        // We pick from candidates using modulo
        // candidates array has length N. 
        // We want to cycle through them.
        const choiceIndex = currentCount % candidates.length;
        // Note: We use currentCount (0-based start) for index selection?
        // If count is 0 -> index 0. 

        const choice = candidates[choiceIndex];

        const newItems = { ...schedule, [mealType]: choice };

        updateMealPlan({
            items: newItems,
            meta: {
                ...mealPlan.meta,
                swapCounts: {
                    ...swapCounts,
                    [mealType]: nextCount
                }
            }
        });
    };

    const handleSkip = (mealType) => {
        const isSkipping = !skipped.includes(mealType);

        if (isSkipping) {
            actions.toggleSkip(mealType);
        } else {
            // Un-skipping (Restoring): Check Budget!
            const mealToRestore = schedule[mealType];
            const potentialPreTax = preTaxTotal + (mealToRestore?.price || 0);
            const potentialFinal = potentialPreTax * (1 + TAX_RATE);

            if (potentialFinal > TARGET_DAILY + 0.50) {
                alert(`Cannot restore meal! \nAdding this meal back($${mealToRestore.price}) pushes you over your $${TARGET_DAILY.toFixed(2)} daily limit.`);
                return;
            }
            actions.toggleSkip(mealType);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Date Navigator */}
            <div className="flex items-center justify-between bg-[#FAFAFA] py-2">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold shadow-sm">
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
                <div className={cn(
                    "px-3 py-1 text-sm font-bold rounded-lg border flex items-center gap-1 transition-colors",
                    isOverBudget
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                    <DollarSign className="w-3.5 h-3.5" />
                    {finalTotal.toFixed(2)}
                    <span className="text-[9px] opacity-70 ml-0.5 font-normal">w/ tax</span>
                </div>
            </div>

            {/* Smart Processing Timer - All Processed State Only */}
            {isAllOrdersLocked && (
                <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 mb-6 flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                        <h3 className="font-bold text-lg">All Orders Processed</h3>
                        <p className="text-sm text-gray-400">You are all set for today.</p>
                    </div>
                </div>
            )}
            {/* Removed Old SmartTimer <SmartTimer ... /> */}

            {/* Empty State / Warning */}
            {validMeals.length === 0 && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    No meals found matching your strict criteria. Try enabling "Wildcard".
                </div>
            )}

            {/* Smart Meal List (Responsive to mealPrefs) */}
            <div className="space-y-4">
                <AnimatePresence>
                    {MEAL_ORDER.filter(type => mealPrefs.includes(type)).map((type, i) => {
                        const meal = schedule[type];
                        const isSkipped = skipped.includes(type);

                        // Time Filter & Lock Logic
                        const now = new Date();
                        // Reset "now" seconds/ms to avoid flickering at the minute mark
                        now.setSeconds(0, 0);

                        // Delivery Info Resolution
                        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        const currentDayStr = days[now.getDay()];
                        const deliveryKey = `${currentDayStr}_${type}`;
                        const scheduleEntry = deliverySchedule[deliveryKey];

                        let deliveryInfo = null;
                        let isLocked = false;
                        let isDelivered = false;

                        if (scheduleEntry) {
                            const addrObj = addresses.find(a => a.id === scheduleEntry.locationId);
                            // Format: "Home (123 Maple St...)"
                            const locationLabel = addrObj ? `${addrObj.label} (${addrObj.address})` : "Unknown Location";

                            // Time Calculations
                            const [h, m] = scheduleEntry.time.split(':').map(Number);

                            // Delivery Window
                            const startTime = new Date(now);
                            startTime.setHours(h, m, 0, 0);
                            const endTime = new Date(startTime);
                            endTime.setHours(h + 1);

                            // Lock Time: 30 minutes BEFORE start time
                            const lockTime = new Date(startTime.getTime() - 30 * 60000);

                            // Check Status
                            isLocked = now >= lockTime;
                            isDelivered = now >= endTime;

                            const fmt = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            const timeWindow = `${fmt(startTime)} - ${fmt(endTime)}`;


                            // DEDICATED TIMER INJECTION
                            // If it's NOT locked yet, we show the countdown.
                            // We use the delivery-based lockTime we just assumed.
                            // We need to pass that lockTime to the component.

                            // NOTE: Since "lockTime" is scoped inside the `if (scheduleEntry)` block,
                            // we need to lift it or ensure we have it for the timer.
                            // Let's refactor slightly to ensure `lockTime` is available for the render check.

                            if (!isLocked && !isSkipped) {
                                // Dynamic Timer Component
                                // We inject it here
                                // Since we are inside the map, we can return the timer element just before the card.
                                // But `lockTime` is only defined inside the if block. 
                                // Let's pull `lockTime` data out.
                            }

                            deliveryInfo = {
                                time: timeWindow,
                                locationLabel: locationLabel,
                                lockTime: lockTime  // Pass it out
                            };
                        } else {
                            // Fallback logic
                            isLocked = false;
                        }

                        return (
                            <React.Fragment key={type}>
                                {/* DEDICATED MEAL TIMER */}
                                {!isSkipped && !isLocked && deliveryInfo?.lockTime && (
                                    <div className="mb-4">
                                        <OrderCountdown
                                            targetDate={deliveryInfo.lockTime}
                                            theme={type} // 'breakfast', 'lunch', 'dinner'
                                        />
                                    </div>
                                )}
                                <MealCard
                                    type={type}
                                    meal={meal}
                                    isSkipped={isSkipped}
                                    onSkip={handleSkip}
                                    onSwap={handleSwap}
                                    deliveryInfo={deliveryInfo}
                                    swapIndex={(swapCounts[type] || 0) % (swapOptionsMap[type] || 1)}
                                    totalSwaps={swapOptionsMap[type] || 1}
                                    isLocked={isLocked}
                                    isDelivered={isDelivered}
                                />
                            </React.Fragment>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Context Summary */}
            <div className="text-center text-xs text-gray-300 font-medium">
                Generating from {validMeals.length} valid options based on your profile.
            </div>
        </div>
    );
};
