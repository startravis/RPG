"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Heart, Brain, Flame, Minus, Plus, Power, Droplets, Skull } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  icon: "hp" | "mental" | "cursed" | "mana" | "demonic"
  maxValue: number
  currentValue: number
  onValueChange: (newValue: number) => void
  onMaxChange: (newMax: number) => void
  delay?: number
  toggleable?: boolean
  enabled?: boolean
  onToggle?: () => void
  isEnergy?: boolean
}

const iconMap = {
  hp: Heart,
  mental: Brain,
  cursed: Flame,
  mana: Droplets,
  demonic: Skull,
}

const colorMap = {
  hp: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "animate-pulse-hp",
    bar: "bg-gradient-to-r from-rose-600 to-rose-400",
    barBg: "bg-rose-950/50",
    btnDamage: "bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30",
    btnHeal: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    bgGlow: "bg-rose-500",
  },
  mental: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "animate-pulse-mental",
    bar: "bg-gradient-to-r from-blue-600 to-blue-400",
    barBg: "bg-blue-950/50",
    btnDamage: "bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30",
    btnHeal: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    bgGlow: "bg-blue-500",
  },
  cursed: {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    glow: "animate-pulse-cursed",
    bar: "bg-gradient-to-r from-teal-600 to-teal-400",
    barBg: "bg-teal-950/50",
    btnDamage: "bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30",
    btnHeal: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    bgGlow: "bg-teal-500",
  },
  mana: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glow: "animate-pulse-mental",
    bar: "bg-gradient-to-r from-violet-600 to-violet-400",
    barBg: "bg-violet-950/50",
    btnDamage: "bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30",
    btnHeal: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    bgGlow: "bg-violet-500",
  },
  demonic: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "animate-pulse-hp",
    bar: "bg-gradient-to-r from-red-700 to-red-500",
    barBg: "bg-red-950/50",
    btnDamage: "bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30",
    btnHeal: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    bgGlow: "bg-red-500",
  },
}

