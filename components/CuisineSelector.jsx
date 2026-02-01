import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Globe, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const CUISINE_OPTIONS = [
    { id: "us", label: "American", icon: "🇺🇸", related: ["Burgers", "Wings"] },
    { id: "mx", label: "Mexican", icon: "🇲🇽", related: ["Tacos", "Burritos"] },
    { id: "it", label: "Italian", icon: "🇮🇹", related: ["Pasta", "Pizza"] },
    { id: "cn", label: "Chinese", icon: "🇨🇳", related: ["Dim Sum", "Mapo Tofu"] },
    { id: "jp", label: "Japanese", icon: "🇯🇵", related: ["Sushi", "Ramen"] },
    { id: "bq", label: "BBQ / Grill", icon: "🍖", related: ["Brisket", "Ribs"] },
    { id: "sh", label: "Steakhouse", icon: "🥩", related: ["Ribeye", "Filet Mignon"] },
    { id: "th", label: "Thai", icon: "🇹🇭", related: ["Pad Thai", "Green Curry"] },
    { id: "in", label: "Indian", icon: "🇮🇳", related: ["Butter Chicken", "Naan"] },
    { id: "md", label: "Mediterranean", icon: "🫒", related: ["Falafel", "Gyro"] },
    { id: "vt", label: "Vietnamese", icon: "🇻🇳", related: ["Pho", "Banh Mi"] },
    { id: "kr", label: "Korean", icon: "🇰🇷", related: ["K-BBQ", "Bibimbap"] },
    { id: "cj", label: "Cajun/Creole", icon: "🦐", related: ["Gumbo", "Jambalaya"] },
    { id: "lb", label: "Lebanese", icon: "🇱🇧", related: ["Shawarma", "Hummus"] },
    { id: "pk", label: "Pakistani", icon: "🇵🇰", related: ["Nihari", "Biryani"] },
    { id: "bd", label: "Bangladeshi", icon: "🇧🇩", related: ["Kacchi Biryani", "Tehari"] },
    { id: "np", label: "Nepalese", icon: "🇳🇵", related: ["Momo", "Thukpa"] },
];

import { useAppContext } from "@/components/providers/AppProvider";

export const CuisineSelector = () => {
    const { cuisines, actions } = useAppContext();
    const selected = cuisines; // Alias
    const { toggleCuisine } = actions;

    const minSelection = 3;
    const remaining = Math.max(0, minSelection - selected.length);

    // "Super Intelligent" Logic: Show what the AI found based on selection
    const discoveryItems = CUISINE_OPTIONS
        .filter(c => selected.includes(c.id))
        .flatMap(c => c.related)
        .slice(0, 4);

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {/* Header with Dynamic Progress */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-bold text-gray-900">Cuisine Preference</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        Select cultures to train the Menu AI.
                    </p>
                </div>

                {/* The Progress Badge */}
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-colors duration-300",
                    remaining === 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-50 text-orange-600"
                )}>
                    {remaining === 0 ? (
                        <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> AI Ready
                        </span>
                    ) : (
                        <span>Select {remaining} more</span>
                    )}
                </div>
            </div>

            {/* Grid of Options */}
            <div className="flex flex-wrap gap-3 mb-6">
                {CUISINE_OPTIONS.map((cuisine) => {
                    const isActive = selected.includes(cuisine.id);
                    return (
                        <motion.button
                            key={cuisine.id}
                            onClick={() => toggleCuisine(cuisine.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border",
                                isActive
                                    ? "bg-black text-white border-black shadow-lg"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            <span className="text-lg">{cuisine.icon}</span>
                            <span>{cuisine.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* "Super Intelligent" Discovery Section */}
            <AnimatePresence>
                {selected.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-indigo-50 rounded-xl p-4 border border-indigo-100"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                AI Found {selected.length * 4} Matches near your location
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {discoveryItems.map((item, i) => (
                                <span key={i} className="text-xs font-bold bg-white text-indigo-600 px-2 py-1 rounded shadow-sm border border-indigo-50">
                                    {item}
                                </span>
                            ))}
                            <span className="text-xs font-medium text-indigo-400 px-2 py-1">+8 more</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
