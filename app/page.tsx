"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { CharacterSheet, type CharacterSheetHandle, type CharacterSaveData } from "@/components/character-sheet"
import { FloatingParticles } from "@/components/floating-particles"
import { useTheme } from "next-themes"
import { useSound } from "@/hooks/use-sound"
import {
  Plus,
  Swords,
  Shield,
  Skull,
  Crown,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Users,
  Dna,
  Download,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Role = "mestre" | "player" | null

export default function Page() {
  const [role, setRole] = useState<Role>(null)
  const [playerName, setPlayerName] = useState("")
  const [characters, setCharacters] = useState<string[]>(["char-1"])
  const [isAdding, setIsAdding] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { play } = useSound()
  const menuRef = useRef<HTMLDivElement>(null)
  const importFileRef = useRef<HTMLInputElement>(null)
  const characterRefs = useRef<Map<string, CharacterSheetHandle>>(new Map())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  const addCharacter = useCallback(() => {
    setIsAdding(true)
    play("add")
    const newId = `char-${Date.now()}`
    setCharacters((prev) => [...prev, newId])
    setTimeout(() => setIsAdding(false), 600)
  }, [play])

  const removeCharacter = useCallback(
    (id: string) => {
      play("remove")
      setCharacters((prev) => prev.filter((c) => c !== id))
    },
    [play]
  )

  const handleRoleSelect = useCallback(
    (r: Role) => {
      play("roleSelect")
      setRole(r)
    },
    [play]
  )

  const toggleTheme = useCallback(() => {
    play("themeSwitch")
    setTheme(theme === "dark" ? "light" : "dark")
  }, [play, theme, setTheme])

  // Scroll to evolutions of first character
  const scrollToTransformations = useCallback(() => {
    play("navigate")
    setMenuOpen(false)
    // Dispatch a custom event that CharacterSheet can listen to
    window.dispatchEvent(new CustomEvent("open-transformations"))
  }, [play])

  // Save all data as a downloadable JSON file
  const handleSaveToFile = useCallback(() => {
    const allCharacterData: CharacterSaveData[] = []
    for (const charId of characters) {
      const handle = characterRefs.current.get(charId)
      if (handle) {
        allCharacterData.push(handle.getData())
      }
    }
    const savePayload = {
      version: 1,
      savedAt: new Date().toISOString(),
      role,
      playerName,
      characters: allCharacterData,
    }
    const json = JSON.stringify(savePayload, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `power-save-${playerName || "personagem"}-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    play("add")
    setSaveMessage("Dados salvos com sucesso!")
    setTimeout(() => setSaveMessage(null), 3000)
    setMenuOpen(false)
  }, [characters, role, playerName, play])

  // Import data from a JSON file
  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        if (!raw.characters || !Array.isArray(raw.characters)) {
          setSaveMessage("Arquivo invalido!")
          setTimeout(() => setSaveMessage(null), 3000)
          return
        }
        // Restore role and player name
        if (raw.role) setRole(raw.role)
        if (raw.playerName) setPlayerName(raw.playerName)

        // Create new character IDs and schedule data loading
        const newCharIds = raw.characters.map((_: CharacterSaveData, i: number) => `char-import-${Date.now()}-${i}`)
        setCharacters(newCharIds)

        // Load data into each character sheet after a short delay for refs to be set
        setTimeout(() => {
          raw.characters.forEach((charData: CharacterSaveData, i: number) => {
            const handle = characterRefs.current.get(newCharIds[i])
            if (handle) {
              handle.loadData(charData)
            }
          })
        }, 500)

        play("add")
        setSaveMessage("Dados importados com sucesso!")
        setTimeout(() => setSaveMessage(null), 3000)
      } catch {
        setSaveMessage("Erro ao ler o arquivo!")
        setTimeout(() => setSaveMessage(null), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ""
    setMenuOpen(false)
  }, [play])

  // Role selection screen
  if (!role) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <FloatingParticles />
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-rose-500/5 blur-3xl" />
          <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div
          className="relative z-10 mx-4 w-full max-w-lg"
          style={{ animation: "fade-up 0.8s ease-out" }}
        >
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-500/10"
              style={{ animation: "logo-pulse 2s ease-in-out infinite" }}
            >
              <Swords className="h-9 w-9 text-rose-400" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-[0.3em] text-foreground">
                P.O.W.E.R
              </h1>

            </div>
          </div>

          {/* Role selection */}
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Selecione seu papel
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Mestre */}
            <button
              type="button"
              onClick={() => handleRoleSelect("mestre")}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-amber-500/30 bg-card/80 p-6 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/10 active:scale-95"
              style={{ animation: "fade-up 0.8s ease-out 0.2s both" }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 transition-all group-hover:scale-110 group-hover:bg-amber-500/20">
                <Crown className="h-8 w-8 text-amber-400" />
              </div>
              <div className="text-center">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Mestre
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Controle todos os personagens e NPCs
                </p>
              </div>
            </button>

            {/* Player */}
            <button
              type="button"
              onClick={() => handleRoleSelect("player")}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-blue-500/30 bg-card/80 p-6 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/10 active:scale-95"
              style={{ animation: "fade-up 0.8s ease-out 0.35s both" }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 transition-all group-hover:scale-110 group-hover:bg-blue-500/20">
                <User className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-center">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Player
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gerencie seu personagem de forma individual
                </p>
              </div>
            </button>
          </div>

          {/* Theme toggle */}
          {mounted && (
            <div className="mt-8 flex justify-center" style={{ animation: "fade-up 0.8s ease-out 0.5s both" }}>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground active:scale-95"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <FloatingParticles />

      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-rose-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10">
              <Swords className="h-5 w-5 text-rose-400" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold tracking-[0.25em] text-foreground">
                P.O.W.E.R
              </h1>
            </div>
          </div>

          {/* Name input - desktop */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-secondary/40 px-3 py-2">
              {role === "mestre" ? (
                <Crown className="h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <User className="h-4 w-4 shrink-0 text-blue-400" />
              )}
              <input
                type="text"
                placeholder={role === "mestre" ? "Nome do Mestre" : "Nome do Player"}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-40 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Stat legend - desktop only */}
            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="text-xs text-muted-foreground">Vida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs text-muted-foreground">Mental</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-teal-400" />
                <span className="text-xs text-muted-foreground">Energia</span>
              </div>
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-secondary/40 text-muted-foreground transition-all hover:bg-secondary/70 hover:text-foreground active:scale-95"
                title={theme === "dark" ? "Tema Claro" : "Tema Escuro"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* Add character button (mestre only, desktop) */}
            {role === "mestre" && (
              <button
                type="button"
                onClick={addCharacter}
                disabled={isAdding}
                className={cn(
                  "hidden items-center gap-1.5 rounded-xl border border-border/40 bg-secondary/40 px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 active:scale-95 sm:flex",
                  isAdding && "pointer-events-none opacity-50"
                )}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Novo Personagem</span>
              </button>
            )}

            {/* Menu button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  play(menuOpen ? "menuClose" : "menuOpen")
                  setMenuOpen(!menuOpen)
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-secondary/40 text-muted-foreground transition-all hover:bg-secondary/70 hover:text-foreground active:scale-95",
                  menuOpen && "border-rose-500/30 bg-rose-500/10 text-rose-300"
                )}
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-[100] mt-2 w-60 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-background/80 backdrop-blur-xl"
                  style={{ animation: "fade-up 0.2s ease-out" }}
                >
                  <div className="p-1.5">
                    {/* Player: add character option */}
                    {role === "player" && (
                      <button
                        type="button"
                        onClick={() => {
                          addCharacter()
                          setMenuOpen(false)
                        }}
                        disabled={isAdding}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Personagem
                      </button>
                    )}

                    {/* Mestre: add character (mobile only) */}
                    {role === "mestre" && (
                      <button
                        type="button"
                        onClick={() => {
                          addCharacter()
                          setMenuOpen(false)
                        }}
                        disabled={isAdding}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-rose-500/10 hover:text-rose-300 sm:hidden"
                      >
                        <Plus className="h-4 w-4" />
                        Novo Personagem
                      </button>
                    )}

                    {/* Transformations shortcut */}
                    <button
                      type="button"
                      onClick={scrollToTransformations}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-all hover:bg-fuchsia-500/10 hover:text-fuchsia-300"
                    >
                      <Dna className="h-4 w-4" />
                      Transformacoes
                    </button>

                    <div className="mx-2 my-1 border-t border-border/20" />

                    {/* Save to file */}
                    <button
                      type="button"
                      onClick={handleSaveToFile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <Download className="h-4 w-4" />
                      Salvar Dados (Arquivo)
                    </button>

                    {/* Import from file */}
                    <button
                      type="button"
                      onClick={() => importFileRef.current?.click()}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-all hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      <Upload className="h-4 w-4" />
                      Importar Dados (Arquivo)
                    </button>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />

                    <div className="mx-2 my-1 border-t border-border/20" />

                    {/* Trocar papel */}
                    <button
                      type="button"
                      onClick={() => {
                        play("navigate")
                        setRole(null)
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-secondary/70 hover:text-foreground"
                    >
                      <Users className="h-4 w-4" />
                      Trocar Papel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile name input */}
        <div className="flex items-center gap-2 border-t border-border/20 px-4 py-2 md:hidden">
          {role === "mestre" ? (
            <Crown className="h-4 w-4 shrink-0 text-amber-400" />
          ) : (
            <User className="h-4 w-4 shrink-0 text-blue-400" />
          )}
          <input
            type="text"
            placeholder={role === "mestre" ? "Nome do Mestre" : "Nome do Player"}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {characters.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border/30 bg-card/50">
                <Skull className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="absolute inset-0 animate-pulse rounded-3xl bg-rose-500/5" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground">
                Nenhum personagem
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione um personagem para comecar a rastrear seus atributos
              </p>
            </div>
            <button
              type="button"
              onClick={addCharacter}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-3 font-semibold text-rose-300 transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Adicionar Personagem
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Quick info bar */}
            <div className="flex items-center gap-2 rounded-2xl border border-border/30 bg-card/30 px-4 py-3 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {characters.length}{" "}
                {characters.length === 1 ? "personagem" : "personagens"} em jogo
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="rounded-lg border border-border/30 bg-secondary/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {role === "mestre" ? "Mestre" : "Player"}
                  {playerName ? `: ${playerName}` : ""}
                </span>
              </div>
            </div>

            {/* Character sheets */}
            {characters.map((id, index) => (
              <CharacterSheet
                key={id}
                id={id}
                ref={(handle) => {
                  if (handle) {
                    characterRefs.current.set(id, handle)
                  } else {
                    characterRefs.current.delete(id)
                  }
                }}
                onRemove={removeCharacter}
                initialDelay={index * 150}
              />
            ))}

            {/* Add another character - only for Mestre */}
            {role === "mestre" && (
              <button
                type="button"
                onClick={addCharacter}
                disabled={isAdding}
                className={cn(
                  "group flex items-center justify-center gap-2 rounded-3xl border border-dashed border-border/30 bg-card/20 py-8 text-muted-foreground transition-all hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-300",
                  isAdding && "pointer-events-none opacity-50"
                )}
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                <span className="font-display text-sm font-semibold tracking-wider">
                  Adicionar Personagem
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save/Import notification */}
      {saveMessage && (
        <div
          className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-card/95 px-6 py-3 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl"
          style={{ animation: "fade-up 0.3s ease-out" }}
        >
          <span className="text-sm font-semibold text-emerald-300">{saveMessage}</span>
        </div>
      )}

      {/* Footer gradient */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </main>
  )
}
