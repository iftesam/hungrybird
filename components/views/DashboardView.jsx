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
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { useAppContext } from "@/components/providers/AppProvider";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const DashboardView = ({ isSynced, onSync, onNavigate }) => {
    // Sync logic moved to ProfileView

    const { financials, history, nextOrder, mealPlan, deliverySchedule, addresses, skipped, reviews, actions } = useAppContext();
    const FINANCIALS = financials; // Mapping to keep existing JSX working seamlessly



    const [visibleReviews, setVisibleReviews] = useState(3);
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
        <div className="space-y-8 md:space-y-12 pb-24 md:pb-20">
            {/* ROW 1: Header & Personalized Greeting */}
            <div className="flex flex-col gap-1">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour >= 5 && hour < 12) return "Good morning, Iftesam!";
                            if (hour >= 12 && hour < 17) return "Good afternoon, Iftesam!";
                            return "Hungry evening, Iftesam!";
                        })()}
                    </h1>
                    <p className="text-sm font-medium text-gray-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>
            </div>

            {/* ROW 2: Lock-In / Next Meal Status banner */}
            {!nextOrder?.isHidden && (
                <div className="max-w-4xl mx-auto w-full">
                    {nextOrder ? (
                        <OrderCountdown
                            targetDate={nextOrder.expectedTime}
                            label={nextOrder.label}
                            onAdjust={() => onNavigate && onNavigate("schedule")}
                            theme={nextOrder.type}
                            onDismiss={nextOrder.id ? () => actions.dismissLockIn(nextOrder.id, nextOrder.expectedTime) : null}
                        />
                    ) : (
                        // Skeleton Loader to prevent layout shift/flicker
                        <div className="h-24 w-full bg-gray-100 animate-pulse rounded-2xl mb-8" />
                    )}
                </div>
            )}

            {/* ROW 3: Split Columns (Priority Notes & Order Review) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

                {/* Left Column: Priority Notes */}
                <div className="h-full">
                    <PriorityNotes />
                </div>

                {/* Right Column: Order Review */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border-white/40 h-full flex flex-col space-y-6 relative group"
                >
                    {/* Background Decoration - Wrapped to prevent tooltip clipping */}
                    <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    </div>

                    <div className="flex items-center justify-between relative z-50">
                        <div className="flex items-center gap-3 text-gray-900 leading-none">
                            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Order Review</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Taste Calibration</p>
                            </div>

                            {/* Google Material Design Tooltip */}
                            <div
                                className="relative z-50 ml-1"
                                onMouseEnter={() => setShowHelp(true)}
                                onMouseLeave={() => setShowHelp(false)}
                            >
                                <button
                                    onClick={() => setShowHelp(!showHelp)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                                >
                                    <HelpCircle className="w-4 h-4" strokeWidth={2} />
                                </button>

                                <AnimatePresence>
                                    {showHelp && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[280px] z-[100]"
                                        >
                                            {/* Material Design Tooltip Card */}
                                            <div className="relative bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] p-4 border border-gray-100">
                                                {/* Tooltip arrow */}
                                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

                                                {/* Content */}
                                                <div className="relative z-10">
                                                    <p className="text-xs leading-relaxed text-gray-600">
                                                        <span className="font-semibold text-gray-900">Dislike</span> blocks a dish forever, <span className="font-semibold text-gray-900">Like</span> suggests similar flavors, and <span className="font-semibold text-gray-900">Favorite</span> prioritizes that dish in your schedule.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Google Material Design Info Chip */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-full">
                        <Sparkles className="w-4 h-4 text-purple-600" strokeWidth={2} />
                        <p className="text-sm font-medium text-gray-700">
                            Your feedback directly influences your taste buds.
                        </p>
                    </div>

                    {/* Sync Status Banner */}
                    {(() => {
                        const favoriteCount = Object.values(reviews).filter(r => r.isFavorite).length;
                        const likeCount = Object.values(reviews).filter(r => r.liked === true && !r.isFavorite).length;
                        const dislikeCount = Object.values(reviews).filter(r => r.liked === false).length;

                        if (favoriteCount === 0 && likeCount === 0 && dislikeCount === 0) return null;

                        return (
                            <div
                                onClick={() => onNavigate && onNavigate("taste-profile")}
                                className="bg-zinc-50/50 p-4 rounded-[1.5rem] border border-zinc-100 flex flex-wrap items-center justify-center gap-4 cursor-pointer hover:bg-zinc-100 transition-all duration-300"
                            >
                                {favoriteCount > 0 && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                        <Heart className="w-4 h-4 fill-current" />
                                        <span>{favoriteCount} {favoriteCount === 1 ? 'favorite' : 'favorites'}</span>
                                    </div>
                                )}
                                {likeCount > 0 && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                                    </div>
                                )}
                                {dislikeCount > 0 && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest">
                                        <ThumbsDown className="w-4 h-4" />
                                        <span>{dislikeCount} {dislikeCount === 1 ? 'dislike' : 'dislikes'}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

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
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center animate-in fade-in zoom-in-95 duration-500 h-full max-h-[300px]">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-500 mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">You have reviewed all the food you ordered.</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Kindly order more food to review.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ROW 4: Logistics (Timeline/Map) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-black/5 border-white/40 space-y-8 relative group"
            >
                {/* Background Decoration - Wrapped to prevent clipping */}
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-bl-[140px] -mr-8 -mt-8 transition-transform group-hover:scale-105" />
                </div>

                <div className="flex items-center justify-between relative z-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Logistics</h2>
                        </div>
                    </div>
                    <div className="px-6 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                        Delivered
                    </div>
                </div>

                <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-200/50 shadow-inner">
                    <DeliveryMap status={history[0]?.status} />
                    {/* Integrated Telemetry Overlay */}
                    <div className="absolute bottom-6 right-6 z-20 w-72">
                        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-white/20">
                            <LogisticsTelemetry status={history[0]?.status} deliveryTime={history[0]?.time} />
                        </div>
                    </div>
                </div>

                {/* Timeline & Order Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    {/* Status Timeline */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Delivery Pulse</h3>
                        <div className="space-y-8 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-emerald-500 to-zinc-100" />

                            {[
                                { title: "Order Confirmed", status: "Completed", time: "11:45 AM", current: false },
                                { title: "Driver Picked Up", status: "Completed", time: "12:10 PM", current: false },
                                { title: "On the Way", status: "Completed", time: "12:20 PM", current: false },
                                { title: "Delivered", status: "Arrival", time: history[0]?.time || "12:30 PM", current: true }
                            ].map((step, i) => (
                                <div key={i} className="relative flex gap-6 items-start">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full mt-1.5 relative z-10 border-2",
                                        step.current ? "bg-emerald-500 border-white shadow-[0_0_10px_#10b981]" : "bg-white border-emerald-500"
                                    )} />
                                    <div>
                                        <div className={cn("text-base font-bold", step.current ? "text-gray-900" : "text-gray-500")}>{step.title}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{step.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details Mini-Card - dynamic from history[0] */}
                    {history.length > 0 && (
                        <div className="bg-zinc-50/50 rounded-[2.5rem] p-8 border border-gray-100 flex flex-col justify-between group overflow-hidden relative">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-[100px] pointer-events-none" />

                            <div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-8">Summary</h3>
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                        <Utensils className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900">{history[0].restaurant}</h3>
                                        <p className="text-sm font-medium text-gray-500">{history[0].items[0]}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-200/50">
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Base</span>
                                    <span>${(history[0].total * 0.8).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Fees</span>
                                    <span>${(history[0].total * 0.2).toFixed(2)}</span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Total</span>
                                    <span className="text-2xl font-black text-emerald-600">${history[0].total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ROW 5: Analytics (Today's Buying Power & Fuel) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Today's Avg per Meal */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border-white/40"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-gray-500">
                            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider">Today's Avg. Per Meal</span>
                        </div>
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>

                    {(() => {
                        const allItems = Object.values(mealPlan.items || {}).flat();
                        const todaysMeals = allItems.filter(m => m && m.name && !m.name.includes("Skip"));
                        const totalCost = todaysMeals.reduce((sum, meal) => sum + meal.price, 0);
                        const avgPerMeal = todaysMeals.length > 0 ? totalCost / todaysMeals.length : 0;
                        const percentage = (avgPerMeal / 30) * 100; // Assuming 30 is a high reference

                        return (
                            <div className="space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">${avgPerMeal.toFixed(2)}</span>
                                    <span className="text-sm font-bold text-gray-400">/ meal</span>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>

                {/* Daily Cap */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border-white/40"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-gray-500">
                            <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider">Today's Buying Power</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
                                ${(mealPlan.meta?.authorizedBudgets?.[new Date().toDateString()] || FINANCIALS.dailyCap).toFixed(2)}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-wider">Time Remaining</span>
                                <span className="text-gray-900">8h 12m</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "65%" }}
                                    className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div >
    );
};
