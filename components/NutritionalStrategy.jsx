import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Brain, Dumbbell, Leaf, Lock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const STRATEGIES = [
    {
        id: "deficit",
        label: "Burn / Weight Loss",
        desc: "Calorie deficit with high volume foods.",
        icon: Flame,
        color: "text-orange-500",
        bg: "bg-orange-50",
        border: "border-orange-200"
    },
    {
        id: "hypertrophy",
        label: "Muscle Gain",
        desc: "High protein surplus for recovery.",
        icon: Dumbbell,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        border: "border-indigo-200"
    },
    {
        id: "cognitive",
        label: "Cognitive Focus",
        desc: "Stable blood sugar. Low carb meal.",
        icon: Brain,
        color: "text-blue-500",
        bg: "bg-blue-50",
        border: "border-blue-200"
    },
    {
        id: "wellness",
        label: "Clean Maintenance",
        desc: "Balanced macros. Whole food focus.",
        icon: Leaf,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200"
    },
];

import { useAppContext } from "@/components/providers/AppProvider";

export const NutritionalStrategy = ({ onAccessDenied }) => {
    const { profile, actions } = useAppContext();
    const active = profile?.nutritionalStrategy || null;
    const onUpdate = (id) => actions.updateProfile({ nutritionalStrategy: id });

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative group">
            {/* Background Decoration */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            </div>

            <div className="mb-6 relative z-10">
                <h3 className="text-lg font-bold text-gray-900">Nutritional Strategy</h3>
                <p className="text-sm text-gray-500">Tell our system your primary biological objective.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STRATEGIES.map((s) => {
                    const isActive = active === s.id;
                    const Icon = s.icon;
                    const isLocked = s.id === "deficit" && !profile.healthConnected;

                    return (
                        <button
                            key={s.id}
                            onClick={() => isLocked ? onAccessDenied?.() : onUpdate(s.id)}
                            className={cn(
                                "relative flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2",
                                isLocked
                                    ? "bg-gray-50 border-gray-100 opacity-60 cursor-pointer grayscale hover:bg-red-50/50 hover:border-red-100" // Interactive locked state
                                    : isActive
                                        ? cn(s.border, s.bg)
                                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                            )}
                        >
                            <div className={cn("p-2 rounded-xl bg-white shadow-sm", s.color)}>
                                {isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className={cn("font-bold text-sm", isActive ? "text-gray-900" : "text-gray-700")}>
                                    {s.label}
                                </div>
                                <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    {isLocked ? "Connect Health to unlock." : s.desc}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
