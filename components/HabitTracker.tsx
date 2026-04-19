'use client'

import { useState, useEffect, useCallback } from 'react'

interface Habit {
  id: string
  name: string
  emoji: string
  streak: number
  completedToday: boolean
}

const EMOJI_OPTIONS = ['✅', '💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '✍️', '🎯', '🧠', '🎨', '🚴', '🌿', '💊']

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('✅')
  const [showAdd, setShowAdd] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/habits')
      const json = await res.json()
      if (json.success) setHabits(json.habits)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const addHabit = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, emoji: newEmoji }),
    })
    const json = await res.json()
    if (json.success) {
      setHabits((h) => [...h, json.habit])
      setNewName('')
      setNewEmoji('✅')
      setShowAdd(false)
    }
  }

  const toggleHabit = async (habit: Habit) => {
    setToggling(habit.id)
    const res = await fetch('/api/habits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: habit.id, completed: !habit.completedToday }),
    })
    if (res.ok) {
      // Refetch to get updated streaks
      await fetchHabits()
    }
    setToggling(null)
  }

  const deleteHabit = async (id: string) => {
    await fetch('/api/habits', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setHabits((h) => h.filter((hab) => hab.id !== id))
  }

  const completedCount = habits.filter((h) => h.completedToday).length
  const totalCount = habits.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Progress */}
        <div className="panel p-5 sm:col-span-2">
          <div className="font-mono text-xs text-slate-600 mb-2 flex items-center gap-2">
            <span className="text-amber-glow">◆</span> TODAY&apos;S PROGRESS
            <span className="ml-auto font-mono text-xs text-slate-500">{today}</span>
          </div>
          <div className="flex items-end justify-between mb-3">
            <span className="text-3xl font-bold text-white">
              {completedCount}
              <span className="text-slate-600 text-xl font-normal">/{totalCount}</span>
            </span>
            <span
              className="font-mono text-2xl font-bold"
              style={{
                color: completionPct === 100 ? '#34d399' : completionPct >= 50 ? '#f59e0b' : '#94a3b8',
              }}
            >
              {completionPct}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionPct}%`,
                background:
                  completionPct === 100
                    ? 'linear-gradient(90deg, #34d399, #22d3ee)'
                    : completionPct >= 50
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : '#4a5568',
                boxShadow: completionPct === 100 ? '0 0 12px rgba(52,211,153,0.4)' : 'none',
              }}
            />
          </div>
          {completionPct === 100 && totalCount > 0 && (
            <p className="font-mono text-xs text-emerald-400 mt-2">
              🎉 Perfect day! All habits completed.
            </p>
          )}
        </div>

        {/* Best streak */}
        <div className="panel p-5 flex flex-col items-center justify-center">
          <div className="font-mono text-xs text-slate-600 mb-2">TOP STREAK</div>
          <div className="text-4xl mb-1">🔥</div>
          <div className="font-mono text-3xl font-bold text-amber-glow text-glow-amber">
            {Math.max(0, ...habits.map((h) => h.streak))}
          </div>
          <div className="font-mono text-xs text-slate-600 mt-1">days</div>
        </div>
      </div>

      {/* Habit list */}
      <div className="panel p-5">
        <div className="font-mono text-xs text-slate-600 mb-4 flex items-center gap-2">
          <span className="text-emerald-400">◆</span> HABITS
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="ml-auto btn-ghost px-3 py-1 text-xs font-mono"
          >
            {showAdd ? '✕ Cancel' : '+ Add habit'}
          </button>
        </div>

        {/* Add habit form */}
        {showAdd && (
          <div className="mb-5 p-4 bg-bg-elevated rounded-xl border border-bg-border animate-fade-in-up">
            <div className="font-mono text-xs text-slate-600 mb-3">NEW HABIT</div>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                placeholder="Habit name..."
                className="input-base flex-1 px-3 py-2.5 text-sm"
                autoFocus
              />
              <button onClick={addHabit} className="btn-primary px-4 py-2.5 text-sm">
                Add
              </button>
            </div>
            {/* Emoji picker */}
            <div>
              <div className="font-mono text-xs text-slate-600 mb-2">Pick an emoji</div>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={`w-9 h-9 rounded-lg text-lg transition-all ${
                      newEmoji === e
                        ? 'bg-amber-glow/20 border-2 border-amber-glow scale-110'
                        : 'bg-bg-base border border-bg-border hover:border-slate-600'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Habits */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-bg-elevated rounded-xl animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-mono text-xs text-slate-600 mb-4">No habits yet. Start building your routine!</p>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary px-5 py-2.5 text-sm mx-auto"
            >
              Add your first habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, i) => (
              <div
                key={habit.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group animate-fade-in-up ${
                  habit.completedToday
                    ? 'bg-amber-glow/5 border-amber-glow/25'
                    : 'bg-bg-elevated border-bg-border hover:border-slate-700'
                }`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                {/* Check button */}
                <button
                  onClick={() => toggleHabit(habit)}
                  disabled={toggling === habit.id}
                  className={`habit-check flex-shrink-0 ${habit.completedToday ? 'checked' : ''} ${
                    toggling === habit.id ? 'opacity-50' : ''
                  }`}
                >
                  {habit.completedToday && <span className="text-amber-glow text-sm">✓</span>}
                </button>

                {/* Emoji */}
                <span className="text-2xl flex-shrink-0">{habit.emoji}</span>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate ${
                      habit.completedToday ? 'text-amber-glow/80' : 'text-slate-200'
                    }`}
                  >
                    {habit.name}
                  </p>
                  {habit.completedToday && (
                    <p className="font-mono text-xs text-amber-glow/50 mt-0.5">Completed today ✓</p>
                  )}
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-base">{habit.streak >= 3 ? '🔥' : '⬜'}</span>
                  <div className="text-right">
                    <div
                      className={`font-mono text-base font-bold ${
                        habit.streak >= 7
                          ? 'text-emerald-400'
                          : habit.streak >= 3
                          ? 'text-amber-glow'
                          : 'text-slate-500'
                      }`}
                    >
                      {habit.streak}
                    </div>
                    <div className="font-mono text-[9px] text-slate-600">streak</div>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 text-sm transition-all ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational footer */}
      {habits.length > 0 && !loading && (
        <div className="font-mono text-xs text-slate-700 text-center py-2">
          {completionPct === 100
            ? '🏆 Full streak day! You showed up for yourself.'
            : `${totalCount - completedCount} habit${totalCount - completedCount !== 1 ? 's' : ''} left for today. Keep going.`}
        </div>
      )}
    </div>
  )
}
