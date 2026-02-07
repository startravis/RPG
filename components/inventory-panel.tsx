"use client"

import { useState, useCallback } from "react"
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil, Check, X, Package, Sword, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound, getGradeSound } from "@/hooks/use-sound"

export interface InventoryItem {
  id: string
  name: string
  type: "item" | "weapon"
  grade: string
  effect: string
  durability: string
  damage: string
  description: string
}

interface InventoryPanelProps {
  items: InventoryItem[]
  onItemsChange: (items: InventoryItem[]) => void
}

const GRADES = [
  { value: "10", label: "Grau 10", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20", badgeBg: "bg-zinc-500/15" },
  { value: "9", label: "Grau 9", color: "text-zinc-300", bg: "bg-zinc-500/10", border: "border-zinc-500/20", badgeBg: "bg-zinc-500/15" },
  { value: "8", label: "Grau 8", color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/20", badgeBg: "bg-slate-500/15" },
  { value: "7", label: "Grau 7", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", badgeBg: "bg-green-500/15" },
  { value: "6", label: "Grau 6", color: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/20", badgeBg: "bg-green-500/15" },
  { value: "5", label: "Grau 5", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", badgeBg: "bg-blue-500/15" },
  { value: "4", label: "Grau 4", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", badgeBg: "bg-blue-500/15" },
  { value: "3", label: "Grau 3", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", badgeBg: "bg-purple-500/15" },
  { value: "2", label: "Grau 2", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", badgeBg: "bg-amber-500/15" },
  { value: "1", label: "Grau 1", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", badgeBg: "bg-orange-500/15" },
  { value: "Especial", label: "Grau Especial", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", badgeBg: "bg-fuchsia-500/15" },
  { value: "Divino", label: "Grau Divino", color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20", badgeBg: "bg-yellow-400/20" },
]

function getGradeConfig(grade: string) {
  const found = GRADES.find((g) => g.value.toLowerCase() === grade.toLowerCase())
  return found || GRADES[0]
}

function getGradeAnimation(grade: string): string {
  const g = grade.toLowerCase()
  if (g === "divino" || g === "divine") return "animation: grade-divine-glow 2s ease-in-out infinite"
  if (g === "especial" || g === "special") return "animation: grade-special-glow 2s ease-in-out infinite"
  return ""
}

export function InventoryPanel({ items, onItemsChange }: InventoryPanelProps) {
  const { play } = useSound()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "item" | "weapon">("all")
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null)

  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"item" | "weapon">("item")
  const [newGrade, setNewGrade] = useState("10")
  const [newEffect, setNewEffect] = useState("")
  const [newDurability, setNewDurability] = useState("")
  const [newDamage, setNewDamage] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState<"item" | "weapon">("item")
  const [editGrade, setEditGrade] = useState("10")
  const [editEffect, setEditEffect] = useState("")
  const [editDurability, setEditDurability] = useState("")
  const [editDamage, setEditDamage] = useState("")
  const [editDesc, setEditDesc] = useState("")

  const filteredItems = filter === "all" ? items : items.filter((i) => i.type === filter)

  const resetForm = () => {
    setNewName(""); setNewType("item"); setNewGrade("10")
    setNewEffect(""); setNewDurability(""); setNewDamage("")
    setNewDesc(""); setShowForm(false)
  }

  const addItem = useCallback(() => {
    if (!newName.trim()) return
    const itemId = `inv-${Date.now()}`
    const item: InventoryItem = {
      id: itemId, name: newName.trim(), type: newType,
      grade: newGrade, effect: newEffect.trim(),
      durability: newDurability.trim(), damage: newDamage.trim(),
      description: newDesc.trim(),
    }
    onItemsChange([...items, item])
    play(getGradeSound(newGrade))
    setNewlyAddedId(itemId)
    setTimeout(() => setNewlyAddedId(null), 800)
    resetForm()
  }, [newName, newType, newGrade, newEffect, newDurability, newDamage, newDesc, items, onItemsChange, play])

  const removeItem = useCallback((id: string) => {
    onItemsChange(items.filter((i) => i.id !== id))
    play("remove")
  }, [items, onItemsChange, play])

  const startEdit = useCallback((item: InventoryItem) => {
    setEditingId(item.id); setEditName(item.name); setEditType(item.type)
    setEditGrade(item.grade); setEditEffect(item.effect)
    setEditDurability(item.durability); setEditDamage(item.damage); setEditDesc(item.description)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId || !editName.trim()) return
    onItemsChange(items.map((i) =>
      i.id === editingId ? { ...i, name: editName.trim(), type: editType, grade: editGrade, effect: editEffect.trim(), durability: editDurability.trim(), damage: editDamage.trim(), description: editDesc.trim() } : i
    ))
    play("add")
    setEditingId(null)
  }, [editingId, editName, editType, editGrade, editEffect, editDurability, editDamage, editDesc, items, onItemsChange, play])

  const inputClass = "w-full rounded-lg border border-border/30 bg-secondary/50 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-indigo-500/30"

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 transition-all">
      <button type="button" onClick={() => { setIsExpanded(!isExpanded); play("click") }} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <Package className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inventario</h3>
            <span className="text-xs text-muted-foreground/50">{items.length} {items.length === 1 ? "item" : "itens"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-secondary/30 px-2 py-1 text-xs text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      <div className={cn("overflow-hidden transition-all duration-500", isExpanded ? "mt-4 max-h-[5000px] opacity-100" : "max-h-0 opacity-0")}>
        {/* Filter */}
        <div className="mb-3 flex gap-1.5">
          {(["all", "item", "weapon"] as const).map((f) => (
            <button key={f} type="button" onClick={() => { setFilter(f); play("click") }}
              className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                filter === f ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300" : "border-border/30 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              )}>
              {f === "all" && <Package className="h-3 w-3" />}
              {f === "item" && <Shield className="h-3 w-3" />}
              {f === "weapon" && <Sword className="h-3 w-3" />}
              {f === "all" ? "Todos" : f === "item" ? "Itens" : "Armas"}
            </button>
          ))}
        </div>

        {/* Items list */}
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const gc = getGradeConfig(item.grade)
            const gradeAnim = getGradeAnimation(item.grade)
            const isNew = item.id === newlyAddedId
            return (
              <div
                key={item.id}
                className={cn(
                  "group rounded-xl border p-3 transition-all",
                  gc.border, gc.bg,
                  isNew && "[animation:item-appear_0.5s_ease-out]"
                )}
                style={gradeAnim ? { [gradeAnim.split(":")[0].trim()]: gradeAnim.split(":")[1]?.trim() } : undefined}
              >
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" className={inputClass} autoFocus />
                      <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)}
                        className="w-full rounded-lg border border-border/30 bg-secondary/50 px-2 py-1.5 text-xs text-foreground outline-none">
                        {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" value={editEffect} onChange={(e) => setEditEffect(e.target.value)} placeholder="Efeito" className={inputClass} />
                      <input type="text" value={editDurability} onChange={(e) => setEditDurability(e.target.value)} placeholder="Durabilidade" className={inputClass} />
                      <input type="text" value={editDamage} onChange={(e) => setEditDamage(e.target.value)} placeholder="Dano" className={inputClass} />
                    </div>
                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} placeholder="Descricao..." className={cn(inputClass, "resize-none")} />
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setEditType("item")} className={cn("rounded-lg border px-2 py-1 text-xs font-bold transition-all", editType === "item" ? "border-sky-500/40 bg-sky-500/20 text-sky-300" : "border-border/30 bg-secondary/30 text-muted-foreground")}>Item</button>
                        <button type="button" onClick={() => setEditType("weapon")} className={cn("rounded-lg border px-2 py-1 text-xs font-bold transition-all", editType === "weapon" ? "border-red-500/40 bg-red-500/20 text-red-300" : "border-border/30 bg-secondary/30 text-muted-foreground")}>Arma</button>
                      </div>
                      <div className="ml-auto flex gap-1">
                        <button type="button" onClick={saveEdit} className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 p-1.5 text-emerald-300 transition-all active:scale-95"><Check className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-border/30 bg-secondary/30 p-1.5 text-muted-foreground transition-all active:scale-95"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", item.type === "weapon" ? "bg-red-500/20 text-red-400" : "bg-sky-500/20 text-sky-400")}>
                      {item.type === "weapon" ? <Sword className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{item.name}</span>
                        <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", item.type === "weapon" ? "bg-red-500/20 text-red-400" : "bg-sky-500/20 text-sky-400")}>
                          {item.type === "weapon" ? "Arma" : "Item"}
                        </span>
                        {item.grade && (
                          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold", gc.badgeBg, gc.color)}>
                            {GRADES.find((g) => g.value === item.grade)?.label || `Grau ${item.grade}`}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {item.damage && <span className="text-[10px] text-rose-400">Dano: {item.damage}</span>}
                        {item.durability && <span className="text-[10px] text-blue-400">Durabilidade: {item.durability}</span>}
                        {item.effect && <span className="text-[10px] text-emerald-400">Efeito: {item.effect}</span>}
                      </div>
                      {item.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" onClick={() => startEdit(item)} className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => removeItem(item.id)} className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Package className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-xs text-muted-foreground/50">Inventario vazio</p>
            </div>
          )}
        </div>

        {/* Add form */}
        {showForm ? (
          <div className="mt-3 space-y-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3" style={{ animation: "item-appear 0.3s ease-out" }}>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Nome do item" value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} autoFocus />
              <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)}
                className="w-full rounded-lg border border-border/30 bg-secondary/50 px-2 py-1.5 text-xs text-foreground outline-none">
                {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Efeito" value={newEffect} onChange={(e) => setNewEffect(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Durabilidade" value={newDurability} onChange={(e) => setNewDurability(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Dano" value={newDamage} onChange={(e) => setNewDamage(e.target.value)} className={inputClass} />
            </div>
            <textarea placeholder="Descricao (opcional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} className={cn(inputClass, "resize-none")} />
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => setNewType("item")} className={cn("rounded-lg border px-3 py-1.5 text-xs font-bold transition-all", newType === "item" ? "border-sky-500/40 bg-sky-500/20 text-sky-300" : "border-border/30 bg-secondary/30 text-muted-foreground")}>Item</button>
                <button type="button" onClick={() => setNewType("weapon")} className={cn("rounded-lg border px-3 py-1.5 text-xs font-bold transition-all", newType === "weapon" ? "border-red-500/40 bg-red-500/20 text-red-300" : "border-border/30 bg-secondary/30 text-muted-foreground")}>Arma</button>
              </div>
              <div className="ml-auto flex gap-1.5">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border/30 bg-secondary/30 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:bg-secondary/50">Cancelar</button>
                <button type="button" onClick={addItem} disabled={!newName.trim()} className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/30 active:scale-95 disabled:opacity-40">Adicionar</button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => { setShowForm(true); play("click") }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/20 py-3 text-xs font-bold text-indigo-400/60 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-400">
            <Plus className="h-3.5 w-3.5" />
            Novo Item
          </button>
        )}
      </div>
    </div>
  )
}
