import React, { useState } from "react";
import { AlertTriangle, Ban, Flame, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppContext } from "@/components/providers/AppProvider";

function cn(...inputs) { return twMerge(clsx(inputs)); }

export const DietaryPreferences = () => {
    const { profile, actions } = useAppContext();
    const selected = profile.allergies || [];

    const toggle = (item) => {
        const newSelection = selected.includes(item)
            ? selected.filter(i => i !== item)
            : [...selected, item];
        actions.updateProfile({ allergies: newSelection });
    };

    // 1. The "Big 8" Allergens (Safety Critical)
    const ALLERGENS = [
        "Peanuts", "Tree Nuts", "Dairy", "Eggs",
        "Shellfish", "Soy", "Gluten"
    ];

    // 2. Meat Exclusions (Lifestyle / Religion)
    const PROTEINS = [
        "Pork", "Beef", "Chicken", "Fish"
    ];

    // 3. Sensitivities (Taste / Mild intolerance)
    const SENSITIVITIES = [
        "Spicy", "Cilantro"
    ];

    const renderPill = (item, type) => {
        const isActive = selected.includes(item);
        return (
            <button
                key={item}
                onClick={() => toggle(item)}
                className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                    isActive
                        ? "bg-red-50 text-red-700 border-red-200 pl-8 shadow-sm" // Active State (Red/Excluded)
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300" // Inactive
                )}
            >
                <span className={cn(
                    "absolute left-2.5 top-1/2 -translate-y-1/2 transition-all",
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"
                )}>
                    <X className="w-3.5 h-3.5 text-red-600" strokeWidth={4} />
                </span>
                {item}
            </button>
        );
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Ingredient Exclusions</h3>
                <p className="text-sm text-gray-500">Select ingredients to strict-filter from your menu.</p>
            </div>

            <div className="space-y-6">
                {/* SECTION 1: ALLERGENS */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Common Allergens</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ALLERGENS.map(item => renderPill(item, "allergen"))}
                    </div>
                </div>

                {/* SECTION 2: PROTEINS */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Ban className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meat & Protein</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PROTEINS.map(item => renderPill(item, "protein"))}
                    </div>
                </div>

                {/* SECTION 3: SENSITIVITIES */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taste Profile</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SENSITIVITIES.map(item => renderPill(item, "sense"))}
                    </div>
                </div>
            </div>
        </div>
    );
};
