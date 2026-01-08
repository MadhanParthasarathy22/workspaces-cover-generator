/**
 * Color Approaches Module
 * 
 * Implements two approaches for color pair selection:
 * - Approach A: Harmonized (uses M3's Blend.harmonize)
 * - Approach B: Contrast Validated (checks WCAG AA 4.5:1)
 * 
 * Both approaches use the two most frequent colors as the starting point.
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

export interface ContrastValidatedPair extends ColorPair {
  contrastRatio: number;
  passesWCAG: boolean;
}

export interface ApproachState {
  pairs: ColorPair[];
  currentIndex: number;
}

export interface HarmonizedState extends ApproachState {
  pairs: HarmonizedPair[];
}

export interface ContrastState extends ApproachState {
  pairs: ContrastValidatedPair[];
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
export function generateColorPairs(colorGroups: ColorGroup[]): ColorPair[] {
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
// Contrast Range Filter
// ============================================

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
// Approach A: Harmonization
// ============================================

/**
 * Apply M3's Blend.harmonize to shift the accent color toward the background
 * This makes the colors feel more cohesive while keeping accent's character
 */
export function harmonizeColor(accentHex: string, backgroundHex: string): string {
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
export function applyHarmonization(pair: ColorPair): HarmonizedPair {
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
export function generateHarmonizedPairs(colorGroups: ColorGroup[]): HarmonizedPair[] {
  const basePairs = generateColorPairs(colorGroups);
  const filtered = filterByContrastRange(basePairs);
  return filtered.map(applyHarmonization);
}

// ============================================
// Approach B: Contrast Validation
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
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a contrast ratio passes WCAG AA (4.5:1)
 */
export function passesWCAGAA(contrastRatio: number): boolean {
  return contrastRatio >= 4.5;
}

/**
 * Validate contrast for a color pair
 */
export function validateContrast(pair: ColorPair): ContrastValidatedPair {
  const contrastRatio = calculateContrastRatio(pair.background, pair.accent);
  
  return {
    ...pair,
    contrastRatio: Math.round(contrastRatio * 10) / 10, // Round to 1 decimal
    passesWCAG: passesWCAGAA(contrastRatio),
  };
}

/**
 * Generate all contrast-validated pairs from color groups
 * Filters by contrast range (2.1:1 to 12:1) before validating
 */
export function generateContrastValidatedPairs(colorGroups: ColorGroup[]): ContrastValidatedPair[] {
  const basePairs = generateColorPairs(colorGroups);
  const filtered = filterByContrastRange(basePairs);
  return filtered.map(validateContrast);
}

// ============================================
// State Management
// ============================================

/**
 * Initialize harmonized approach state
 */
export function initHarmonizedState(colorGroups: ColorGroup[]): HarmonizedState {
  const pairs = generateHarmonizedPairs(colorGroups);
  return {
    pairs,
    currentIndex: 0,
  };
}

/**
 * Initialize contrast approach state
 */
export function initContrastState(colorGroups: ColorGroup[]): ContrastState {
  const pairs = generateContrastValidatedPairs(colorGroups);
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
 * Get current pair from contrast state
 */
export function getCurrentContrastPair(state: ContrastState): ContrastValidatedPair | null {
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
 * Regenerate: cycle to next pair in contrast state
 */
export function regenerateContrast(state: ContrastState): ContrastState {
  if (state.pairs.length <= 1) return state;
  
  return {
    ...state,
    currentIndex: (state.currentIndex + 1) % state.pairs.length,
  };
}

