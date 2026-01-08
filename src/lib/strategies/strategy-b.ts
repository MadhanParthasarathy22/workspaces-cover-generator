/**
 * Strategy B: Single Smart Button
 * 
 * Behavior: One button cycles through ALL combinations
 * - Alternates between Dark and Light mode: Dark → Light → Dark → Light
 * - Wraps around when reaching the end
 */

import type { ColorGroup, ColorPair } from "@/lib/types";
import { generateAllColorPairs, getLightness } from "@/lib/color-utils";

export interface StrategyBState {
  allPairs: ColorPair[];
  currentIndex: number;
  totalPairs: number;
}

/**
 * Initialize Strategy B state from color groups
 */
export function initStrategyB(colorGroups: ColorGroup[]): StrategyBState {
  const allPairs = generateAllColorPairs(colorGroups);
  
  return {
    allPairs,
    currentIndex: 0,
    totalPairs: allPairs.length,
  };
}

/**
 * Get the current color pair for Strategy B
 */
export function getCurrentPairB(state: StrategyBState): ColorPair {
  if (state.allPairs.length === 0) {
    return { background: "#1a1a1a", accent: "#d45a00" };
  }
  return state.allPairs[state.currentIndex];
}

/**
 * Regenerate: Move to next pair in Strategy B
 * Alternates between dark and light mode pairs
 */
export function regenerateB(state: StrategyBState): StrategyBState {
  if (state.allPairs.length <= 1) {
    return state;
  }
  
  return {
    ...state,
    currentIndex: (state.currentIndex + 1) % state.allPairs.length,
  };
}

/**
 * Check if the current pair is a "dark mode" pair
 * Based on the background color lightness
 */
export function isCurrentPairDark(state: StrategyBState): boolean {
  const currentPair = getCurrentPairB(state);
  return getLightness(currentPair.background) < 50;
}

