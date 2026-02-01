import React, { useState } from "react";
import { Edit2, Shield, Heart, Activity, Moon, Scale, User, Mail, Save, Sparkles, ChevronRight, CheckCircle2, Phone, AlertCircle, Lock, Apple } from "lucide-react";
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

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
                } : {}}
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

    // --- SUB-COMPONENT: Section Header with Verification ---
    const SectionVerification = ({ title, isComplete, icon: Icon, feedback }) => (
        <div className="mb-6 pl-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Icon className="w-3 h-3" /> {title}
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all",
                    isComplete
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-red-50 border-red-100 text-red-500"
                )}>
                    {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {isComplete ? "Complete" : "Action Required"}
                </div>
            </div>
            {/* Contextual Feedback */}
            {!isComplete && feedback && (
                <div className="text-xs font-medium text-gray-500 ml-5 flex items-start gap-2">
                    <div className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                    <span>{feedback}</span>
                </div>
            )}
        </div>
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
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your bio-data, logistics, and dining Cuisine.</p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-gray-900 text-white rounded-full shadow-lg shadow-gray-200 hover:scale-105 transition-all"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <button
                            disabled={!isValid || saveStatus === "saving"}
                            onClick={handleSave}
                            className={cn(
                                "group flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300",
                                saveStatus === "success"
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200"
                                    : isValid
                                        ? "bg-gray-900 text-white shadow-xl shadow-gray-200 hover:scale-105 hover:bg-black"
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
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Locked Mode Indicator - Super Cool & Visible "In Place" */}
            {!isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 rounded-2xl p-4 flex items-center justify-center gap-3 text-sm font-medium text-gray-600"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm">
                        <Lock className="w-4 h-4 text-gray-900" />
                    </div>
                    <span>Settings are locked. To change, kindly press the <span className="font-bold text-gray-900">Edit Profile</span> button.</span>
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

                    {/* Identity Card */}
                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        {/* ... Content ... */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full mb-6 p-1 border-2 border-dashed border-gray-200 group-hover:border-gray-400 transition-colors cursor-pointer">
                                    <img src={prefixPath('/images/iftesam-nabi.png')} alt="Profile" className="w-full h-full object-cover rounded-full shadow-sm" />
                                </div>
                                {/* Edit Icon hidden if locked by parent pointer-events-none, but visually we can hide it too */}
                                <div className="absolute bottom-4 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-black hover:scale-110 transition-all cursor-pointer">
                                    <Edit2 className="w-4 h-4" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-gray-500">Active Subscriber</span>
                            </div>
                        </div>
                        {/* ... Inputs ... */}
                        <div className="mt-8 space-y-5">
                            <div className="group/input">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue={userProfile.name}
                                    className="w-full p-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 transition-all"
                                />
                            </div>
                            <div className="group/input">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    defaultValue={userProfile.email}
                                    className="w-full p-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 transition-all"
                                />
                            </div>
                            <div className="group/input">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Contact Number
                                </label>
                                <input
                                    type="tel"
                                    defaultValue={userProfile.phone || "+1 318 000 0000"}
                                    className="w-full p-3 bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 transition-all"
                                />
                            </div>
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

                    {/* Lifestyle */}
                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Lifestyle Alignment</h3>
                                <p className="text-sm text-gray-500">Dietary standards like Vegan, Keto, or Halal.</p>
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
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => toggleList("diet", tag)}
                                                className={cn(
                                                    "px-5 py-2.5 rounded-full text-sm font-bold transition-all border",
                                                    isActive
                                                        ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                )}
                                            >
                                                {tag}
                                                {isActive && <span className="ml-2 text-emerald-400">•</span>}
                                            </motion.button>
                                        );
                                    })}
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
