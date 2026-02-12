"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check, X, Pencil } from "lucide-react"

export type ClassEffect =
  | "none"
  | "golden_glow"
  | "fire_aura"
  | "ice_crystals"
  | "lightning_sparks"
  | "shadow_mist"
  | "holy_light"
  | "blood_drip"
  | "poison_bubbles"
  | "sword_rain"
  | "dagger_spin"
  | "arcane_runes"
  | "wind_slash"
  | "earth_rocks"
  | "water_ripple"
  | "necro_skulls"
  | "star_burst"
  | "void_pulse"
  | "nature_leaves"
  | "thunder_bolt"
  | "chaos_spiral"

interface EffectOption {
  id: ClassEffect
  label: string
  emoji: string
  color: string
  borderColor: string
  bgColor: string
  glowColor: string
}

const EFFECTS: EffectOption[] = [
  { id: "none", label: "Nenhum", emoji: "", color: "text-muted-foreground", borderColor: "border-border/30", bgColor: "bg-secondary/20", glowColor: "" },
  { id: "golden_glow", label: "Brilho Dourado", emoji: "golden_glow", color: "text-yellow-400", borderColor: "border-yellow-500/40", bgColor: "bg-yellow-500/10", glowColor: "shadow-yellow-500/30" },
  { id: "fire_aura", label: "Aura de Fogo", emoji: "fire_aura", color: "text-orange-400", borderColor: "border-orange-500/40", bgColor: "bg-orange-500/10", glowColor: "shadow-orange-500/30" },
  { id: "ice_crystals", label: "Cristais de Gelo", emoji: "ice_crystals", color: "text-cyan-300", borderColor: "border-cyan-400/40", bgColor: "bg-cyan-500/10", glowColor: "shadow-cyan-400/30" },
  { id: "lightning_sparks", label: "Faiscas de Raio", emoji: "lightning", color: "text-yellow-300", borderColor: "border-yellow-400/40", bgColor: "bg-yellow-400/10", glowColor: "shadow-yellow-400/30" },
  { id: "shadow_mist", label: "Nevoa Sombria", emoji: "shadow", color: "text-gray-400", borderColor: "border-gray-500/40", bgColor: "bg-gray-500/10", glowColor: "shadow-gray-500/30" },
  { id: "holy_light", label: "Luz Sagrada", emoji: "holy", color: "text-amber-200", borderColor: "border-amber-300/40", bgColor: "bg-amber-300/10", glowColor: "shadow-amber-300/30" },
  { id: "blood_drip", label: "Gotas de Sangue", emoji: "blood", color: "text-red-500", borderColor: "border-red-500/40", bgColor: "bg-red-500/10", glowColor: "shadow-red-500/30" },
  { id: "poison_bubbles", label: "Bolhas de Veneno", emoji: "poison", color: "text-green-400", borderColor: "border-green-500/40", bgColor: "bg-green-500/10", glowColor: "shadow-green-500/30" },
  { id: "sword_rain", label: "Chuva de Espadas", emoji: "sword", color: "text-slate-300", borderColor: "border-slate-400/40", bgColor: "bg-slate-400/10", glowColor: "shadow-slate-400/30" },
  { id: "dagger_spin", label: "Adagas Girando", emoji: "dagger", color: "text-zinc-300", borderColor: "border-zinc-400/40", bgColor: "bg-zinc-400/10", glowColor: "shadow-zinc-400/30" },
  { id: "arcane_runes", label: "Runas Arcanas", emoji: "arcane", color: "text-violet-400", borderColor: "border-violet-500/40", bgColor: "bg-violet-500/10", glowColor: "shadow-violet-500/30" },
  { id: "wind_slash", label: "Corte de Vento", emoji: "wind", color: "text-emerald-300", borderColor: "border-emerald-400/40", bgColor: "bg-emerald-400/10", glowColor: "shadow-emerald-400/30" },
  { id: "earth_rocks", label: "Pedras da Terra", emoji: "earth", color: "text-amber-600", borderColor: "border-amber-600/40", bgColor: "bg-amber-600/10", glowColor: "shadow-amber-600/30" },
  { id: "water_ripple", label: "Ondas de Agua", emoji: "water", color: "text-blue-400", borderColor: "border-blue-500/40", bgColor: "bg-blue-500/10", glowColor: "shadow-blue-500/30" },
  { id: "necro_skulls", label: "Caveiras Necro", emoji: "necro", color: "text-lime-400", borderColor: "border-lime-500/40", bgColor: "bg-lime-500/10", glowColor: "shadow-lime-500/30" },
  { id: "star_burst", label: "Explosao Estelar", emoji: "star", color: "text-yellow-200", borderColor: "border-yellow-200/40", bgColor: "bg-yellow-200/10", glowColor: "shadow-yellow-200/30" },
  { id: "void_pulse", label: "Pulso do Vazio", emoji: "void", color: "text-purple-500", borderColor: "border-purple-600/40", bgColor: "bg-purple-600/10", glowColor: "shadow-purple-600/30" },
  { id: "nature_leaves", label: "Folhas da Natureza", emoji: "nature", color: "text-green-300", borderColor: "border-green-400/40", bgColor: "bg-green-400/10", glowColor: "shadow-green-400/30" },
  { id: "thunder_bolt", label: "Trovao", emoji: "thunder", color: "text-sky-300", borderColor: "border-sky-400/40", bgColor: "bg-sky-400/10", glowColor: "shadow-sky-400/30" },
  { id: "chaos_spiral", label: "Espiral do Caos", emoji: "chaos", color: "text-rose-400", borderColor: "border-rose-500/40", bgColor: "bg-rose-500/10", glowColor: "shadow-rose-500/30" },
]

