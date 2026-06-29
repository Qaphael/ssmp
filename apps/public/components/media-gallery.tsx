"use client"

import { useState } from "react"
import type { Media } from "@ssmp/shared-types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MediaGalleryProps {
  media: Media[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [filter, setFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Media | null>(null)

  const filtered = filter === "all" ? media : media.filter((m) => m.type === filter)

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No media available for this competition yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({media.length})</TabsTrigger>
          <TabsTrigger value="photo">
            Photos ({media.filter((m) => m.type === "photo").length})
          </TabsTrigger>
          <TabsTrigger value="video">
            Videos ({media.filter((m) => m.type === "video").length})
          </TabsTrigger>
          <TabsTrigger value="document">
            Documents ({media.filter((m) => m.type === "document").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
            onClick={() => setSelected(item)}
          >
            <div className="aspect-square overflow-hidden bg-muted">
              {item.type === "photo" || item.type === "logo" ? (
                <img
                  src={item.url}
                  alt={item.caption || item.filename}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : item.type === "video" ? (
                <div className="h-full w-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[9px] uppercase">
                  {item.type}
                </Badge>
              </div>
              {item.caption && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  {item.caption}
                </p>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground/60">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              &times;
            </button>
            {(selected.type === "photo" || selected.type === "logo") && (
              <img
                src={selected.url}
                alt={selected.caption || selected.filename}
                className="w-full max-h-[70vh] object-contain bg-black"
                referrerPolicy="no-referrer"
              />
            )}
            {selected.type === "video" && (
              <video
                src={selected.url}
                controls
                className="w-full max-h-[70vh]"
              />
            )}
            {selected.type === "document" && (
              <div className="aspect-video flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">{selected.filename}</p>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[9px] uppercase">
                  {selected.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selected.caption && (
                <p className="mt-2 text-sm text-muted-foreground">{selected.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
