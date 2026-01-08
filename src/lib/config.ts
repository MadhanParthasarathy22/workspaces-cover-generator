/**
 * Feature flags and configuration for testing different strategies
 * 
 * Change COLOR_STRATEGY to test different approaches:
 * - "B": Single smart button cycles through all (dark → light)
 * - "C": Auto-detect mode with toggle override
 */

// Strategy selection - change this to test different strategies
export const COLOR_STRATEGY: "B" | "C" = "B";

// Alternative: use environment variable for easier switching without code changes
// export const COLOR_STRATEGY = (process.env.NEXT_PUBLIC_COLOR_STRATEGY || "C") as "B" | "C";

