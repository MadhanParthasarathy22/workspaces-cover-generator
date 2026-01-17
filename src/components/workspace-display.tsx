"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkspaceData } from "@/lib/types";

interface WorkspaceDisplayProps {
  data: WorkspaceData;
}

export function WorkspaceDisplay({ data }: WorkspaceDisplayProps) {
  return (
    <div className="w-full max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">{data.name}</h2>
        {data.title && (
          <p className="text-xl text-amber-400 font-medium">{data.title}</p>
        )}
        {data.location && (
          <p className="text-zinc-400 flex items-center gap-2 text-base">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{data.location}</span>
          </p>
        )}
      </div>

      {/* Bio */}
      {data.bio && (
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 shadow-xl">
          <CardHeader>
            <h3 className="text-white text-xl leading-none font-bold">Bio</h3>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 whitespace-pre-line leading-relaxed text-base">
              {data.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Workspace Items */}
      {data.workspaceItems.length > 0 && (
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 shadow-xl">
          <CardHeader>
            <h3 className="text-white text-xl leading-none font-bold">
              Workspace Items ({data.workspaceItems.length})
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.workspaceItems.map((item, index) => (
                <li
                  key={index}
                  className="text-zinc-300 flex items-start gap-3 text-base"
                >
                  <span className="text-amber-500 mt-1.5 text-lg font-bold">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {data.images.length > 0 && (
        <Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-800/50 shadow-xl">
          <CardHeader>
            <h3 className="text-white text-xl leading-none font-bold">
              Images ({data.images.length})
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-video bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <Image
                    src={imageUrl}
                    alt={`${data.name} workspace image ${index + 1} of ${data.images.length}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON (for debugging) */}
      <details className="group">
        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-dashed focus-visible:outline-offset-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
          View raw JSON data
        </summary>
        <pre className="mt-3 p-5 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl overflow-auto text-xs text-zinc-400 shadow-lg">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

