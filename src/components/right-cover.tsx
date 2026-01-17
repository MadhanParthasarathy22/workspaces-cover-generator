"use client";

import type { WorkspaceData } from "@/lib/types";

interface RightCoverProps {
  data: WorkspaceData;
  selectedColors?: { background?: string; accent?: string };
}

// W Icon Component - square with rounded corners containing "W"
function WIcon({ color }: { color: string }) {
  // Icon dimensions from Figma: 28×31px at 842px height
  // Scaled to 458.349px height: (28/842) * 438.349 = ~14.6px width, (31/842) * 438.349 = ~16.2px height
  const iconWidth = 14.6;
  const iconHeight = 16.2;
  
  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 28 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 0C26.2091 0 28 1.79086 28 4V27C28 29.14 26.3194 30.8879 24.2061 30.9951L24 31H4L3.79395 30.9951C1.68056 30.8879 0 29.14 0 27V4C0 1.79086 1.79086 9.66384e-08 4 0H24ZM26 25.4639C25.4673 25.7722 24.8575 25.9621 24.2061 25.9951L24 26H4L3.79395 25.9951C3.14249 25.9621 2.5327 25.7721 2 25.4639V27C2 28.1046 2.89543 29 4 29H24C25.1046 29 26 28.1046 26 27V25.4639ZM4 2C2.89543 2 2 2.89543 2 4V22C2 23.1046 2.89543 24 4 24H24C25.1046 24 26 23.1046 26 22V4C26 2.89543 25.1046 2 24 2H4Z"
        fill={color}
      />
      <path
        d="M5.253 6.773L5.055 6.113V6.069H6.518L6.529 6.113L6.705 6.773L7.816 10.898C7.95533 11.47 8.06533 11.998 8.146 12.482C8.234 11.998 8.34767 11.47 8.487 10.898L9.543 6.949L9.598 6.773L9.774 6.069H11.402L11.413 6.113L11.589 6.773L12.678 10.909C12.8173 11.4737 12.9273 11.998 13.008 12.482C13.096 11.998 13.2097 11.4737 13.349 10.909L14.46 6.773L14.636 6.113L14.647 6.069H16.099V6.113L15.901 6.773L13.789 14H12.238L10.962 9.435C10.808 8.863 10.687 8.33867 10.599 7.862C10.4963 8.33867 10.368 8.863 10.214 9.435L8.927 14H7.387L5.253 6.773Z"
        fill={color}
      />
    </svg>
  );
}

export function RightCover({ data, selectedColors }: RightCoverProps) {
  // Get colors from selectedColors or use defaults from Figma
  const backgroundColor = selectedColors?.background || "#bdc771";
  const textColor = selectedColors?.accent || "#366302";
  
  const rightCoverWidth = 120;
  const baseHeight = 458.349;
  const padding = 10;
  
  // Content area dimensions (after padding)
  const contentWidth = rightCoverWidth - padding * 2; // 100px
  const contentHeight = baseHeight - padding * 2; // 438.349px
  
  // Original Figma frame dimensions: 223×842px
  // Our dimensions: 120×458.349px
  // Scale factor for width: 120 / 223 = 0.538
  // Scale factor for height: 458.349 / 842 = 0.544
  
  // Text position from Figma: (18px, 17px) in 223×842 frame
  // Scaled positions proportionally:
  const textX = padding + (18 / 223) * contentWidth; // ~18.07px
  const textY = padding + (17 / 842) * contentHeight; // ~18.85px
  
  // Icon position from Figma: (13px, 796px) in 223×842 frame, size 28×31px
  // Scaled positions proportionally:
  const iconX = padding + (13 / 223) * contentWidth; // ~15.83px
  const iconY = padding + (796 / 842) * contentHeight; // ~423.5px
  
  return (
    <div
      data-component="right-cover"
      className="absolute top-0"
      style={{
        width: `${rightCoverWidth}px`,
        height: `${baseHeight}px`,
        backgroundColor,
        paddingTop: `${padding}px`,
        paddingRight: `${padding}px`,
        paddingBottom: `${padding}px`,
        paddingLeft: `${padding}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "visible",
      }}
    >
      {/* Bio text */}
      <p
        style={{
          width: `${rightCoverWidth - padding * 2}px`, // Fill entire width with 10px padding on each side
          fontSize: "8px",
          fontWeight: 550,
          color: textColor,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          lineHeight: "normal",
          margin: 0,
          whiteSpace: "pre-line", // Preserve paragraph breaks from \n\n separators
        }}
      >
        {data.bio || "No bio available."}
      </p>
    </div>
  );
}
