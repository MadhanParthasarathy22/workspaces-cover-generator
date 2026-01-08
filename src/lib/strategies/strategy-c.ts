/**
 * Strategy C: Auto-Detect + Toggle
 * 
 * Behavior:
 * - Auto-detects light/dark mode from workspace colors
 * - Regenerate cycles through pairs within the current mode
 * - Toggle button switches between light and dark modes
 */

import type { ColorGroup, ColorPair } from "@/lib/types";
import {
  detectWorkspaceMode,
  generateDarkModePairs,
  generateLightModePairs,
} from "@/lib/color-utils";

export interface StrategyCState {
  detectedMode: "light" | "dark";
  currentMode: "light" | "dark";
  darkPairs: ColorPair[];
  lightPairs: ColorPair[];
  currentIndex: number;
  isAutoDetected: boolean;
}

/**
 * Initialize Strategy C state from color groups
 */
export function initStrategyC(colorGroups: ColorGroup[]): StrategyCState {
  const detectedMode = detectWorkspaceMode(colorGroups);
  const darkPairs = generateDarkModePairs(colorGroups);
  const lightPairs = generateLightModePairs(colorGroups);

  return {
    detectedMode,
    currentMode: detectedMode,
    darkPairs,
    lightPairs,
    currentIndex: 0,
    isAutoDetected: true,
  };
}

/**
 * Get the current color pair for Strategy C
 */
export function getCurrentPairC(state: StrategyCState): ColorPair {
  const pairs = state.currentMode === "dark" ? state.darkPairs : state.lightPairs;

  if (pairs.length === 0) {
    return { background: "#1a1a1a", accent: "#d45a00" };
  }

  return pairs[state.currentIndex % pairs.length];
}

/**
 * Get total pairs available in current mode
 */
export function getTotalPairsC(state: StrategyCState): number {
  const pairs = state.currentMode === "dark" ? state.darkPairs : state.lightPairs;
  return pairs.length;
}

/**
 * Regenerate: Move to next pair within current mode
 */
export function regenerateC(state: StrategyCState): StrategyCState {
  const pairs = state.currentMode === "dark" ? state.darkPairs : state.lightPairs;

  if (pairs.length <= 1) {
    return state;
  }

  return {
    ...state,
    currentIndex: (state.currentIndex + 1) % pairs.length,
  };
}

/**
 * Toggle between light and dark mode
 */
export function toggleModeC(state: StrategyCState): StrategyCState {
  const newMode = state.currentMode === "dark" ? "light" : "dark";

  return {
    ...state,
    currentMode: newMode,
    currentIndex: 0, // Reset to first option in new mode
    isAutoDetected: false, // User has overridden auto-detection
  };
}

/**
 * Reset to auto-detected mode
 */
export function resetToAutoC(state: StrategyCState): StrategyCState {
  return {
    ...state,
    currentMode: state.detectedMode,
    currentIndex: 0,
    isAutoDetected: true,
  };
}

