"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Heart, Brain, Minus, Plus, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BarData {
  current: number
  max: number
}

interface MultiBarStatProps {
  label: string
  icon: "hp" | "mental"
  bars: {
    leve: BarData
    moderada: BarData
    severa: BarData
    extra: BarData
  }
  extraActive: boolean
  onBarChange: (barKey: string, field: "current" | "max", value: number) => void
  onExtraToggle: () => void
  delay?: number
}

const iconMap = {
  hp: Heart,
  mental: Brain,
}

const colorConfig = {
  hp: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "animate-pulse-hp",
    barGrad: "from-rose-600 to-rose-400",
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
    barGrad: "from-blue-600 to-blue-400",
    barBg: "bg-blue-950/50",
    btnDamage: "bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border-rose-500/30",
    btnHeal: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border-emerald-500/30",
    bgGlow: "bg-blue-500",
  },
}

const barLabels: Record<string, { label: string; shortLabel: string }> = {
  leve: { label: "Leve", shortLabel: "L" },
  moderada: { label: "Moderada", shortLabel: "M" },
  severa: { label: "Severa", shortLabel: "S" },
  extra: { label: "Extra", shortLabel: "E" },
}

function SingleBar({
  barKey,
  data,
  colors,
  isExtra,
  isExtraActive,
  onToggleExtra,
  onChange,
}: {
  barKey: string
  data: BarData
  colors: (typeof colorConfig)["hp"]
  isExtra: boolean
  isExtraActive: boolean
  onToggleExtra?: () => void
  onChange: (field: "current" | "max", value: number) => void
}) {
  const [damageInput, setDamageInput] = useState("")
  const [healInput, setHealInput] = useState("")
  const [editingMax, setEditingMax] = useState(false)
  const [maxInput, setMaxInput] = useState(data.max.toString())
  const [isShaking, setIsShaking] = useState(false)
  const [isHealing, setIsHealing] = useState(false)

  const info = barLabels[barKey]
  const percentage = data.max > 0 ? (data.current / data.max) * 100 : 0
  const isDisabled = isExtra && !isExtraActive

  const handleDamage = useCallback(() => {
    const amount = Number.parseInt(damageInput)
    if (Number.isNaN(amount) || amount <= 0) return
    onChange("current", Math.max(0, data.current - amount))
    setDamageInput("")
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }, [damageInput, data.current, onChange])

  const handleHeal = useCallback(() => {
    const amount = Number.parseInt(healInput)
    if (Number.isNaN(amount) || amount <= 0) return
    onChange("current", Math.min(data.max, data.current + amount))
    setHealInput("")
    setIsHealing(true)
    setTimeout(() => setIsHealing(false), 500)
  }, [healInput, data.current, data.max, onChange])

  const handleMaxSubmit = useCallback(() => {
    const newMax = Number.parseInt(maxInput)
    if (!Number.isNaN(newMax) && newMax > 0) {
      onChange("max", newMax)
      if (data.current > newMax) {
        onChange("current", newMax)
      }
    } else {
      setMaxInput(data.max.toString())
    }
    setEditingMax(false)
  }, [maxInput, data.current, data.max, onChange])

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all duration-300",
        isDisabled
          ? "border-border/20 bg-secondary/20 opacity-40"
          : cn(colors.border, colors.bg),
        isShaking && !isDisabled && "animate-shake",
        isHealing && !isDisabled && "[animation:heal-flash_0.5s_ease-out]"
      )}
    >
      {/* Bar header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExtra ? (
            <button
              type="button"
              onClick={onToggleExtra}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-bold uppercase tracking-wider transition-all",
                isExtraActive
                  ? cn("border-amber-500/40 bg-amber-500/20 text-amber-300")
                  : "border-border/30 bg-secondary/30 text-muted-foreground hover:border-amber-500/30"
              )}
            >
              <Shield className="h-3 w-3" />
              {info.label}
              {isExtraActive ? " ON" : " OFF"}
            </button>
          ) : (
            <span className={cn("text-xs font-bold uppercase tracking-wider", isDisabled ? "text-muted-foreground/50" : colors.text)}>
              {info.label}
            </span>
          )}
        </div>

        {/* Max editor */}
        <div className="flex items-center gap-1">
          {editingMax && !isDisabled ? (
            <input
              type="number"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={handleMaxSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleMaxSubmit()}
              className={cn(
                "w-14 rounded-md border bg-secondary/50 px-1.5 py-0.5 text-center text-xs font-bold outline-none",
                colors.border, colors.text
              )}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isDisabled) return
                setMaxInput(data.max.toString())
                setEditingMax(true)
              }}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs font-bold transition-colors",
                isDisabled ? "cursor-default text-muted-foreground/30" : cn("hover:bg-secondary/50", colors.text)
              )}
            >
              {data.current}/{data.max}
            </button>
          )}
        </div>
      </div>

      {/* Bar visual */}
      <div className={cn("relative mb-2 h-2 overflow-hidden rounded-full", isDisabled ? "bg-secondary/30" : colors.barBg)}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            isDisabled ? "from-muted-foreground/20 to-muted-foreground/10" : colors.barGrad,
            percentage < 25 && !isDisabled && "animate-pulse"
          )}
          style={{ width: `${isDisabled ? 0 : percentage}%` }}
        />
      </div>

      {/* Damage / Heal controls */}
      {!isDisabled && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              placeholder="Dano"
              value={damageInput}
              onChange={(e) => setDamageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDamage()}
              className="w-full rounded-md border border-rose-500/20 bg-secondary/50 px-2 py-1 text-center text-xs font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-rose-500/50"
            />
            <button
              type="button"
              onClick={handleDamage}
              className={cn("flex shrink-0 items-center justify-center rounded-md border px-1.5 py-1 transition-all active:scale-95", colors.btnDamage)}
            >
              <Minus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              placeholder="Cura"
              value={healInput}
              onChange={(e) => setHealInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleHeal()}
              className="w-full rounded-md border border-emerald-500/20 bg-secondary/50 px-2 py-1 text-center text-xs font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={handleHeal}
              className={cn("flex shrink-0 items-center justify-center rounded-md border px-1.5 py-1 transition-all active:scale-95", colors.btnHeal)}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function MultiBarStat({
  label,
  icon,
  bars,
  extraActive,
  onBarChange,
  onExtraToggle,
  delay = 0,
}: MultiBarStatProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isPopping, setIsPopping] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; type: "damage" | "heal" }>>([])
  const nextParticleId = useRef(0)

  // Global damage/heal inputs
  const [globalDamage, setGlobalDamage] = useState("")
  const [globalHeal, setGlobalHeal] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const Icon = iconMap[icon]
  const colors = colorConfig[icon]

  const barKeys = extraActive
    ? (["leve", "moderada", "severa", "extra"] as const)
    : (["leve", "moderada", "severa"] as const)

  const totalCurrent = barKeys.reduce((sum, k) => sum + bars[k].current, 0)
  const totalMax = barKeys.reduce((sum, k) => sum + bars[k].max, 0)
  const totalPercentage = totalMax > 0 ? (totalCurrent / totalMax) * 100 : 0

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

  // Global damage: distributes across bars extra -> leve -> moderada -> severa
  const handleGlobalDamage = useCallback(() => {
    const amount = Number.parseInt(globalDamage)
    if (Number.isNaN(amount) || amount <= 0) return
    let remaining = amount
    const order = extraActive
      ? ["extra", "leve", "moderada", "severa"]
      : ["leve", "moderada", "severa"]

    for (const key of order) {
      if (remaining <= 0) break
      const bar = bars[key as keyof typeof bars]
      const reduction = Math.min(remaining, bar.current)
      if (reduction > 0) {
        onBarChange(key, "current", bar.current - reduction)
        remaining -= reduction
      }
    }

    setGlobalDamage("")
    setIsPopping(true)
    spawnParticles("damage")
    setTimeout(() => setIsPopping(false), 400)
  }, [globalDamage, bars, extraActive, onBarChange, spawnParticles])

  // Global heal: distributes across bars extra -> severa -> moderada -> leve
  const handleGlobalHeal = useCallback(() => {
    const amount = Number.parseInt(globalHeal)
    if (Number.isNaN(amount) || amount <= 0) return
    let remaining = amount
    const order = extraActive
      ? ["extra", "severa", "moderada", "leve"]
      : ["severa", "moderada", "leve"]

    for (const key of order) {
      if (remaining <= 0) break
      const bar = bars[key as keyof typeof bars]
      const healing = Math.min(remaining, bar.max - bar.current)
      if (healing > 0) {
        onBarChange(key, "current", bar.current + healing)
        remaining -= healing
      }
    }

    setGlobalHeal("")
    setIsPopping(true)
    spawnParticles("heal")
    setTimeout(() => setIsPopping(false), 400)
  }, [globalHeal, bars, extraActive, onBarChange, spawnParticles])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-500",
        colors.border,
        colors.bg,
        !isVisible && "translate-y-8 opacity-0",
        isVisible && "translate-y-0 opacity-100"
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-20 blur-3xl transition-opacity duration-500",
          colors.bgGlow,
          totalPercentage < 25 && "animate-pulse opacity-40"
        )}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute z-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: "particle-float 0.8s ease-out forwards",
          }}
        >
          <div className={cn("h-2 w-2 rounded-full", p.type === "damage" ? "bg-rose-400" : "bg-emerald-400")} />
        </div>
      ))}

      {/* Header with total */}
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors.bg, colors.glow)}>
            <Icon className={cn("h-5 w-5", colors.text)} />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </h3>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "font-display text-3xl font-bold tabular-nums tracking-tight transition-all duration-300",
                  colors.text,
                  isPopping && "animate-number-pop",
                  totalPercentage < 25 && "animate-pulse"
                )}
              >
                {totalCurrent}
              </span>
              <span className="text-sm text-muted-foreground">/ {totalMax}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded-lg border border-border/30 bg-secondary/30 px-2 py-1 text-xs text-muted-foreground transition-all hover:bg-secondary/50"
        >
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Total bar */}
      <div className={cn("relative z-10 mb-3 h-3 overflow-hidden rounded-full", colors.barBg)}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            colors.barGrad,
            totalPercentage < 25 && "animate-pulse"
          )}
          style={{ width: `${totalPercentage}%` }}
        />
        <div
          className={cn("absolute inset-0 h-full rounded-full bg-gradient-to-r opacity-50", colors.barGrad)}
          style={{ width: `${totalPercentage}%`, filter: "blur(4px)" }}
        />
      </div>

      {/* Global damage / heal */}
      <div className="relative z-10 mb-3 grid grid-cols-2 gap-2">
        <div className="flex gap-1.5">
          <input
            type="number"
            min="0"
            placeholder="Dano Total"
            value={globalDamage}
            onChange={(e) => setGlobalDamage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGlobalDamage()}
            className="w-full rounded-lg border border-rose-500/20 bg-secondary/50 px-2 py-1.5 text-center text-xs font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-rose-500/50"
          />
          <button
            type="button"
            onClick={handleGlobalDamage}
            className={cn("flex shrink-0 items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-bold transition-all active:scale-95", colors.btnDamage)}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-1.5">
          <input
            type="number"
            min="0"
            placeholder="Cura Total"
            value={globalHeal}
            onChange={(e) => setGlobalHeal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGlobalHeal()}
            className="w-full rounded-lg border border-emerald-500/20 bg-secondary/50 px-2 py-1.5 text-center text-xs font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            onClick={handleGlobalHeal}
            className={cn("flex shrink-0 items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-bold transition-all active:scale-95", colors.btnHeal)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Individual bars (expandable) */}
      <div
        className={cn(
          "relative z-10 grid gap-2 overflow-hidden transition-all duration-500",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 space-y-2 overflow-hidden">
          {(["leve", "moderada", "severa", "extra"] as const).map((key) => (
            <SingleBar
              key={key}
              barKey={key}
              data={bars[key]}
              colors={colors}
              isExtra={key === "extra"}
              isExtraActive={extraActive}
              onToggleExtra={key === "extra" ? onExtraToggle : undefined}
              onChange={(field, value) => onBarChange(key, field, value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
