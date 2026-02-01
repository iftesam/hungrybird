import React, { useState } from "react";
import { MapPin, Plus, Trash2, Home, Building2, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Copy, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppContext } from "@/components/providers/AppProvider";

// Helper for Tailwind classes
function cn(...inputs) { return twMerge(clsx(inputs)); }

// --- TIME SLOT GENERATOR ---
const generateTimeSlots = (meal) => {
    const slots = [];
    let startHour, endHour;

    if (meal === "breakfast") {
        startHour = 5;  // 5 AM
        endHour = 10;   // 10 AM
    } else if (meal === "lunch") {
        startHour = 10; // 10 AM
        endHour = 17;   // 5 PM
    } else { // dinner
        startHour = 17; // 5 PM
        endHour = 29;   // 5 AM (next day) - logic handles wrap
    }

    for (let h = startHour; h < endHour; h++) {
        const hour = h % 24;
        const nextHour = (h + 1) % 24;

        // Format: "5 AM"
        const format = (hr) => {
            const ampm = hr >= 12 ? "PM" : "AM";
            const hDisplay = hr % 12 || 12;
            return `${hDisplay} ${ampm}`;
        };

        const value = `${hour.toString().padStart(2, '0')}:00`;
        const label = `${format(hour)} - ${format(nextHour)}`;
        slots.push({ value, label });
    }
    return slots;
};

