"use client";

import React from "react";
import { ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { useAppContext } from "@/components/providers/AppProvider";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const OrderReviewCard = ({ order, onRemove }) => {
    const { reviews, actions } = useAppContext();

    // Assume primary item is the meal to review
    const mealName = order.items[0];
    const review = reviews[mealName];

    const isLiked = review?.liked === true;
    const isDisliked = review?.liked === false;
    const isFavorite = review?.isFavorite === true;

    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    // --- Feedback Views ---

    // 1. Dislike State (Minimal & Apologetic)
    if (isDisliked) {
        return (
            <div className="p-5 w-full bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <ThumbsDown className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">Sorry to hear that.</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-tight">We won't add this to your schedule again.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => actions.submitReview(mealName, null, false)}
                        className="text-xs font-bold text-gray-400 hover:text-gray-900 px-3 py-1.5 transition-colors"
                    >
                        Undo
                    </button>
                    <button
                        onClick={() => onRemove ? onRemove() : setIsVisible(false)}
                        className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-black transition-colors shadow-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // 2. Favorite State (Premium & Celebratory)
    if (isFavorite) {
        return (
            <div className="relative overflow-hidden w-full p-5 rounded-2xl border border-rose-100 shadow-sm bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500 group">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100/30 to-transparent rounded-bl-full -mr-4 -mt-4 pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-rose-500 border border-rose-50 shrink-0">
                        <Heart className="w-5 h-5 fill-current animate-pulse" />
                    </div>

                    <div>
                        <p className="text-sm font-extrabold text-gray-900 leading-tight">Highest Priority!</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                            We'll make sure this meal is at the top of your schedule whenever available and budget allows.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative z-10 shrink-0">
                    <button
                        onClick={() => actions.submitReview(mealName, null, false)}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors px-2"
                    >
                        Undo
                    </button>
                    <button
                        onClick={() => onRemove ? onRemove() : setIsVisible(false)}
                        className="bg-white text-gray-900 border border-gray-200 text-xs font-bold px-4 py-1.5 rounded-full hover:border-gray-300 hover:shadow-md transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // 3. Liked State (Clean & Affirming)
    if (isLiked && !isFavorite) {
        return (
            <div className="p-5 w-full bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <ThumbsUp className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-900 leading-tight">Glad you liked it!</p>
                        <p className="text-[11px] text-emerald-700 font-medium leading-tight">We'll find more meals like this.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => actions.submitReview(mealName, null, false)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 px-3 py-1.5 transition-colors"
                    >
                        Undo
                    </button>
                    <button
                        onClick={() => onRemove ? onRemove() : setIsVisible(false)}
                        className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // --- Default Review Card ---

    const handleLike = () => actions.submitReview(mealName, true, false);
    const handleDislike = () => actions.submitReview(mealName, false, false);
    const handleHeart = () => actions.submitReview(mealName, true, !isFavorite);

    return (
        <div className="relative flex items-center justify-between px-7 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">

            {/* Favorite Button (Top Right) */}
            <button
                onClick={handleHeart}
                className={cn(
                    "absolute top-3 right-3 p-1.5 rounded-full transition-all border shadow-sm z-10",
                    isFavorite
                        ? "text-rose-500 bg-rose-50 border-rose-100"
                        : "text-gray-400 bg-white border-gray-200 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                )}
                title="Favorite"
            >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>

            {/* Left: Meal Info */}
            <div className="flex items-center gap-4">
                {/* Placeholder Image or Icon */}
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    🍽️
                </div>

                <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight pr-6">{mealName}</h4>
                    <p className="text-xs text-gray-500 font-medium">
                        {order.restaurant} • <span className="text-gray-400 font-normal">
                            Last ordered {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </p>
                </div>
            </div>

            {/* Right: Review Actions */}
            <div className="flex flex-col items-end gap-2 mt-2">

                {/* Question */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-8">
                    Did you like it?
                </div>

                {/* Buttons (Like / Dislike) */}
                <div className="flex items-center gap-2">
                    {/* Dislike */}
                    <button
                        onClick={handleDislike}
                        className="p-2 rounded-full bg-white text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600 transition-all"
                    >
                        <ThumbsDown className="w-4 h-4" />
                    </button>

                    {/* Like */}
                    <button
                        onClick={handleLike}
                        className="p-2 rounded-full transition-all border bg-white text-gray-400 border-gray-200 hover:border-emerald-200 hover:text-emerald-500"
                    >
                        <ThumbsUp className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
