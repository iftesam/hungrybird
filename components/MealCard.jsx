import React from "react";
import { CheckCircle2, XCircle, PlusCircle, RefreshCw, Lock, Clock, MapPin, AlertTriangle, Users, Truck, Info, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const MealCard = ({ meal, type, isSkipped, onSkip, onSwap, onRemove, onAddGuest, deliveryInfo, swapIndex = 0, totalSwaps = 5, isLocked = false, isDelivered = false, role = "host", isSplitRestaurant = false, logistics }) => {
    if (!meal) return null;

    const isGuest = role === "guest";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
                opacity: isSkipped ? 0.6 : 1,
                y: 0,
                scale: isSkipped ? 0.98 : 1
            }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
                "group relative rounded-2xl border transition-all overflow-hidden",
                isLocked
                    ? "bg-gray-50 border-gray-200"
                    : isSkipped
                        ? "bg-gray-50 border-dashed border-gray-200"
                        : isGuest
                            ? "bg-white border-indigo-100 shadow-sm"
                            : "bg-white border-gray-100 shadow-sm hover:shadow-md"
            )}
        >
            {/* Guest Badge */}
            {isGuest && (
                <div className="absolute top-4 left-4 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white">Guest</span>
                    </div>
                </div>
            )}

            {/* Delivered Overlay */}
            <AnimatePresence>
                {isDelivered && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-4 right-4 z-30"
                    >
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Delivered Today</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Locked Overlay (Only if NOT Delivered) */}
            <AnimatePresence>
                {isLocked && !isDelivered && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-4 right-4 z-30"
                    >
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl backdrop-blur-md">
                            <Lock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Confirmed & Locked</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <div className={cn("p-4 pb-2 relative transition-all duration-500", isLocked && "grayscale-[0.4] opacity-80")}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isGuest ? "Guest Item" : type}</span>
                        {!isSkipped && (
                            <>
                                <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
                                    isGuest ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}>
                                    {meal.cuisine}
                                </span>
                                {meal.tags.includes("Top Tier") && !isGuest && (
                                    <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Top Tier</span>
                                )}
                            </>
                        )}
                        {isSkipped && <span className="text-[10px] font-bold text-gray-400">SKIPPING</span>}
                    </div>

                    {/* Action Buttons (Conditioned on Lock/Delivered) */}
                    <div className="flex gap-2 items-center">
                        {!isLocked && !isDelivered && (
                            <>
                                {!isSkipped && (
                                    <>
                                        <div className="flex items-center justify-center w-[36px] h-[36px] bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group/swaps">
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover/swaps:opacity-100 transition-opacity" />
                                            <AnimatePresence mode="popLayout" initial={false}>
                                                <motion.span
                                                    key={swapIndex}
                                                    initial={{ y: 15, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -15, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                    className="text-[10px] font-black text-gray-900 absolute z-10"
                                                >
                                                    {swapIndex + 1}<span className="text-gray-300 mx-0.5">/</span>{totalSwaps}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>

                                        <button
                                            onClick={() => onSwap && onSwap(type)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 border border-gray-100 hover:bg-black hover:text-white hover:border-black transition-all active:scale-95"
                                            title="Smart Swap"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>

                                        {!isGuest && !isLocked && (
                                            <button
                                                onClick={() => onSkip && onSkip(type)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all active:scale-95 group/skip"
                                                title="Skip Meal"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {isGuest && (
                                            <button
                                                onClick={() => onRemove && onRemove()}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all active:scale-95"
                                                title="Remove Guest"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {!isGuest && (
                                            <motion.button
                                                whileHover={{ scale: 1.02, backgroundColor: "#000" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onAddGuest && onAddGuest()}
                                                className="h-10 px-4 flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 border border-white/10 group/btn overflow-hidden relative"
                                                title="Add Guest Meal"
                                            >
                                                {/* Button Glow Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                                                <div className="relative flex items-center justify-center">
                                                    {/* Sharp Custom Plus Icon */}
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className="w-4 h-4 text-emerald-400 group-hover/btn:rotate-90 transition-transform duration-500 ease-out"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    >
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                    <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-100">Add Guest</span>
                                            </motion.button>
                                        )}
                                    </>
                                )}

                                {isSkipped && (
                                    <button
                                        onClick={() => onSkip && onSkip(type)}
                                        className="h-9 px-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 font-bold text-[10px] uppercase tracking-wider"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Restore
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-start mb-2 px-4">
                    <div className={cn("flex-1 mr-4", isSkipped && "opacity-50")}>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{meal.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{meal.vendor?.name || "Unknown Vendor"}</p>
                    </div>

                    {/* Highlighted Price & Calories */}
                    <div className={cn("text-right", isSkipped && "line-through text-gray-300 opacity-50")}>
                        <div className="font-bold text-xl text-gray-900 leading-none">${meal.price?.toFixed(2)}</div>
                        <div className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                            {meal.nutrition?.cals} cals
                        </div>
                    </div>
                </div>

                {/* Split Restaurant Warning */}
                {isSplitRestaurant && (
                    <div className="mx-4 mb-3 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700 leading-tight">
                            Split Restaurant Choice: This guest meal incurs a separate delivery fee.
                        </span>
                    </div>
                )}

                {/* Google-Style Logistics Card */}
                {!isLocked && !isSkipped && logistics && (
                    <div className={cn(
                        "mx-4 mb-4 p-4 rounded-xl border transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]",
                        logistics.mode === "green" ? "bg-emerald-50/40 border-emerald-100" :
                            logistics.mode === "yellow" ? "bg-amber-50/40 border-amber-100" :
                                "bg-red-50/40 border-red-100"
                    )}>

                        {/* 1. Header with Urgency Signal */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                    logistics.mode === "green" ? "bg-emerald-100 text-emerald-700" :
                                        logistics.mode === "yellow" ? "bg-amber-100 text-amber-700 hover:animate-pulse cursor-default" :
                                            "bg-red-100 text-red-700"
                                )}>
                                    {logistics.mode === "green" && <Sparkles className="w-3 h-3" />}
                                    {logistics.mode === "yellow" && <TrendingUp className="w-3 h-3" />}
                                    {logistics.mode === "red" && <AlertTriangle className="w-3 h-3" />}

                                    {logistics.mode === "green" ? "BEST PRICE" :
                                        logistics.mode === "yellow" ? "GAINING MOMENTUM" :
                                            "SURGE PRICING"}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    "text-lg font-black leading-none",
                                    logistics.mode === "green" ? "text-emerald-700" :
                                        logistics.mode === "yellow" ? "text-amber-700" :
                                            "text-red-700"
                                )}>
                                    ${logistics.deliveryFee.toFixed(2)}
                                </div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Delivery Fee</div>
                            </div>
                        </div>

                        {/* 2. Google Material Density Meter */}
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                    Neighborhood Density
                                </span>
                                <span className="text-xs font-bold text-gray-900">
                                    {logistics.neighbors} <span className="text-gray-400 font-normal">
                                        {logistics.neighbors < 4 ? `/ 4 needed for $1.99` :
                                            logistics.neighbors < 10 ? `/ 10 needed for FREE` :
                                                "Neighbors (Unlocked)"}
                                    </span>
                                </span>
                            </div>

                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden relative">
                                {/* Markers */}
                                <div className="absolute left-[33.3%] top-0 bottom-0 w-0.5 bg-white mix-blend-overlay z-10 opacity-50" />
                                <div className="absolute left-[83.3%] top-0 bottom-0 w-0.5 bg-white mix-blend-overlay z-10 opacity-50" />

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (logistics.neighbors / 12) * 100)}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                                        logistics.mode === "green" ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                                            logistics.mode === "yellow" ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                                "bg-gradient-to-r from-red-400 to-red-500"
                                    )}
                                />
                            </div>

                            {/* Explicit Steps */}
                            {/* Explicit Steps */}
                            <div className="relative h-4 text-[9px] font-medium text-gray-400 pt-1">
                                <span className={cn("absolute left-0", logistics.mode === 'red' && "font-bold text-red-600")}>Solo ($7.99)</span>
                                <span className={cn("absolute left-[33.3%] -translate-x-1/2", logistics.mode === 'yellow' && "font-bold text-amber-600")}>Group ($1.99)</span>
                                <span className={cn("absolute right-0", logistics.mode === 'green' && "font-bold text-emerald-600")}>Eco (Free)</span>
                            </div>
                        </div>

                        {/* 3. Narrative Insight */}
                        {logistics.description && (
                            <div className="flex gap-2.5 items-start mt-2 pt-2 border-t border-black/5">
                                <div className={cn(
                                    "p-1 rounded-md shrink-0 mt-0.5",
                                    logistics.mode === "green" ? "bg-emerald-100 text-emerald-600" :
                                        logistics.mode === "yellow" ? "bg-amber-100 text-amber-600" :
                                            "bg-red-100 text-red-600"
                                )}>
                                    <Info className="w-3 h-3" />
                                </div>
                                <p className="text-[11px] leading-snug text-gray-600">
                                    <span className={cn("font-bold block text-xs mb-0.5",
                                        logistics.mode === "green" ? "text-emerald-800" :
                                            logistics.mode === "yellow" ? "text-amber-800" :
                                                "text-red-800"
                                    )}>
                                        {logistics.description.split(/:(.+)/)[0]}
                                    </span>
                                    {logistics.description.split(/:(.+)/)[1]}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Delivery Info Section (Enhanced) */}
                {!isSkipped && deliveryInfo && (
                    <div className="mx-4 mt-2 px-3 py-3 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                            {/* Time & Location */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex flex-col gap-0.5 flex-1 max-w-[120px]">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{deliveryInfo.time}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium pl-5 whitespace-nowrap">Order Arrival</span>
                                </div>

                                <div className="w-px bg-gray-200 self-stretch mx-1" />

                                <div className="flex flex-col gap-0.5 flex-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="truncate">{deliveryInfo.locationLabel.split('(')[0].trim()}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium pl-5 truncate">
                                        {deliveryInfo.locationLabel.match(/\((.*?)\)/)?.[1] || "Address"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">
                                    Locks @ {deliveryInfo.lockTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* Optional drink info */}
                        {meal.includes_drink && (
                            <div className="mt-1 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Drink Included</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Always Visible Details */}
            {!isSkipped && (
                <div className={cn("px-4 pb-4", (isLocked && !isDelivered) && "grayscale opacity-90")}>
                    {/* Description */}
                    <p className="text-sm text-gray-600 italic leading-relaxed mb-4">
                        "{meal.description}"
                    </p>

                    {/* Macro Visualization */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                            <div className="text-xs font-bold text-gray-900">{meal.nutrition.protein_g}g</div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-wide">Protein</div>
                            <div className="h-1 w-full bg-gray-200 mt-1 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (meal.nutrition.protein_g / 50) * 100)}%` }} />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                            <div className="text-xs font-bold text-gray-900">{meal.nutrition.carbs_g}g</div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-wide">Carbs</div>
                            <div className="h-1 w-full bg-gray-200 mt-1 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400" style={{ width: `${Math.min(100, (meal.nutrition.carbs_g / 80) * 100)}%` }} />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                            <div className="text-xs font-bold text-gray-900">{meal.nutrition.fat_g}g</div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-wide">Fat</div>
                            <div className="h-1 w-full bg-gray-200 mt-1 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400" style={{ width: `${Math.min(100, (meal.nutrition.fat_g / 40) * 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients & Diet */}
                    <div className="flex flex-wrap gap-2">
                        {meal.ingredients && meal.ingredients.map(ing => (
                            <span key={ing} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-600 font-medium">
                                {ing}
                            </span>
                        ))}
                        {meal.dietary?.gluten_free && (
                            <span className="text-[10px] bg-amber-50 border border-amber-100 px-2 py-1 rounded-full text-amber-700 font-bold">Gluten Free</span>
                        )}
                        {meal.dietary?.vegan && (
                            <span className="text-[10px] bg-green-50 border border-green-100 px-2 py-1 rounded-full text-green-700 font-bold">Vegan</span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
