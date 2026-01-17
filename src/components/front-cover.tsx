"use client";

import Image from "next/image";
import type { WorkspaceData } from "@/lib/types";

interface FrontCoverProps {
  data: WorkspaceData;
  selectedColors?: { background?: string; accent?: string };
  scale?: number;
}

export function FrontCover({ data, selectedColors, scale = 1.5 }: FrontCoverProps) {
  const coverImage = data.images.length > 0 ? data.images[0] : null;
  
  // Split location into two lines if it contains a comma
  // Default to "Earth, Milky Way" if no location
  const locationText = data.location || "Earth, Milky Way";
  const locationParts = locationText.split(",");
  const locationLines =
    locationParts.length > 1
      ? [locationParts[0].trim() + ",", locationParts.slice(1).join(",").trim()]
      : [locationText];

  // Get colors from selectedColors or use defaults
  const backgroundColor = selectedColors?.background || "#c0c0c0";
  const textColor = selectedColors?.accent || "#1e1e1e";
  const frontWidth = 323.892;
  const spineWidth = 57.702;
  const spineGap = 6;
  const baseWidth = frontWidth + spineWidth + spineGap;
  const baseHeight = 458.349;

  return (
    <div
      className="relative mx-auto"
      style={{
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Spine background */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: `${spineWidth}px`,
            height: `${baseHeight}px`,
            backgroundColor,
          }}
        />

        {/* Gap between spine and front cover (shows page background) */}
        <div
          className="absolute top-0"
          style={{
            left: `${spineWidth}px`,
            width: `${spineGap}px`,
            height: `${baseHeight}px`,
          }}
        />

        {/* Front cover background */}
        <div
          className="absolute top-0"
          style={{
            left: `${spineWidth + spineGap}px`,
            width: `${frontWidth}px`,
            height: `${baseHeight}px`,
            backgroundColor,
          }}
        />

        {/* Spine - grouped container with both text elements */}
        <div
          className="absolute flex flex-col"
          style={{
            left: 0,
            top: "13.06px",
            width: `${spineWidth}px`,
            height: "416px",
          }}
        >
          {/* Spine - vertical title aligned near top */}
          <div
            className="flex items-center justify-center"
            style={{
              width: `${spineWidth}px`,
              height: "239px",
            }}
          >
            <div
              style={{
                transform: "rotate(90deg)",
                transformOrigin: "center",
              }}
            >
              <p
                style={{
                  fontSize: "23px",
                  fontWeight: 500,
                  color: textColor,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                }}
              >
                Workspace Collection
              </p>
            </div>
          </div>

          {/* Spine - author name aligned to bottom */}
          <div
            className="flex items-center justify-center"
            style={{
              width: `${spineWidth}px`,
              height: "66px",
              marginTop: "111px",
            }}
          >
            <div
              style={{
                transform: "rotate(90deg)",
                transformOrigin: "center",
              }}
            >
              <p
                style={{
                  fontSize: "13.631px",
                  fontWeight: 400,
                  color: textColor,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                {data.name}
              </p>
            </div>
          </div>
        </div>

        {/* Front cover content, positioned to the right of the spine */}
        <div
          className="absolute"
          style={{
            left: `${spineWidth + spineGap}px`,
            top: 0,
            width: `${frontWidth}px`,
            height: `${baseHeight}px`,
          }}
        >
          {/* "Workspaces" Title - exact Figma positioning */}
          <h1
            className="absolute whitespace-nowrap"
            style={{
              left: "8.71px",
              top: "4.9px",
              fontSize: "35.403px",
              fontWeight: 500,
              color: textColor,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              lineHeight: "normal",
            }}
          >
            Workspaces
          </h1>

          {/* Author Name - exact Figma positioning */}
          <p
            className="absolute whitespace-nowrap"
            style={{
              left: "105.6px",
              top: "145.89px",
              fontSize: "13.631px",
              fontWeight: 400,
              color: textColor,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              lineHeight: "normal",
            }}
          >
            {data.name}
          </p>

          {/* Cover Image - exact Figma positioning and dimensions */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: "105.6px",
              top: "167.12px",
              width: "218.417px",
              height: "291.223px",
              backgroundColor: "#1e1e1e",
            }}
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`${data.name} workspace cover`}
                fill
                className="object-cover"
                sizes="218.417px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="text-gray-400"
                  style={{ width: "8.679px", height: "8.679px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Location - exact Figma positioning, split into two lines */}
          <div
            className="absolute"
            style={{
              left: "5.44px",
              top: "421.33px",
              fontSize: "13.631px",
              fontWeight: 400,
              color: textColor,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              lineHeight: "normal",
            }}
          >
            {locationLines.map((line, index) => (
              <p key={index} className="mb-0">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