// --- ADDRESS CARD COMPONENT (Separated to prevent re-renders) ---
const AddressCard = ({ addr, deliverySchedule, MEALS, DAYS, onDelete, onUpdateDefaultTime, onToggleAssignment, onUpdateTime, isRecurring }) => {
    const Icon = addr.type === "Work" ? Building2 : Home;
    const [isEditing, setIsEditing] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [pendingTimes, setPendingTimes] = useState({}); // Track one-time selections

    // Check if meal is unavailable (One-Time mode only)
    const getMealStatus = (meal) => {
        if (isRecurring) return { closed: false };

        const now = new Date();
        const h = now.getHours(); // 0-23

        let cutoff = 24;
        if (meal === "breakfast") cutoff = 10; // 10 AM
        if (meal === "lunch") cutoff = 17;     // 5 PM
        if (meal === "dinner") cutoff = 24;    // Open until 5 AM next day (effectively all day today)

        if (h >= cutoff) return { closed: true, message: "Timed Out" };
        return { closed: false };
    };

    // Calculate summary for collapsed view
    const activeSummary = MEALS.map(meal => {
        const count = DAYS.filter(d => {
            const entry = deliverySchedule[`${d}_${meal}`];
            return entry && entry.locationId === addr.id;
        }).length;
        return count > 0 ? `${count} ${meal}` : null;
    }).filter(Boolean).join(" • ");

    // Collapsed View
    if (!isEditing) {
        return (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", addr.type === "Work" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{addr.label}</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400 font-medium">{addr.address}</p>
                            {!isRecurring && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">TODAY ONLY</span>}
                        </div>

                        {/* Summary Badge */}
                        {activeSummary ? (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs font-bold text-gray-600 capitalize">
                                    {activeSummary}
                                </span>
                            </div>
                        ) : (
                            <p className="text-xs text-orange-400 mt-1 font-bold">Not currently scheduled</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 bg-black text-white text-sm font-bold rounded-xl transition-transform hover:scale-105"
                >
                    Edit
                </button>
            </div>
        );
    }

    // Expanded (Zoomed In) View
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border-2 border-black/5 shadow-xl relative overflow-hidden ring-4 ring-gray-50"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", addr.type === "Work" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{addr.label}</h4>
                        <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{addr.address}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onDelete(addr.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-900"
                    >
                        Save
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {MEALS.map(meal => {
                    const timeOptions = generateTimeSlots(meal);
                    const defaultTimeSlot = addr[`${meal}Time`] || timeOptions[0]?.value || "12:00";
                    const isExpanded = editingMeal === meal;
                    const { closed, message } = getMealStatus(meal);

                    // ONE-TIME EXPERIENCE
                    if (!isRecurring) {
                        const today = DAYS[0];
                        const entry = deliverySchedule[`${today}_${meal}`];
                        const isActive = entry && entry.locationId === addr.id;

                        // Time Logic
                        const selectedTime = isActive ? entry.time : (pendingTimes[meal] || "");
                        const isTimeSet = selectedTime && selectedTime !== "";

                        return (
                            <div key={meal} className={cn(
                                "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                                isActive ? "bg-black border-black text-white shadow-lg" : "bg-white border-gray-100 hover:border-gray-200"
                            )}>
                                {/* Closed State Overlay */}
                                {closed && (
                                    <div className="absolute inset-0 z-20 bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center">
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{message}</span>
                                        </motion.div>
                                    </div>
                                )}

                                <div className="p-5 flex items-center justify-between">
                                    <div className={cn("transition-opacity duration-300", closed ? "opacity-20 blur-[1px]" : "opacity-100")}>
                                        <h5 className="text-lg font-bold capitalize flex items-center gap-2">
                                            {meal}
                                        </h5>
                                        <p className="text-xs font-medium opacity-60">Today • {today}</p>
                                    </div>

                                    {/* Action Area */}
                                    <div className={cn("flex items-center gap-4 transition-all duration-300", closed ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0")}>
                                        {/* Time Selector - ALWAYS VISIBLE */}
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
                                            isActive
                                                ? "bg-white/10 border-white/20"
                                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                        )}>
                                            <Clock className={cn("w-3 h-3 transition-colors", isActive ? "opacity-60" : "text-gray-400")} />
                                            <select
                                                value={selectedTime}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (isActive) {
                                                        onUpdateTime(today, meal, val);
                                                    } else {
                                                        setPendingTimes(prev => ({ ...prev, [meal]: val }));
                                                    }
                                                }}
                                                className={cn(
                                                    "bg-transparent border-none text-sm font-bold outline-none text-right appearance-none cursor-pointer w-20",
                                                    isActive ? "text-white" : "text-gray-900"
                                                )}
                                            >
                                                <option value="" className="text-gray-400">Select Time</option>
                                                {timeOptions.map(t => (
                                                    <option key={t.value} value={t.value} className="text-black">{t.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => isTimeSet && onToggleAssignment(today, meal, addr.id, selectedTime)}
                                            disabled={!isTimeSet}
                                            className={cn(
                                                "px-6 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95",
                                                isActive
                                                    ? "bg-white text-black shadow-md"
                                                    : isTimeSet
                                                        ? "bg-black text-white hover:bg-gray-800"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            )}
                                        >
                                            {isActive ? "Added" : "Add"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // RECURRING EXPERIENCE (Original Grid)
                    // Active Days for this address & meal
                    const activeDays = DAYS.filter(d => {
                        const entry = deliverySchedule[`${d}_${meal}`];
                        return entry && entry.locationId === addr.id;
                    });

                    return (
                        <div key={meal} className={cn(
                            "rounded-xl p-4 border transition-all relative overflow-hidden",
                            closed
                                ? "bg-gray-100/50 border-gray-100 opacity-70"
                                : "bg-gray-50/50 border-gray-100"
                        )}>
                            {/* Disable Overlay if closed */}
                            {closed && (
                                <div className="absolute top-2 right-2 z-20 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {message}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-3">
                                <h5 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", closed ? "text-gray-400" : "text-gray-500")}>
                                    <Clock className="w-3 h-3" /> {meal} Schedule
                                </h5>

                                {/* Default Time Selector */}
                                {!closed && (
                                    <select
                                        className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-black"
                                        value={defaultTimeSlot}
                                        onChange={(e) => onUpdateDefaultTime(meal, addr.id, e.target.value)}
                                    >
                                        {timeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Day Toggles */}
                            <div className="flex gap-1 mb-3">
                                {DAYS.map(day => {
                                    const entry = deliverySchedule[`${day}_${meal}`];
                                    const isActive = entry && entry.locationId === addr.id;
                                    const isConflict = !isActive && entry;
                                    const isLocked = closed; // Lock if Closed

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => !isLocked && onToggleAssignment(day, meal, addr.id, defaultTimeSlot)}
                                            disabled={isLocked}
                                            className={cn(
                                                "h-8 flex-1 rounded-lg text-[10px] font-bold transition-all border relative overflow-hidden",
                                                isLocked
                                                    ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                                                    : isActive
                                                        ? "bg-black text-white border-black"
                                                        : isConflict
                                                            ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                                                            : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                                            )}
                                        >
                                            <span className={cn("relative z-10", isActive && closed && "opacity-50")}>{day.charAt(0)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Advanced / Exceptions */}
                            {activeDays.length > 0 && !closed && (
                                <div>
                                    <button
                                        onClick={() => setEditingMeal(isExpanded ? null : meal)}
                                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                                    >
                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        {isExpanded ? "Hide Exceptions" : "Customize Times per Day"}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-3 space-y-2">
                                                    {activeDays.map(day => {
                                                        const entry = deliverySchedule[`${day}_${meal}`];
                                                        return (
                                                            <div key={day} className="flex justify-between items-center text-xs">
                                                                <span className="font-bold text-gray-600 w-8">{day}</span>
                                                                <select
                                                                    className="bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-700 text-xs outline-none focus:border-black"
                                                                    value={entry.time}
                                                                    onChange={(e) => onUpdateTime(day, meal, e.target.value)}
                                                                >
                                                                    {timeOptions.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};


export const AddressManager = () => {
    const { addresses, deliverySchedule, actions, mealPrefs, profile } = useAppContext();
    const setAddresses = actions.updateAddresses;
    const setSchedule = actions.updateDeliverySchedule;

    const [isAdding, setIsAdding] = useState(false);
    const [newAddr, setNewAddr] = useState({
        label: "",
        address: "",
        type: "Home",
        breakfastTime: "08:00",
        lunchTime: "12:00",
        dinnerTime: "19:00",
        schedule: {
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            start: "09:00",
            end: "17:00",
            active: true // default active for simple logic
        }
    });

    const isRecurring = profile.recurrence?.isActive ?? true;
    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const today = allDays.includes(todayStr) ? todayStr : "Mon";

    // If One-Time, strictly restrict to Today
    const DAYS = isRecurring ? allDays : [today];
    const rawMeals = mealPrefs.length > 0 ? mealPrefs : ["lunch", "dinner"];
    const MEALS = ["breakfast", "lunch", "dinner"].filter(m => rawMeals.includes(m));

    // --- COMPLETENESS LOGIC ---
    const totalSlots = DAYS.length * MEALS.length;
    // Count filled slots in deliverySchedule
    const filledSlots = DAYS.flatMap(d => MEALS.map(m => `${d}_${m}`)).filter(k => deliverySchedule[k]).length;
    const progress = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

    // --- HELPER: CONFLICT CHECK ---
    const checkConflict = (day, mealType, currentAddrId) => {
        const key = `${day}_${mealType}`;
        const existing = deliverySchedule[key];
        // If assigned to a DIFFERENT address, it's a conflict
        if (existing && existing.locationId !== currentAddrId) {
            const locName = addresses.find(a => a.id === existing.locationId)?.label || "another location";
            return `Already assigned to ${locName}`;
        }
        return null;
    };

    // --- HELPER: TOGGLE DAY ASSIGNMENT ---
    const toggleAssignment = (day, mealType, addrId, defaultTime) => {
        const key = `${day}_${mealType}`;
        const conflict = checkConflict(day, mealType, addrId);

        if (conflict) {
            // Show simple alert for now
            alert(`Conflict: ${day} ${mealType} is ${conflict}. Please deselect it from there first.`);
            return;
        }

        const newSched = { ...deliverySchedule };
        const existing = newSched[key];

        if (existing && existing.locationId === addrId) {
            // Deselect
            delete newSched[key];
        } else {
            // Select
            newSched[key] = { locationId: addrId, time: defaultTime };
        }
        setSchedule(newSched);
    };

    // --- HELPER: UPDATE TIME ---
    // Update time for a specific day key
    const updateTime = (day, mealType, newTime) => {
        const key = `${day}_${mealType}`;
        if (!deliverySchedule[key]) return;

        const newSched = { ...deliverySchedule };
        newSched[key] = { ...newSched[key], time: newTime };
        setSchedule(newSched);
    };

    // Bulk update time for ALL days of this meal type at this address
    const updateDefaultTime = (mealType, addrId, newTime) => {
        const newSched = { ...deliverySchedule };
        DAYS.forEach(day => {
            const key = `${day}_${mealType}`;
            const existing = newSched[key];
            if (existing && existing.locationId === addrId) {
                newSched[key] = { ...existing, time: newTime };
            }
        });
        setAddresses(addresses.map(a => a.id === addrId ? { ...a, [`${mealType}Time`]: newTime } : a));
        setSchedule(newSched);
    };

    const handleAdd = () => {
        if (!newAddr.label || !newAddr.address) return;
        setAddresses([...addresses, { ...newAddr, id: Date.now().toString() }]);
        setIsAdding(false);
        setNewAddr({ ...newAddr, label: "", address: "" });
    };

    const handleDelete = (id) => {
        // Also clean up schedule
        const newSched = { ...deliverySchedule };
        Object.keys(newSched).forEach(k => {
            if (newSched[k].locationId === id) delete newSched[k];
        });
        setSchedule(newSched);
        setAddresses(addresses.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* 1. Schedule Validation Status */}
            {(() => {
                const activeDaysTarget = isRecurring ? (profile.recurrence?.days || 7) : 1;
                // Analysis: strictly complete days vs partially filled days
                let strictCount = 0;
                let partialDays = [];

                DAYS.forEach(day => {
                    if (mealPrefs.length === 0) return;
                    const scheduledCount = mealPrefs.filter(meal => {
                        const key = `${day}_${meal}`;
                        return deliverySchedule[key] && deliverySchedule[key].locationId;
                    }).length;

                    if (scheduledCount === mealPrefs.length) {
                        strictCount++;
                    } else if (scheduledCount > 0) {
                        partialDays.push(day);
                    }
                });

                const activeDaysCount = strictCount;
                const diff = activeDaysCount - activeDaysTarget;

                let status = "ok";
                let message = "Autopilot Active. Coverage 100%.";

                if (partialDays.length > 0) {
                    status = "over"; // Reuse orange warning style
                    message = `Incomplete schedule for ${partialDays.join(", ")}. Please fill all meal slots.`;
                } else if (diff < 0) {
                    status = "under";
                    message = `Complete your schedule (${Math.abs(diff)} days remaining) to enable autopilot.`;
                } else if (diff > 0) {
                    status = "over";
                    message = `Over-scheduled by ${diff} days. Kindly adjust frequency or remove days.`;
                }

                return (
                    <div className={cn(
                        "rounded-2xl p-6 shadow-lg transition-colors duration-500",
                        status === "ok" ? "bg-gradient-to-r from-emerald-900 to-emerald-800 text-white" :
                            status === "over" ? "bg-gradient-to-r from-orange-900 to-orange-800 text-white" :
                                "bg-gradient-to-r from-gray-900 to-gray-800 text-white"
                    )}>
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Delivery Profile
                                </h2>
                                <p className={cn("text-xs mt-1 font-medium", status === "over" ? "text-orange-200" : "text-gray-400")}>
                                    {message}
                                </p>
                            </div>
                            <div className={cn("text-2xl font-bold", status === "ok" ? "text-emerald-400" : status === "over" ? "text-orange-400" : "text-gray-400")}>
                                {activeDaysCount}/{activeDaysTarget} <span className="text-sm font-normal opacity-60">days</span>
                            </div>
                        </div>
                        {/* Bar */}
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full transition-all duration-700 rounded-full", status === "ok" ? "bg-emerald-400" : status === "over" ? "bg-orange-400" : "bg-gray-400")}
                                style={{ width: `${Math.min((activeDaysCount / activeDaysTarget) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                );
            })()}

            {/* 2. Address Cards */}
            <div className="grid gap-6">
                {addresses.map(addr => (
                    <AddressCard
                        key={addr.id}
                        addr={addr}
                        deliverySchedule={deliverySchedule}
                        MEALS={MEALS}
                        DAYS={DAYS}
                        isRecurring={isRecurring}
                        onDelete={handleDelete}
                        onUpdateDefaultTime={updateDefaultTime}
                        onToggleAssignment={toggleAssignment}
                        onUpdateTime={updateTime}
                    />
                ))}
            </div>

            {/* Add New Button / Form */}
            {!isAdding ? (
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600 transition-all" onClick={() => setIsAdding(true)}>
                    <Plus className="w-5 h-5" />
                    Add Another Location
                </button>
            ) : (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">Add New Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="md:col-span-1">
                            <input type="text" placeholder="Label (Home)" className="w-full p-2 rounded-lg border" value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <input type="text" placeholder="Address" className="w-full p-2 rounded-lg border" value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 font-bold">Cancel</button>
                        <button onClick={handleAdd} className="flex-1 py-2 bg-black text-white font-bold rounded-lg">Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};