export function StatCard({
  label,
  icon,
  maxValue,
  currentValue,
  onValueChange,
  onMaxChange,
  delay = 0,
  toggleable = false,
  enabled = true,
  onToggle,
  isEnergy = false,
}: StatCardProps) {
  const [damageInput, setDamageInput] = useState("")
  const [healInput, setHealInput] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [isHealing, setIsHealing] = useState(false)
  const [isPopping, setIsPopping] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; type: "damage" | "heal" }>>([])
  const [isVisible, setIsVisible] = useState(false)
  const [editingMax, setEditingMax] = useState(false)
  const [maxInput, setMaxInput] = useState(maxValue.toString())
  const cardRef = useRef<HTMLDivElement>(null)
  const nextParticleId = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const spawnParticles = useCallback((type: "damage" | "heal") => {
    const newParticles = Array.from({ length: 5 }, () => ({
      id: nextParticleId.current++,
      x: Math.random() * 100,
      y: Math.random() * 40 + 30,
      type,
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)))
    }, 800)
  }, [])

  const handleDamage = useCallback(() => {
    const amount = Number.parseInt(damageInput)
    if (Number.isNaN(amount) || amount <= 0) return
    onValueChange(Math.max(0, currentValue - amount))
    setDamageInput("")
    setIsShaking(true)
    setIsPopping(true)
    spawnParticles("damage")
    setTimeout(() => setIsShaking(false), 500)
    setTimeout(() => setIsPopping(false), 400)
  }, [damageInput, currentValue, onValueChange, spawnParticles])

  const handleHeal = useCallback(() => {
    const amount = Number.parseInt(healInput)
    if (Number.isNaN(amount) || amount <= 0) return
    onValueChange(Math.min(maxValue, currentValue + amount))
    setHealInput("")
    setIsHealing(true)
    setIsPopping(true)
    spawnParticles("heal")
    setTimeout(() => setIsHealing(false), 500)
    setTimeout(() => setIsPopping(false), 400)
  }, [healInput, currentValue, maxValue, onValueChange, spawnParticles])

  const handleMaxSubmit = useCallback(() => {
    const newMax = Number.parseInt(maxInput)
    if (!Number.isNaN(newMax) && newMax > 0) {
      onMaxChange(newMax)
      if (currentValue > newMax) {
        onValueChange(newMax)
      }
    } else {
      setMaxInput(maxValue.toString())
    }
    setEditingMax(false)
  }, [maxInput, currentValue, maxValue, onMaxChange, onValueChange])

  const Icon = iconMap[icon]
  const colors = colorMap[icon]
  const percentage = maxValue > 0 ? (currentValue / maxValue) * 100 : 0
  const isDisabled = toggleable && !enabled

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-500",
        isDisabled ? "border-border/20 bg-secondary/10 opacity-50" : cn(colors.border, colors.bg),
        isShaking && !isDisabled && "animate-shake",
        isHealing && !isDisabled && "[animation:heal-flash_0.5s_ease-out]",
        !isVisible && "translate-y-8 opacity-0",
        isVisible && "translate-y-0 opacity-100"
      )}
    >
      {/* Background glow */}
      {!isDisabled && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-20 blur-3xl transition-opacity duration-500",
            colors.bgGlow,
            percentage < 25 && "animate-pulse opacity-40"
          )}
        />
      )}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute z-20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animation: "particle-float 0.8s ease-out forwards" }}
        >
          <div className={cn("h-2 w-2 rounded-full", p.type === "damage" ? "bg-rose-400" : "bg-emerald-400")} />
        </div>
      ))}

      {/* Header */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", isDisabled ? "bg-secondary/20" : cn(colors.bg, colors.glow))}>
            <Icon className={cn("h-5 w-5", isDisabled ? "text-muted-foreground/30" : colors.text)} />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle button */}
          {toggleable && (
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold transition-all",
                enabled
                  ? cn(colors.border, colors.bg, colors.text)
                  : "border-border/30 bg-secondary/20 text-muted-foreground/50 hover:border-border/50"
              )}
            >
              <Power className="h-3 w-3" />
              {enabled ? "ON" : "OFF"}
            </button>
          )}

          {/* Max value editor */}
          {!isDisabled && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Max:</span>
              {editingMax ? (
                <input
                  type="number"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  onBlur={handleMaxSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleMaxSubmit()}
                  className={cn("w-16 rounded-md border bg-secondary/50 px-2 py-0.5 text-center text-sm font-bold outline-none", colors.border, colors.text)}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => { setMaxInput(maxValue.toString()); setEditingMax(true) }}
                  className={cn("rounded-md px-2 py-0.5 text-sm font-bold transition-colors hover:bg-secondary/50", colors.text)}
                >
                  {maxValue}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isDisabled ? (
        <div className="flex items-center justify-center py-6">
          <p className="text-xs text-muted-foreground/40">Desativado</p>
        </div>
      ) : (
        <>
          {/* Current value display */}
          <div className="relative z-10 mb-4 flex items-baseline justify-center gap-1">
            <span
              className={cn(
                "font-display text-5xl font-bold tabular-nums tracking-tight transition-all duration-300",
                colors.text,
                isPopping && "animate-number-pop",
                percentage < 25 && "animate-pulse"
              )}
            >
              {currentValue}
            </span>
            <span className="text-lg text-muted-foreground">/ {maxValue}</span>
          </div>

          {/* Health bar */}
          <div className={cn("relative mb-5 h-3 overflow-hidden rounded-full", colors.barBg)}>
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", colors.bar, percentage < 25 && "animate-pulse")}
              style={{ width: `${percentage}%` }}
            />
            <div className={cn("absolute inset-0 h-full rounded-full opacity-50", colors.bar)} style={{ width: `${percentage}%`, filter: "blur(4px)" }} />
          </div>

          {/* Actions */}
          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400">
                <Minus className="h-3 w-3" />
                {isEnergy ? "Uso" : "Dano"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder={isEnergy ? "Uso" : "0"}
                  value={damageInput}
                  onChange={(e) => setDamageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDamage()}
                  className="w-full rounded-lg border border-rose-500/20 bg-secondary/50 px-3 py-2 text-center text-sm font-bold tabular-nums text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-rose-500/50"
                />
                <button
                  type="button"
                  onClick={handleDamage}
                  className={cn("flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-bold transition-all active:scale-95", colors.btnDamage)}
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Plus className="h-3 w-3" />
                {isEnergy ? "Restaurar" : "Cura"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={healInput}
                  onChange={(e) => setHealInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleHeal()}
                  className="w-full rounded-lg border border-emerald-500/20 bg-secondary/50 px-3 py-2 text-center text-sm font-bold tabular-nums text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={handleHeal}
                  className={cn("flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-bold transition-all active:scale-95", colors.btnHeal)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
