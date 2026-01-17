"use client";

import Image from "next/image";
import { BackCover } from "@/components/back-cover";
import { LeftCover } from "@/components/left-cover";
import { RightCover } from "@/components/right-cover";
import type { WorkspaceData } from "@/lib/types";

interface BookSpreadProps {
  data: WorkspaceData;
  selectedColors?: { background?: string; accent?: string };
  scale?: number;
}

export function BookSpread({ data, selectedColors, scale = 1.5 }: BookSpreadProps) {
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
  
  // Dimensions
  const leftCoverWidth = 120;
  const leftCoverGap = 6;
  const backWidth = 323.892;
  const frontWidth = 323.892;
  const spineWidth = 57.702;
  const spineGap = 6;
  const rightCoverGap = 6;
  const rightCoverWidth = 120;
  const baseHeight = 458.349;
  const totalWidth = leftCoverWidth + leftCoverGap + backWidth + spineGap + spineWidth + spineGap + frontWidth + rightCoverGap + rightCoverWidth;

  return (
    <div
      data-component="book-spread-container"
      className="relative mx-auto"
      style={{
        width: `${totalWidth * scale}px`,
        height: `${baseHeight * scale}px`,
      }}
    >
      <div
        data-component="book-spread-scalable-wrapper"
        className="absolute left-0 top-0"
        style={{
          width: `${totalWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Left Cover */}
        <LeftCover data={data} selectedColors={selectedColors} />

        {/* Gap between left cover and back cover (shows page background) */}
        <div
          data-component="left-cover-gap"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth}px`,
            width: `${leftCoverGap}px`,
            height: `${baseHeight}px`,
          }}
        />

        {/* Back Cover */}
        <div
          data-component="back-cover-wrapper"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap}px`,
            width: `${backWidth}px`,
            height: `${baseHeight}px`,
          }}
        >
          <BackCover data={data} selectedColors={selectedColors} />
        </div>

        {/* Gap between back cover and spine (shows page background) */}
        <div
          data-component="back-cover-spine-gap"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth}px`,
            width: `${spineGap}px`,
            height: `${baseHeight}px`,
          }}
        />

        {/* Spine background */}
        <div
          data-component="spine-background"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap}px`,
            width: `${spineWidth}px`,
            height: `${baseHeight}px`,
            backgroundColor,
          }}
        />

        {/* Gap between spine and front cover (shows page background) */}
        <div
          data-component="spine-front-cover-gap"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap + spineWidth}px`,
            width: `${spineGap}px`,
            height: `${baseHeight}px`,
          }}
        />

        {/* Front cover background */}
        <div
          data-component="front-cover-background"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap + spineWidth + spineGap}px`,
            width: `${frontWidth}px`,
            height: `${baseHeight}px`,
            backgroundColor,
          }}
        />

        {/* Spine - grouped container with both text elements */}
        <div
          data-component="spine-content-container"
          className="absolute flex flex-col"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap}px`,
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

        {/* Front cover content */}
        <div
          data-component="front-cover-content"
          className="absolute"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap + spineWidth + spineGap}px`,
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
            data-component="front-cover-image-container"
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
            data-component="front-cover-location"
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

        {/* Gap between front cover and right cover (shows page background) */}
        <div
          data-component="front-cover-right-cover-gap"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap + spineWidth + spineGap + frontWidth}px`,
            width: `${rightCoverGap}px`,
            height: `${baseHeight}px`,
          }}
        />

        {/* Right Cover */}
        <div
          data-component="right-cover-wrapper"
          className="absolute top-0"
          style={{
            left: `${leftCoverWidth + leftCoverGap + backWidth + spineGap + spineWidth + spineGap + frontWidth + rightCoverGap}px`,
            width: `${rightCoverWidth}px`,
            height: `${baseHeight}px`,
          }}
        >
          <RightCover data={data} selectedColors={selectedColors} />
        </div>
      </div>
    </div>
  );
}
