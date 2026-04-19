'use client'

import { useState, useEffect, useCallback } from 'react'

interface BriefData {
  greeting: string
  insight: string
  focus_word: string
  quote: string
  quote_author: string
  intention: string
}

export default function DailyBrief() {
  const [data, setData] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBrief = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/brief')
      const json = await res.json()
      if (json.success) setData(json.data)
      else throw new Error(json.error)
    } catch {
      setError('Failed to load brief. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrief()
  }, [fetchBrief])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="panel p-6 animate-pulse">
            <div className="h-4 bg-bg-elevated rounded w-3/4 mb-3" />
            <div className="h-4 bg-bg-elevated rounded w-1/2" />
          </div>
        ))}
        <div className="text-center font-mono text-xs text-slate-600 mt-4">
          <span className="text-amber-glow">▸</span> Generating your daily brief...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-red-400 font-mono text-sm mb-4">{error || 'Something went wrong'}</p>
        <button onClick={fetchBrief} className="btn-ghost px-4 py-2 text-sm font-mono">
          Try again ↺
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Greeting + Focus Word */}
      <div className="panel p-6 sm:p-8 relative overflow-hidden animate-fade-in-up">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-glow/3 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative">
          <div className="font-mono text-xs text-slate-600 mb-2 flex items-center gap-2">
            <span className="text-amber-glow">◆</span> SYSTEM.GREETING
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
            {data.greeting}
          </h1>

          {/* Focus word */}
          <div className="inline-flex items-center gap-3 bg-amber-glow/5 border border-amber-glow/20 rounded-xl px-5 py-3">
            <span className="font-mono text-xs text-slate-500">TODAY&apos;S WORD</span>
            <span className="font-mono text-2xl font-bold text-amber-glow text-glow-amber tracking-widest">
              {data.focus_word}
            </span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="panel p-6 animate-fade-in-up delay-100">
        <div className="font-mono text-xs text-slate-600 mb-3 flex items-center gap-2">
          <span className="text-cyan-glow">◆</span> AI.INSIGHT
        </div>
        <p className="text-slate-300 leading-relaxed text-base">{data.insight}</p>
      </div>

      {/* Quote */}
      <div className="panel p-6 border-l-2 border-amber-glow/30 animate-fade-in-up delay-200">
        <div className="font-mono text-xs text-slate-600 mb-3 flex items-center gap-2">
          <span className="text-amber-glow">◆</span> DAILY.QUOTE
        </div>
        <blockquote className="text-slate-200 text-lg italic leading-relaxed mb-3">
          &ldquo;{data.quote}&rdquo;
        </blockquote>
        <p className="font-mono text-xs text-amber-glow/70">— {data.quote_author}</p>
      </div>

      {/* Intention */}
      <div className="panel p-6 animate-fade-in-up delay-300">
        <div className="font-mono text-xs text-slate-600 mb-3 flex items-center gap-2">
          <span className="text-emerald-400">◆</span> TODAY&apos;S INTENTION
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🎯</span>
          <p className="text-white font-medium text-base leading-relaxed">{data.intention}</p>
        </div>
      </div>

      {/* Regenerate */}
      <div className="flex justify-end animate-fade-in-up delay-400">
        <button
          onClick={fetchBrief}
          className="btn-ghost px-4 py-2 text-xs font-mono flex items-center gap-2"
        >
          <span>↺</span> Regenerate Brief
        </button>
      </div>
    </div>
  )
}
