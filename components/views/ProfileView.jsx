import React, { useState } from "react";
import { Edit2, Shield, Heart, Activity, Moon, Scale, User, Mail, Save, Sparkles, ChevronRight, CheckCircle2, Phone, AlertCircle, Lock, Apple, TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

import { prefixPath } from '@/utils/prefix';
import { CuisineSelector } from "@/components/CuisineSelector";
import { SmartAllowance } from "@/components/SmartAllowance";
import { NutritionalStrategy } from "@/components/NutritionalStrategy";
import { RestaurantPreference } from "@/components/RestaurantPreference";
import { AddressManager } from "@/components/AddressManager";
import { DrinkPreference } from "@/components/DrinkPreference";
import { DietaryPreferences } from "@/components/DietaryPreferences";
import { HealthConnectModal } from "@/components/HealthConnectModal";
import { useAppContext } from "@/components/providers/AppProvider";

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Animation Variants - Enhanced for smoother Google-style animations
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            mass: 0.8
        }
    }
};

// Circular Progress Component - Google Material-You Style
const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "emerald" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
        emerald: { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.2)" },
        orange: { stroke: "#f97316", glow: "rgba(249, 115, 22, 0.2)" },
        blue: { stroke: "#3b82f6", glow: "rgba(59, 130, 246, 0.2)" }
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Circle with Glow */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colorClasses[color].stroke}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
                    style={{
                        filter: `drop-shadow(0 0 6px ${colorClasses[color].glow})`
                    }}
                />
            </svg>
            {/* Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {percentage}%
                </motion.span>
                <span className="text-xs text-gray-500 font-medium">Complete</span>
            </div>
        </div>
    );
};

const HealthConnectWidget = ({ isEditing, isHighlighted }) => {
    const { profile, actions } = useAppContext();
    const isConnected = profile.healthConnected;
    const [showModal, setShowModal] = useState(false);

    const handleSyncComplete = () => {
        actions.updateProfile({ healthConnected: true });
        setShowModal(false);
    };

    return (
        <>
            <HealthConnectModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSyncComplete={handleSyncComplete}
            />

            <motion.div
                variants={itemVariants}
                animate={isHighlighted ? {
                    backgroundColor: ["#111827", "#7f1d1d", "#111827"],
                    scale: [1, 1.02, 1]
                } : {
                    backgroundColor: "#111827",
                    scale: 1
                }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "bg-gray-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors duration-200",
                    !isConnected && "hover:bg-gray-800 cursor-pointer", // subtle hover when clickable
                    !isEditing && "opacity-40 grayscale"
                )}
                onClick={() => {
                    if (!isConnected && isEditing) setShowModal(true);
                }}
            >
                {/* Background Gradients (Always Present for cool vibe) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

                <AnimatePresence mode="wait">
                    {/* STATE: IDLE (CONNECT PROMPT) */}
                    {!isConnected && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-8 text-center relative z-10"
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-inner border border-white/5">
                                <Activity className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Connect Apple Health</h3>
                            <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                                Sync your activity data for automated nutrition adjustments.
                            </p>
                            <button
                                disabled={!isEditing}
                                className={cn(
                                    "mt-6 px-6 py-2 rounded-full font-bold text-sm transition-all",
                                    isEditing
                                        ? "bg-white text-black hover:scale-105"
                                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                {isEditing ? "Sync Now" : "Unlock to Sync"}
                            </button>
                        </motion.div>
                    )}

                    {/* STATE: CONNECTED (LIVE DATA) */}
                    {isConnected && (
                        <motion.div
                            key="connected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-emerald-400" />
                                        Live Biometrics
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1"> synced via Apple Health</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-400">Live</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-medium text-gray-400 mb-1">Total Burn</div>
                                    <div className="text-2xl font-bold">2,840</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">kcal/day</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-medium text-gray-400 mb-1">Recovery</div>
                                    <div className="text-2xl font-bold">42<span className="text-sm opacity-50">ms</span></div>
                                    <div className="text-[10px] text-orange-400 uppercase tracking-widest mt-1">Strained</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-medium text-gray-400 mb-1">Sleep</div>
                                    <div className="text-2xl font-bold">6<span className="text-lg opacity-70">h</span> 12<span className="text-lg opacity-70">m</span></div>
                                    <div className="text-[10px] text-red-400 uppercase tracking-widest mt-1">Deficit</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-medium text-gray-400 mb-1">Weight</div>
                                    <div className="text-2xl font-bold">175<span className="text-sm opacity-50">lbs</span></div>
                                    <div className="text-[10px] text-emerald-400 uppercase tracking-widest mt-1">-1.2 lbs</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div >
        </>
    );
};

export const ProfileView = () => {
    const { profile, actions, cuisines, addresses } = useAppContext();
    const userProfile = profile;
    const onUpdateProfile = actions.updateProfile;

    const DIET_TAGS = ["Halal", "Kosher", "Vegan", "Keto", "Paleo", "Gluten-Free"];

    const toggleList = (listName, item) => {
        const currentList = userProfile[listName] || [];
        const newList = currentList.includes(item)
            ? currentList.filter(i => i !== item)
            : [...currentList, item];
        onUpdateProfile({ [listName]: newList });
    };

    // --- VALIDATION LOGIC ---
    // 1. Logistics: Check if all slots are filled
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const { deliverySchedule, addresses: savedAddresses, mealPrefs } = useAppContext();
    const MEALS = mealPrefs && mealPrefs.length > 0 ? mealPrefs : ["lunch", "dinner"];
    // Recurrence Check (Strict)
    // Analyze schedule for strict completeness and partial fragments
    let strictCount = 0;
    let hasPartialDays = false;

    // Only verify days if we have preferences. 
    if (mealPrefs && mealPrefs.length > 0) {
        DAYS.forEach(day => {
            const filledCount = mealPrefs.filter(meal => {
                const key = `${day}_${meal}`;
                return deliverySchedule[key] && deliverySchedule[key].locationId;
            }).length;

            if (filledCount === mealPrefs.length) strictCount++;
            else if (filledCount > 0) hasPartialDays = true;
        });
    }

    const activeDaysCount = strictCount;
    // Valid only if target met AND no partial days
    const activeTarget = profile.recurrence?.isActive ? (profile.recurrence?.days || 7) : 1;
    const isRecurringValid = (activeDaysCount >= activeTarget) && !hasPartialDays;
    const isLogisticsComplete = isRecurringValid && savedAddresses.length > 0;

    // 2. Nutrition
    const isNutritionComplete = !!userProfile.nutritionalStrategy;

    // 3. Dining DNA
    const isDiningComplete = (cuisines && cuisines.length >= 3) && userProfile.diet && (userProfile.drinkPrefs && userProfile.drinkPrefs.length >= 3); // Added diet check as mandatory example or just cuisines

    // 4. Identity
    const isIdentityComplete = userProfile.name && userProfile.email;

    // Global Valid
    const isValid = isLogisticsComplete && isNutritionComplete && isDiningComplete && isIdentityComplete && isRecurringValid;

    // Calculate overall completion percentage
    const completionPercentage = Math.round(
        ([isLogisticsComplete, isNutritionComplete, isDiningComplete, isIdentityComplete].filter(Boolean).length / 4) * 100
    );

    // --- SUB-COMPONENT: Enhanced Section Header with Material-You Design ---
    const SectionVerification = ({ title, isComplete, icon: Icon, feedback }) => (
        <motion.div
            variants={itemVariants}
            className="mb-6 relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Gradient Accent Line */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-500",
                isComplete
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                    : "bg-gradient-to-b from-orange-400 to-red-500"
            )} />

            <div className={cn(
                "pl-6 pr-4 py-4 rounded-2xl transition-all duration-300",
                "bg-gradient-to-br from-white to-gray-50/50",
                "border border-gray-100/50 shadow-sm hover:shadow-md",
                "backdrop-blur-sm"
            )}>
                <div className="flex items-center justify-between">
                    {/* Left: Title & Icon */}
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2.5 rounded-xl transition-all duration-300",
                            isComplete
                                ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600"
                                : "bg-gradient-to-br from-orange-50 to-red-50/50 text-orange-600"
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                                {title}
                            </h3>
                            {!isComplete && feedback && (
                                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                    {feedback}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Status Badge with Animation */}
                    <motion.div
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300",
                            "backdrop-blur-md shadow-sm",
                            isComplete
                                ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700"
                                : "bg-gradient-to-r from-orange-50 to-red-50/50 border-orange-200 text-orange-700"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isComplete ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </motion.div>
                                <span className="text-xs font-bold uppercase tracking-wider">Complete</span>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <AlertCircle className="w-4 h-4" />
                                </motion.div>
                                <span className="text-xs font-bold uppercase tracking-wider">Required</span>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 mb-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className={cn(
                                "h-full rounded-full",
                                isComplete
                                    ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                                    : "bg-gradient-to-r from-orange-400 to-red-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: isComplete ? "100%" : "0%" }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const [saveStatus, setSaveStatus] = useState("idle");
    const [isEditing, setIsEditing] = useState(false);

    // --- Flash Logic ---
    const [highlightHealth, setHighlightHealth] = useState(false);
    const triggerHealthFlash = () => {
        setHighlightHealth(true);
        setTimeout(() => setHighlightHealth(false), 800);
    };

    const handleSave = () => {
        if (!isValid) return;
        setSaveStatus("saving");
        setTimeout(() => {
            setSaveStatus("success");
            setTimeout(() => {
                setSaveStatus("idle");
                setIsEditing(false); // Lock it back
            }, 600);
        }, 500);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-24"
        >
            {/* Enhanced Header with Gradient */}
            <motion.div variants={itemVariants} className="relative">
                {/* Decorative Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-blue-50/30 rounded-3xl blur-3xl -z-10" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            {isValid && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </motion.div>
                            )}
                        </div>
                        <p className="text-gray-600 font-medium">
                            {isValid
                                ? "Your profile is complete and locked for safety."
                                : "Complete your profile to unlock all features."}
                        </p>
                    </div>

                    {/* Action Bar with Enhanced Buttons */}
                    <div className="flex items-center gap-3">
                        {!isEditing ? (
                            <motion.button
                                onClick={() => setIsEditing(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </motion.button>
                        ) : (
                            <motion.button
                                disabled={!isValid || saveStatus === "saving"}
                                onClick={handleSave}
                                whileHover={isValid ? { scale: 1.05 } : {}}
                                whileTap={isValid ? { scale: 0.98 } : {}}
                                className={cn(
                                    "group flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full transition-all duration-300",
                                    saveStatus === "success"
                                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                        : isValid
                                            ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:shadow-gray-900/30"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {saveStatus === "saving" ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : saveStatus === "success" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Changes Saved!" : isValid ? "Save Changes" : "Complete Profile to Save"}</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Overall Progress Card - Material-You Style */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden"
            >
                <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6 md:p-8">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-blue-100/30 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-100/20 to-pink-100/20 rounded-full blur-2xl -ml-24 -mb-24" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Progress Circle */}
                            <div className="shrink-0">
                                <CircularProgress
                                    percentage={completionPercentage}
                                    size={120}
                                    color={completionPercentage === 100 ? "emerald" : "orange"}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Profile Completion
                                </h2>
                                <p className="text-gray-600 font-medium mb-4">
                                    {completionPercentage === 100
                                        ? "Excellent! Your profile is fully configured."
                                        : `You're ${completionPercentage}% complete. Fill in missing sections to unlock full features.`}
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className={cn(
                                        "p-3 rounded-xl border transition-all",
                                        isIdentityComplete
                                            ? "bg-emerald-50/50 border-emerald-200/50"
                                            : "bg-gray-50 border-gray-200"
                                    )}>
                                        <div className="text-xs font-semibold text-gray-500 mb-1">Identity</div>
                                        <div className={cn("text-sm font-bold", isIdentityComplete ? "text-emerald-600" : "text-gray-400")}>
                                            {isIdentityComplete ? "✓ Done" : "Pending"}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-xl border transition-all",
                                        isLogisticsComplete
                                            ? "bg-emerald-50/50 border-emerald-200/50"
                                            : "bg-gray-50 border-gray-200"
                                    )}>
                                        <div className="text-xs font-semibold text-gray-500 mb-1">Logistics</div>
                                        <div className={cn("text-sm font-bold", isLogisticsComplete ? "text-emerald-600" : "text-gray-400")}>
                                            {isLogisticsComplete ? "✓ Done" : "Pending"}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-xl border transition-all",
                                        isNutritionComplete
                                            ? "bg-emerald-50/50 border-emerald-200/50"
                                            : "bg-gray-50 border-gray-200"
                                    )}>
                                        <div className="text-xs font-semibold text-gray-500 mb-1">Nutrition</div>
                                        <div className={cn("text-sm font-bold", isNutritionComplete ? "text-emerald-600" : "text-gray-400")}>
                                            {isNutritionComplete ? "✓ Done" : "Pending"}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-xl border transition-all",
                                        isDiningComplete
                                            ? "bg-emerald-50/50 border-emerald-200/50"
                                            : "bg-gray-50 border-gray-200"
                                    )}>
                                        <div className="text-xs font-semibold text-gray-500 mb-1">Dining</div>
                                        <div className={cn("text-sm font-bold", isDiningComplete ? "text-emerald-600" : "text-gray-400")}>
                                            {isDiningComplete ? "✓ Done" : "Pending"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Locked Mode Indicator */}
            {!isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-5 shadow-md">
                        {/* Animated Gradient Border Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/0 via-emerald-200/30 to-emerald-200/0 animate-pulse" />

                        <div className="relative z-10 flex items-center justify-center gap-4 text-sm font-medium text-gray-700">
                            <motion.div
                                className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner"
                                animate={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                            >
                                <Lock className="w-5 h-5 text-gray-700" />
                            </motion.div>
                            <div className="text-center md:text-left">
                                <div className="font-bold text-gray-900 text-base">Settings Locked</div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                    Click <span className="font-bold text-gray-900">Edit Profile</span> to make changes
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-12 gap-8 mt-8">
                {/* LEFT COLUMN: Identity & Bio (Sticky) - VISIBLE BUT LOCKED */}
                <div className={cn(
                    "col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit transition-all duration-500",
                    !isEditing && "pointer-events-none" // No opacity change, just locked
                )}>

                    {/* Dynamic Health Connect / Biometrics Card */}
                    <HealthConnectWidget isEditing={isEditing} isHighlighted={highlightHealth} />

                    {/* Enhanced Identity Card with Material-You Design */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-3xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6 md:p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100/40 to-purple-100/30 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-100/30 to-cyan-100/20 rounded-full blur-2xl -ml-8 -mb-8 transition-transform group-hover:scale-110 duration-700" />

                        <div className="flex flex-col items-center text-center relative z-10">
                            {/* Enhanced Profile Picture */}
                            <div className="relative mb-6">
                                <motion.div
                                    className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 shadow-xl cursor-pointer"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="w-full h-full rounded-full bg-white p-1">
                                        <img
                                            src={prefixPath('/images/iftesam-nabi.png')}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full shadow-md"
                                        />
                                    </div>
                                </motion.div>

                                {/* Floating Edit Icon */}
                                <motion.div
                                    className="absolute bottom-0 right-0 bg-gradient-to-br from-gray-900 to-gray-800 p-2.5 rounded-full shadow-lg border-2 border-white text-white hover:scale-110 transition-all cursor-pointer"
                                    whileHover={{ rotate: 15 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </motion.div>
                            </div>

                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-8">
                                {userProfile.name}
                            </h2>
                        </div>

                        {/* Enhanced Input Fields */}
                        <div className="mt-8 space-y-5 relative z-10">
                            <motion.div
                                className="group/input"
                                whileHover={{ x: 2 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-gray-400" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue={userProfile.name}
                                    className="w-full p-3.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 border-2 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 transition-all shadow-sm hover:shadow-md"
                                />
                            </motion.div>

                            <motion.div
                                className="group/input"
                                whileHover={{ x: 2 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    defaultValue={userProfile.email}
                                    className="w-full p-3.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 border-2 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 transition-all shadow-sm hover:shadow-md"
                                />
                            </motion.div>

                            <motion.div
                                className="group/input"
                                whileHover={{ x: 2 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Contact Number
                                </label>
                                <input
                                    type="tel"
                                    defaultValue={userProfile.phone || "+1 318 000 0000"}
                                    className="w-full p-3.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 border-2 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 transition-all shadow-sm hover:shadow-md"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={cn(
                    "col-span-12 lg:col-span-8 space-y-6 transition-all duration-500",
                    !isEditing && "opacity-40 grayscale pointer-events-none"
                )}>

                    {/* Smart Allowance - Moved Here to be Side-by-Side */}
                    <motion.div variants={itemVariants}>
                        <SmartAllowance />
                    </motion.div>

                    {/* Section Label: Logistics */}
                    {/* Section Label: Logistics */}
                    <SectionVerification
                        title="Logistics & Strategy"
                        isComplete={isRecurringValid && isLogisticsComplete}
                        icon={Sparkles}
                    />

                    <motion.div variants={itemVariants} className="space-y-6">
                        <AddressManager />
                        <NutritionalStrategy onAccessDenied={triggerHealthFlash} />

                        <RestaurantPreference />
                    </motion.div>

                    {/* Section Label: Dining */}
                    <SectionVerification title="Dining Cuisine" isComplete={isDiningComplete} icon={Heart} />

                    <motion.div variants={itemVariants}>
                        <CuisineSelector />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <DrinkPreference />
                    </motion.div>

                    {/* Enhanced Lifestyle Alignment Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-3xl border border-gray-200/50 shadow-lg shadow-gray-200/50 p-6 md:p-8 relative overflow-hidden hover:shadow-xl transition-all duration-500"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/30 to-green-100/20 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="relative z-10">
                            <div className="flex items-start gap-4 mb-8">
                                <motion.div
                                    className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl text-emerald-600 shadow-sm"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <Shield className="w-6 h-6" />
                                </motion.div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Lifestyle Alignment</h3>
                                    <p className="text-sm text-gray-600 font-medium">Dietary standards like Vegan, Keto, or Halal.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex flex-wrap gap-3">
                                        {DIET_TAGS.map(tag => {
                                            const isActive = userProfile.diet?.includes(tag);
                                            return (
                                                <motion.button
                                                    key={tag}
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => toggleList("diet", tag)}
                                                    className={cn(
                                                        "px-5 py-3 rounded-full text-sm font-bold transition-all border-2 shadow-sm",
                                                        isActive
                                                            ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-900 shadow-lg shadow-gray-900/20"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {tag}
                                                        {isActive && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 bg-emerald-400 rounded-full"
                                                            />
                                                        )}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <DietaryPreferences />
                    </motion.div>
                </div>
            </div>
        </motion.div >
    );
};
