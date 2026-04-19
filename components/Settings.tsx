'use client'

import { useState, useEffect } from 'react'

const THEMES = [
  { id: 'amber',   label: 'Amber',   color: '#f59e0b' },
  { id: 'cyan',    label: 'Cyan',    color: '#22d3ee' },
  { id: 'emerald', label: 'Emerald', color: '#34d399' },
  { id: 'violet',  label: 'Violet',  color: '#a78bfa' },
  { id: 'rose',    label: 'Rose',    color: '#fb7185' },
]

const FOCUS_PRESETS = [
  { label: 'Classic', work: 25, short: 5,  long: 15 },
  { label: 'Flow',    work: 50, short: 10, long: 20 },
  { label: 'Sprint',  work: 15, short: 3,  long: 10 },
  { label: 'Custom',  work: 0,  short: 0,  long: 0  },
]

export interface Settings {
  name: string
  accentColor: string
  focusPreset: string
  customWork: number
  customShort: number
  customLong: number
  soundEnabled: boolean
  briefTime: string
}

const DEFAULTS: Settings = {
  name: '',
  accentColor: '#f59e0b',
  focusPreset: 'Classic',
  customWork: 25,
  customShort: 5,
  customLong: 15,
  soundEnabled: true,
  briefTime: 'morning',
}

export function useSettings(): Settings {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dayos-settings')
      if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) })
    } catch {}
  }, [])

  return settings
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem('dayos-settings')
      if (s) setSettings({ ...DEFAULTS, ...JSON.parse(s) })
    } catch {}
  }, [])

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  const save = () => {
    localStorage.setItem('dayos-settings', JSON.stringify(settings))
    // Apply accent color CSS variable
    document.documentElement.style.setProperty('--amber', settings.accentColor)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => {
    setSettings(DEFAULTS)
    localStorage.removeItem('dayos-settings')
    document.documentElement.style.removeProperty('--amber')
  }

  const selectedPreset = FOCUS_PRESETS.find((p) => p.label === settings.focusPreset) || FOCUS_PRESETS[0]

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile */}
      <div className="panel p-6 animate-fade-in-up">
        <div className="font-mono text-xs text-slate-600 mb-4 flex items-center gap-2">
          <span className="text-amber-glow">◆</span> PROFILE
        </div>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-slate-500 block mb-2">YOUR NAME</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="How should DayOS greet you?"
              className="input-base w-full px-4 py-3 text-sm"
            />
            <p className="font-mono text-xs text-slate-600 mt-1.5">
              Used in your AI Daily Brief greeting
            </p>
          </div>
        </div>
      </div>

      {/* Accent Color */}
      <div className="panel p-6 animate-fade-in-up delay-100">
        <div className="font-mono text-xs text-slate-600 mb-4 flex items-center gap-2">
          <span className="text-amber-glow">◆</span> ACCENT COLOR
        </div>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => update({ accentColor: theme.color })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all"
              style={{
                borderColor: settings.accentColor === theme.color ? theme.color : '#1e2030',
                background: settings.accentColor === theme.color ? `${theme.color}15` : 'transparent',
              }}
            >
              <div className="w-4 h-4 rounded-full" style={{ background: theme.color }} />
              <span className="font-mono text-xs" style={{ color: settings.accentColor === theme.color ? theme.color : '#64748b' }}>
                {theme.label}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="font-mono text-xs text-slate-500">CUSTOM HEX</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-bg-border"
            />
            <span className="font-mono text-xs text-slate-500">{settings.accentColor}</span>
          </div>
        </div>
      </div>

      {/* Focus Timer Presets */}
      <div className="panel p-6 animate-fade-in-up delay-200">
        <div className="font-mono text-xs text-slate-600 mb-4 flex items-center gap-2">
          <span className="text-cyan-glow">◆</span> FOCUS TIMER PRESET
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {FOCUS_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => update({ focusPreset: preset.label })}
              className={`p-3 rounded-xl border text-center transition-all ${
                settings.focusPreset === preset.label
                  ? 'border-amber-glow bg-amber-glow/10'
                  : 'border-bg-border hover:border-slate-600'
              }`}
            >
              <div className={`font-mono text-sm font-bold ${settings.focusPreset === preset.label ? 'text-amber-glow' : 'text-slate-400'}`}>
                {preset.label}
              </div>
              {preset.label !== 'Custom' && (
                <div className="font-mono text-xs text-slate-600 mt-1">{preset.work}m work</div>
              )}
            </button>
          ))}
        </div>

        {settings.focusPreset === 'Custom' ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'WORK (min)', key: 'customWork' as const, value: settings.customWork },
              { label: 'SHORT (min)', key: 'customShort' as const, value: settings.customShort },
              { label: 'LONG (min)', key: 'customLong' as const, value: settings.customLong },
            ].map(({ label, key, value }) => (
              <div key={key}>
                <label className="font-mono text-xs text-slate-500 block mb-1.5">{label}</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={value}
                  onChange={(e) => update({ [key]: Number(e.target.value) })}
                  className="input-base w-full px-3 py-2.5 text-sm text-center font-mono"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'WORK', val: selectedPreset.work },
              { label: 'SHORT BREAK', val: selectedPreset.short },
              { label: 'LONG BREAK', val: selectedPreset.long },
            ].map(({ label, val }) => (
              <div key={label} className="bg-bg-elevated rounded-xl p-3 text-center">
                <div className="font-mono text-xs text-slate-600 mb-1">{label}</div>
                <div className="font-mono text-xl font-bold text-amber-glow">{val}m</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="panel p-6 animate-fade-in-up delay-300">
        <div className="font-mono text-xs text-slate-600 mb-4 flex items-center gap-2">
          <span className="text-emerald-400">◆</span> PREFERENCES
        </div>
        <div className="space-y-4">
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300 font-medium">Timer Sound</p>
              <p className="font-mono text-xs text-slate-600 mt-0.5">Beep when a session ends</p>
            </div>
            <button
              onClick={() => update({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${
                settings.soundEnabled ? 'bg-amber-glow/30' : 'bg-bg-elevated'
              } border ${settings.soundEnabled ? 'border-amber-glow/50' : 'border-bg-border'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                  settings.soundEnabled ? 'left-6 bg-amber-glow' : 'left-0.5 bg-slate-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save / Reset */}
      <div className="flex items-center gap-3 animate-fade-in-up delay-400">
        <button
          onClick={save}
          className="btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2"
        >
          {saved ? '✓ Saved!' : '↓ Save Settings'}
        </button>
        <button onClick={reset} className="btn-ghost px-4 py-3 text-sm font-mono">
          Reset defaults
        </button>
      </div>

      {/* Info box */}
      <div className="border border-bg-border rounded-xl p-4 bg-bg-elevated/50">
        <p className="font-mono text-xs text-slate-600 leading-relaxed">
          Settings are saved locally in your browser. Your data (notes, habits, tasks) is stored in the database configured via <span className="text-amber-glow">DATABASE_URL</span>.
        </p>
      </div>
    </div>
  )
}
