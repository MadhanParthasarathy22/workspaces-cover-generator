/**
 * Color Approaches Module
 * 
 * Implements harmonized color pair selection using M3's Blend.harmonize
 * Colors are filtered by contrast range (2.1:1 to 12:1) before harmonization
 */

import { Blend, argbFromHex, hexFromArgb } from "@material/material-color-utilities";
import type { ColorGroup } from "./types";
import { hexToRgb } from "./color-utils";

// ============================================
// Types
// ============================================

export interface ColorPair {
  background: string;
  accent: string;
}

export interface HarmonizedPair extends ColorPair {
  originalAccent: string; // The accent before harmonization
}

export interface HarmonizedState {
  pairs: HarmonizedPair[];
  currentIndex: number;
}

// ============================================
// Contrast Range Filter Constants
// ============================================

const MIN_CONTRAST = 2.1;
const MAX_CONTRAST = 12;

// ============================================
// Pair Generation
// ============================================

/**
 * Generate all possible color pairs from the top frequent colors
 * Pairs: 1+2, 1+3, 2+3, 1+4, 2+4, 3+4, etc.
 * First color in each pair is background, second is accent
 */
function generateColorPairs(colorGroups: ColorGroup[]): ColorPair[] {
  // Take top colors (at least 4 for variety)
  const topColors = colorGroups.slice(0, Math.min(6, colorGroups.length));
  
  if (topColors.length < 2) {
    return [];
  }

  const pairs: ColorPair[] = [];

  // Generate combinations: (0,1), (0,2), (1,2), (0,3), (1,3), (2,3), etc.
  for (let i = 0; i < topColors.length; i++) {
    for (let j = i + 1; j < topColors.length; j++) {
      // First pair: i as bg, j as accent
      pairs.push({
        background: topColors[i].representative,
        accent: topColors[j].representative,
      });
      
      // Second pair: j as bg, i as accent (swapped)
      pairs.push({
        background: topColors[j].representative,
        accent: topColors[i].representative,
      });
    }
  }

  return pairs;
}

// ============================================
// Contrast Calculation (for filtering)
// ============================================

/**
 * Calculate relative luminance of a color (for WCAG contrast)
 * Formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  
  const toLinear = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns value between 1 (no contrast) and 21 (max contrast)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Filter color pairs to only include those within the acceptable contrast range
 * Removes pairs that are too similar (muddy) or too extreme (jarring)
 * Range: 2.1:1 to 12:1
 */
function filterByContrastRange(pairs: ColorPair[]): ColorPair[] {
  return pairs.filter(pair => {
    const ratio = calculateContrastRatio(pair.background, pair.accent);
    return ratio >= MIN_CONTRAST && ratio <= MAX_CONTRAST;
  });
}

// ============================================
// Harmonization
// ============================================

/**
 * Apply M3's Blend.harmonize to shift the accent color toward the background
 * This makes the colors feel more cohesive while keeping accent's character
 */
function harmonizeColor(accentHex: string, backgroundHex: string): string {
  try {
    const accentArgb = argbFromHex(accentHex);
    const backgroundArgb = argbFromHex(backgroundHex);
    
    // Harmonize shifts accent's hue toward background's hue
    const harmonizedArgb = Blend.harmonize(accentArgb, backgroundArgb);
    
    return hexFromArgb(harmonizedArgb);
  } catch {
    // Fallback to original if harmonization fails
    return accentHex;
  }
}

/**
 * Apply harmonization to a color pair
 */
function applyHarmonization(pair: ColorPair): HarmonizedPair {
  const harmonizedAccent = harmonizeColor(pair.accent, pair.background);
  
  return {
    background: pair.background,
    accent: harmonizedAccent,
    originalAccent: pair.accent,
  };
}

/**
 * Generate all harmonized pairs from color groups
 * Filters by contrast range (2.1:1 to 12:1) before harmonizing
 */
function generateHarmonizedPairs(colorGroups: ColorGroup[]): HarmonizedPair[] {
  const basePairs = generateColorPairs(colorGroups);
  const filtered = filterByContrastRange(basePairs);
  return filtered.map(applyHarmonization);
}

// ============================================
// State Management
// ============================================

/**
 * Initialize harmonized state from color groups
 */
export function initHarmonizedState(colorGroups: ColorGroup[]): HarmonizedState {
  const pairs = generateHarmonizedPairs(colorGroups);
  return {
    pairs,
    currentIndex: 0,
  };
}

/**
 * Get current pair from harmonized state
 */
export function getCurrentHarmonizedPair(state: HarmonizedState): HarmonizedPair | null {
  if (state.pairs.length === 0) return null;
  return state.pairs[state.currentIndex];
}

/**
 * Regenerate: cycle to next pair in harmonized state
 */
export function regenerateHarmonized(state: HarmonizedState): HarmonizedState {
  if (state.pairs.length <= 1) return state;
  
  return {
    ...state,
    currentIndex: (state.currentIndex + 1) % state.pairs.length,
  };
}

/**
 * Navigate to previous pair in harmonized state
 */
export function navigateToPreviousPair(state: HarmonizedState): HarmonizedState {
  if (state.pairs.length <= 1) return state;
  
  return {
    ...state,
    currentIndex: state.currentIndex === 0 
      ? state.pairs.length - 1 
      : state.currentIndex - 1,
  };
}

/**
 * Navigate to next pair in harmonized state
 */
export function navigateToNextPair(state: HarmonizedState): HarmonizedState {
  if (state.pairs.length <= 1) return state;
  
  return {
    ...state,
    currentIndex: (state.currentIndex + 1) % state.pairs.length,
  };
}