// Particle component for canvas-like effect
function EffectParticles({ effect }: { effect: ClassEffect }) {
  if (effect === "none") return null

  const config = EFFECTS.find((e) => e.id === effect)
  if (!config) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      {/* Glow background */}
      <div className={cn("absolute inset-0 opacity-30", getGlowAnimation(effect))} />
      {/* Animated particles */}
      {getParticles(effect)}
    </div>
  )
}

function getGlowAnimation(effect: ClassEffect): string {
  const map: Record<string, string> = {
    golden_glow: "[animation:class-glow_2s_ease-in-out_infinite] bg-gradient-to-r from-yellow-500/20 via-yellow-300/30 to-yellow-500/20",
    fire_aura: "[animation:class-glow_1.5s_ease-in-out_infinite] bg-gradient-to-t from-orange-600/30 via-red-500/20 to-orange-400/10",
    ice_crystals: "[animation:class-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-cyan-400/20 via-blue-300/15 to-cyan-500/20",
    lightning_sparks: "[animation:class-flash_0.8s_ease-in-out_infinite] bg-gradient-to-r from-yellow-400/20 via-yellow-200/30 to-yellow-400/20",
    shadow_mist: "[animation:class-glow_3s_ease-in-out_infinite] bg-gradient-to-t from-gray-900/40 via-gray-700/20 to-transparent",
    holy_light: "[animation:class-glow_2.5s_ease-in-out_infinite] bg-gradient-to-b from-amber-200/30 via-white/15 to-amber-200/20",
    blood_drip: "[animation:class-glow_2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-red-600/20 to-red-800/30",
    poison_bubbles: "[animation:class-glow_2s_ease-in-out_infinite] bg-gradient-to-t from-green-600/20 via-green-400/15 to-transparent",
    sword_rain: "[animation:class-glow_2s_ease-in-out_infinite] bg-gradient-to-b from-slate-300/15 via-transparent to-slate-400/10",
    dagger_spin: "[animation:class-glow_1.8s_ease-in-out_infinite] bg-gradient-to-r from-zinc-400/15 via-zinc-300/20 to-zinc-400/15",
    arcane_runes: "[animation:class-glow_2.5s_ease-in-out_infinite] bg-gradient-to-r from-violet-600/20 via-purple-400/25 to-violet-600/20",
    wind_slash: "[animation:class-glow_2s_ease-in-out_infinite] bg-gradient-to-r from-emerald-400/15 via-emerald-200/20 to-emerald-400/15",
    earth_rocks: "[animation:class-glow_3s_ease-in-out_infinite] bg-gradient-to-b from-amber-700/15 via-amber-600/20 to-amber-700/15",
    water_ripple: "[animation:class-ripple_2.5s_ease-in-out_infinite] bg-gradient-to-r from-blue-500/15 via-blue-300/25 to-blue-500/15",
    necro_skulls: "[animation:class-glow_2s_ease-in-out_infinite] bg-gradient-to-t from-lime-600/20 via-lime-400/10 to-transparent",
    star_burst: "[animation:class-flash_1.5s_ease-in-out_infinite] bg-gradient-radial from-yellow-200/25 via-yellow-100/10 to-transparent",
    void_pulse: "[animation:class-pulse-void_2s_ease-in-out_infinite] bg-gradient-to-r from-purple-800/30 via-purple-500/20 to-purple-800/30",
    nature_leaves: "[animation:class-glow_3s_ease-in-out_infinite] bg-gradient-to-r from-green-500/15 via-green-300/20 to-green-500/15",
    thunder_bolt: "[animation:class-flash_0.6s_ease-in-out_infinite] bg-gradient-to-b from-sky-400/25 via-sky-200/15 to-sky-400/20",
    chaos_spiral: "[animation:class-glow_1.5s_ease-in-out_infinite] bg-gradient-to-r from-rose-600/20 via-pink-400/25 to-rose-600/20",
  }
  return map[effect] || ""
}

