
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

export const getLogisticsInfo = (mealId, restaurantName, day = "today", index = 0, totalOptions = 5, extraGuests = 0) => {
    // 1. Create a stable seed for neighbors count randomization within the tier
    const seed = `${mealId}_${restaurantName}_${day}_${index}`;
    const rng = new Seeder(seed);

    let baseNeighbors;

    // Logic for BASE neighbors (before guests): 
    // - First 2 options (0, 1): Green (Free, 10+ neighbors)
    // - Last 2 options: Red ($7.99, 0-3 neighbors)
    // - Everything else: Yellow ($1.99, 4-9 neighbors)

    const isFirstTwo = index < 2;
    const isLastTwo = index >= totalOptions - 2 && index >= 2;

    if (isFirstTwo) {
        baseNeighbors = rng.range(10, 45); // 10+ neighbors
    } else if (isLastTwo) {
        baseNeighbors = rng.range(0, 3); // 0-3 neighbors
    } else {
        baseNeighbors = rng.range(4, 9); // 4-9 neighbors
    }

    // 2. Add Guests to Density
    const neighbors = baseNeighbors + extraGuests;

    // 3. Determine Mode & Price based on FINAL Density
    let mode, deliveryFee, isAnomaly;

    if (neighbors >= 10) {
        mode = "green";
        deliveryFee = 0.00;
        isAnomaly = false;
    } else if (neighbors >= 4) {
        mode = "yellow";
        deliveryFee = 1.99;
        isAnomaly = false;
    } else {
        mode = "red";
        deliveryFee = 7.99;
        isAnomaly = true; // Low density
    }

    let description;
    if (mode === "green") {
        description = `Viral Hit: With ${neighbors} neighbors (10+ orders), we've unlocked FREE delivery for the entire cluster!`;
    } else if (mode === "yellow") {
        description = `Growing Fast: ${neighbors} neighbors joined (4-9 orders). Fee drops to $1.99. Reach 10+ to unlock FREE delivery!`;
    } else {
        description = "Start the Group: Be the first (1-3 orders) to anchor this batch. Fee is $7.99 until more neighbors join.";
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
