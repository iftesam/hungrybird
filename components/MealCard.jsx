import React from "react";
import { CheckCircle2, XCircle, PlusCircle, RefreshCw, Lock, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const MealCard = ({ meal, type, isSkipped, onSkip, onSwap, deliveryInfo, swapIndex = 0, totalSwaps = 5, isLocked = false, isDelivered = false }) => {
    if (!meal) return null;

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
                    ? "bg-gray-50 border-gray-200" // Locked/Delivered Base Style (No Grayscale on root)
                    : isSkipped
                        ? "bg-gray-50 border-dashed border-gray-200"
                        : "bg-white border-gray-100 shadow-sm hover:shadow-md"
            )}
        >
            {/* Delivered Overlay */}
            {isDelivered && (
                <div className="absolute top-2 right-2 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Delivered</span>
                </div>
            )}

            {/* Locked Overlay (Only if NOT Delivered) */}
            {isLocked && !isDelivered && (
                <div className="absolute top-2 right-2 z-10 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                    <Lock className="w-3 h-3" />
                    <span>Delivery in Progress</span>
                </div>
            )}
            {/* Header Section */}
            <div className={cn("p-4 pb-2", isLocked && "grayscale opacity-90")}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{type}</span>
                        {!isSkipped && (
                            <>
                                <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
                                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                                )}>
                                    {meal.cuisine}
                                </span>
                                {meal.tags.includes("Top Tier") && (
                                    <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Top Tier</span>
                                )}
                            </>
                        )}
                        {isSkipped && <span className="text-[10px] font-bold text-gray-400">SKIPPING</span>}
                    </div>

                    {/* Action Buttons (Conditioned on Lock/Delivered) */}
                    <div className="flex gap-2">
                        {!isLocked && !isDelivered && (
                            <>
                                <button
                                    onClick={() => onSkip && onSkip(type)}
                                    className={cn(
                                        "p-1.5 rounded-full transition-colors",
                                        isSkipped
                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" // Restore Style
                                            : "bg-red-50 text-red-500 hover:bg-red-100" // Skip Style
                                    )}
                                    title={isSkipped ? "Restore Meal" : "Skip Meal"}
                                >
                                    {isSkipped ? <PlusCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                </button>
                                {!isSkipped && (
                                    <button
                                        onClick={() => onSwap && onSwap(type)}
                                        className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-colors"
                                        title="Smart Swap"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                )}
                                {!isSkipped && (
                                    <div className="flex items-center justify-center w-[34px] h-[34px] bg-gray-50 rounded-full border border-gray-100 relative overflow-hidden">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span
                                                key={swapIndex}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                className="text-[10px] font-bold text-gray-500 absolute"
                                            >
                                                {swapIndex + 1}/{totalSwaps}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                )}
                            </>
                        )}
                        {/* If Locked, show placeholder or nothing? Nothing keeps it clean. The Overlay explains why. */}
                    </div>
                </div>

                <div className="flex justify-between items-start mb-2">
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

                {/* Delivery Info Section (Enhanced) */}
                {!isSkipped && deliveryInfo && (
                    <div className="mx-4 mt-2 px-3 py-3 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-2">
                        {/* Row 1: Time & Location */}
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col gap-0.5 flex-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{deliveryInfo.time}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium pl-5">Delivery Window</span>
                            </div>

                            <div className="w-px bg-gray-200 self-stretch mx-1" />

                            <div className="flex flex-col gap-0.5 flex-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="truncate">{deliveryInfo.locationLabel.split('(')[0].trim()}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium pl-5 truncate max-w-[100px]">
                                    {deliveryInfo.locationLabel.match(/\((.*?)\)/)?.[1] || "Address"}
                                </span>
                            </div>
                        </div>

                        {/* Row 2: Drink Status (Optional) */}
                        {meal.includes_drink && (
                            <div className="mt-1 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Drink Included</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Always Visible Details */}
            {!isSkipped && (
                <div className={cn("px-4 pb-4", isLocked && "grayscale opacity-90")}>
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