function getParticles(effect: ClassEffect): React.ReactNode {
  const particleSets: Record<string, { char: string; count: number; animClass: string; sizeClass: string }> = {
    golden_glow: { char: "\u2726", count: 6, animClass: "[animation:class-particle-float_2.5s_ease-in-out_infinite]", sizeClass: "text-[10px] text-yellow-400/60" },
    fire_aura: { char: "\u2739", count: 7, animClass: "[animation:class-particle-rise_1.8s_ease-out_infinite]", sizeClass: "text-[11px] text-orange-400/70" },
    ice_crystals: { char: "\u2742", count: 5, animClass: "[animation:class-particle-fall_3s_ease-in-out_infinite]", sizeClass: "text-[10px] text-cyan-300/60" },
    lightning_sparks: { char: "\u26A1", count: 4, animClass: "[animation:class-particle-flash_0.8s_ease-in-out_infinite]", sizeClass: "text-[9px] text-yellow-300/70" },
    shadow_mist: { char: "\u2593", count: 5, animClass: "[animation:class-particle-drift_4s_ease-in-out_infinite]", sizeClass: "text-[14px] text-gray-500/30" },
    holy_light: { char: "\u2727", count: 6, animClass: "[animation:class-particle-float_3s_ease-in-out_infinite]", sizeClass: "text-[10px] text-amber-200/60" },
    blood_drip: { char: "\u25CF", count: 5, animClass: "[animation:class-particle-drip_2s_ease-in_infinite]", sizeClass: "text-[8px] text-red-500/60" },
    poison_bubbles: { char: "\u25CB", count: 6, animClass: "[animation:class-particle-rise_2.5s_ease-out_infinite]", sizeClass: "text-[9px] text-green-400/50" },
    sword_rain: { char: "\u2694", count: 4, animClass: "[animation:class-particle-fall_1.5s_linear_infinite]", sizeClass: "text-[10px] text-slate-300/50" },
    dagger_spin: { char: "\u2620", count: 4, animClass: "[animation:class-particle-spin_2s_linear_infinite]", sizeClass: "text-[9px] text-zinc-300/50" },
    arcane_runes: { char: "\u2726", count: 5, animClass: "[animation:class-particle-spin_3s_linear_infinite]", sizeClass: "text-[11px] text-violet-400/50" },
    wind_slash: { char: "\u2215", count: 5, animClass: "[animation:class-particle-slash_1.2s_ease-out_infinite]", sizeClass: "text-[14px] text-emerald-300/40 font-bold" },
    earth_rocks: { char: "\u25A0", count: 4, animClass: "[animation:class-particle-shake_1s_ease-in-out_infinite]", sizeClass: "text-[8px] text-amber-600/50" },
    water_ripple: { char: "\u223C", count: 5, animClass: "[animation:class-particle-drift_3s_ease-in-out_infinite]", sizeClass: "text-[12px] text-blue-400/40" },
    necro_skulls: { char: "\u2620", count: 4, animClass: "[animation:class-particle-float_3s_ease-in-out_infinite]", sizeClass: "text-[10px] text-lime-400/50" },
    star_burst: { char: "\u2605", count: 6, animClass: "[animation:class-particle-burst_2s_ease-out_infinite]", sizeClass: "text-[9px] text-yellow-200/60" },
    void_pulse: { char: "\u25CF", count: 5, animClass: "[animation:class-pulse-void_2s_ease-in-out_infinite]", sizeClass: "text-[10px] text-purple-500/40" },
    nature_leaves: { char: "\u2766", count: 6, animClass: "[animation:class-particle-fall_3.5s_ease-in-out_infinite]", sizeClass: "text-[10px] text-green-300/50" },
    thunder_bolt: { char: "\u26A1", count: 3, animClass: "[animation:class-particle-flash_0.5s_ease-in-out_infinite]", sizeClass: "text-[11px] text-sky-300/60" },
    chaos_spiral: { char: "\u2738", count: 6, animClass: "[animation:class-particle-spin_1.5s_linear_infinite]", sizeClass: "text-[10px] text-rose-400/50" },
  }

  const p = particleSets[effect]
  if (!p) return null

  return Array.from({ length: p.count }).map((_, i) => {
    const left = 10 + (i * 80) / p.count + Math.random() * 10
    const top = 10 + Math.random() * 70
    const delay = i * 0.3 + Math.random() * 0.5

    return (
      <span
        key={i}
        className={cn("absolute", p.animClass, p.sizeClass)}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
        }}
      >
        {p.char}
      </span>
    )
  })
}

