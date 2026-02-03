import { MEALS } from "@/data/meals";

// Context mapping for tags/cuisines
const CUISINE_MAP = {
    "bd": "Bangladeshi",
    "in": "Indian",
    "pk": "Pakistani",
    "np": "Nepalese",
    "th": "Thai",
    "cn": "Chinese",
    "jp": "Japanese",
    "mx": "Mexican",
    "med": "Mediterranean",
    "us": "American",
    "it": "Italian"
};

/**
 * Ingredient Guardian
 * Performs a deep scan of meal data to ensure strict compliance with Ingredient Exclusions.
 * Matches keywords against name, description, ingredients, and tags.
 */
export const isMealSafe = (meal, exclusions = []) => {
    if (!exclusions || exclusions.length === 0) return true;

    // Normalize exclusions for efficient matching
    const normalizedExclusions = exclusions.map(e => e.toLowerCase());

    // 1. Explicit Allergen Check
    const hasExplicitAllergy = meal.allergens?.some(a =>
        normalizedExclusions.includes(a.toLowerCase())
    );
    if (hasExplicitAllergy) return false;

    // 2. Deep Text Scan (Hard Rule)
    // We combine all searchable text into one blob for a comprehensive keyword search
    const searchableBlob = [
        meal.name,
        meal.description,
        ...(meal.ingredients || []),
        ...(meal.tags || []),
        meal.vendor?.name,
        meal.cuisine
    ].filter(Boolean).join(" ").toLowerCase();

    const hasForbiddenKeyword = normalizedExclusions.some(exclusion =>
        searchableBlob.includes(exclusion)
    );

    if (hasForbiddenKeyword) return false;

    return true;
};

/**
 * Smart Swap Engine
 * Selects the best meal options based on user profile, constraints, and variety.
 */
export const findSmartSwap = (currentMealType, currentSchedule, context) => {
    const {
        profile,
        financials,
        cuisines,
        restaurantPrefs,
        mealPrefs,
        mealToSwap, // Assuming mealToSwap is passed in context
        items, // Assuming items (participants) are passed in context
        requiredRestaurant: initialRequiredRestaurant = null
    } = context;

    let requiredRestaurant = initialRequiredRestaurant;

    // If the meal to swap is for a guest, the required restaurant must be the host's restaurant.
    if (mealToSwap && mealToSwap.role === "guest" && items) {
        const host = items.find(i => i.role === "host") || items[0];
        if (host && host.vendor && host.vendor.name) {
            requiredRestaurant = host.vendor.name;
        }
    }

    // 1. Identify Constraints
    const currentMeal = currentSchedule[currentMealType];
    const otherMeals = Object.values(currentSchedule).filter(m => m && m.id !== currentMeal?.id);
    const usedCuisines = new Set(otherMeals.map(m => m.cuisine));

    // Financial Soft Cap calculation
    const TAX_RATE = 0.08875;
    const TARGET_DAILY = financials.monthlyBudget / 30;

    const otherMealsCost = otherMeals.reduce((acc, m) => acc + (m.price || 0), 0);
    const maxDayBudgetPreTax = TARGET_DAILY / (1 + TAX_RATE);
    const remainingForSlot = maxDayBudgetPreTax - otherMealsCost;

    const absoluteMaxPrice = remainingForSlot + 5.00;

    // 2. Candidate Filtering
    const candidates = MEALS.filter(meal => {
        // A. Strict Time Check
        if (!meal.meal_time.includes(currentMealType)) return false;

        // B. Deep Ingredient & Allergy Hard Rule
        if (!isMealSafe(meal, profile.allergies)) return false;

        // C. Strict Dietary Check
        if (profile.diet.includes("Vegan") && !meal.dietary.vegan) return false;
        if (profile.diet.includes("Vegetarian") && !meal.dietary.vegetarian) return false;
        if (profile.diet.includes("Halal") && !meal.dietary.halal) return false;
        if (profile.diet.includes("Gluten-Free") && !meal.dietary.gluten_free) return false;

        // D. Strict Cuisine Check
        if (cuisines && cuisines.length > 0) {
            const activeCuisines = cuisines.map(c => CUISINE_MAP[c]);
            const matchesCuisine = activeCuisines.some(c =>
                c && (meal.cuisine.includes(c) || meal.tags.includes(c))
            );
            if (!matchesCuisine) return false;
        }

        // E. Current Removal
        if (currentMeal && meal.id === currentMeal.id) return false;

        // F. Hard Price Cap
        if (meal.price > absoluteMaxPrice) return false;

        // G. Required Restaurant (Guest Swap Restriction)
        if (requiredRestaurant && meal.vendor.name !== requiredRestaurant) return false;

        return true;
    });

    if (candidates.length === 0) return null;

    // 3. Scoring System
    const scoredCandidates = candidates.map(meal => {
        let score = 10;

        // A. Restaurant Preferences
        const isTopTier = meal.tags.includes("Top Tier") || meal.vendor.rating >= 4.8;
        if (restaurantPrefs.includes("top_tier") && isTopTier) score += 5;

        // B. Variety Bonus
        if (!usedCuisines.has(meal.cuisine)) {
            score += 8;
        }

        // C. Price Penalty
        const priceDiff = meal.price - remainingForSlot;
        if (priceDiff > 0) {
            score -= (priceDiff * 2);
        }

        // D. Rating Boost
        if (meal.vendor && meal.vendor.rating) {
            score += (meal.vendor.rating - 4.0) * 5;
        }

        return { ...meal, score };
    });

    // 4. Sort and Pick
    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates.slice(0, 5);
};
