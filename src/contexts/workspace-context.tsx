"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { WorkspaceData, ColorPalette } from "@/lib/types";

interface WorkspaceContextType {
  workspaceData: WorkspaceData | null;
  colorPalette: ColorPalette | null;
  selectedColors: { background: string; accent: string } | null;
  setWorkspaceData: (data: WorkspaceData | null) => void;
  setColorPalette: (palette: ColorPalette | null) => void;
  setSelectedColors: (colors: { background: string; accent: string } | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [selectedColors, setSelectedColors] = useState<{
    background: string;
    accent: string;
  } | null>(null);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceData,
        colorPalette,
        selectedColors,
        setWorkspaceData,
        setColorPalette,
        setSelectedColors,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
