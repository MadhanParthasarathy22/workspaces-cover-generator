"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColorPalette } from "@/lib/types";
import {
  initHarmonizedState,
  initContrastState,
  getCurrentHarmonizedPair,
  getCurrentContrastPair,
  regenerateHarmonized,
  regenerateContrast,
  type HarmonizedState,
  type ContrastState,
} from "@/lib/color-approaches";

interface ColorComparisonProps {
  palette: ColorPalette;
  onColorChange?: (background: string, accent: string) => void;
}

/**
 * Color Comparison Component
 * Shows two approaches side by side:
 * - Harmonized: M3's Blend.harmonize for cohesive feel
 * - Contrast Validated: WCAG AA 4.5:1 compliance check
 */
export function ColorComparison({
  palette,
  onColorChange,
}: ColorComparisonProps) {
  const [harmonizedState, setHarmonizedState] = useState<HarmonizedState | null>(null);
  const [contrastState, setContrastState] = useState<ContrastState | null>(null);

  // Initialize states when palette changes
  useEffect(() => {
    if (palette.colorGroups && palette.colorGroups.length >= 2) {
      const hState = initHarmonizedState(palette.colorGroups);
      const cState = initContrastState(palette.colorGroups);
      
      setHarmonizedState(hState);
      setContrastState(cState);
      
      // Notify parent of initial harmonized selection
      const pair = getCurrentHarmonizedPair(hState);
      if (pair) {
        onColorChange?.(pair.background, pair.accent);
      }
    }
  }, [palette]);

  if (!harmonizedState || !contrastState) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-500 text-center">Loading...</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <p className="text-zinc-500 text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const harmonizedPair = getCurrentHarmonizedPair(harmonizedState);
  const contrastPair = getCurrentContrastPair(contrastState);

  // Handle case where contrast filtering leaves no valid pairs
  if (!harmonizedPair || !contrastPair) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="text-center space-y-2">
          <p className="text-zinc-400">No color pairs found within contrast range</p>
          <p className="text-xs text-zinc-600">
            The extracted colors don&apos;t have enough contrast difference (2.1:1 to 12:1)
          </p>
        </div>
      </div>
    );
  }

  function handleRegenerateHarmonized() {
    if (!harmonizedState) return;
    const newState = regenerateHarmonized(harmonizedState);
    setHarmonizedState(newState);
  }

  function handleRegenerateContrast() {
    if (!contrastState) return;
    const newState = regenerateContrast(contrastState);
    setContrastState(newState);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Harmonized Approach Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              Harmonized
            </span>
            <span className="text-sm font-normal text-zinc-500">
              {harmonizedState.currentIndex + 1} / {harmonizedState.pairs.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          <div
            className="rounded-lg p-6 transition-colors duration-300"
            style={{ backgroundColor: harmonizedPair.background }}
          >
            <div className="space-y-3">
              <h3
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: harmonizedPair.accent }}
              >
                Workspaces
              </h3>
              <p
                className="text-sm opacity-80 transition-colors duration-300"
                style={{ color: harmonizedPair.accent }}
              >
                Preview with harmonized colors
              </p>
            </div>
          </div>

          {/* Color Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-zinc-700"
                style={{ backgroundColor: harmonizedPair.background }}
              />
              <span className="text-xs text-zinc-400">
                BG: <code className="uppercase">{harmonizedPair.background}</code>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-zinc-700"
                style={{ backgroundColor: harmonizedPair.accent }}
              />
              <span className="text-xs text-zinc-400">
                Accent: <code className="uppercase">{harmonizedPair.accent}</code>
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              (harmonized from <code className="uppercase">{harmonizedPair.originalAccent}</code>)
            </p>
          </div>

          {/* Regenerate Button */}
          <Button
            onClick={handleRegenerateHarmonized}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            disabled={harmonizedState.pairs.length <= 1}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </Button>

          <p className="text-xs text-zinc-600 text-center">
            M3 Blend.harmonize() shifts accent toward background
          </p>
        </CardContent>
      </Card>

      {/* Contrast Validated Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Contrast Validated
            </span>
            <span className="text-sm font-normal text-zinc-500">
              {contrastState.currentIndex + 1} / {contrastState.pairs.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          <div
            className="rounded-lg p-6 transition-colors duration-300"
            style={{ backgroundColor: contrastPair.background }}
          >
            <div className="space-y-3">
              <h3
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: contrastPair.accent }}
              >
                Workspaces
              </h3>
              <p
                className="text-sm opacity-80 transition-colors duration-300"
                style={{ color: contrastPair.accent }}
              >
                Preview with original colors
              </p>
            </div>
          </div>

          {/* Color Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-zinc-700"
                style={{ backgroundColor: contrastPair.background }}
              />
              <span className="text-xs text-zinc-400">
                BG: <code className="uppercase">{contrastPair.background}</code>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-zinc-700"
                style={{ backgroundColor: contrastPair.accent }}
              />
              <span className="text-xs text-zinc-400">
                Accent: <code className="uppercase">{contrastPair.accent}</code>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  contrastPair.passesWCAG
                    ? "bg-emerald-900/50 text-emerald-300"
                    : "bg-amber-900/50 text-amber-300"
                }`}
              >
                Contrast: {contrastPair.contrastRatio}:1{" "}
                {contrastPair.passesWCAG ? "✓" : "⚠"}
              </span>
            </div>
          </div>

          {/* Regenerate Button */}
          <Button
            onClick={handleRegenerateContrast}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            disabled={contrastState.pairs.length <= 1}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </Button>

          <p className="text-xs text-zinc-600 text-center">
            WCAG AA requires 4.5:1 contrast ratio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

