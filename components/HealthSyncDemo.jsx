import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ScrambleText } from "./ScrambleText";

// --- Utility for consistent class merging ---
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- Animated Number Component ---
const AnimatedValue = ({ value, suffix = "" }) => {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString() + suffix
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
};

// --- Preference Selector Component ---
const PreferenceSelector = ({ onComplete }) => {
    const [allergies, setAllergies] = useState([]);
    const [notes, setNotes] = useState("");

    const toggleAllergy = (a) => {
        setAllergies(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold mb-3">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-2">
                    {["Peanuts", "Gluten", "Dairy", "Shellfish", "Soy"].map(a => (
                        <button
                            key={a}
                            onClick={() => toggleAllergy(a)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                allergies.includes(a)
                                    ? "bg-[#171717] text-white border-[#171717]"
                                    : "bg-white/50 border-gray-200 text-neutral-600 hover:bg-white"
                            )}
                        >
                            {a}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Chef's Notes</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., High protein, no cilantro..."
                    className="w-full p-4 rounded-xl bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 resize-none h-24 text-sm"
                />
            </div>

            <button
                onClick={onComplete}
                className="w-full py-4 rounded-xl bg-[#171717] text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
            >
                Generate Meal Plan
            </button>
        </motion.div>
    );
};

// --- Interactive Schedule Component ---
const MEAL_OPTIONS = {
    "Lunch": [
        { brand: "Popeyes", name: "Blackened Chicken Tenders", cals: 550, tags: ["High Protein", "Spicy"] },
        { brand: "Sweetgreen", name: "Harvest Bowl (No Cheese)", cals: 620, tags: ["Balanced", "Fiber"] },
        { brand: "Chipotle", name: "Chicken Burrito Bowl", cals: 710, tags: ["Post-Workout", "Available"] },
    ],
    "Dinner": [
        { brand: "Local Diner", name: "Grilled Salmon w/ Asparagus", cals: 480, tags: ["Omega-3", "Light"] },
        { brand: "Panda Express", name: "Wok-Seared Steak & Greens", cals: 520, tags: ["Low Carb"] },
    ]
};

const DayCard = ({ day, initialMeal, type }) => {
    const [meal, setMeal] = useState(initialMeal);
    const [isEditing, setIsEditing] = useState(false);

    const handleSwap = (newMeal) => {
        setMeal(newMeal);
        setIsEditing(false);
    };

    return (
        <div className="relative group">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 hover:bg-white/60 transition-colors border border-white/50 relative overflow-hidden">
                {/* Day Label */}
                <div className="w-16 flex flex-col items-center justify-center border-r border-gray-200 pr-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</span>
                    <span className="text-sm font-semibold text-gray-900">{type}</span>
                </div>

                {/* Meal Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-[#F97316] uppercase tracking-wide mb-1 block">{meal.brand}</span>
                            <h4 className="font-semibold text-gray-900 leading-tight">{meal.name}</h4>
                        </div>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{meal.cals} kcal</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                        {meal.tags.map(t => (
                            <span key={t} className="text-[10px] bg-emerald-100 text-[#10B981] px-1.5 py-0.5 rounded font-medium">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Edit Button (Hover) */}
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
                >
                    <span className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">Swap Meal</span>
                </button>
            </div>

            {/* Swap Drawer / Dropdown */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-white/80 backdrop-blur-md rounded-b-2xl -mt-2 mx-2 border-x border-b border-white shadow-xl z-20 relative"
                    >
                        <div className="p-3 grid gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase ml-2">Select Alternative</span>
                            {MEAL_OPTIONS[type].map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSwap(opt)}
                                    className="flex items-center justify-between p-3 hover:bg-black/5 rounded-xl text-left transition-colors"
                                >
                                    <div>
                                        <span className="text-xs font-bold text-[#F97316] block">{opt.brand}</span>
                                        <span className="text-sm font-medium text-gray-900">{opt.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{opt.cals} kcal</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ScheduleView = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full space-y-3 mt-4"
        >
            <div className="flex justify-between items-end mb-2 px-1">
                <h3 className="font-bold text-xl">Your Weekly Plan</h3>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">Optimize for Recovery</span>
            </div>

            <DayCard day="MON" type="Lunch" initialMeal={MEAL_OPTIONS["Lunch"][0]} />
            <DayCard day="MON" type="Dinner" initialMeal={MEAL_OPTIONS["Dinner"][0]} />
            <DayCard day="TUE" type="Lunch" initialMeal={MEAL_OPTIONS["Lunch"][1]} />
        </motion.div>
    );
};


// --- Main Component ---
export default function HealthSyncDemo() {
    const [status, setStatus] = useState("idle"); // 'idle' | 'syncing' | 'synced' | 'preferences' | 'generating' | 'schedule'

    const handleSync = () => {
        setStatus("syncing");
        setTimeout(() => {
            setStatus("synced");
        }, 2000);
    };

    const handleStartPlan = () => {
        setStatus("preferences");
    };

    const handleGenerate = () => {
        setStatus("generating");
        setTimeout(() => {
            setStatus("schedule");
        }, 2500);
    };

    return (
        <div className="flex min-h-[800px] w-full items-center justify-center font-sans text-[#171717]">

            {/* The Glassmorphic Card Container */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }} // Dampened for smoother height changes
                className={cn(
                    "relative flex flex-col items-center overflow-hidden border border-white/60 bg-white/60 p-8 shadow-2xl backdrop-blur-xl transition-[width]",
                    (status === "synced" || status === "preferences") ? "w-[500px] rounded-3xl" :
                        (status === "schedule") ? "w-[480px] rounded-[2rem]" :
                            "w-[340px] rounded-[2rem]"
                )}
            >

                {/* Header Section */}
                {status !== "generating" && (
                    <motion.div layout className="mb-6 flex w-full flex-col items-center text-center z-10">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                            {/* Dynamic Icon based on state */}
                            <AnimatePresence mode="wait">
                                {status === "idle" && (
                                    <motion.svg
                                        key="icon-idle"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </motion.svg>
                                )}
                                {status === "syncing" && (
                                    <motion.div
                                        key="icon-syncing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, rotate: 360 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-black"
                                    />
                                )}
                                {(status === "synced" || status === "preferences") && (
                                    <motion.svg
                                        key="icon-synced"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-[#10B981]" // Emerald Green
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </motion.svg>
                                )}
                                {status === "schedule" && (
                                    <motion.svg
                                        key="icon-schedule"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="h-8 w-8 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </motion.svg>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.h2 layout className="text-xl font-bold tracking-tight text-neutral-900">
                            {status === "synced" ? "Biometrics Calibrated" :
                                status === "preferences" ? "Customize Your Plan" :
                                    status === "schedule" ? "Your AI Meal Plan" :
                                        "Connect Health"}
                        </motion.h2>
                        <motion.p layout className="mt-1 text-sm font-medium text-neutral-500">
                            {status === "synced"
                                ? "RouxBot is ready to build your schedule."
                                : status === "preferences" ? "Let us know your dietary needs."
                                    : status === "schedule" ? "Optimized for your 84% recovery score."
                                        : "Sync Apple Health or Google Fit to personalize your nutrition."}
                        </motion.p>
                    </motion.div>
                )}


                {/* Dynamic Body Content */}
                <AnimatePresence mode="wait">

                    {/* STATE 1: IDLE */}
                    {status === "idle" && (
                        <motion.div
                            key="step-idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <button
                                onClick={handleSync}
                                className="group relative flex items-center gap-2 rounded-full bg-[#171717] px-8 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                <span>Sync Wearables</span>
                                <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </motion.div>
                    )}

                    {/* STATE 2: SYNCING */}
                    {status === "syncing" && (
                        <motion.div
                            key="step-syncing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                                Analyzing Recovery Data...
                            </span>
                        </motion.div>
                    )}

                    {/* STATE 3: SYNCED (Data Grid + Action) */}
                    {status === "synced" && (
                        <motion.div
                            key="step-synced"
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                                },
                            }}
                            className="w-full"
                        >
                            <div className="grid w-full grid-cols-2 gap-3 mb-6">
                                <StatCard
                                    label="Sleep Recovery"
                                    value={84}
                                    suffix="%"
                                    color="text-indigo-500"
                                    sub="7h 12m avg"
                                />
                                <StatCard
                                    label="Active Energy"
                                    value={620}
                                    suffix=" kcal"
                                    color="text-orange-500"
                                    sub="Moderate Load"
                                />
                                <StatCard
                                    label="Heart Rate Variability (HRV)"
                                    value={42}
                                    suffix=" ms"
                                    color="text-emerald-500"
                                    sub="Ready for Strain"
                                    colSpan="col-span-2"
                                />
                            </div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleStartPlan}
                                className="w-full flex items-center justify-center gap-2 bg-[#F97316] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:brightness-110 transition-all"
                            >
                                <span>Build My Meal Plan</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </motion.button>

                        </motion.div>
                    )}

                    {/* STATE 4: PREFERENCES */}
                    {status === "preferences" && (
                        <PreferenceSelector key="step-prefs" onComplete={handleGenerate} />
                    )}

                    {/* STATE 5: GENERATING */}
                    {status === "generating" && (
                        <motion.div
                            key="step-generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                        >
                            <div className="relative h-16 w-16">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-[#171717] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div>
                                <ScrambleText text="Analyzing local menus..." className="block text-lg font-bold text-gray-900" />
                                <span className="text-sm text-gray-500">Matching with your nutritional profile</span>
                            </div>
                        </motion.div>
                    )}


                    {/* STATE 6: SCHEDULE */}
                    {status === "schedule" && (
                        <ScheduleView key="step-schedule" />
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// --- Sub-Component for Data Cards (Reused) ---
function StatCard({ label, value, suffix, color, sub, colSpan = "" }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
            }}
            className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-colors hover:bg-white/80",
                colSpan
            )}
        >
            <div className="absolute right-0 top-0 h-16 w-16 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-50 blur-xl" />

            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{label}</span>

            <div className="mt-2 flex items-baseline gap-1">
                <span className={cn("text-3xl font-bold tracking-tight", color)}>
                    <AnimatedValue value={value} suffix="" />
                </span>
                <span className={cn("text-lg font-medium opacity-60", color)}>{suffix}</span>
            </div>

            <div className="mt-1 flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full bg-current", color)} />
                <span className="text-xs font-medium text-neutral-500">{sub}</span>
            </div>
        </motion.div>
    );
}
