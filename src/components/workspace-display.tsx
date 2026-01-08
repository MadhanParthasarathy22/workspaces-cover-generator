"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkspaceData } from "@/lib/types";

interface WorkspaceDisplayProps {
  data: WorkspaceData;
}

export function WorkspaceDisplay({ data }: WorkspaceDisplayProps) {
  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">{data.name}</h2>
        {data.title && (
          <p className="text-lg text-amber-500">{data.title}</p>
        )}
        {data.location && (
          <p className="text-zinc-400 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            {data.location}
          </p>
        )}
      </div>

      {/* Bio */}
      {data.bio && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
              {data.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Workspace Items */}
      {data.workspaceItems.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Workspace Items ({data.workspaceItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.workspaceItems.map((item, index) => (
                <li
                  key={index}
                  className="text-zinc-300 flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {data.images.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Images ({data.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden"
                >
                  <Image
                    src={imageUrl}
                    alt={`Workspace image ${index + 1}`}
                    fill
                    className="object-cover"
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
        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 text-sm">
          View raw JSON data
        </summary>
        <pre className="mt-2 p-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto text-xs text-zinc-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

