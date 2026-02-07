"use client"

import React, { forwardRef, useImperativeHandle } from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { MultiBarStat, type BarData } from "./multi-bar-stat"
import { StatCard } from "./stat-card"
import { AbilitiesPanel, type Ability } from "./abilities-panel"
import { AttributesPanel, type Attributes } from "./attributes-panel"
import { InventoryPanel, type InventoryItem } from "./inventory-panel"
import { NotesPanel } from "./notes-panel"
import { AvatarEditor } from "./avatar-editor"
import { RotateCcw, Sparkles, Camera, UserCircle2, Dna, Save, ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface BarsState {
  leve: BarData
  moderada: BarData
  severa: BarData
  extra: BarData
}

interface EvolutionData {
  id: string
  name: string
  hpBars: BarsState
  hpExtraActive: boolean
  mentalBars: BarsState
  mentalExtraActive: boolean
  cursedEnergy: number
  maxCursedEnergy: number
  cursedEnabled: boolean
  mana: number
  maxMana: number
  manaEnabled: boolean
  demonicEnergy: number
  maxDemonicEnergy: number
  demonicEnabled: boolean
  abilities: Ability[]
  inventory: InventoryItem[]
}

export interface CharacterSaveData {
  id: string
  name: string
  avatar: string | null
  characterLevel: number
  attributes: Attributes
  hpBars: BarsState
  hpExtraActive: boolean
  mentalBars: BarsState
  mentalExtraActive: boolean
  cursedEnergy: number
  maxCursedEnergy: number
  cursedEnabled: boolean
  mana: number
  maxMana: number
  manaEnabled: boolean
  demonicEnergy: number
  maxDemonicEnergy: number
  demonicEnabled: boolean
  abilities: Ability[]
  inventory: InventoryItem[]
  notes: string
  backstory: string
  evolutionsActive: boolean
  evolutions: EvolutionData[]
  activeEvolution: string | null
}

export interface CharacterSheetHandle {
  getData: () => CharacterSaveData
  loadData: (data: CharacterSaveData) => void
}

interface CharacterSheetProps {
  id: string
  onRemove: (id: string) => void
  initialDelay?: number
}

const defaultHpBars: BarsState = {
  leve: { current: 0, max: 0 },
  moderada: { current: 0, max: 0 },
  severa: { current: 0, max: 0 },
  extra: { current: 10, max: 10 },
}

const defaultMentalBars: BarsState = {
  leve: { current: 0, max: 0 },
  moderada: { current: 0, max: 0 },
  severa: { current: 0, max: 0 },
  extra: { current: 10, max: 10 },
}

export const CharacterSheet = forwardRef<CharacterSheetHandle, CharacterSheetProps>(function CharacterSheet({ id, onRemove, initialDelay = 0 }, ref) {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const [rawAvatarSrc, setRawAvatarSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Attributes & Level
  const [characterLevel, setCharacterLevel] = useState(1)
  const [attributes, setAttributes] = useState<Attributes>({
    chamativo: 0,
    esperteza: 0,
    sorrateiro: 0,
    rapidez: 0,
    potente: 0,
    cuidadoso: 0,
  })

  // HP
  const [hpBars, setHpBars] = useState<BarsState>({ ...defaultHpBars })
  const [hpExtraActive, setHpExtraActive] = useState(false)

  // Mental
  const [mentalBars, setMentalBars] = useState<BarsState>({ ...defaultMentalBars })
  const [mentalExtraActive, setMentalExtraActive] = useState(false)

  // Auto-calculate HP bar maxes from Potente attribute
  // Leve = potente * 3, Moderada = leve * 2, Severa = moderada * 2
  useEffect(() => {
    const potente = attributes.potente
    const leveMax = potente * 3
    const moderadaMax = leveMax * 2
    const severaMax = moderadaMax * 2
    setHpBars((prev) => ({
      leve: { current: Math.min(prev.leve.current, leveMax), max: leveMax },
      moderada: { current: Math.min(prev.moderada.current, moderadaMax), max: moderadaMax },
      severa: { current: Math.min(prev.severa.current, severaMax), max: severaMax },
      extra: prev.extra,
    }))
  }, [attributes.potente])

  // Auto-calculate Mental bar maxes from Mentalidade (esperteza)
  // Same formula: Leve = esperteza * 3, Moderada = leve * 2, Severa = moderada * 2
  useEffect(() => {
    const esperteza = attributes.esperteza
    const leveMax = esperteza * 3
    const moderadaMax = leveMax * 2
    const severaMax = moderadaMax * 2
    setMentalBars((prev) => ({
      leve: { current: Math.min(prev.leve.current, leveMax), max: leveMax },
      moderada: { current: Math.min(prev.moderada.current, moderadaMax), max: moderadaMax },
      severa: { current: Math.min(prev.severa.current, severaMax), max: severaMax },
      extra: prev.extra,
    }))
  }, [attributes.esperteza])

  // Cursed Energy (toggleable)
  const [cursedEnergy, setCursedEnergy] = useState(75)
  const [maxCursedEnergy, setMaxCursedEnergy] = useState(75)
  const [cursedEnabled, setCursedEnabled] = useState(true)

  // Mana (toggleable)
  const [mana, setMana] = useState(50)
  const [maxMana, setMaxMana] = useState(50)
  const [manaEnabled, setManaEnabled] = useState(false)

  // Demonic Energy (toggleable)
  const [demonicEnergy, setDemonicEnergy] = useState(50)
  const [maxDemonicEnergy, setMaxDemonicEnergy] = useState(50)
  const [demonicEnabled, setDemonicEnabled] = useState(false)

  // Abilities
  const [abilities, setAbilities] = useState<Ability[]>([])

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  // Notes & Backstory
  const [notes, setNotes] = useState("")
  const [backstory, setBackstory] = useState("")

  // Evolutions system
  const [evolutionsActive, setEvolutionsActive] = useState(false)
  const [evolutions, setEvolutions] = useState<EvolutionData[]>([])
  const [activeEvolution, setActiveEvolution] = useState<string | null>(null)
  const [evoExpanded, setEvoExpanded] = useState(false)

  const [isResetting, setIsResetting] = useState(false)

  // Expose getData/loadData for save/load system
  useImperativeHandle(ref, () => ({
    getData: (): CharacterSaveData => ({
      id,
      name,
      avatar,
      characterLevel,
      attributes,
      hpBars: JSON.parse(JSON.stringify(hpBars)),
      hpExtraActive,
      mentalBars: JSON.parse(JSON.stringify(mentalBars)),
      mentalExtraActive,
      cursedEnergy,
      maxCursedEnergy,
      cursedEnabled,
      mana,
      maxMana,
      manaEnabled,
      demonicEnergy,
      maxDemonicEnergy,
      demonicEnabled,
      abilities: JSON.parse(JSON.stringify(abilities)),
      inventory: JSON.parse(JSON.stringify(inventory)),
      notes,
      backstory,
      evolutionsActive,
      evolutions: JSON.parse(JSON.stringify(evolutions)),
      activeEvolution,
    }),
    loadData: (data: CharacterSaveData) => {
      setName(data.name ?? "")
      setAvatar(data.avatar ?? null)
      setCharacterLevel(data.characterLevel ?? 1)
      setAttributes(data.attributes ?? { chamativo: 0, esperteza: 0, sorrateiro: 0, rapidez: 0, potente: 0, cuidadoso: 0 })
      setHpBars(data.hpBars ?? { ...defaultHpBars })
      setHpExtraActive(data.hpExtraActive ?? false)
      setMentalBars(data.mentalBars ?? { ...defaultMentalBars })
      setMentalExtraActive(data.mentalExtraActive ?? false)
      setCursedEnergy(data.cursedEnergy ?? 75)
      setMaxCursedEnergy(data.maxCursedEnergy ?? 75)
      setCursedEnabled(data.cursedEnabled ?? true)
      setMana(data.mana ?? 50)
      setMaxMana(data.maxMana ?? 50)
      setManaEnabled(data.manaEnabled ?? false)
      setDemonicEnergy(data.demonicEnergy ?? 50)
      setMaxDemonicEnergy(data.maxDemonicEnergy ?? 50)
      setDemonicEnabled(data.demonicEnabled ?? false)
      setAbilities(data.abilities ?? [])
      setInventory(data.inventory ?? [])
      setNotes(data.notes ?? "")
      setBackstory(data.backstory ?? "")
      setEvolutionsActive(data.evolutionsActive ?? false)
      setEvolutions(data.evolutions ?? [])
      setActiveEvolution(data.activeEvolution ?? null)
    },
  }))

  // Avatar handlers
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setRawAvatarSrc(src)
      setShowAvatarEditor(true)
    }
    reader.readAsDataURL(file)
    // Reset the input so same file can be re-selected
    e.target.value = ""
  }, [])

  const handleAvatarSave = useCallback((croppedImage: string) => {
    setAvatar(croppedImage)
    setShowAvatarEditor(false)
    setRawAvatarSrc(null)
  }, [])

  const handleAvatarEditorCancel = useCallback(() => {
    setShowAvatarEditor(false)
    setRawAvatarSrc(null)
  }, [])

  // Bar change handlers
  const handleHpBarChange = useCallback((barKey: string, field: "current" | "max", value: number) => {
    setHpBars((prev) => ({ ...prev, [barKey]: { ...prev[barKey as keyof BarsState], [field]: value } }))
  }, [])

  const handleMentalBarChange = useCallback((barKey: string, field: "current" | "max", value: number) => {
    setMentalBars((prev) => ({ ...prev, [barKey]: { ...prev[barKey as keyof BarsState], [field]: value } }))
  }, [])

  // Evolution system
  const saveCurrentAsEvolution = useCallback(() => {
    const evo: EvolutionData = {
      id: `evo-${Date.now()}`,
      name: `Forma ${evolutions.length + 1}`,
      hpBars: JSON.parse(JSON.stringify(hpBars)),
      hpExtraActive,
      mentalBars: JSON.parse(JSON.stringify(mentalBars)),
      mentalExtraActive,
      cursedEnergy,
      maxCursedEnergy,
      cursedEnabled,
      mana,
      maxMana,
      manaEnabled,
      demonicEnergy,
      maxDemonicEnergy,
      demonicEnabled,
      abilities: JSON.parse(JSON.stringify(abilities)),
      inventory: JSON.parse(JSON.stringify(inventory)),
    }
    setEvolutions((prev) => [...prev, evo])
  }, [hpBars, hpExtraActive, mentalBars, mentalExtraActive, cursedEnergy, maxCursedEnergy, cursedEnabled, mana, maxMana, manaEnabled, demonicEnergy, maxDemonicEnergy, demonicEnabled, abilities, inventory, evolutions.length])

  const loadEvolution = useCallback((evo: EvolutionData) => {
    setHpBars(JSON.parse(JSON.stringify(evo.hpBars)))
    setHpExtraActive(evo.hpExtraActive)
    setMentalBars(JSON.parse(JSON.stringify(evo.mentalBars)))
    setMentalExtraActive(evo.mentalExtraActive)
    setCursedEnergy(evo.cursedEnergy)
    setMaxCursedEnergy(evo.maxCursedEnergy)
    setCursedEnabled(evo.cursedEnabled)
    setMana(evo.mana)
    setMaxMana(evo.maxMana)
    setManaEnabled(evo.manaEnabled)
    setDemonicEnergy(evo.demonicEnergy)
    setMaxDemonicEnergy(evo.maxDemonicEnergy)
    setDemonicEnabled(evo.demonicEnabled)
    setAbilities(JSON.parse(JSON.stringify(evo.abilities)))
    setInventory(JSON.parse(JSON.stringify(evo.inventory)))
    setActiveEvolution(evo.id)
  }, [])

  const removeEvolution = useCallback((evoId: string) => {
    setEvolutions((prev) => prev.filter((e) => e.id !== evoId))
    if (activeEvolution === evoId) setActiveEvolution(null)
  }, [activeEvolution])

  const updateEvolutionName = useCallback((evoId: string, newName: string) => {
    setEvolutions((prev) => prev.map((e) => (e.id === evoId ? { ...e, name: newName } : e)))
  }, [])

  // Reset all
  const resetAll = useCallback(() => {
    setIsResetting(true)
    setTimeout(() => {
      setHpBars((prev) => ({
        leve: { ...prev.leve, current: prev.leve.max },
        moderada: { ...prev.moderada, current: prev.moderada.max },
        severa: { ...prev.severa, current: prev.severa.max },
        extra: { ...prev.extra, current: prev.extra.max },
      }))
      setMentalBars((prev) => ({
        leve: { ...prev.leve, current: prev.leve.max },
        moderada: { ...prev.moderada, current: prev.moderada.max },
        severa: { ...prev.severa, current: prev.severa.max },
        extra: { ...prev.extra, current: prev.extra.max },
      }))
      setCursedEnergy(maxCursedEnergy)
      setMana(maxMana)
      setDemonicEnergy(maxDemonicEnergy)
      setIsResetting(false)
    }, 300)
  }, [maxCursedEnergy, maxMana, maxDemonicEnergy])

  return (
    <>
      {/* Avatar Editor Modal */}
      {showAvatarEditor && rawAvatarSrc && (
        <AvatarEditor
          imageSrc={rawAvatarSrc}
          onSave={handleAvatarSave}
          onCancel={handleAvatarEditorCancel}
        />
      )}

      <div
        className={cn(
          "relative rounded-3xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm transition-all duration-500 md:p-6",
          isResetting && "scale-[0.98] opacity-80"
        )}
        style={{ animation: `slide-in 0.6s ease-out ${initialDelay}ms both` }}
      >
        {/* Decorative corner glows */}
        <div className="pointer-events-none absolute -left-1 -top-1 h-20 w-20 rounded-tl-3xl bg-gradient-to-br from-rose-500/10 to-transparent" />
        <div className="pointer-events-none absolute -bottom-1 -right-1 h-20 w-20 rounded-br-3xl bg-gradient-to-tl from-teal-500/10 to-transparent" />

        {/* Character header */}
        <div className="relative z-10 mb-5 flex items-center gap-4">
          {/* Avatar */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border/50 bg-secondary/50 transition-all hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10"
          >
            {avatar ? (
              <img
                src={avatar || "/placeholder.svg"}
                alt={name || "Avatar do personagem"}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle2 className="h-12 w-12 text-muted-foreground/40" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-foreground" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </button>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              placeholder="Nome do Personagem"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent font-display text-xl font-bold tracking-wide text-foreground outline-none placeholder:text-muted-foreground/50 md:text-2xl"
            />
            <div className="mt-0.5 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground/50">Nivel {characterLevel}</span>
              </div>
              {/* Evolution toggle */}
              <button
                type="button"
                onClick={() => setEvolutionsActive(!evolutionsActive)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                  evolutionsActive
                    ? "border-fuchsia-500/40 bg-fuchsia-500/20 text-fuchsia-300"
                    : "border-border/30 bg-secondary/20 text-muted-foreground/50 hover:border-fuchsia-500/20"
                )}
              >
                <Dna className="h-3 w-3" />
                Evolucoes {evolutionsActive ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-95"
              title="Restaurar todos os atributos"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="flex items-center justify-center rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
              title="Remover personagem"
            >
              Remover
            </button>
          </div>
        </div>

        {/* Evolutions panel (if active) */}
        {evolutionsActive && (
          <div className="relative z-10 mb-4 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 transition-all">
            <button
              type="button"
              onClick={() => setEvoExpanded(!evoExpanded)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
                  <Dna className="h-5 w-5 text-fuchsia-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Evolucoes / Transformacoes
                  </h3>
                  <span className="text-xs text-muted-foreground/50">
                    {evolutions.length} {evolutions.length === 1 ? "forma" : "formas"} salvas
                    {activeEvolution && ` | Ativa: ${evolutions.find((e) => e.id === activeEvolution)?.name}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-secondary/30 px-2 py-1 text-xs text-muted-foreground">
                {evoExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </div>
            </button>

            <div className={cn("overflow-hidden transition-all duration-500", evoExpanded ? "mt-4 max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
              {/* Saved evolutions */}
              <div className="space-y-2">
                {evolutions.map((evo) => (
                  <div
                    key={evo.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border p-3 transition-all",
                      activeEvolution === evo.id
                        ? "border-fuchsia-500/40 bg-fuchsia-500/15"
                        : "border-border/30 bg-secondary/20 hover:bg-secondary/30"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/20">
                      <Dna className="h-4 w-4 text-fuchsia-400" />
                    </div>
                    <input
                      type="text"
                      value={evo.name}
                      onChange={(e) => updateEvolutionName(evo.id, e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-bold text-foreground outline-none"
                    />
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => loadEvolution(evo)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                          activeEvolution === evo.id
                            ? "border-fuchsia-500/40 bg-fuchsia-500/20 text-fuchsia-300"
                            : "border-border/30 bg-secondary/30 text-muted-foreground hover:border-fuchsia-500/30 hover:text-fuchsia-300"
                        )}
                      >
                        Carregar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEvolution(evo.id)}
                        className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {evolutions.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <Dna className="h-6 w-6 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/50">Nenhuma evolucao salva</p>
                  </div>
                )}
              </div>

              {/* Save current as evolution */}
              <button
                type="button"
                onClick={saveCurrentAsEvolution}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-fuchsia-500/20 py-3 text-xs font-bold text-fuchsia-400/60 transition-all hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 hover:text-fuchsia-400"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar Estado Atual como Evolucao
              </button>
            </div>
          </div>
        )}

        {/* Stats grid - HP and Mental */}
        <div className="grid gap-4 lg:grid-cols-2">
          <MultiBarStat
            label="Vida"
            icon="hp"
            bars={hpBars}
            extraActive={hpExtraActive}
            onBarChange={handleHpBarChange}
            onExtraToggle={() => setHpExtraActive((prev) => !prev)}
            delay={initialDelay + 100}
          />
          <MultiBarStat
            label="Mentalidade"
            icon="mental"
            bars={mentalBars}
            extraActive={mentalExtraActive}
            onBarChange={handleMentalBarChange}
            onExtraToggle={() => setMentalExtraActive((prev) => !prev)}
            delay={initialDelay + 200}
          />
        </div>

        {/* Energy stats grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Energia Amaldicoada"
            icon="cursed"
            maxValue={maxCursedEnergy}
            currentValue={cursedEnergy}
            onValueChange={setCursedEnergy}
            onMaxChange={setMaxCursedEnergy}
            delay={initialDelay + 300}
            toggleable
            enabled={cursedEnabled}
            onToggle={() => setCursedEnabled((prev) => !prev)}
            isEnergy
          />
          <StatCard
            label="Mana"
            icon="mana"
            maxValue={maxMana}
            currentValue={mana}
            onValueChange={setMana}
            onMaxChange={setMaxMana}
            delay={initialDelay + 400}
            toggleable
            enabled={manaEnabled}
            onToggle={() => setManaEnabled((prev) => !prev)}
            isEnergy
          />
          <StatCard
            label="Energia Demoniaca"
            icon="demonic"
            maxValue={maxDemonicEnergy}
            currentValue={demonicEnergy}
            onValueChange={setDemonicEnergy}
            onMaxChange={setMaxDemonicEnergy}
            delay={initialDelay + 500}
            toggleable
            enabled={demonicEnabled}
            onToggle={() => setDemonicEnabled((prev) => !prev)}
            isEnergy
          />
        </div>

        {/* Attributes */}
        <div className="mt-4">
          <AttributesPanel
            attributes={attributes}
            characterLevel={characterLevel}
            onAttributesChange={setAttributes}
            onLevelChange={setCharacterLevel}
          />
        </div>

        {/* Abilities */}
        <div className="mt-4">
          <AbilitiesPanel abilities={abilities} onAbilitiesChange={setAbilities} />
        </div>

        {/* Inventory */}
        <div className="mt-4">
          <InventoryPanel items={inventory} onItemsChange={setInventory} />
        </div>

        {/* Notes & Backstory */}
        <div className="mt-4">
          <NotesPanel
            notes={notes}
            backstory={backstory}
            onNotesChange={setNotes}
            onBackstoryChange={setBackstory}
          />
        </div>
      </div>
    </>
  )
})
