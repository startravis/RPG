"use client"

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, ZoomIn, ZoomOut, Move, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarEditorProps {
  imageSrc: string
  onSave: (croppedImage: string) => void
  onCancel: () => void
}

export function AvatarEditor({ imageSrc, onSave, onCancel }: AvatarEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const CANVAS_SIZE = 240

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imageRef.current
    canvas.width = CANVAS_SIZE
    canvas.height = CANVAS_SIZE

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Fill background
    ctx.fillStyle = "#0a0a12"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Calculate scaled dimensions
    const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * zoom
    const scaledW = img.width * scale
    const scaledH = img.height * scale
    const drawX = (CANVAS_SIZE - scaledW) / 2 + offset.x
    const drawY = (CANVAS_SIZE - scaledH) / 2 + offset.y

    ctx.drawImage(img, drawX, drawY, scaledW, scaledH)

    // Draw circle mask overlay
    ctx.save()
    ctx.globalCompositeOperation = "destination-in"
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }, [imageLoaded, zoom, offset])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    },
    [offset]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    },
    [isDragging, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y })
    },
    [offset]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      const touch = e.touches[0]
      setOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
    },
    [isDragging, dragStart]
  )

  const handleSave = useCallback(() => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL("image/png")
    onSave(dataUrl)
  }, [onSave])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border/50 bg-card p-6 shadow-2xl" style={{ animation: "slide-in 0.3s ease-out" }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Editar Avatar</h3>
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas area */}
        <div className="mb-4 flex justify-center">
          <div
            className="relative overflow-hidden rounded-full border-2 border-border/50"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="h-full w-full" />
            {/* Drag hint overlay */}
            {!isDragging && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity hover:opacity-100">
                <Move className="h-8 w-8 text-foreground/50" />
              </div>
            )}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-secondary/30 text-muted-foreground transition-all hover:bg-secondary/50 active:scale-95"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-secondary/50 accent-rose-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-secondary/30 text-muted-foreground transition-all hover:bg-secondary/50 active:scale-95"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/30 bg-secondary/30 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/20 py-2.5 text-sm font-bold text-rose-300 transition-all hover:bg-rose-500/30 active:scale-95"
          >
            <Check className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
