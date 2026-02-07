"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, StickyNote, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotesPanelProps {
  notes: string
  backstory: string
  onNotesChange: (notes: string) => void
  onBackstoryChange: (backstory: string) => void
}

export function NotesPanel({ notes, backstory, onNotesChange, onBackstoryChange }: NotesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"notes" | "backstory">("notes")

  return (
    <div className="rounded-2xl border border-lime-500/20 bg-lime-500/5 p-4 transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/10">
            <StickyNote className="h-5 w-5 text-lime-400" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Anotacoes & Historia
            </h3>
            <span className="text-xs text-muted-foreground/50">
              Registros do personagem
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
          isExpanded ? "mt-4 max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Tabs */}
        <div className="mb-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "notes"
                ? "border-lime-500/40 bg-lime-500/20 text-lime-300"
                : "border-border/30 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <StickyNote className="h-3 w-3" />
            Anotacoes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("backstory")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "backstory"
                ? "border-lime-500/40 bg-lime-500/20 text-lime-300"
                : "border-border/30 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <BookOpen className="h-3 w-3" />
            Historia
          </button>
        </div>

        {activeTab === "notes" ? (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground/50">Anotacoes gerais, lembretes, missoes...</p>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={6}
              placeholder="Escreva suas anotacoes aqui..."
              className="w-full resize-y rounded-xl border border-lime-500/15 bg-secondary/30 px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-lime-500/30"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground/50">Historia e background do personagem</p>
            <textarea
              value={backstory}
              onChange={(e) => onBackstoryChange(e.target.value)}
              rows={8}
              placeholder="Conte a historia do seu personagem..."
              className="w-full resize-y rounded-xl border border-lime-500/15 bg-secondary/30 px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-lime-500/30"
            />
          </div>
        )}
      </div>
    </div>
  )
}
