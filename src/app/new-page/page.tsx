"use client";

import { useState, useEffect } from "react";
import { BookSpread } from "@/components/book-spread";
import { CanvasUrlInput } from "@/components/canvas-url-input";
import { ExportButton } from "@/components/export-button";
import { useWorkspace } from "@/contexts/workspace-context";
import { scrapeWorkspaceUrl } from "@/app/actions/scrape";
import { extractColors } from "@/app/actions/colors";
import {
  initHarmonizedState,
  getCurrentHarmonizedPair,
  regenerateHarmonized,
  navigateToPreviousPair,
  navigateToNextPair,
  type HarmonizedState,
} from "@/lib/color-approaches";

export default function NewPage() {
  const {
    workspaceData,
    colorPalette,
    selectedColors,
    setWorkspaceData,
    setColorPalette,
    setSelectedColors,
  } = useWorkspace();

  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [harmonizedState, setHarmonizedState] = useState<HarmonizedState | null>(null);

  // Initialize harmonized state when color palette changes
  useEffect(() => {
    if (colorPalette?.colorGroups && colorPalette.colorGroups.length >= 2) {
      const hState = initHarmonizedState(colorPalette.colorGroups);
      setHarmonizedState(hState);

      // Set initial selected colors
      const pair = getCurrentHarmonizedPair(hState);
      if (pair) {
        setSelectedColors({
          background: pair.background,
          accent: pair.accent,
        });
      }
    }
  }, [colorPalette, setSelectedColors]);

  async function handleScrape(url: string) {
    setIsLoading(true);
    setError(null);
    setColorPalette(null);
    setSelectedColors(null);
    setHarmonizedState(null);

    const result = await scrapeWorkspaceUrl(url);

    if (result.success && result.data) {
      // Update shared context state with scraped data
      setWorkspaceData(result.data);

      // Auto-extract colors from ALL images using frequency-based analysis
      if (result.data.images.length > 0) {
        setIsExtractingColors(true);
        // Pass all images to extract colors with frequency analysis
        const colorResult = await extractColors(result.data.images);
        if (colorResult.success && colorResult.palette) {
          // Update shared context state with color palette
          setColorPalette(colorResult.palette);
          // Harmonized state will be initialized in useEffect
        }
        setIsExtractingColors(false);
      }
    } else {
      setError(result.error || "Failed to scrape workspace");
      setWorkspaceData(null);
    }

    setIsLoading(false);
  }

  function handleRegenerateColors() {
    if (!harmonizedState) return;

    const newState = regenerateHarmonized(harmonizedState);
    setHarmonizedState(newState);

    const pair = getCurrentHarmonizedPair(newState);
    if (pair) {
      setSelectedColors({
        background: pair.background,
        accent: pair.accent,
      });
    }
  }

  function handleNavigatePrevious() {
    if (!harmonizedState) return;

    const newState = navigateToPreviousPair(harmonizedState);
    setHarmonizedState(newState);

    const pair = getCurrentHarmonizedPair(newState);
    if (pair) {
      setSelectedColors({
        background: pair.background,
        accent: pair.accent,
      });
    }
  }

  function handleNavigateNext() {
    if (!harmonizedState) return;

    const newState = navigateToNextPair(harmonizedState);
    setHarmonizedState(newState);

    const pair = getCurrentHarmonizedPair(newState);
    if (pair) {
      setSelectedColors({
        background: pair.background,
        accent: pair.accent,
      });
    }
  }

  return (
    <div data-component="canvas-page-container" className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* White dots pattern */}
      <div data-component="canvas-dots-pattern" className="absolute inset-0 dots-pattern" />
      
      {/* Controls positioned 30px from top */}
      {workspaceData && (
        <div className="absolute top-[30px] left-1/2 -translate-x-1/2 z-20">
          <CanvasUrlInput
            onSubmit={handleScrape}
            onRegenerateColors={handleRegenerateColors}
            isLoading={isLoading || isExtractingColors}
            showControls={true}
            currentColorIndex={harmonizedState ? harmonizedState.currentIndex + 1 : 0}
            totalColors={harmonizedState ? harmonizedState.pairs.length : 0}
            onNavigatePrevious={handleNavigatePrevious}
            onNavigateNext={handleNavigateNext}
          />
        </div>
      )}
      
      {/* Export button positioned 30px from bottom */}
      {workspaceData && (
        <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-20">
          <ExportButton />
        </div>
      )}
      
      {/* Centered content */}
      <div data-component="canvas-content-wrapper" className="relative z-10 flex items-center justify-center px-4 py-8 w-full">
        {workspaceData ? (
          <BookSpread 
            data={workspaceData} 
            selectedColors={selectedColors || undefined}
            scale={1.25}
          />
        ) : (
          <div className="w-full max-w-3xl flex justify-center">
            <CanvasUrlInput
              onSubmit={handleScrape}
              onRegenerateColors={handleRegenerateColors}
              isLoading={isLoading || isExtractingColors}
              showControls={false}
            />
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div 
            data-component="canvas-error-message"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-3xl p-5 bg-red-50 border border-red-200 rounded-xl"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-800 text-center font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
