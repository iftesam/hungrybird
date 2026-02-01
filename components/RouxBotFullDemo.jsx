import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Check, Loader2, Utensils, AlertCircle, Edit3, Flame, Leaf, Calendar, ChevronRight } from "lucide-react";
import { MEALS } from "@/data/meals";

// --- Utility ---
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- 1. THE FILM GRAIN TEXTURE (Classy Feel) ---
const NoiseOverlay = () => (
    <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
);

// --- 2. TEXT SCRAMBLE EFFECT (Cyber-Physical) ---
const ScrambleText = ({ text, className, trigger }) => {
    const [display, setDisplay] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+";

    useEffect(() => {
        let iterations = 0;
        const interval = setInterval(() => {
            setDisplay(text.split("").map((char, i) => {
                if (i < iterations) return text[i];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(""));
            if (iterations >= text.length) clearInterval(interval);
            iterations += 1 / 2;
        }, 30);
        return () => clearInterval(interval);
    }, [text, trigger]);

    return <span className={className}>{display}</span>;
};

// --- 3. DYNAMIC ISLAND (Persistent Status) ---
const DynamicIsland = ({ status }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'idle': return { width: 130, text: "RouxBot Idle", color: "bg-black" };
            case 'syncing': return { width: 160, text: "Syncing Health...", color: "bg-black" };
            case 'synced': return { width: 180, text: "Biometrics Active", color: "bg-emerald-600" };
            case 'processing': return { width: 180, text: "AI Optimizing...", color: "bg-indigo-600" };
            case 'preferences': return { width: 220, text: "Waiting for Input", color: "bg-orange-600" };
            case 'schedule': return { width: 340, text: "Schedule Ready • Monthly Plan", color: "bg-black" };
            default: return { width: 130, text: "RouxBot", color: "bg-black" };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40">
            <motion.div
                animate={{ width: config.width }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn("h-10 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md overflow-hidden text-white", config.color)}
            >
                <motion.span
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold tracking-wide px-4 whitespace-nowrap"
                >
                    {config.text}
                </motion.span>
            </motion.div>
        </div>
    );
};

// --- LOGIC: GENERATE MONTHLY PLAN ---
const generateMonth = (prefs) => {
    const isHalal = prefs.allergies.includes("Halal");
    const isVegan = prefs.allergies.includes("Vegan");
    const allergies = prefs.allergies.filter(a => a !== "Halal" && a !== "Vegan");

    // Filter Database
    const safeMeals = MEALS.filter(meal => { // Changed EXPANDED_DATA to MEALS
        // 1. Strict Halal Logic
        if (isHalal && !meal.dietary.halal) return false; // isHalal -> dietary.halal

        // 2. Strict Vegan Logic
        if (isVegan && !meal.dietary.vegetarian) return false; // isVegetarian -> dietary.vegetarian (or vegan if stricter)

        // 3. Allergy Logic (Exclude matches)
        const hasAllergy = meal.allergens.some(ingredient => allergies.includes(ingredient)); // contains -> allergens
        if (hasAllergy) return false;

        return true;
    });

    // Fallback if strict filtering leaves nothing (shouldn't happen with robust DB but good for safety)
    const mealPool = safeMeals.length > 0 ? safeMeals : MEALS;

    // Generate 4 Weeks (28 Days) x 2 Meals (Lunch/Dinner)
    const weeks = [];
    let poolIndex = 0;

    for (let w = 1; w <= 4; w++) {
        const days = [];
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        dayNames.forEach((d, i) => {
            // Cycle through meal pool
            const lunch = mealPool[poolIndex % mealPool.length];
            const dinner = mealPool[(poolIndex + 1) % mealPool.length];
            poolIndex += 2;

            days.push({
                name: d,
                date: `Oct ${1 + (w - 1) * 7 + i}`,
                meals: [
                    { ...lunch, type: "Lunch", time: "12:30 PM" },
                    { ...dinner, type: "Dinner", time: "7:00 PM" }
                ]
            });
        });
        weeks.push({ id: w, days });
    }
    return weeks;
};

const MonthlyFeed = ({ preferences }) => {
    const monthData = useMemo(() => generateMonth(preferences), [preferences]);

    return (
        <div className="space-y-12">
            {monthData.map((week) => (
                <div key={week.id} className="relative">
                    {/* Week Header */}
                    <div className="sticky top-0 z-20 bg-[#FAFAFA]/95 backdrop-blur py-4 mb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">{week.id}</div>
                            <h3 className="text-lg font-bold tracking-tight">Week {week.id}</h3>
                            <span className="text-xs text-gray-400 font-mono tracking-widest uppercase ml-auto">Oct 2026</span>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {week.days.map((day, dIdx) => (
                            <motion.div
                                key={dIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dIdx * 0.05 }}
                                className="flex gap-4 group"
                            >
                                {/* Date Column */}
                                <div className="w-16 pt-2 text-right shrink-0">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day.name}</div>
                                    <div className="text-xl font-bold text-gray-900 leading-none">{day.date.split(' ')[1]}</div>
                                </div>

                                {/* Meals Column */}
                                <div className="flex-1 space-y-3">
                                    {day.meals.map((meal, mIdx) => (
                                        <MealCard key={mIdx} data={meal} />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}

            {/* End of Month */}
            <div className="py-20 text-center">
                <p className="text-gray-400 text-sm">You've reached the end of October.</p>
                <button className="mt-4 text-emerald-600 font-bold hover:underline">Load November Plan</button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function RouxBotFullDemo() {
    const [status, setStatus] = useState("idle");
    // State Machine: idle -> syncing -> synced -> processing -> preferences -> schedule

    const [allergies, setAllergies] = useState([]);
    const [note, setNote] = useState("");

    // Auto-advance logic
    useEffect(() => {
        if (status === 'syncing') {
            setTimeout(() => setStatus('synced'), 2500); // 2.5s Sync
        }
        if (status === 'synced') {
            setTimeout(() => setStatus('preferences'), 2000); // 2s read stats then ask q's
        }
        if (status === 'processing') {
            setTimeout(() => setStatus('schedule'), 3000); // 3s AI "Thinking"
        }
    }, [status]);

    const toggleAllergy = (a) => {
        setAllergies(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a]);
    };

    return (
        <div className="min-h-screen w-full bg-[#FAFAFA] font-sans text-[#171717] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <NoiseOverlay />
            <DynamicIsland status={status} />

            {/* --- THE STAGE --- */}
            <AnimatePresence mode="wait">

                {/* PHASE 1: CONNECT & SYNC */}
                {(status === 'idle' || status === 'syncing' || status === 'synced') && (
                    <motion.div
                        key="phase-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        className="z-10"
                    >
                        <SyncCard status={status} onConnect={() => setStatus('syncing')} />
                    </motion.div>
                )}

                {/* PHASE 2: PREFERENCES (The "Input" Step) */}
                {status === 'preferences' && (
                    <motion.div
                        key="phase-2"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                        className="z-10 w-full max-w-md"
                    >
                        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-2xl">
                            <h2 className="text-2xl font-bold mb-2">Refine Your Intake</h2>
                            <p className="text-gray-500 mb-6 text-sm">RouxBot detected a heavy workout. Adjusting for protein.</p>

                            {/* Allergy Toggles */}
                            <div className="mb-6">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">Constraints</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Halal', 'Gluten', 'Peanuts', 'Dairy', 'Shrimp', 'Vegan'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleAllergy(tag)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                allergies.includes(tag)
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chef's Note */}
                            <div className="mb-8">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">Chef's Note</label>
                                <div className="relative">
                                    <Edit3 className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="e.g., Extra spicy sauce..."
                                        className="w-full bg-white/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStatus('processing')}
                                className="w-full bg-[#171717] text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                                Generate Schedule
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* PHASE 3: PROCESSING (The AI "Brain") */}
                {status === 'processing' && (
                    <motion.div
                        key="phase-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="z-10 text-center"
                    >
                        <Loader2 className="w-12 h-12 text-black animate-spin mb-6 mx-auto" />
                        <ScrambleText text="ANALYZING LOCAL MENUS..." className="font-mono text-sm tracking-widest text-gray-500" trigger={true} />
                        <div className="mt-2 text-xs text-gray-400">Scanning Popeyes • Chick-fil-A • Campus Dining</div>
                    </motion.div>
                )}

                {/* PHASE 4: THE SCHEDULE (Monthly View) */}
                {status === 'schedule' && (
                    <motion.div
                        key="phase-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="z-10 w-full max-w-5xl h-[80vh] flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-6 px-4 shrink-0">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">Your Monthly Plan</h1>
                                <p className="text-gray-500 mt-2 text-sm md:text-base">
                                    Optimized for <span className="text-emerald-600 font-semibold">Halal Compliance</span> • Recovery Focus
                                </p>
                            </div>
                            <button onClick={() => setStatus('preferences')} className="text-sm font-semibold text-gray-500 hover:text-black underline">Edit Constraints</button>
                        </div>

                        {/* Scrollable Monthly Grid */}
                        <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-8 scrollbar-hide">
                            <MonthlyFeed preferences={{ allergies, note }} />
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}

// --- SUB-COMPONENTS ---

const SyncCard = ({ status, onConnect }) => (
    <div className={cn(
        "flex flex-col items-center bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl transition-all duration-500 p-8",
        status === 'synced' ? "rounded-3xl w-[400px]" : "rounded-[2rem] w-[340px]"
    )}>
        <div className="mb-6 bg-white p-4 rounded-full shadow-sm ring-1 ring-black/5">
            {status === 'idle' && <AlertCircle className="w-8 h-8 text-gray-400" />}
            {status === 'syncing' && <Loader2 className="w-8 h-8 text-black animate-spin" />}
            {status === 'synced' && <Check className="w-8 h-8 text-emerald-500" />}
        </div>

        <h2 className="text-xl font-bold mb-1">
            {status === 'synced' ? "Data Received" : "Sync Biometrics"}
        </h2>

        {status === 'idle' && (
            <button onClick={onConnect} className="mt-6 bg-black text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                Connect Health
            </button>
        )}

        {status === 'synced' && (
            <div className="mt-6 w-full grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase">Sleep</div>
                    <div className="text-lg font-bold text-indigo-600">7h 12m</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase">Strain</div>
                    <div className="text-lg font-bold text-orange-600">14.2</div>
                </div>
            </div>
        )}
    </div>
);

// New Meal Card (Horizontal Layout for List)
const MealCard = ({ data }) => {
    const [swapped, setSwapped] = useState(false);

    // Quick brand logos (using text/colors for simple demo)
    const getBrandColor = (brand) => {
        if (!brand) return "bg-gray-50 text-gray-700 border-gray-200";
        if (brand.includes("Chick")) return "bg-red-50 text-red-600 border-red-100";
        if (brand.includes("Popeyes")) return "bg-orange-50 text-orange-600 border-orange-100";
        if (brand.includes("Starbucks")) return "bg-green-50 text-green-700 border-green-100";
        return "bg-gray-50 text-gray-700 border-gray-200";
    }

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 relative group overflow-hidden"
        >
            {/* Time / Type */}
            <div className="w-16 shrink-0 text-center border-r border-gray-100 pr-4">
                <div className="text-[10px] uppercase font-bold text-gray-400">{data.type}</div>
                <div className="text-sm font-semibold text-gray-900">{data.time}</div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border", getBrandColor(data.vendor?.name))}>{data.vendor?.name}</span>
                    {data.dietary?.halal && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Halal</span>}
                    {swapped && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Updated</span>}
                </div>
                <h4 className="text-lg font-bold text-gray-900 truncate pr-4">{swapped ? "Grilled Option" : data.name}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {data.nutrition?.cals} kcal</span>
                    <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-emerald-400" /> {data.nutrition?.protein_g}g pro</span>
                </div>
            </div>

            {/* Action */}
            <button onClick={() => setSwapped(!swapped)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-2 rounded-full absolute right-4 shadow-lg active:scale-95">
                <Utensils className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
