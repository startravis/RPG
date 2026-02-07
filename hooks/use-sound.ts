"use client"

import { useCallback, useRef } from "react"

type SoundType =
  | "add"
  | "remove"
  | "levelUp"
  | "damage"
  | "heal"
  | "evolution"
  | "gradeCommon"
  | "gradeRare"
  | "gradeEpic"
  | "gradeLegendary"
  | "gradeDivine"
  | "click"
  | "toggle"
  | "abilityAdd"
  | "abilityRemove"
  | "abilityLevelUp"
  | "themeSwitch"
  | "roleSelect"
  | "menuOpen"
  | "menuClose"
  | "restore"
  | "navigate"
  | "success"
  | "warning"

const audioCtxRef: { current: AudioContext | null } = { current: null }

function getAudioCtx(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioCtxRef.current
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15, detune = 0) {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    if (detune) osc.detune.setValueAtTime(detune, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = "sine", volume = 0.08) {
  for (const f of frequencies) {
    playTone(f, duration, type, volume)
  }
}

const soundMap: Record<SoundType, () => void> = {
  add: () => {
    playTone(523, 0.12, "sine", 0.12)
    setTimeout(() => playTone(659, 0.12, "sine", 0.12), 60)
    setTimeout(() => playTone(784, 0.18, "sine", 0.15), 120)
  },
  remove: () => {
    playTone(440, 0.15, "sine", 0.1)
    setTimeout(() => playTone(330, 0.2, "sine", 0.08), 80)
  },
  levelUp: () => {
    playTone(523, 0.1, "sine", 0.12)
    setTimeout(() => playTone(659, 0.1, "sine", 0.12), 70)
    setTimeout(() => playTone(784, 0.1, "sine", 0.12), 140)
    setTimeout(() => playTone(1047, 0.25, "sine", 0.15), 210)
  },
  damage: () => {
    playTone(200, 0.15, "sawtooth", 0.08)
    setTimeout(() => playTone(150, 0.2, "sawtooth", 0.06), 60)
  },
  heal: () => {
    playTone(440, 0.12, "sine", 0.1)
    setTimeout(() => playTone(554, 0.12, "sine", 0.1), 80)
    setTimeout(() => playTone(659, 0.18, "sine", 0.12), 160)
  },
  evolution: () => {
    playChord([261, 329, 392], 0.15, "sine", 0.08)
    setTimeout(() => playChord([329, 415, 523], 0.15, "sine", 0.08), 150)
    setTimeout(() => playChord([392, 493, 587], 0.2, "sine", 0.1), 300)
    setTimeout(() => playChord([523, 659, 784], 0.4, "sine", 0.12), 450)
  },
  gradeCommon: () => {
    playTone(440, 0.15, "sine", 0.08)
  },
  gradeRare: () => {
    playTone(523, 0.12, "sine", 0.1)
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 80)
  },
  gradeEpic: () => {
    playTone(523, 0.1, "triangle", 0.1)
    setTimeout(() => playTone(659, 0.1, "triangle", 0.1), 70)
    setTimeout(() => playTone(784, 0.2, "triangle", 0.12), 140)
  },
  gradeLegendary: () => {
    playChord([523, 659, 784], 0.1, "sine", 0.06)
    setTimeout(() => playChord([587, 740, 880], 0.15, "sine", 0.08), 120)
    setTimeout(() => playChord([659, 830, 1047], 0.3, "sine", 0.1), 240)
  },
  gradeDivine: () => {
    playChord([261, 329, 392, 523], 0.15, "sine", 0.06)
    setTimeout(() => playChord([329, 415, 523, 659], 0.15, "sine", 0.06), 150)
    setTimeout(() => playChord([392, 493, 587, 784], 0.2, "sine", 0.08), 300)
    setTimeout(() => playChord([523, 659, 784, 1047], 0.5, "triangle", 0.1), 450)
    setTimeout(() => playTone(1318, 0.6, "sine", 0.08, 10), 600)
  },
  click: () => {
    playTone(800, 0.06, "sine", 0.06)
  },
  toggle: () => {
    playTone(600, 0.08, "sine", 0.08)
    setTimeout(() => playTone(800, 0.08, "sine", 0.08), 50)
  },
  abilityAdd: () => {
    playTone(440, 0.08, "sine", 0.1)
    setTimeout(() => playTone(554, 0.08, "sine", 0.1), 60)
    setTimeout(() => playTone(659, 0.1, "sine", 0.12), 120)
    setTimeout(() => playTone(880, 0.2, "triangle", 0.14), 200)
  },
  abilityRemove: () => {
    playTone(600, 0.1, "sawtooth", 0.06)
    setTimeout(() => playTone(400, 0.15, "sawtooth", 0.05), 80)
    setTimeout(() => playTone(300, 0.2, "sawtooth", 0.04), 160)
  },
  abilityLevelUp: () => {
    playTone(523, 0.08, "sine", 0.1)
    setTimeout(() => playTone(659, 0.08, "sine", 0.1), 70)
    setTimeout(() => playTone(784, 0.1, "sine", 0.12), 140)
    setTimeout(() => playTone(1047, 0.2, "triangle", 0.14), 210)
  },
  themeSwitch: () => {
    playTone(440, 0.1, "sine", 0.08)
    setTimeout(() => playTone(660, 0.15, "sine", 0.1), 100)
  },
  roleSelect: () => {
    playChord([392, 493, 587], 0.15, "sine", 0.08)
    setTimeout(() => playChord([523, 659, 784], 0.3, "sine", 0.1), 180)
  },
  menuOpen: () => {
    playTone(400, 0.06, "sine", 0.06)
    setTimeout(() => playTone(600, 0.06, "sine", 0.06), 40)
    setTimeout(() => playTone(800, 0.08, "sine", 0.07), 80)
  },
  menuClose: () => {
    playTone(800, 0.06, "sine", 0.06)
    setTimeout(() => playTone(600, 0.06, "sine", 0.06), 40)
    setTimeout(() => playTone(400, 0.08, "sine", 0.05), 80)
  },
  restore: () => {
    playChord([523, 659, 784], 0.1, "sine", 0.06)
    setTimeout(() => playChord([587, 740, 880], 0.15, "sine", 0.08), 120)
    setTimeout(() => playChord([659, 830, 1047], 0.25, "sine", 0.1), 260)
  },
  navigate: () => {
    playTone(523, 0.06, "sine", 0.06)
    setTimeout(() => playTone(698, 0.08, "sine", 0.07), 50)
  },
  success: () => {
    playTone(523, 0.08, "sine", 0.1)
    setTimeout(() => playTone(659, 0.08, "sine", 0.1), 80)
    setTimeout(() => playTone(784, 0.12, "sine", 0.12), 160)
    setTimeout(() => playTone(1047, 0.25, "triangle", 0.15), 250)
  },
  warning: () => {
    playTone(440, 0.15, "sawtooth", 0.06)
    setTimeout(() => playTone(440, 0.15, "sawtooth", 0.06), 200)
  },
}

export function useSound() {
  const lastPlayedRef = useRef<number>(0)

  const play = useCallback((type: SoundType) => {
    const now = Date.now()
    // Debounce to avoid overlapping rapid sounds
    if (now - lastPlayedRef.current < 50) return
    lastPlayedRef.current = now
    soundMap[type]?.()
  }, [])

  return { play }
}

export function getGradeSound(grade: string): SoundType {
  const g = grade.toLowerCase()
  if (g.includes("divino") || g.includes("divine")) return "gradeDivine"
  if (g.includes("especial") || g.includes("special")) return "gradeLegendary"
  if (g === "1" || g === "2") return "gradeEpic"
  if (g === "3" || g === "4" || g === "5") return "gradeRare"
  return "gradeCommon"
}
