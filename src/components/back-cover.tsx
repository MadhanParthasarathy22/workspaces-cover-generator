"use client";

import Image from "next/image";
import type { WorkspaceData } from "@/lib/types";

interface BackCoverProps {
  data: WorkspaceData;
  selectedColors?: { background?: string; accent?: string };
}

export function BackCover({ data, selectedColors }: BackCoverProps) {
  // Get colors from selectedColors or use defaults
  const backgroundColor = selectedColors?.background || "#c0c0c0";
  const textColor = selectedColors?.accent || "#1e1e1e";
  const backWidth = 323.892;
  const backHeight = 458.349;

  // Get images for bottom row (skip images[0] which is used on front cover)
  const bottomImages = data.images.slice(1, 4); // images[1], images[2], images[3]

  // Image dimensions - full width with larger gaps
  // Total available width: backWidth - padding (10px on each side)
  const imageGap = 8; // Gap between images
  const totalImageWidth = backWidth - 20; // 10px padding on each side
  const imageWidth = Math.floor((totalImageWidth - imageGap * 2) / 3); // 3 images with 2 gaps
  const imageHeight = 120; // Reduced from 215px to make images smaller

  return (
    <div
      data-component="back-cover"
      className="absolute top-0 left-0"
      style={{
        width: `${backWidth}px`,
        height: `${backHeight}px`,
        backgroundColor,
        padding: "10px",
      }}
    >
      {/* Workspace Items List - positioned at top */}
      <div
        data-component="back-cover-workspace-items"
        style={{
          width: `${backWidth - 20}px`, // Full width minus 10px padding on each side
        }}
      >
        {data.workspaceItems.length > 0 ? (
          data.workspaceItems.map((item, index) => (
            <p
              key={index}
              className="mb-0"
              style={{
                fontSize: "8px",
                fontWeight: 550,
                color: textColor,
                fontFamily: "var(--font-inter), Inter, sans-serif",
                lineHeight: "normal",
              }}
            >
              {item}
            </p>
          ))
        ) : (
          <p
            className="mb-0"
            style={{
              fontSize: "8px",
              fontWeight: 550,
              color: textColor,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              lineHeight: "normal",
            }}
          >
            No workspace items available
          </p>
        )}
      </div>

      {/* Three Images at Bottom - arranged horizontally, full width */}
      <div
        data-component="back-cover-images-row"
        className="absolute flex items-center"
        style={{
          left: "10px", // Align with padding
          right: "10px", // Align with padding (full width)
          bottom: "10px", // Position at bottom with padding
          gap: `${imageGap}px`,
        }}
      >
        {bottomImages.map((imageUrl, index) => (
          <div
            key={index}
            className="relative overflow-hidden shrink-0"
            style={{
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
            }}
          >
            <Image
              src={imageUrl}
              alt={`${data.name} workspace image ${index + 2}`}
              fill
              className="object-cover"
              sizes={`${imageWidth}px`}
              unoptimized
            />
          </div>
        ))}
        {/* Placeholder spaces for missing images */}
        {Array.from({ length: 3 - bottomImages.length }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="relative bg-zinc-800 shrink-0"
            style={{
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="text-gray-400"
                style={{ width: "24px", height: "24px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
