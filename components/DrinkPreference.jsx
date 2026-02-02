"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassWater, Check, Sparkles, Snowflake, Ban } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppContext } from "@/components/providers/AppProvider";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const DRINK_OPTIONS = [
    { id: "coke", label: "Coca-Cola", color: "#2E0905", highlight: "#4A1A17", flavor: "Classic", icon: "🥤" },
    { id: "pepsi", label: "Pepsi", color: "#004B93", highlight: "#0066CC", flavor: "Sweet", icon: "🔵" },
    { id: "diet-coke", label: "Diet Coke", color: "#1A1A1A", highlight: "#404040", flavor: "Zero Sugar", icon: "✨" },
    { id: "sprite", label: "Sprite", color: "#008F47", highlight: "#00BF60", flavor: "Lemon Lime", icon: "🍋" },
    { id: "drpepper", label: "Dr Pepper", color: "#541016", highlight: "#802029", flavor: "Spiced", icon: "🌶️" },
    { id: "fanta", label: "Fanta", color: "#FF7300", highlight: "#FFA500", flavor: "Orange", icon: "🍊" }
];

export const DrinkPreference = () => {
    const { profile, actions } = useAppContext();
    const selectedDrinks = profile.drinkPrefs || [];

    const handleToggle = (id) => {
        if (selectedDrinks.includes(id)) {
            actions.updateProfile({ drinkPrefs: selectedDrinks.filter(d => d !== id) });
        } else if (selectedDrinks.length < 5) {
            actions.updateProfile({ drinkPrefs: [...selectedDrinks, id] });
        }
    };

    const count = selectedDrinks.length;
    const min = 3;
    const max = 5;
    const remainingToMin = Math.max(0, min - count);

    const getStatus = () => {
        if (count < min) return `Select ${remainingToMin} more`;
        if (count === max) return "Max Reached";
        return `${count}/${max} Selected`;
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group/container">
            {/* Dynamic Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-white" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Drink Preferences</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-400">
                        Curate your hydration pack (3-5 items).
                    </p>
                </div>

                <motion.div
                    animate={{ scale: count >= min ? [1, 1.05, 1] : 1 }}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border",
                        count >= min
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-500 border-gray-200"
                    )}
                >
                    {getStatus()}
                </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                {DRINK_OPTIONS.map((drink) => {
                    const isSelected = selectedDrinks.includes(drink.id);

                    return (
                        <motion.button
                            key={drink.id}
                            onClick={() => handleToggle(drink.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "relative group flex flex-col items-center justify-between p-4 rounded-xl border transition-all duration-300 h-40 overflow-hidden",
                                isSelected
                                    ? "bg-white ring-2 ring-black ring-offset-2 border-transparent shadow-xl shadow-black/5"
                                    : "bg-gray-50/50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md"
                            )}
                        >
                            {/* Selected Background Tint - Very Subtle */}
                            <motion.div
                                className="absolute inset-0 opacity-[0.03]"
                                animate={{ backgroundColor: isSelected ? drink.color : "transparent" }}
                            />

                            {/* Badge */}
                            <div className="w-full flex justify-end mb-2">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        opacity: isSelected ? 1 : 0,
                                        scale: isSelected ? 1 : 0.5
                                    }}
                                    className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                </motion.div>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        opacity: !isSelected ? 1 : 0,
                                        scale: !isSelected ? 1 : 0.5
                                    }}
                                    className="w-5 h-5 rounded-full border-2 border-gray-200"
                                />
                            </div>

                            {/* THE GLASS - High Fidelity */}
                            <div className="relative w-14 h-20 mb-2">
                                {/* Glass Container Stroke (Front) */}
                                <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-sm">
                                    <defs>
                                        <linearGradient id={`grad-${drink.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor={drink.color} stopOpacity="0.8" />
                                            <stop offset="100%" stopColor={drink.color} />
                                        </linearGradient>
                                        <mask id={`mask-${drink.id}`}>
                                            {/* Mask matching glass shape */}
                                            <path d="M2 2h36l-3 48a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5L2 2Z" fill="white" />
                                        </mask>
                                    </defs>

                                    {/* Glass Back Wall (Semi-transparent) */}
                                    <path d="M2 2h36l-3 48a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5L2 2Z"
                                        fill={isSelected ? "rgba(255,255,255,0.4)" : "rgba(229,231,235,0.3)"} />

                                    {/* LIQUID FILL */}
                                    {isSelected && (
                                        <g mask={`url(#mask-${drink.id})`}>
                                            <motion.rect
                                                x="0"
                                                width="40"
                                                fill={`url(#grad-${drink.id})`}
                                                initial={{ y: 60, height: 0 }}
                                                animate={{ y: 15, height: 45 }}
                                                transition={{
                                                    type: "spring",
                                                    damping: 15,
                                                    stiffness: 70,
                                                    mass: 1
                                                }}
                                            />

                                            {/* REALISTIC ICE SHARDS (Visible Premium Ice) */}
                                            {/* Only show if Ice is preferred (default true) */}
                                            {((profile.icePreference || "ice") === "ice") && (
                                                <g>
                                                    {/* Buoyancy Group - Rising with Liquid */}
                                                    <motion.g
                                                        initial={{ y: 40, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{
                                                            type: "spring",
                                                            damping: 15,
                                                            stiffness: 70,
                                                            mass: 1,
                                                            delay: 0.1
                                                        }}
                                                    >
                                                        {/* 1. Base Chunk (Bottom Left) */}
                                                        <motion.path
                                                            d="M6 42 L16 40 L18 50 L8 52 Z"
                                                            fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"
                                                            animate={{ y: [0, 2, 0], rotate: [0, 2, 0] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                        />

                                                        {/* 2. Base Chunk (Bottom Right) */}
                                                        <motion.path
                                                            d="M22 44 L34 42 L36 52 L24 54 Z"
                                                            fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"
                                                            animate={{ y: [0, -2, 0], rotate: [0, -2, 0] }}
                                                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                                        />

                                                        {/* 3. Mid Chunk (Left) */}
                                                        <motion.path
                                                            d="M8 30 L18 28 L20 38 L10 40 Z"
                                                            fill="rgba(255,255,255,0.5)" stroke="white" strokeWidth="0.5"
                                                            animate={{ y: [0, 3, 0], rotate: [10, 12, 10] }}
                                                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                                        />

                                                        {/* 4. Mid Chunk (Right) */}
                                                        <motion.path
                                                            d="M24 28 L34 26 L36 36 L26 38 Z"
                                                            fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5"
                                                            animate={{ y: [0, -2, 0], rotate: [-5, -8, -5] }}
                                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                                        />

                                                        {/* 5. Upper Chunk (Center) */}
                                                        <motion.path
                                                            d="M14 18 L26 16 L28 26 L16 28 Z"
                                                            fill="rgba(255,255,255,0.55)" stroke="white" strokeWidth="0.5"
                                                            animate={{ y: [0, 2, 0], rotate: [5, 8, 5] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                                                        />

                                                        {/* 6. Top Floater (Surface) */}
                                                        <motion.path
                                                            d="M20 10 L28 8 L30 16 L22 18 Z"
                                                            fill="rgba(255,255,255,0.6)" stroke="white" strokeWidth="0.5"
                                                            animate={{ y: [0, 3, 0], rotate: [15, 18, 15] }}
                                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                                                        />
                                                    </motion.g>

                                                    {/* Bubbles - Rising through the ice */}
                                                    <motion.circle cx="12" cy="45" r="1.5" fill="white" opacity="0.6" animate={{ y: -35, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }} />
                                                    <motion.circle cx="30" cy="40" r="1" fill="white" opacity="0.6" animate={{ y: -30, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 1, ease: "easeOut" }} />
                                                    <motion.circle cx="20" cy="50" r="1" fill="white" opacity="0.4" animate={{ y: -40, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5, ease: "easeOut" }} />
                                                </g>
                                            )}

                                            {/* Surface Highlight/Meniscus - Layered ON TOP of ice */}
                                            <motion.ellipse
                                                cx="20"
                                                cy="15"
                                                rx="16"
                                                ry="3"
                                                fill={drink.highlight}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 0.6, scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                        </g>
                                    )}

                                    {/* Fizz Particles */}
                                    {isSelected && (
                                        <g mask={`url(#mask-${drink.id})`}>
                                            <motion.circle cx="10" cy="50" r="1.5" fill="rgba(255,255,255,0.6)"
                                                animate={{ y: -40, opacity: [0, 1, 0] }}
                                                transition={{ repeat: Infinity, duration: 2, delay: 0.1 }} />
                                            <motion.circle cx="20" cy="55" r="2" fill="rgba(255,255,255,0.4)"
                                                animate={{ y: -45, opacity: [0, 1, 0] }}
                                                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} />
                                            <motion.circle cx="30" cy="52" r="1" fill="rgba(255,255,255,0.5)"
                                                animate={{ y: -35, opacity: [0, 1, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.8, delay: 0.8 }} />
                                        </g>
                                    )}

                                    {/* Glass Rim & Outline Highlight */}
                                    <path d="M2 2h36l-3 48a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5L2 2Z"
                                        fill="none"
                                        stroke={isSelected ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.05)"}
                                        strokeWidth="1.5" />

                                    {/* Glossy Reflection (Left Side) */}
                                    <path d="M6 5 L4.5 45" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" mask={`url(#mask-${drink.id})`} />
                                </svg>
                            </div>

                            <div className="text-center">
                                <span className={cn(
                                    "block text-sm font-bold transition-all",
                                    isSelected ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                                )}>{drink.label}</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300">{drink.flavor}</span>
                            </div>

                        </motion.button>
                    );
                })}
            </div>

            {/* Ice Preference Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Snowflake className="w-4 h-4 text-sky-400" />
                            <h4 className="text-sm font-bold text-gray-900">Ice Preference</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            Choose how you'd like your drinks served.
                        </p>
                    </div>

                    <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/60">
                        {[
                            { id: "ice", label: "Ice", icon: Snowflake },
                            { id: "no-ice", label: "No Ice", icon: Ban }
                        ].map((opt) => {
                            const isActive = (profile.icePreference || "ice") === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => actions.updateProfile({ icePreference: opt.id })}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                        isActive
                                            ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    <opt.icon className={cn("w-3.5 h-3.5", isActive ? "text-sky-500" : "opacity-50")} />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
