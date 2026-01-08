"use server";

import type { ColorResult, ColorPalette, Swatch, ColorGroup } from "@/lib/types";
import {
  groupColorsByFrequency,
  detectWorkspaceMode,
  generateDarkModePairs,
  generateLightModePairs,
  getLightness,
  getColorCategory,
} from "@/lib/color-utils";

/**
 * Server Action to extract colors from multiple image URLs using frequency-based analysis
 * Extracts colors from each image, groups similar colors, and ranks by frequency
 */
export async function extractColors(imageUrls: string | string[]): Promise<ColorResult> {
  // Normalize to array
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  
  if (urls.length === 0 || !urls[0]) {
    return {
      success: false,
      error: "Please provide at least one image URL",
    };
  }

  try {
    // Dynamic import to avoid bundling for client
    const { Vibrant } = await import("node-vibrant/node");
    
    // Only use first 3 hero images for color extraction (better quality shots)
    const imagesToProcess = urls.slice(0, 3);
    
    // Extract colors from each image in parallel
    const colorExtractionPromises = imagesToProcess.map(async (url): Promise<string[]> => {
      try {
        const palette = await Vibrant.from(url).getPalette();
        const colors: string[] = [];
        
        // Get the dominant colors from this image
        const swatchOrder = ["Vibrant", "DarkMuted", "Muted", "DarkVibrant", "LightVibrant", "LightMuted"] as const;
        
        for (const name of swatchOrder) {
          const swatch = palette[name];
          if (swatch) {
            colors.push(swatch.hex);
          }
        }
        
        return colors;
      } catch (err) {
        console.warn(`Failed to extract colors from ${url}:`, err);
        return [];
      }
    });
    
    const colorsPerImage = await Promise.all(colorExtractionPromises);
    
    // Filter out empty results
    const validColorsPerImage = colorsPerImage.filter(colors => colors.length > 0);
    
    if (validColorsPerImage.length === 0) {
      return {
        success: false,
        error: "Could not extract colors from any of the provided images",
      };
    }
    
    // Group colors by frequency across all images
    const colorGroups = groupColorsByFrequency(validColorsPerImage);
    
    if (colorGroups.length === 0) {
      return {
        success: false,
        error: "No valid colors could be extracted",
      };
    }
    
    // Detect workspace mode (light or dark)
    const detectedMode = detectWorkspaceMode(colorGroups);
    
    // Generate color pairs based on detected mode
    const pairs = detectedMode === "dark" 
      ? generateDarkModePairs(colorGroups)
      : generateLightModePairs(colorGroups);
    
    // Pick the first pair as default
    const defaultPair = pairs[0] || {
      background: colorGroups[0]?.representative || "#1a1a1a",
      accent: colorGroups[1]?.representative || "#d45a00",
    };
    
    // Convert color groups to legacy swatches for backward compatibility
    const allSwatches: Swatch[] = colorGroups.slice(0, 6).map((group, index) => ({
      name: `Group${index + 1}_${group.category}`,
      hex: group.representative,
      population: group.frequency * 1000, // Scale frequency for display
    }));

    const colorPalette: ColorPalette = {
      background: defaultPair.background,
      accent: defaultPair.accent,
      allSwatches,
      colorGroups,
      detectedMode,
    };

    return {
      success: true,
      palette: colorPalette,
    };
  } catch (error) {
    console.error("Color extraction error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract colors from images",
    };
  }
}

/**
 * Legacy function for single image extraction (backward compatible)
 */
export async function extractColorsFromSingleImage(imageUrl: string): Promise<ColorResult> {
  return extractColors([imageUrl]);
}
