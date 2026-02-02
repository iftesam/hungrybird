"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Create Context
const AppContext = createContext();

// Default Initial State
const INITIAL_PROFILE = {
    name: "Iftesam Nabi",
    email: "iftesamnabi@gmail.com",
    phone: "+1 318 000 0000",
    address: "123 Tech Lane, San Francisco, CA",
    diet: [],
    allergies: [],
    notes: "",
    nutritionalStrategy: "hypertrophy", // Muscle Gain
    drinkPrefs: [],
    dailyAllowance: 60,
    recurrence: { isActive: true, days: 7 },
    healthConnected: false
};

const INITIAL_FINANCIALS = {
    monthlyBudget: 1800, // $60 * 30 days
    monthLength: 30, // Days in month
    currentDay: 14,  // Simulated day
    spent: 840.00 // Approx 14 days * 60
};

const INITIAL_CUISINES = ["us", "in", "jp", "mx", "th"]; // Current setting is good

const INITIAL_ADDRESSES = [
    {
        id: "addr-home",
        label: "Home",
        address: "123 Maple Street, Apt 4B",
        type: "Home",
        breakfastTime: "09:00",
        lunchTime: "13:00",
        dinnerTime: "19:30"
    },
    {
        id: "addr-office",
        label: "Office",
        address: "Tech Hub, Floor 3, Suite 300",
        type: "Work",
        breakfastTime: "08:30",
        lunchTime: "12:30",
        dinnerTime: "19:00"
    },
    {
        id: "addr-campus",
        label: "Campus",
        address: "201 Mayfield Ave, Ruston, LA 71272", // Louisiana Tech Fake Address
        type: "School",
        breakfastTime: "08:00",
        lunchTime: "12:00",
        dinnerTime: "18:00"
    }
];

const INITIAL_MEAL_PREFS = ["breakfast", "lunch", "dinner"];
const INITIAL_RESTAURANT_PREFS = ["top_tier"];

import { MEALS, CUISINE_MAP } from "@/data/meals";
import { findSmartSwap } from "@/utils/SwapLogistics";

// --- SMART LOGISTICS SCHEDULE ---
const INITIAL_SCHEDULE = {};
const INITIAL_MEAL_PLAN = { items: {}, meta: { budget: 0 } }; // New Meal Plan State
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];

// Populate Schedule
DAYS.forEach(day => {
    // Weekday Logic
    if (WEEKDAYS.includes(day)) {
        INITIAL_SCHEDULE[`${day}_breakfast`] = { locationId: "addr-campus", time: "08:00" };
        INITIAL_SCHEDULE[`${day}_lunch`] = { locationId: "addr-office", time: "12:30" };
        INITIAL_SCHEDULE[`${day}_dinner`] = { locationId: "addr-home", time: "19:30" };
    } else {
        // Weekend Logic (All Home)
        INITIAL_SCHEDULE[`${day}_breakfast`] = { locationId: "addr-home", time: "09:00" };
        INITIAL_SCHEDULE[`${day}_lunch`] = { locationId: "addr-home", time: "13:00" };
        INITIAL_SCHEDULE[`${day}_dinner`] = { locationId: "addr-home", time: "19:30" };
    }
});

