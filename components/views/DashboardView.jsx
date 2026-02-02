import React, { useState, useEffect } from "react";
import { ArrowUpRight, DollarSign, CreditCard, Clock, Utensils, Activity, Zap, Heart, Flame, History, Package, Info, ThumbsUp, ThumbsDown, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DeliveryMap } from "@/components/DeliveryMap";
import { LogisticsTelemetry } from "@/components/LogisticsTelemetry";
import { OrderCountdown } from "@/components/OrderCountdown";
import { OrderHistoryItem } from "@/components/OrderHistoryItem"; // Keeping specifically for HistoryView or unused
import { CheckCircle2, Circle } from "lucide-react";
import { MealCard } from "@/components/MealCard";
import { OrderReviewCard } from "@/components/OrderReviewCard";
import { PriorityNotes } from "@/components/PriorityNotes";
import { useAppContext } from "@/components/providers/AppProvider";

export const DashboardView = ({ isSynced, onSync, onNavigate }) => {
    // Sync logic moved to ProfileView

    const { financials, history, nextOrder, mealPlan, deliverySchedule, addresses, skipped, reviews } = useAppContext();
    const FINANCIALS = financials; // Mapping to keep existing JSX working seamlessly



    const [visibleReviews, setVisibleReviews] = useState(5);
    const [recentlyReviewed, setRecentlyReviewed] = useState(new Set());
    const [showHelp, setShowHelp] = useState(false);
    const previousReviews = React.useRef(reviews); // Initialize with current reviews

    // Effect: Detect NEW reviews (transition from unreviewed -> reviewed) and add to grace period
    React.useEffect(() => {
        const newlyReviewedMeals = [];

        Object.keys(reviews).forEach(mealName => {
            const currentReview = reviews[mealName];
            const previousReview = previousReviews.current[mealName];

            const isCurrentlyReviewed = currentReview && (currentReview.liked === true || currentReview.liked === false);
            const wasPreviouslyReviewed = previousReview && (previousReview.liked === true || previousReview.liked === false);

            // Only add if this is a NEW review (transition from unreviewed to reviewed)
            if (isCurrentlyReviewed && !wasPreviouslyReviewed) {
                newlyReviewedMeals.push(mealName);
            }
        });

        // Update the grace period set with newly reviewed meals
        if (newlyReviewedMeals.length > 0) {
            setRecentlyReviewed(prev => {
                const next = new Set(prev);
                newlyReviewedMeals.forEach(meal => next.add(meal));
                return next;
            });
        }

        // Update ref for next comparison
        previousReviews.current = { ...reviews };
    }, [reviews]);

    // Filter Logic: Unique, Unreviewed (or Grace Period), Non-Skipped Meals
    const unreviewedMeals = React.useMemo(() => {
        const seen = new Set();
        return history.filter(order => {
            // 1. Skip check
            if (order.items[0].includes("Skip") || order.restaurant === "Planned Skip") return false;

            const mealName = order.items[0];

            // 2. Review check 
            // Show if: NOT reviewed OR (Reviewed AND In Grace Period)
            const review = reviews[mealName];
            const isReviewed = review && (review.liked === true || review.liked === false);

            if (isReviewed && !recentlyReviewed.has(mealName)) return false;

            // 3. Deduplicate (Keep most recent)
            if (seen.has(mealName)) return false;
            seen.add(mealName);

            return true;
        });
    }, [history, reviews, recentlyReviewed]);

    const handleRemove = (mealName) => {
        setRecentlyReviewed(prev => {
            const next = new Set(prev);
            next.delete(mealName);
            return next;
        });
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-24 md:pb-20">
            {/* 1. Header & Sync Status */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </h1>
                    <p className="text-sm md:text-base text-gray-500">Financials, Fuel & Logistics.</p>
                </div>
                {/* Health Connect moved to ProfileSettings */}
            </div>

            {/* 2. Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Today's Avg per Meal */}
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Today's Avg. Per Meal</span>
                    </div>
                    {(() => {
                        const todaysMeals = Object.values(mealPlan.items || {}).filter(m => m && m.name && !m.name.includes("Skip"));
                        const totalCost = todaysMeals.reduce((sum, meal) => sum + meal.price, 0);
                        const avgPerMeal = todaysMeals.length > 0 ? totalCost / todaysMeals.length : 0;
                        return <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">${avgPerMeal.toFixed(2)}</div>;
                    })()}
                </div>

                {/* Daily Cap */}
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Today's Buying Power</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">${FINANCIALS.dailyCap.toFixed(2)}</div>
                    <div className="mt-4 text-xs font-medium text-gray-500">
                        Resets in 8h 12m
                    </div>
                </div>
            </div>

            {/* NEXT ORDER COUNTDOWN */}
            {nextOrder ? (
                <OrderCountdown
                    targetDate={nextOrder.expectedTime}
                    label={nextOrder.label}
                    onAdjust={() => onNavigate && onNavigate("schedule")}
                    theme={nextOrder.type}
                />
            ) : (
                // Skeleton Loader to prevent layout shift/flicker
                <div className="h-24 w-full bg-gray-100 animate-pulse rounded-2xl mb-8" />
            )}

            {/* 3. Live Context: Map + Suggestions */}
            {/* 3. Live Context: Map + Suggestions OR Pending Meal Focus */}
            <div className="space-y-8">
                {/* 
                    If we have a valid pending meal (Lock-in) that is NOT delivered yet, we prioritize showing it.
                    We get the meal from the plan using nextOrder.type.
                */}
                {/* Up Next Meal Card removed as per user request */}

                {/* Logistics Column (Map + History) - ONLY SHOW IF NO URGENT LOCK IN? OR ALWAYS? 
                    User said "only show the 1". So let's hide the details if we are in urgent mode?
                    Or just push them down. Pushing them down is safer UX.
                */}

                {/* Logistics Column (Map + History) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold">Logistics</h2>
                            {/* changed from pulsating red Live */}
                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                Review
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                            Delivered
                        </span>
                    </div>

                    <div className="relative">
                        <DeliveryMap status={history[0]?.status} />
                        {/* Integrated Telemetry Overlay */}
                        <div className="absolute top-4 right-4 z-20 w-64">
                            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20">
                                <LogisticsTelemetry status={history[0]?.status} deliveryTime={history[0]?.time} />
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Timeline */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Delivery Timeline</h3>
                            <div className="space-y-4 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-emerald-100" />

                                {/* Step 1: Confirmed */}
                                <div className="relative flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white relative z-10 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Order Confirmed</div>
                                        <div className="text-xs text-emerald-600 font-bold">Completed</div>
                                    </div>
                                </div>
                                {/* Step 2: Picked Up */}
                                <div className="relative flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white relative z-10 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Driver Picked Up</div>
                                        <div className="text-xs text-emerald-600 font-bold">Completed</div>
                                    </div>
                                </div>
                                {/* Step 3: On The Way */}
                                <div className="relative flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white relative z-10 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">On the Way</div>
                                        <div className="text-xs text-emerald-600 font-bold">Completed</div>
                                    </div>
                                </div>
                                {/* Step 4: Delivered */}
                                <div className="relative flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white relative z-10 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Delivered</div>
                                        {/* Use history[0] time if available, or fallback */}
                                        <div className="text-xs text-gray-500">
                                            {history[0]?.time ? `Arrived ${history[0].time}` : "Arrived 12:30 PM"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Details Mini-Card - dynamic from history[0] */}
                        {history.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Last Order Details</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                            <Utensils className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">{history[0].restaurant}</h3>
                                            <p className="text-xs text-gray-500">{history[0].items[0]}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Subtotal</span>
                                        <span>${(history[0].total * 0.8).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Tax & Fees</span>
                                        <span>${(history[0].total * 0.2).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>${history[0].total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SPLIT SECTION: Order Review & Sticky Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

                        {/* LEFT COLUMN: Order Review */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 leading-none">
                                <History className="w-5 h-5 text-purple-600" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Order Review</h3>

                                {/* Tooltip Integrated Next to Title */}
                                <div
                                    className="relative z-50 ml-1"
                                    onMouseEnter={() => setShowHelp(true)}
                                    onMouseLeave={() => setShowHelp(false)}
                                >
                                    <button
                                        onClick={() => setShowHelp(!showHelp)}
                                        className="text-gray-400 hover:text-black transition-colors focus:outline-none flex items-center justify-center"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5" />
                                    </button>

                                    <AnimatePresence>
                                        {showHelp && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[280px] z-[100] md:left-0 md:translate-x-0"
                                            >
                                                <div className="relative p-5 bg-black/90 backdrop-blur-xl text-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group">
                                                    {/* Glow Effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                                                    {/* Arrow */}
                                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-l border-t border-white/10 rotate-45 md:left-4 md:translate-x-0" />

                                                    <div className="relative z-10 space-y-3">
                                                        <p className="text-xs leading-relaxed font-light text-gray-300">
                                                            <span className="font-bold text-white">Dislike</span> blocks a dish forever, <span className="font-bold text-white">like</span> helps us find you similar flavors, and <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-500">favorite</span> makes sure your favorites keep coming back.
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* New Description Banner */}
                            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">Help our system learn your taste buds!</span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-snug">
                                    Your feedback helps us schedule meals you'll love.
                                </p>
                            </div>

                            {/* Review List (Last 5 orders) */}
                            {unreviewedMeals.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {unreviewedMeals.slice(0, visibleReviews).map(order => (
                                            <OrderReviewCard
                                                key={order.id}
                                                order={order}
                                                onRemove={() => handleRemove(order.items[0])}
                                            />
                                        ))}
                                    </div>

                                    {visibleReviews < unreviewedMeals.length && (
                                        <button
                                            onClick={() => setVisibleReviews(prev => prev + 5)}
                                            className="w-full py-3 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            View More
                                            <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">{unreviewedMeals.length - visibleReviews}</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in zoom-in-95 duration-500">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-500 mb-3">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">You have reviewed all the food you ordered.</p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed">Kindly order more food to review.</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Priority Notes */}
                        <PriorityNotes />

                    </div>
                </div>
            </div>
        </div>
    );
};
