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
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

import { OrderCountdown } from "@/components/OrderCountdown";
import { findSmartSwap } from "@/utils/SwapLogistics";
import { MealCard } from "@/components/MealCard";
import { BudgetModal } from "@/components/BudgetModal";

// --- SMART TIMER HOOK REMOVED (Logic moved to per-meal basis) ---

// --- RICH MEAL CARD COMPONENT ---


export const ScheduleView = () => {
    const { profile, cuisines, mealPrefs, restaurantPrefs, financials, addresses, skipped, actions, deliverySchedule, mealPlan, isLoaded, isConfigured, missingConfig, priorityNotes, reviews } = useAppContext();

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
    const TARGET_DAILY = profile.dailyAllowance || 60; // Use setting directly as source of truth

    // --- SMART FILTERING ENGINE ---
    const validMeals = useMemo(() => {
        // Strict Mode: If no cuisines selected, show everything (or show nothing? Let's assume everything if empty selection, but user said 'strict').
        // AppProvider initializes cuisines with default.
        if (cuisines.length === 0) return MEALS;

        return MEALS.filter(meal => {
            // 1. Review Check - Exclude Disliked Meals
            if (reviews[meal.name]?.liked === false) return false;

            // 2. Cuisine Check
            const activeCuisines = cuisines.map(c => CUISINE_MAP[c]);
            // Check both strict cuisine field and tags for flexibility
            // We use optional chaining and strict matching
            const matchesCuisine = activeCuisines.some(c =>
                c && (meal.cuisine.includes(c) || meal.tags.includes(c))
            );
            if (!matchesCuisine) return false;

            // 3. Strict Dietary & Allergy Check

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

            // 4. Restaurant Preference Check
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
    }, [profile, cuisines, restaurantPrefs, reviews]);

    // Simplified destructuring (moved to lower block where needed)

    // Alias explicitly for clarity
    const schedule = mealPlan.items || {};
    // const swapIndices = mealPlan.meta?.swapIndices || {}; 
    // We now use swapCounts (monotonic increment)
    const swapCounts = mealPlan.meta?.swapCounts || {};

    // --- DYNAMIC OPTION COUNTING ---
    // Calculate how many swap options exist for each slot (Current + Alternatives)
    const swapOptionsMap = useMemo(() => {
        const map = {};
        const context = { profile, financials, cuisines, restaurantPrefs, mealPrefs };
        MEAL_ORDER.forEach(type => {
            const candidates = findSmartSwap(type, mealPlan.items, context);
            map[type] = candidates?.length || 1;

            // Also calculate for each specific item in case roles differ
            const itemsInSlot = mealPlan.items[type] || [];
            itemsInSlot.forEach(item => {
                if (item.role === "guest") {
                    const host = itemsInSlot.find(i => i.role === "host") || itemsInSlot[0];
                    const guestCandidates = findSmartSwap(type, mealPlan.items, { ...context, requiredRestaurant: host.vendor.name });
                    map[item.id] = guestCandidates?.length || 1;
                } else {
                    map[item.id] = map[type];
                }
            });
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
        // Now with Review-Aware Scoring!
        const getMealScore = (meal) => {
            const review = reviews[meal.name];
            if (!review) return 1; // Base score for unreviewed
            if (review.isFavorite) return 10; // Highest priority
            if (review.liked === true) return 5; // Medium priority
            if (review.liked === false) return 0; // Should be filtered out already
            return 1;
        };

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
                    // Exclude dislikes
                    if (reviews[m.name]?.liked === false) return false;

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

            // 5. REVIEW-AWARE SELECTION
            // First, try to find favorites that fit the budget
            const favorites = candidates.filter(m => reviews[m.name]?.isFavorite);
            if (favorites.length > 0) {
                // Sort favorites by price proximity
                favorites.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
                const limit = Math.min(favorites.length, 3);
                return favorites[Math.floor(Math.random() * limit)];
            }

            // Next, try liked meals
            const liked = candidates.filter(m => reviews[m.name]?.liked === true);
            if (liked.length > 0) {
                liked.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
                const limit = Math.min(liked.length, 5);
                return liked[Math.floor(Math.random() * limit)];
            }

            // Finally, fall back to unreviewed meals
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
        // Transform the generated items into the new array-based structure
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

        updateMealPlan({
            items: arrayBasedItems,
            meta: {
                ...mealPlan.meta,
                budget: maxPreTaxTotal
            }
        });
    }, [mealPrefs, validMeals, TARGET_DAILY, mealPlan.meta?.budget, isLoaded, priorityNotes, reviews]);

    const [budgetModal, setBudgetModal] = useState({ isOpen: false, data: null });

    const items = mealPlan.items || {};
    const preTaxTotal = Object.entries(items).reduce((acc, [type, slotItems]) => {
        if (skipped.includes(type)) return acc;
        return acc + (slotItems?.reduce((slotAcc, item) => slotAcc + (item?.price || 0), 0) || 0);
    }, 0);
    const taxAmount = preTaxTotal * TAX_RATE;
    const finalTotal = preTaxTotal + taxAmount;
    const isOverBudget = finalTotal > (mealPlan.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY) + 0.50;

    const { updateMealPlan, addGuestMeal, removeGuestMeal, swapSpecificMeal, toggleSkip } = actions;

    const handleSwap = (slotId, itemId) => {
        swapSpecificMeal(slotId, itemId);
    };

    const handleAddGuest = (slotId) => {
        // Budget Check
        const items = mealPlan.items[slotId] || [];
        if (items.length === 0) return;

        const hostItem = items[0];
        const newTotal = finalTotal + (hostItem.price * (1 + TAX_RATE));
        const currentLimit = mealPlan.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY;

        if (newTotal > currentLimit + 0.50) {
            setBudgetModal({
                isOpen: true,
                data: { slotId, currentLimit, newTotal, mealCost: hostItem.price }
            });
        } else {
            addGuestMeal(slotId);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Date Navigator (State of the Art) */}
            <div className="flex flex-col gap-4 bg-[#FAFAFA] py-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Schedule</h1>
                    <div className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors",
                        isOverBudget
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="text-sm">{finalTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Today's Date Display - State of the Art */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="relative overflow-hidden"
                >
                    <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-3xl p-6 shadow-2xl shadow-orange-500/20">
                        {/* Animated shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />

                        {/* Decorative pattern overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-2 left-4 w-20 h-20 border-2 border-white rounded-full" />
                            <div className="absolute bottom-2 right-8 w-16 h-16 border-2 border-white rounded-full" />
                            <div className="absolute top-1/2 right-1/4 w-12 h-12 border-2 border-white rounded-full" />
                        </div>

                        {/* Subtle glow orbs */}
                        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-red-300/20 rounded-full blur-3xl" />

                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {/* "Today" label with pulse */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="flex items-center gap-2"
                            >
                                <motion.div
                                    className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                    animate={{
                                        opacity: [1, 0.5, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <span className="text-sm font-bold text-white/90 uppercase tracking-widest drop-shadow-lg">
                                    Today
                                </span>
                            </motion.div>

                            {/* Separator */}
                            <div className="w-px h-6 bg-white/40" />

                            {/* Full date with gradient text */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0, duration: 0.15 }}
                            >
                                <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
                                    {new Date().toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }).replace(/(\d+)/, (match) => {
                                        const num = parseInt(match);
                                        const suffix = [1, 21, 31].includes(num) ? 'st' : [2, 22].includes(num) ? 'nd' : [3, 23].includes(num) ? 'rd' : 'th';
                                        return `${num}${suffix}`;
                                    })}
                                </span>
                            </motion.div>

                            {/* Smart Budget Indicator */}
                            <div className="hidden md:flex ml-auto items-center gap-3">
                                <div className="w-px h-6 bg-white/20" />
                                <motion.div
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl border flex items-center gap-2.5 backdrop-blur-md transition-all duration-500",
                                        mealPlan.meta?.authorizedBudgets?.[new Date().toDateString()]
                                            ? "bg-emerald-500/20 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                            : "bg-white/10 border-white/20"
                                    )}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60 mb-0.5">Daily Limit</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xl font-black text-white">
                                                ${(mealPlan.meta?.authorizedBudgets?.[new Date().toDateString()] || TARGET_DAILY).toFixed(2)}
                                            </span>
                                            {mealPlan.meta?.authorizedBudgets?.[new Date().toDateString()] && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Visual Budget Graph (Mini) */}
                                    <div className="flex items-end gap-1 h-6 pt-1">
                                        {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h * 100}%` }}
                                                className="w-1 bg-white/30 rounded-full"
                                                transition={{ delay: 0.5 + (i * 0.1) }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
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
            <div className="space-y-8">
                <AnimatePresence>
                    {MEAL_ORDER.filter(type => mealPrefs.includes(type)).map((type, i) => {
                        const slotItems = items[type] || [];
                        const isSkipped = skipped.includes(type);

                        // Time Filter & Lock Logic
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
                            const lockTime = new Date(startTime.getTime() - 30 * 60000);

                            isLocked = now >= lockTime;
                            isDelivered = now >= endTime;
                            const fmt = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            deliveryInfo = {
                                time: `${fmt(startTime)} - ${fmt(endTime)}`,
                                locationLabel: locationLabel,
                                lockTime: lockTime
                            };
                        }

                        return (
                            <React.Fragment key={type}>
                                {/* DEDICATED MEAL TIMER */}
                                {!isSkipped && !isLocked && deliveryInfo?.lockTime && (
                                    <div className="mb-4">
                                        <OrderCountdown
                                            targetDate={deliveryInfo.lockTime}
                                            theme={type}
                                        />
                                    </div>
                                )}

                                <div className="space-y-3 relative group/slot">
                                    {/* Advanced Connector Line */}
                                    {slotItems.length > 1 && (
                                        <div className="absolute left-[20px] top-[80px] bottom-[60px] w-1 z-0 pointer-events-none">
                                            {/* Glow Background */}
                                            <div className="absolute inset-0 bg-indigo-500/10 blur-sm rounded-full" />
                                            {/* Main Gradient Line */}
                                            <div className="h-full w-full bg-gradient-to-b from-gray-200 via-indigo-100 to-gray-200 rounded-full relative">
                                                {/* Pulsing Light on Connector */}
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
                                                    swapIndex={(mealPlan.meta?.swapCounts?.[meal.id] || 0) % (swapOptionsMap[meal.id] || 1)}
                                                    totalSwaps={swapOptionsMap[meal.id] || 1}
                                                    isLocked={isLocked}
                                                    isDelivered={isDelivered}
                                                    role={meal.role}
                                                    isSplitRestaurant={isSplitRestaurant}
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

            {/* Context Summary */}
            <div className="text-center text-xs text-gray-300 font-medium pb-8">
                Generating from {validMeals.length} valid options based on your profile.
            </div>

            <BudgetModal
                isOpen={budgetModal.isOpen}
                onClose={() => setBudgetModal({ isOpen: false, data: null })}
                onConfirm={() => {
                    actions.authorizeBudgetIncrease(new Date().toDateString(), budgetModal.data.newTotal);
                    addGuestMeal(budgetModal.data.slotId);
                    setBudgetModal({ isOpen: false, data: null });
                }}
                currentLimit={budgetModal.data?.currentLimit || 0}
                newTotal={budgetModal.data?.newTotal || 0}
                mealCost={budgetModal.data?.mealCost || 0}
            />
        </div>
    );
};
