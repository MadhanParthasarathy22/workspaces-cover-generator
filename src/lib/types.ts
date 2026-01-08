export interface WorkspaceData {
  name: string;
  title: string;
  bio: string;
  location?: string;
  workspaceItems: string[];
  images: string[];
}

export interface ColorPalette {
  background: string;
  accent: string;
  allSwatches: Swatch[];
  colorGroups: ColorGroup[];
  detectedMode: "light" | "dark";
}

export interface Swatch {
  name: string;
  hex: string;
  population: number;
}

export interface ColorGroup {
  representative: string;  // Main hex color representing this group
  variants: string[];      // Similar colors grouped together
  frequency: number;       // How many images this color appears in
  lightness: number;       // 0-100 for mode detection
  category: "dark" | "light" | "vibrant" | "muted";
}

export interface ColorPair {
  background: string;
  accent: string;
}

export interface ScrapeResult {
  success: boolean;
  data?: WorkspaceData;
  error?: string;
}

export interface ColorResult {
  success: boolean;
  palette?: ColorPalette;
  error?: string;
}

