"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Attributes {
  chamativo: number
  esperteza: number
  sorrateiro: number
  rapidez: number
  potente: number
  cuidadoso: number
}

interface AttributesPanelProps {
  attributes: Attributes
  characterLevel: number
  onAttributesChange: (attrs: Attributes) => void
  onLevelChange: (level: number) => void
}

const attributeConfig: { key: keyof Attributes; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: "chamativo", label: "Chamativo", color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
  { key: "esperteza", label: "Esperteza", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { key: "sorrateiro", label: "Sorrateiro", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
  { key: "rapidez", label: "Rapidez", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  { key: "potente", label: "Potente", color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  { key: "cuidadoso", label: "Cuidadoso", color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
]

function getMaxAttribute(level: number): number {
  if (level >= 20) return 80
  if (level >= 10) return 60
  return 40
}

export function AttributesPanel({ attributes, characterLevel, onAttributesChange, onLevelChange }: AttributesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const maxAttr = getMaxAttribute(characterLevel)

  const handleChange = (key: keyof Attributes, value: number) => {
    onAttributesChange({ ...attributes, [key]: Math.max(0, Math.min(maxAttr, value)) })
  }

  const handleLevelChange = (newLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(20, newLevel))
    onLevelChange(clampedLevel)
    const newMaxAttr = getMaxAttribute(clampedLevel)
    const clamped = { ...attributes }
    let changed = false
    for (const key of Object.keys(clamped) as (keyof Attributes)[]) {
      if (clamped[key] > newMaxAttr) {
        clamped[key] = newMaxAttr
        changed = true
      }
    }
    if (changed) onAttributesChange(clamped)
  }

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <Star className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Atributos
            </h3>
            <span className="text-xs text-muted-foreground/50">
              Nivel {characterLevel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-secondary/30 px-2 py-1 text-xs text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-500",
          isExpanded ? "mt-4 max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Character Level */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
            <Star className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-sm font-bold text-purple-300">Nivel do Personagem</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLevelChange(characterLevel - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/30 bg-secondary/30 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/50 active:scale-95"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={20}
              value={characterLevel}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value)
                if (!Number.isNaN(v)) handleLevelChange(v)
              }}
              className="w-14 rounded-lg border border-purple-500/30 bg-secondary/50 px-2 py-1 text-center text-sm font-bold tabular-nums text-purple-300 outline-none"
            />
            <button
              type="button"
              onClick={() => handleLevelChange(characterLevel + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/30 bg-secondary/30 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary/50 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Max attribute info */}
        <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-1.5">
          <span className="text-xs text-muted-foreground/70">
            Max por atributo: <span className="font-bold text-purple-300">{maxAttr}</span>
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            {characterLevel >= 20 ? "(Nv 20)" : characterLevel >= 10 ? "(Nv 10-19)" : "(Nv 1-9)"}
          </span>
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {attributeConfig.map((attr) => (
            <div
              key={attr.key}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                attr.borderColor,
                attr.bgColor
              )}
            >
              <span className={cn("text-xs font-bold uppercase tracking-wider text-center", attr.color)}>
                {attr.label}
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleChange(attr.key, attributes[attr.key] - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-border/30 bg-secondary/30 text-xs font-bold text-muted-foreground transition-all hover:bg-secondary/50 active:scale-90"
                >
                  -
                </button>
                <input
                  type="number"
                  min={0}
                  max={maxAttr}
                  value={attributes[attr.key]}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value)
                    if (!Number.isNaN(v)) handleChange(attr.key, v)
                  }}
                  className={cn(
                    "w-14 rounded-lg border bg-secondary/50 px-1 py-1 text-center text-lg font-bold tabular-nums outline-none",
                    attr.borderColor,
                    attr.color
                  )}
                />
                <button
                  type="button"
                  onClick={() => handleChange(attr.key, attributes[attr.key] + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-border/30 bg-secondary/30 text-xs font-bold text-muted-foreground transition-all hover:bg-secondary/50 active:scale-90"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground/50 text-center">
                {attributes[attr.key]} / {maxAttr}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
