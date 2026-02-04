
// Simple hash function for seeding
const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// Pseudo-random number generator class
class Seeder {
    constructor(seed) {
        this.seed = getHash(seed);
    }

    // Returns float between 0 and 1
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    // Returns integer between min and max (inclusive)
    range(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
}

export const getLogisticsInfo = (mealId, restaurantName, day = "today", index = 0, totalOptions = 5) => {
    // 1. Create a stable seed for neighbors count randomization within the tier
    const seed = `${mealId}_${restaurantName}_${day}_${index}`;
    const rng = new Seeder(seed);

    let mode, deliveryFee, neighbors, isAnomaly;

    // Logic: 
    // - First 2 options (0, 1): Green ($0.99)
    // - Last 2 options: Red ($7.99)
    // - Everything else: Yellow ($2.99)

    // Safety check for small lists
    const isFirstTwo = index < 2;
    const isLastTwo = index >= totalOptions - 2 && index >= 2; // Ensure we don't overlap if total is small (e.g. 3 options -> 0,1 green, 2 red)

    if (isFirstTwo) {
        // GREEN MODE (High Density)
        mode = "green";
        deliveryFee = 0.99;
        neighbors = rng.range(12, 45);
        isAnomaly = false;
    } else if (isLastTwo) {
        // RED MODE (Anomaly/Low Density)
        mode = "red";
        deliveryFee = 7.99;
        neighbors = 0; // "0 neighbors" as requested
        isAnomaly = true;
    } else {
        // YELLOW MODE (Medium Density)
        mode = "yellow";
        deliveryFee = 2.99;
        neighbors = rng.range(3, 11);
        isAnomaly = false;
    }

    let description;
    if (mode === "green") {
        description = `High Demand: With ${neighbors} neighbors ordering nearby, you might automatically qualify for our lowest 'Eco-Drop' rate.`;
    } else if (mode === "yellow") {
        description = `Gathering Steam: ${neighbors} neighbors are on board. You might pay a standard fee, or even less if the group expands before the cutoff.`;
    } else {
        description = "Quiet Zone: You might pay a premium for a solo run, unless more neighbors join your batch before the lock-in time.";
    }

    return {
        mode,
        deliveryFee,
        neighbors,
        isAnomaly,
        densityLabel: mode === "green" ? "High Density" : mode === "yellow" ? "Medium Density" : "Low Density (Anomaly)",
        description
    };
};
