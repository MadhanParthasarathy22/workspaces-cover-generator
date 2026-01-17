"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColorPalette } from "@/lib/types";
import {
  initHarmonizedState,
  getCurrentHarmonizedPair,
  regenerateHarmonized,
  type HarmonizedState,
} from "@/lib/color-approaches";

interface ColorComparisonProps {
  palette: ColorPalette;
  onColorChange?: (background: string, accent: string) => void;
}

/**
 * Color Palette Component
 * Shows harmonized color pairs using M3's Blend.harmonize
 * Pairs are filtered by contrast range (2.1:1 to 12:1)
 */
export function ColorComparison({
  palette,
  onColorChange,
}: ColorComparisonProps) {
  const [harmonizedState, setHarmonizedState] = useState<HarmonizedState | null>(null);

  // Initialize state when palette changes
  useEffect(() => {
    if (palette.colorGroups && palette.colorGroups.length >= 2) {
      const hState = initHarmonizedState(palette.colorGroups);
      setHarmonizedState(hState);
      
      // Notify parent of initial selection
      const pair = getCurrentHarmonizedPair(hState);
      if (pair) {
        onColorChange?.(pair.background, pair.accent);
      }
    }
  }, [palette]);

  if (!harmonizedState) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <p className="text-zinc-500 text-center">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const harmonizedPair = getCurrentHarmonizedPair(harmonizedState);

  // Handle case where contrast filtering leaves no valid pairs
  if (!harmonizedPair) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-zinc-400">No color pairs found within contrast range</p>
            <p className="text-xs text-zinc-600">
              The extracted colors don&apos;t have enough contrast difference (2.1:1 to 12:1)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  function handleRegenerate() {
    if (!harmonizedState) return;
    const newState = regenerateHarmonized(harmonizedState);
    setHarmonizedState(newState);
    
    const pair = getCurrentHarmonizedPair(newState);
    if (pair) {
      onColorChange?.(pair.background, pair.accent);
    }
  }

  return (
    <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 shadow-xl">
      <CardHeader className="pb-4">
        <h3 className="text-white text-xl leading-none font-bold flex items-center justify-between">
          <span className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🎨</span>
            <span>Color Palette</span>
          </span>
          <span className="text-sm font-medium text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-full" aria-label={`Color pair ${harmonizedState.currentIndex + 1} of ${harmonizedState.pairs.length}`}>
            {harmonizedState.currentIndex + 1} / {harmonizedState.pairs.length}
          </span>
        </h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div
          className="rounded-xl p-8 transition-colors duration-300 shadow-2xl"
          style={{ backgroundColor: harmonizedPair.background }}
        >
          <div className="space-y-4">
            <h3
              className="text-3xl font-bold transition-colors duration-300 tracking-tight"
              style={{ color: harmonizedPair.accent }}
            >
              Workspaces
            </h3>
            <p
              className="text-base opacity-90 transition-colors duration-300 leading-relaxed"
              style={{ color: harmonizedPair.accent }}
            >
              Preview of your book cover colors
            </p>
          </div>
        </div>

        {/* Color Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border-2 border-zinc-700/50 shadow-md"
              style={{ backgroundColor: harmonizedPair.background }}
              role="img"
              aria-label={`Background color: ${harmonizedPair.background}`}
            />
            <div>
              <p className="text-sm font-medium text-zinc-300">Background</p>
              <code className="text-xs text-zinc-400 uppercase font-mono" aria-label={`Color code: ${harmonizedPair.background}`}>{harmonizedPair.background}</code>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border-2 border-zinc-700/50 shadow-md"
              style={{ backgroundColor: harmonizedPair.accent }}
              role="img"
              aria-label={`Accent color: ${harmonizedPair.accent}`}
            />
            <div>
              <p className="text-sm font-medium text-zinc-300">Accent</p>
              <code className="text-xs text-zinc-400 uppercase font-mono" aria-label={`Color code: ${harmonizedPair.accent}`}>{harmonizedPair.accent}</code>
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic pt-2 border-t border-zinc-800">
            Harmonized from <code className="uppercase font-mono" aria-label={`Original accent color: ${harmonizedPair.originalAccent}`}>{harmonizedPair.originalAccent}</code>
          </p>
        </div>

        {/* Regenerate Button */}
        <Button
          onClick={handleRegenerate}
          variant="outline"
          className="w-full h-12 border-zinc-700/50 bg-zinc-800/30 text-zinc-200 hover:bg-zinc-800/50 hover:text-white hover:border-zinc-600 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 transition-all font-medium shadow-md"
          disabled={harmonizedState.pairs.length <= 1}
          aria-label="Regenerate color palette"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Regenerate Colors
        </Button>

        <p className="text-xs text-zinc-500 text-center italic">
          Colors are harmonized using M3 Blend for cohesive pairing
        </p>
      </CardContent>
    </Card>
  );
}
