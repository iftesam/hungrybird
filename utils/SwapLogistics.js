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
    // Allow going up to remaining budget for the day + a small buffer ($2) if total day is okay
    const TAX_RATE = 0.08875;
    const TARGET_DAILY = financials.monthlyBudget / 30; // e.g. 60

    const otherMealsCost = otherMeals.reduce((acc, m) => acc + (m.price || 0), 0);
    const maxDayBudgetPreTax = TARGET_DAILY / (1 + TAX_RATE); // ~55
    const remainingForSlot = maxDayBudgetPreTax - otherMealsCost;

    // Harder cap for the specific slot to capture "Reasonable" swaps
    // But we allow a "Quality Overflow" of up to $5 if it fits daily budget
    const absoluteMaxPrice = remainingForSlot + 5.00;

    // 2. Candidate Filtering
    const candidates = MEALS.filter(meal => {
        // A. Strict Time Check
        if (!meal.meal_time.includes(currentMealType)) return false;

        // B. Strict Allergy Check
        if (profile.allergies && profile.allergies.length > 0) {
            const hasAllergy = profile.allergies.some(allergy => meal.allergens.includes(allergy));
            if (hasAllergy) return false;
        }

        // C. Strict Dietary Check
        if (profile.diet.includes("Vegan") && !meal.dietary.vegan) return false;
        if (profile.diet.includes("Vegetarian") && !meal.dietary.vegetarian) return false;
        if (profile.diet.includes("Halal") && !meal.dietary.halal) return false;
        if (profile.diet.includes("Gluten-Free") && !meal.dietary.gluten_free) return false;

        // D. Strict Cuisine Check (User Fix)
        if (cuisines && cuisines.length > 0) {
            const activeCuisines = cuisines.map(c => CUISINE_MAP[c]);
            const matchesCuisine = activeCuisines.some(c =>
                c && (meal.cuisine.includes(c) || meal.tags.includes(c))
            );
            if (!matchesCuisine) return false;
        }

        // E. Current Removal
        if (currentMeal && meal.id === currentMeal.id) return false;

        // F. Hard Price Cap (Sanity check)
        // Don't show $45 dinner for a $15 lunch slot unless budget is huge
        if (meal.price > absoluteMaxPrice) return false;

        // G. Required Restaurant (Guest Swap Restriction)
        if (requiredRestaurant && meal.vendor.name !== requiredRestaurant) return false;

        return true;
    });

    if (candidates.length === 0) return null;

    // 3. Scoring System
    const scoredCandidates = candidates.map(meal => {
        let score = 10; // Base score

        // A. Restaurant Preferences
        const isTopTier = meal.tags.includes("Top Tier") || meal.vendor.rating >= 4.8;
        if (restaurantPrefs.includes("top_tier") && isTopTier) score += 5;

        // B. Variety Bonus (Anti-Repetition)
        // If this cuisine is NOT used by other meals today -> Boost
        if (!usedCuisines.has(meal.cuisine)) {
            score += 8; // High value on variety
        }

        // C. Price Penalty (Soft Budget adherence)
        // Ideally we want to stay under `remainingForSlot`
        const priceDiff = meal.price - remainingForSlot;
        if (priceDiff > 0) {
            // Penalize expensive upgrades heavily if they break budget
            score -= (priceDiff * 2);
        }

        // D. Rating Boost (General Quality)
        if (meal.vendor && meal.vendor.rating) {
            score += (meal.vendor.rating - 4.0) * 5; // e.g. 4.8 -> +4 points
        }

        return { ...meal, score };
    });

    // 4. Sort and Pick
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Return top 5 to allow for some randomness among the best
    return scoredCandidates.slice(0, 5);
};