export const AppProvider = ({ children }) => {
    // State Definitions
    const [profile, setProfile] = useState(INITIAL_PROFILE);
    const [financials, setFinancials] = useState(INITIAL_FINANCIALS);
    const [cuisines, setCuisines] = useState(INITIAL_CUISINES);
    const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
    const [mealPrefs, setMealPrefs] = useState(INITIAL_MEAL_PREFS);
    const [mealPlan, setMealPlan] = useState(INITIAL_MEAL_PLAN); // New State
    const [restaurantPrefs, setRestaurantPrefs] = useState(INITIAL_RESTAURANT_PREFS);
    const [skipped, setSkipped] = useState([]); // Moved up to avoid ReferenceError
    const [reviews, setReviews] = useState({}); // Stores user feedback { [mealName]: { liked, isFavorite } }
    const [priorityNotes, setPriorityNotes] = useState([]);



    // --- LOGISTICS & HISTORY MOCK DATA ---
    // --- LOGISTICS & HISTORY MOCK GENERATOR ---
    // --- LOGISTICS & HISTORY MOCK GENERATOR ---
    const generateMockHistory = () => {
        const historyItems = [];
        const now = new Date();
        const MS_PER_DAY = 86400000;

        // Helper to pick a random meal of a specific type
        const pickMeal = (type) => {
            const options = MEALS.filter(m => m.meal_time.includes(type));
            return options[Math.floor(Math.random() * options.length)];
        };

        // Generate History starting from Yesterday back to Jan 1, 2026
        const startOfYear = new Date(2026, 0, 1); // Jan 1, 2026
        const diffTime = Math.abs(now - startOfYear);
        const daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 1; i <= daysSinceStart; i++) {
            const date = new Date(now - i * MS_PER_DAY);
            // Skip if date is before 2026 (just safety, though math should match)
            if (date.getFullYear() < 2026) continue;

            // 1. Breakfast (10% chance - almost always home cooked)
            if (Math.random() < 0.10) {
                const bf = pickMeal("breakfast");
                if (bf) {
                    historyItems.push({
                        id: `ORD-HIST-${i}-1`,
                        restaurant: bf.vendor.name,
                        items: [bf.name],
                        total: bf.price,
                        date: new Date(date).setHours(9, 0, 0, 0),
                        status: "Delivered",
                        rating: Math.floor(Math.random() * 2) + 4,
                        time: "9:00 AM"
                    });
                }
            }

            // 2. Lunch (40% chance)
            if (Math.random() < 0.40) {
                const ln = pickMeal("lunch");
                if (ln) {
                    historyItems.push({
                        id: `ORD-HIST-${i}-2`,
                        restaurant: ln.vendor.name,
                        items: [ln.name],
                        total: ln.price,
                        date: new Date(date).setHours(13, 0, 0, 0),
                        status: "Delivered",
                        rating: Math.floor(Math.random() * 2) + 4,
                        time: "1:00 PM"
                    });
                }
            }

            // 3. Dinner (50% chance)
            if (Math.random() < 0.50) {
                const dn = pickMeal("dinner");
                if (dn) {
                    historyItems.push({
                        id: `ORD-HIST-${i}-3`,
                        restaurant: dn.vendor.name,
                        items: [dn.name],
                        total: dn.price,
                        date: new Date(date).setHours(19, 30, 0, 0),
                        status: "Delivered",
                        rating: Math.floor(Math.random() * 2) + 4,
                        time: "7:30 PM"
                    });
                }
            }
        }

        // --- REAL-TIME INJECTION (TODAY) ---
        // If today's meals are "locked in" or delivered, show them.
        // Thresholds: Breakfast 8:30am, Lunch 12:30pm, Dinner 7:00pm
        const todayBF = new Date(now).setHours(8, 30, 0, 0);
        const todayLN = new Date(now).setHours(12, 30, 0, 0);
        const todayDN = new Date(now).setHours(19, 0, 0, 0);

        if (now.getTime() > todayBF) {
            const bf = pickMeal("breakfast");
            if (bf) historyItems.push({
                id: `ORD-TODAY-1`,
                restaurant: bf.vendor.name,
                items: [bf.name],
                total: bf.price,
                date: new Date(now).setHours(9, 0, 0, 0),
                status: "Delivered", // or "Processing" if we want to be fancy, but req said "in history"
                rating: 0, // No rating yet for today? Or 5? Let's say unrated (0) implies pending review
                time: "9:00 AM"
            });
        }

        if (now.getTime() > todayLN) {
            const ln = pickMeal("lunch");
            if (ln) historyItems.push({
                id: `ORD-TODAY-2`,
                restaurant: ln.vendor.name,
                items: [ln.name],
                total: ln.price,
                date: new Date(now).setHours(13, 0, 0, 0),
                status: "Delivered",
                rating: 0,
                time: "1:00 PM"
            });
        }

        if (now.getTime() > todayDN) {
            const dn = pickMeal("dinner");
            if (dn) historyItems.push({
                id: `ORD-TODAY-3`,
                restaurant: dn.vendor.name,
                items: [dn.name],
                total: dn.price,
                date: new Date(now).setHours(19, 30, 0, 0),
                status: "Delivered",
                rating: 0,
                time: "7:30 PM"
            });
        }

        // Fix dates to ISO strings finally
        historyItems.forEach(item => {
            if (typeof item.date === 'number') item.date = new Date(item.date).toISOString();
        });

        // Apply 5 Skips randomly (excluding Today to avoid confusion)
        let skipsApplied = 0;
        // Filter out today's items for skip candidate selection
        const pastIndices = historyItems
            .map((item, index) => item.id.includes('TODAY') ? -1 : index)
            .filter(index => index !== -1);

        while (skipsApplied < 5 && pastIndices.length > 0) {
            const randomIdx = Math.floor(Math.random() * pastIndices.length);
            const targetIdx = pastIndices[randomIdx];

            if (historyItems[targetIdx].status !== "Skipped") {
                historyItems[targetIdx].status = "Skipped";
                historyItems[targetIdx].restaurant = "Planned Skip";
                historyItems[targetIdx].items = ["Skipped"];
                historyItems[targetIdx].total = 0;
                historyItems[targetIdx].rating = 0;
                historyItems[targetIdx].time = "-";
                skipsApplied++;
            }
        }

        // Sort by date descending (newest first)
        return historyItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const [history, setHistory] = useState([]);

    // --- MOCK REVIEW GENERATOR ---
    const generateMockReviews = (historyItems) => {
        // Get unique meal names from history
        const uniqueMeals = [...new Set(historyItems.map(h => h.items[0]))];
        // Shuffle to ensure randomness
        const shuffled = uniqueMeals.sort(() => 0.5 - Math.random());
        // Select 7 items (3 Fav, 2 Like, 2 Dislike) is the request
        // Ensure we have enough items
        const selected = shuffled.slice(0, 10);

        const mockReviews = {};
        const now = new Date().toISOString();

        // 3 Favorites
        selected.slice(0, 3).forEach(meal => {
            mockReviews[meal] = { liked: true, isFavorite: true, lastReviewed: now };
        });

        // 2 Likes
        selected.slice(3, 5).forEach(meal => {
            mockReviews[meal] = { liked: true, isFavorite: false, lastReviewed: now };
        });

        // 2 Dislikes (Random Unlikes)
        selected.slice(5, 7).forEach(meal => {
            mockReviews[meal] = { liked: false, isFavorite: false, lastReviewed: now };
        });

        return mockReviews;
    };

    // --- SMART LOGISTICS SCHEDULE ---
    // --- SMART LOGISTICS SCHEDULE ---
    // Key: "Day_Meal" (e.g., "Mon_lunch") -> Value: { locationId, time }
    const [deliverySchedule, setDeliverySchedule] = useState(INITIAL_SCHEDULE);
    const [recurringCache, setRecurringCache] = useState({});

    // --- PERSISTENCE LOGIC ---
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedProfile = localStorage.getItem("hb_profile");
                const savedAddresses = localStorage.getItem("hb_addresses");
                const savedSchedule = localStorage.getItem("hb_schedule");
                const savedMealPlan = localStorage.getItem("hb_mealPlan"); // Load
                const savedFinancials = localStorage.getItem("hb_financials");
                const savedCuisines = localStorage.getItem("hb_cuisines");
                const savedMealPrefs = localStorage.getItem("hb_mealPrefs");
                const savedRestPrefs = localStorage.getItem("hb_restPrefs");
                const savedHistory = localStorage.getItem("hb_history_2026");
                const savedPriorityNotes = localStorage.getItem("hb_priority_notes");
                let finalHistory = [];

                if (savedProfile) setProfile({ ...INITIAL_PROFILE, ...JSON.parse(savedProfile) });
                if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
                if (savedSchedule) setDeliverySchedule(JSON.parse(savedSchedule));
                if (savedMealPlan) setMealPlan(JSON.parse(savedMealPlan)); // Set
                if (savedFinancials) setFinancials(JSON.parse(savedFinancials));
                if (savedCuisines) setCuisines(JSON.parse(savedCuisines));
                if (savedMealPrefs) setMealPrefs(JSON.parse(savedMealPrefs));
                if (savedRestPrefs) setRestaurantPrefs(JSON.parse(savedRestPrefs));
                if (savedPriorityNotes) {
                    const parsedNotes = JSON.parse(savedPriorityNotes);
                    // Filter out expired notes
                    const now = new Date();
                    const validNotes = parsedNotes.filter(note => {
                        if (!note.expiresAt) return true; // Keep if no expiry (Infinity)
                        return new Date(note.expiresAt) > now;
                    });
                    setPriorityNotes(validNotes);
                }
                if (savedHistory) {
                    finalHistory = JSON.parse(savedHistory);
                    setHistory(finalHistory);
                } else {
                    // Generate fresh if not found
                    finalHistory = generateMockHistory();
                    setHistory(finalHistory);
                }

                // Reviews Logic (dependent on History for seeding)
                const savedReviews = localStorage.getItem("hb_meal_reviews");
                if (savedReviews) {
                    setReviews(JSON.parse(savedReviews));
                } else {
                    // Seed defaults if fresh load
                    const seedReviews = generateMockReviews(finalHistory);
                    setReviews(seedReviews);
                    // We don't save to localStorage immediately here to avoid side-effects during render, 
                    // but the persist effect will catch it? 
                    // Actually, the persist effect runs on state change. 
                    // So setting it here triggers the persist effect below. Perfect.
                }

            } catch (error) {
                console.error("Failed to load settings:", error);
            }
            setIsLoaded(true); // Mark as loaded after all localStorage data is set
        }
    }, []);

    // Save on Change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("hb_profile", JSON.stringify(profile));
            localStorage.setItem("hb_addresses", JSON.stringify(addresses));
            localStorage.setItem("hb_addresses", JSON.stringify(addresses));
            localStorage.setItem("hb_schedule", JSON.stringify(deliverySchedule));
            localStorage.setItem("hb_mealPlan", JSON.stringify(mealPlan)); // Save
            localStorage.setItem("hb_financials", JSON.stringify(financials));
            localStorage.setItem("hb_cuisines", JSON.stringify(cuisines));
            localStorage.setItem("hb_mealPrefs", JSON.stringify(mealPrefs));
            localStorage.setItem("hb_mealPrefs", JSON.stringify(mealPrefs));
            localStorage.setItem("hb_restPrefs", JSON.stringify(restaurantPrefs));
            localStorage.setItem("hb_priority_notes", JSON.stringify(priorityNotes));

            // Only save history if it's populated
            if (history && history.length > 0) {
                localStorage.setItem("hb_history_2026", JSON.stringify(history));
            }
        }
    }, [profile, addresses, deliverySchedule, mealPlan, financials, cuisines, mealPrefs, restaurantPrefs, history, priorityNotes]);

    // --- MEAL WINDOW LOGIC ---
    const calculateNextWindow = () => {
        const now = new Date();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const currentDayStr = days[now.getDay()]; // "Mon", "Tue"...

        // Helper: Parse "12:00" -> Date object for Today (Lock-in)
        const getLockInFromTime = (timeStr, offsetDays = 0) => {
            if (!timeStr) return null;
            // timeStr example: "12:00"
            const [h, m] = timeStr.split(':').map(Number);

            const d = new Date();
            d.setDate(d.getDate() + offsetDays);
            d.setHours(h, m, 0, 0);

            return new Date(d.getTime() - 30 * 60000); // Subtract 30 mins
        };

        // Smart Filtering: Only consider active preferences that are NOT skipped
        const isEligible = (type) => mealPrefs.includes(type) && !skipped.includes(type);

        // Get slots for today
        const breakfastSlot = deliverySchedule[`${currentDayStr}_breakfast`];
        const lunchSlot = deliverySchedule[`${currentDayStr}_lunch`];
        const dinnerSlot = deliverySchedule[`${currentDayStr}_dinner`];

        const breakfastLockIn = breakfastSlot ? getLockInFromTime(breakfastSlot.time) : null;
        const lunchLockIn = lunchSlot ? getLockInFromTime(lunchSlot.time) : null;
        const dinnerLockIn = dinnerSlot ? getLockInFromTime(dinnerSlot.time) : null;

        // Check Future Lock-ins Today
        if (breakfastLockIn > now) {
            return { expectedTime: breakfastLockIn.toISOString(), label: "Breakfast", status: "Scheduled", type: "breakfast" };
        }

        if (lunchLockIn > now) {
            return { expectedTime: lunchLockIn.toISOString(), label: "Lunch", status: "Scheduled", type: "lunch" };
        }

        if (dinnerLockIn > now) {
            return { expectedTime: dinnerLockIn.toISOString(), label: "Dinner", status: "Scheduled", type: "dinner" };
        }

        // Check Tomorrow's Early Slots (Wrap around)
        const nextDayIndex = (now.getDay() + 1) % 7;
        const nextDayStr = days[nextDayIndex];

        // Find the first eligible meal for tomorrow
        const tomorrowTypes = ["breakfast", "lunch", "dinner"];
        for (const type of tomorrowTypes) {
            if (isEligible(type)) { // We assume skipped is reset or persisted? Skipped is for "specific meal instance" usually but here it's "type". 
                // Actually, skipped list is ["breakfast", "lunch"] etc. which implies TODAY? 
                // If skipped implies "I'm skipping this slot specifically", usually it resets daily.
                // However, our current simple model `skipped` is likely global or manual toggle.
                // If user skipped "Breakfast", do they mean "This morning" or "Forever"?
                // Given `skipped` array logic in ScheduleView seems to be toggle-based, let's assume it applies to the 'current' view.
                // For tomorrow, we should probably mostly care about `mealPrefs`.
                // But let's respect it if it's there, simply to avoid confusion if they just clicked it.
                const slot = deliverySchedule[`${nextDayStr}_${type}`];
                if (slot) {
                    const lockIn = getLockInFromTime(slot.time, 1);
                    if (lockIn > now) {
                        return { expectedTime: lockIn.toISOString(), label: `${type.charAt(0).toUpperCase() + type.slice(1)}`, status: "Scheduled", type };
                    }
                }
            }

            // Fallback if nothing found (e.g. no meals selected)
            const defaultTomorrow = new Date(now);
            defaultTomorrow.setDate(defaultTomorrow.getDate() + 1);
            defaultTomorrow.setHours(9, 30, 0, 0);
            return {
                expectedTime: defaultTomorrow.toISOString(),
                label: "Next Meal",
                status: "Scheduled",
                type: "breakfast"
            };
        };
    };

    const [nextOrder, setNextOrder] = useState(null); // Return null initially to allow hydration
    const [isLoaded, setIsLoaded] = useState(false);

    // Removed redundant setIsLoaded effect - now set in localStorage loading logic


    useEffect(() => {
        if (!isLoaded) return;

        // Calculate immediately once loaded
        setNextOrder(calculateNextWindow());

        const interval = setInterval(() => {
            setNextOrder(calculateNextWindow());
        }, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [addresses, deliverySchedule, mealPrefs, skipped, isLoaded]); // Re-calc if ANY scheduling factor changes

    // Derived Financial Metrics
    const remainingBudget = financials.monthlyBudget - financials.spent;
    const remainingDays = financials.monthLength - financials.currentDay;
    // Simple daily cap logic: (Remaining + Rollover) / Remaining Days
    // Or just (Monthly / Length) for base, adjusted by usage. 
    // Fixed daily allowance logic: Monthly / Length
    const dailyCap = financials.monthlyBudget / financials.monthLength;



    // Actions
    const updateProfile = (updates) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const updateFinancials = (updates) => {
        setFinancials(prev => ({ ...prev, ...updates }));
    };

    const toggleCuisine = (cuisineId) => {
        setCuisines(prev =>
            prev.includes(cuisineId)
                ? prev.filter(c => c !== cuisineId)
                : [...prev, cuisineId]
        );
    };

    const toggleSkip = (mealType) => {
        setSkipped(prev =>
            prev.includes(mealType)
                ? prev.filter(t => t !== mealType)
                : [...prev, mealType]
        );
    };

    const updateAddresses = (newAddresses) => {
        setAddresses(newAddresses);
    };

    const updateMealPrefs = (newPrefs) => {
        // Smart Sync: Detect removed meals and clean up their schedule
        // This prevents "ghost data" re-appearing when user re-adds a meal
        const removedMeals = mealPrefs.filter(m => !newPrefs.includes(m));

        if (removedMeals.length > 0) {
            const newSchedule = { ...deliverySchedule };
            Object.keys(newSchedule).forEach(key => {
                const [day, meal] = key.split('_');
                if (removedMeals.includes(meal)) {
                    delete newSchedule[key];
                }
            });
            setDeliverySchedule(newSchedule);
        }

        setMealPrefs(newPrefs);
    };

    const updateRestaurantPrefs = (newPrefs) => {
        setRestaurantPrefs(newPrefs);
    };

    const setRecurrenceMode = (isActive) => {
        // Update Profile
        setProfile(prev => ({ ...prev, recurrence: { ...prev.recurrence, isActive } }));

        if (isActive) {
            // Restore from Cache if available
            if (Object.keys(recurringCache).length > 0) {
                setDeliverySchedule(recurringCache);
            }
        } else {
            // Stash and Clear
            setRecurringCache(deliverySchedule);
            setDeliverySchedule({});
        }
    };

    const submitReview = (mealName, liked, isFavorite = false) => {
        const newReviews = {
            ...reviews,
            [mealName]: {
                liked,
                isFavorite,
                lastReviewed: new Date().toISOString()
            }
        };
        setReviews(newReviews);
        localStorage.setItem("hb_meal_reviews", JSON.stringify(newReviews));
    };

    // --- PROFILE COMPLETENESS CHECK ---
    const checkCompleteness = () => {
        const missing = [];
        if (!profile.name) missing.push("Name");
        // if (!profile.email) missing.push("Email"); // Optional for now? Let's say required.
        if (addresses.length === 0) missing.push("Delivery Address");
        if (cuisines.length === 0) missing.push("Cuisines");
        if (mealPrefs.length === 0) missing.push("Meal Schedule");

        return missing;
    };

    const missingConfig = checkCompleteness();
    const isConfigured = missingConfig.length === 0;

    const addPriorityNote = (text, durationDays = 1) => {
        let expiresAt = null;
        if (durationDays !== "infinity") {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(durationDays));
            expiresAt = date.toISOString();
        }
        const newNote = {
            id: Date.now(),
            text,
            status: "pending",
            createdAt: new Date(),
            expiresAt: expiresAt,
            durationLabel: durationDays === "infinity" ? "Infinity" : `${durationDays} ${parseInt(durationDays) === 1 ? 'Day' : 'Days'}`
        };

        setPriorityNotes(prev => [newNote, ...prev]);

        // SIMULATE AI ANALYSIS (GATEKEEPER)
        setTimeout(() => {
            setPriorityNotes(prev => prev.map(note => {
                if (note.id !== newNote.id) return note;

                const textLower = text.toLowerCase();
                let rejectionReason = null;

                // 0. VALIDATE REQUEST IS MEAL-RELATED (NEW - Most Important Check)
                // Reject common non-food requests
                const invalidKeywords = [
                    { word: 'flight', reason: 'Invalid Request: This is a meal planning service. We cannot book flights.' },
                    { word: 'hotel', reason: 'Invalid Request: This is a meal planning service. We cannot book hotels or accommodations.' },
                    { word: 'booking', reason: 'Invalid Request: This is a meal planning service. Please request specific meals or dishes.' },
                    { word: 'taxi', reason: 'Invalid Request: This is a meal planning service. We cannot arrange transportation.' },
                    { word: 'uber', reason: 'Invalid Request: This is a meal planning service. We cannot arrange transportation.' },
                    { word: 'car rental', reason: 'Invalid Request: This is a meal planning service. We cannot arrange transportation.' },
                    { word: 'ticket', reason: 'Invalid Request: This is a meal planning service. We cannot purchase tickets.' },
                    { word: 'appointment', reason: 'Invalid Request: This is a meal planning service. Please request specific meals.' },
                    { word: 'meeting', reason: 'Invalid Request: This is a meal planning service. Please request specific meals.' },
                    { word: 'reservation', reason: 'Invalid Request: This is a meal planning service. We handle meal delivery, not restaurant reservations.' }
                ];

                // Check for invalid keywords
                for (const { word, reason } of invalidKeywords) {
                    if (textLower.includes(word)) {
                        rejectionReason = reason;
                        break;
                    }
                }

                // If no invalid keywords, verify it's food-related
                if (!rejectionReason) {
                    const foodRelatedKeywords = [
                        'meal', 'food', 'eat', 'hungry', 'breakfast', 'lunch', 'dinner',
                        'pizza', 'burger', 'salad', 'tacos', 'sushi', 'pasta', 'steak',
                        'chicken', 'rice', 'sandwich', 'soup', 'curry', 'nihari', 'pakwan',
                        'dish', 'cuisine', 'restaurant', 'delivery', 'order', 'spicy', 'vegetarian',
                        'vegan', 'protein', 'carbs', 'calories', 'nutritious', 'healthy'
                    ];

                    const hasFoodKeyword = foodRelatedKeywords.some(keyword => textLower.includes(keyword));

                    if (!hasFoodKeyword && text.length > 5) {
                        rejectionReason = 'Invalid Request: Please specify a meal-related request. Example: "I want pizza for dinner" or "Give me tacos for lunch tomorrow."';
                    }
                }

                // If already rejected, skip other validations
                if (rejectionReason) {
                    return {
                        ...note,
                        status: "declined",
                        rejectionReason: rejectionReason
                    };
                }

                // 1. EXTRACT MEAL TIME
                const mealMatches = textLower.match(/(breakfast|lunch|dinner)/i);
                const requestedMeal = mealMatches ? mealMatches[0].toLowerCase() : null;

                // 2. EXTRACT TIMELINE / DATE
                // Simple heuristics for demo purposes
                const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const todayRes = textLower.match(/(today|tonight)/i);
                const tomorrowRes = textLower.match(/(tomorrow)/i);
                const dayMatch = textLower.match(new RegExp(`(${days.join("|")})`, "i"));

                let requestedDate = new Date();
                let dateLabel = "Today";

                if (tomorrowRes) {
                    requestedDate.setDate(requestedDate.getDate() + 1);
                    dateLabel = "Tomorrow";
                } else if (dayMatch) {
                    // Logic to find next occurance of that day
                    const targetDayIndex = days.indexOf(dayMatch[0].toLowerCase());
                    const currentDayIndex = requestedDate.getDay();
                    let diff = targetDayIndex - currentDayIndex;
                    if (diff <= 0) diff += 7; // Target is in the future
                    requestedDate.setDate(requestedDate.getDate() + diff);
                    dateLabel = dayMatch[0]; // e.g. "Friday"
                } else if (!todayRes) {
                    // Default to "Next Meal" logic if no date specified? 
                    // Or do we require a date? Let's say if no date, we assume "Next Available" which is usually fine.
                }

                // 3. VALIDATE DURATION COVERAGE (The "Smart" Part)
                if (durationDays !== "infinity") {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays));
                    // Reset times to compare dates
                    requestedDate.setHours(0, 0, 0, 0);
                    expiryDate.setHours(0, 0, 0, 0);

                    if (requestedDate > expiryDate) {
                        rejectionReason = `Timeline Mismatch: You selected ${durationDays} Day(s), but requested for ${dateLabel}.`;
                    }
                }

                // 4. VALIDATE MEAL PREFERENCE
                if (requestedMeal && !mealPrefs.includes(requestedMeal)) {
                    rejectionReason = `Invalid Slot: You don't have ${requestedMeal.charAt(0).toUpperCase() + requestedMeal.slice(1)} enabled in your schedule.`;
                }

                // 5. VALIDATE SPECIFICITY (Basic NLP Check)
                // If it's too vague, e.g., "I am hungry"
                const foodKeywords = ["pizza", "burger", "salad", "tacos", "sushi", "pasta", "steak", "chicken", "rice", "sandwich", "soup", "curry", "nihari", "pakwan"];
                const hasFood = foodKeywords.some(w => textLower.includes(w)) || textLower.length > 15; // Assumption: specific requests are longer

                if (!hasFood && !requestedMeal) {
                    rejectionReason = "Request Unclear: Please specify a meal type (Dinner) or a specific dish.";
                }

                if (rejectionReason) {
                    return {
                        ...note,
                        status: "declined",
                        rejectionReason: rejectionReason // Pass specific reason
                    };
                }

                // 6. APPROVAL LOGIC (Success)
                // If specific known dish (Demo)
                if (textLower.includes("pakwan")) {
                    return {
                        ...note,
                        status: "approved",
                        tags: {
                            target: `${dateLabel} ${requestedMeal ? requestedMeal.charAt(0).toUpperCase() + requestedMeal.slice(1) : 'Dinner'}`,
                            cuisine: "Pakistani"
                        },
                        logic: {
                            day: days[requestedDate.getDay()].substring(0, 3),
                            time: requestedMeal || "dinner",
                            meal: {
                                id: "pakwan-nihari-special",
                                name: "Beef Nihari",
                                restaurant: "Pakwan",
                                price: 18.50,
                                cuisine: ["Pakistani", "Indian"],
                                tags: ["Spicy", "Rich", "Meat Heavy"],
                                image: "https://images.unsplash.com/photo-1542365887-11499db12ccc?auto=format&fit=crop&q=80&w=400",
                                calories: 950,
                                protein: 45,
                                carbs: 30,
                                fat: 60,
                                allergens: ["Gluten"],
                                dietary: { gluten_free: false, vegan: false, vegetarian: false, halal: true },
                                description: "Slow-cooked beef shank stew with rich spices, ginger, and cilantro."
                            }
                        }
                    };
                }

                // General Approval
                return {
                    ...note,
                    status: "approved",
                    tags: {
                        target: `${dateLabel} ${requestedMeal ? requestedMeal.charAt(0).toUpperCase() + requestedMeal.slice(1) : 'Meal'}`,
                        cuisine: "Custom Request"
                    },
                    logic: null
                };
            }));
        }, 2000); // 2 second analysis delay (slightly faster)
    };

    const removePriorityNote = (id) => {
        setPriorityNotes(prev => prev.filter(n => n.id !== id));
    };

    const value = {
        profile,
        financials: {
            ...financials,
            remaining: remainingBudget,
            dailyCap: dailyCap,
            avgDailySpend: (() => {
                const totalSpent = history.reduce((acc, order) => acc + order.total, 0);
                // Days elapsed since Jan 1, 2026 (Start of History)
                const start = new Date(2026, 0, 1);
                const now = new Date();
                const daysElapsed = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));

                return totalSpent / daysElapsed;
            })()
        },
        cuisines,
        addresses,
        mealPrefs,
        restaurantPrefs,
        history,
        isConfigured, // Expose
        missingConfig, // Expose
        reviews,
        // actions: { ... } REMOVED duplicate

        nextOrder,
        skipped,
        deliverySchedule,
        mealPlan, // Expose
        isLoaded, // Expose loading state
        priorityNotes, // Expose
        actions: {
            updateProfile,
            updateFinancials,
            toggleCuisine,
            toggleSkip,
            updateAddresses,
            updateMealPrefs,
            updateRestaurantPrefs,
            updateDeliverySchedule: setDeliverySchedule,
            updateMealPlan: setMealPlan, // Expose Action
            setRecurrenceMode,
            submitReview, // Added here
            addPriorityNote, // Expose
            removePriorityNote // Expose
        }
    };




    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Hook for easy usage
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