interface ClassEffectBadgeProps {
  className?: string
  characterClass: string
  onClassChange: (val: string) => void
  effect: ClassEffect
  onEffectChange: (val: ClassEffect) => void
}

export function ClassEffectBadge({ className, characterClass, onClassChange, effect, onEffectChange }: ClassEffectBadgeProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(characterClass)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentEffect = EFFECTS.find((e) => e.id === effect) ?? EFFECTS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const startEdit = () => {
    setEditValue(characterClass)
    setIsEditing(true)
  }

  const saveEdit = () => {
    onClassChange(editValue.trim())
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditValue(characterClass)
    setIsEditing(false)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Badge display */}
      <div
        className={cn(
          "relative flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-1.5 transition-all",
          currentEffect.borderColor,
          currentEffect.bgColor,
          effect !== "none" && "shadow-lg",
          effect !== "none" && currentEffect.glowColor,
        )}
      >
        {/* Effect particles behind content */}
        <EffectParticles effect={effect} />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit()
                  if (e.key === "Escape") cancelEdit()
                }}
                placeholder="Nome da classe..."
                className="w-24 bg-transparent text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground/40 sm:w-32"
              />
              <button type="button" onClick={saveEdit} className="rounded-md p-0.5 text-emerald-400 hover:bg-emerald-500/20">
                <Check className="h-3 w-3" />
              </button>
              <button type="button" onClick={cancelEdit} className="rounded-md p-0.5 text-muted-foreground hover:bg-secondary/50">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={startEdit}
                className={cn(
                  "flex items-center gap-1 text-xs font-bold transition-colors",
                  characterClass ? currentEffect.color : "text-muted-foreground/50"
                )}
              >
                {characterClass || "Classe"}
                <Pencil className="h-2.5 w-2.5 opacity-50" />
              </button>
            </>
          )}

          {/* Effect dropdown toggle */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all",
              currentEffect.borderColor,
              "bg-secondary/30 hover:bg-secondary/50",
              currentEffect.color
            )}
          >
            Efeito
            <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", showDropdown && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Dropdown for effect selection */}
      {showDropdown && (
        <div
          className="absolute left-0 top-full z-50 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-border/50 bg-card/95 p-2 shadow-2xl backdrop-blur-sm"
          style={{ animation: "item-appear 0.2s ease-out" }}
        >
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Escolha o efeito
          </p>
          <div className="grid grid-cols-2 gap-1">
            {EFFECTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onEffectChange(opt.id)
                  setShowDropdown(false)
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition-all",
                  effect === opt.id
                    ? cn(opt.borderColor, opt.bgColor, opt.color)
                    : "border-border/20 bg-secondary/10 text-muted-foreground hover:bg-secondary/30"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {effect === opt.id && <Check className="ml-auto h-3 w-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
