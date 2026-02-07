"use client"

import { useState, useCallback } from "react"
import { Plus, Trash2, Zap, Eye, ChevronDown, ChevronUp, Pencil, Check, X, ArrowUp, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/hooks/use-sound"

export interface Ability {
  id: string
  name: string
  description: string
  type: "passive" | "active"
  level: number
}

interface AbilitiesPanelProps {
  abilities: Ability[]
  onAbilitiesChange: (abilities: Ability[]) => void
}

export function AbilitiesPanel({ abilities, onAbilitiesChange }: AbilitiesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newType, setNewType] = useState<"passive" | "active">("active")
  const [newLevel, setNewLevel] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editType, setEditType] = useState<"passive" | "active">("active")
  const [editLevel, setEditLevel] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null)
  const [levelUpId, setLevelUpId] = useState<string | null>(null)
  const { play } = useSound()

  const addAbility = useCallback(() => {
    if (!newName.trim()) return
    const ability: Ability = {
      id: `ability-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      type: newType,
      level: newLevel,
    }
    onAbilitiesChange([...abilities, ability])
    play("abilityAdd")
    setRecentlyAdded(ability.id)
    setTimeout(() => setRecentlyAdded(null), 800)
    setNewName("")
    setNewDesc("")
    setNewType("active")
    setNewLevel(1)
    setShowForm(false)
  }, [newName, newDesc, newType, newLevel, abilities, onAbilitiesChange, play])

  const removeAbility = useCallback((id: string) => {
    play("abilityRemove")
    onAbilitiesChange(abilities.filter((a) => a.id !== id))
  }, [abilities, onAbilitiesChange, play])

  const levelUpAbility = useCallback((id: string) => {
    play("abilityLevelUp")
    setLevelUpId(id)
    setTimeout(() => setLevelUpId(null), 600)
    onAbilitiesChange(
      abilities.map((a) =>
        a.id === id ? { ...a, level: a.level + 1 } : a
      )
    )
  }, [abilities, onAbilitiesChange, play])

  const levelDownAbility = useCallback((id: string) => {
    play("click")
    onAbilitiesChange(
      abilities.map((a) =>
        a.id === id ? { ...a, level: Math.max(1, a.level - 1) } : a
      )
    )
  }, [abilities, onAbilitiesChange, play])

  const startEdit = useCallback((ability: Ability) => {
    play("click")
    setEditingId(ability.id)
    setEditName(ability.name)
    setEditDesc(ability.description)
    setEditType(ability.type)
    setEditLevel(ability.level)
  }, [play])

  const saveEdit = useCallback(() => {
    if (!editingId || !editName.trim()) return
    play("success")
    onAbilitiesChange(
      abilities.map((a) =>
        a.id === editingId
          ? { ...a, name: editName.trim(), description: editDesc.trim(), type: editType, level: editLevel }
          : a
      )
    )
    setEditingId(null)
  }, [editingId, editName, editDesc, editType, editLevel, abilities, onAbilitiesChange, play])

  const cancelEdit = useCallback(() => {
    play("click")
    setEditingId(null)
  }, [play])

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all">
      {/* Header */}
      <button
        type="button"
        onClick={() => {
          play("toggle")
          setIsExpanded(!isExpanded)
        }}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Habilidades
            </h3>
            <span className="text-xs text-muted-foreground/50">
              {abilities.length} {abilities.length === 1 ? "habilidade" : "habilidades"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-secondary/30 px-2 py-1 text-xs text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500",
          isExpanded ? "mt-4 max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Ability list */}
        <div className="space-y-2">
          {abilities.map((ability) => (
            <div
              key={ability.id}
              className={cn(
                "group rounded-xl border p-3 transition-all",
                ability.type === "passive"
                  ? "border-cyan-500/20 bg-cyan-500/5"
                  : "border-orange-500/20 bg-orange-500/5",
                recentlyAdded === ability.id && "[animation:item-appear_0.5s_ease-out]",
                levelUpId === ability.id && "[animation:heal-flash_0.5s_ease-out]"
              )}
            >
              {editingId === ability.id ? (
                /* Edit mode */
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-border/30 bg-secondary/50 px-3 py-1.5 text-sm font-bold text-foreground outline-none"
                    autoFocus
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border/30 bg-secondary/50 px-3 py-1.5 text-xs text-foreground outline-none"
                    placeholder="Descricao..."
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditType("active")}
                        className={cn(
                          "rounded-lg border px-2 py-1 text-xs font-bold transition-all",
                          editType === "active"
                            ? "border-orange-500/40 bg-orange-500/20 text-orange-300"
                            : "border-border/30 bg-secondary/30 text-muted-foreground"
                        )}
                      >
                        Ativavel
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType("passive")}
                        className={cn(
                          "rounded-lg border px-2 py-1 text-xs font-bold transition-all",
                          editType === "passive"
                            ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300"
                            : "border-border/30 bg-secondary/30 text-muted-foreground"
                        )}
                      >
                        Passiva
                      </button>
                    </div>
                    {/* Level editor in edit mode */}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={editLevel}
                        onChange={(e) => setEditLevel(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        className="w-12 rounded-md border border-amber-500/30 bg-secondary/50 px-1 py-0.5 text-center text-xs font-bold text-amber-300 outline-none"
                      />
                    </div>
                    <div className="ml-auto flex gap-1">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 p-1.5 text-emerald-300 transition-all active:scale-95"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-border/30 bg-secondary/30 p-1.5 text-muted-foreground transition-all active:scale-95"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      ability.type === "passive"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-orange-500/20 text-orange-400"
                    )}
                  >
                    {ability.type === "passive" ? <Eye className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{ability.name}</span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          ability.type === "passive"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-orange-500/20 text-orange-400"
                        )}
                      >
                        {ability.type === "passive" ? "Passiva" : "Ativavel"}
                      </span>
                      {/* Level badge */}
                      <span className="flex items-center gap-0.5 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                        <Star className="h-2.5 w-2.5" />
                        Nv.{ability.level}
                      </span>
                    </div>
                    {ability.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {ability.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Level up/down */}
                    <button
                      type="button"
                      onClick={() => levelDownAbility(ability.id)}
                      disabled={ability.level <= 1}
                      className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-30"
                      title="Diminuir nivel"
                    >
                      <ArrowUp className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => levelUpAbility(ability.id)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-amber-500/10 hover:text-amber-400"
                      title="Aumentar nivel"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(ability)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAbility(ability.id)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {abilities.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Zap className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-xs text-muted-foreground/50">Nenhuma habilidade adicionada</p>
            </div>
          )}
        </div>

        {/* Add ability form */}
        {showForm ? (
          <div
            className="mt-3 space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
            style={{ animation: "item-appear 0.3s ease-out" }}
          >
            <input
              type="text"
              placeholder="Nome da habilidade"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAbility()}
              className="w-full rounded-lg border border-border/30 bg-secondary/50 px-3 py-2 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-amber-500/30"
              autoFocus
            />
            <textarea
              placeholder="Descricao da habilidade (opcional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-border/30 bg-secondary/50 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-amber-500/30"
            />
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setNewType("active")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                    newType === "active"
                      ? "border-orange-500/40 bg-orange-500/20 text-orange-300"
                      : "border-border/30 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  Ativavel
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("passive")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                    newType === "passive"
                      ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300"
                      : "border-border/30 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  Passiva
                </button>
              </div>
              {/* Level input */}
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1">
                <Star className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Nv.</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newLevel}
                  onChange={(e) => setNewLevel(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-10 bg-transparent text-center text-xs font-bold text-amber-300 outline-none"
                />
              </div>
              <div className="ml-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() => { play("click"); setShowForm(false); setNewName(""); setNewDesc("") }}
                  className="rounded-lg border border-border/30 bg-secondary/30 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:bg-secondary/50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={addAbility}
                  disabled={!newName.trim()}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/30 active:scale-95 disabled:opacity-40"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              play("click")
              setShowForm(true)
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/20 py-3 text-xs font-bold text-amber-400/60 transition-all hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Habilidade
          </button>
        )}
      </div>
    </div>
  )
}
