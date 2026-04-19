'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Task {
  id: string
  title: string
  completed: boolean
  sessionDone: boolean
}

const MODES = [
  { label: 'Focus', duration: 25 * 60, color: '#f59e0b', desc: '25 min deep work' },
  { label: 'Short Break', duration: 5 * 60, color: '#22d3ee', desc: '5 min breather' },
  { label: 'Long Break', duration: 15 * 60, color: '#34d399', desc: '15 min rest' },
]

function pad(n: number) { return String(n).padStart(2, '0') }

export default function FocusTimer() {
  const [modeIdx, setModeIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loadingTasks, setLoadingTasks] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const mode = MODES[modeIdx]
  const radius = 100
  const circumference = 2 * Math.PI * radius
  const progress = timeLeft / mode.duration
  const dashOffset = circumference * (1 - progress)

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true)
    try {
      const res = await fetch('/api/tasks')
      const json = await res.json()
      if (json.success) setTasks(json.tasks)
    } finally {
      setLoadingTasks(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Timer logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false)
            if (modeIdx === 0) setSessions((s) => s + 1)
            // Play a beep sound via Web Audio API
            try {
              const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain)
              gain.connect(ctx.destination)
              osc.frequency.value = 440
              gain.gain.setValueAtTime(0.3, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
              osc.start(ctx.currentTime)
              osc.stop(ctx.currentTime + 1)
            } catch {}
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, modeIdx])

  const selectMode = (idx: number) => {
    setModeIdx(idx)
    setTimeLeft(MODES[idx].duration)
    setRunning(false)
  }

  const reset = () => {
    setTimeLeft(mode.duration)
    setRunning(false)
  }

  const addTask = async () => {
    if (!newTask.trim()) return
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    })
    const json = await res.json()
    if (json.success) {
      setTasks((t) => [...t, json.task])
      setNewTask('')
    }
  }

  const toggleSessionDone = async (task: Task) => {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, sessionDone: !task.sessionDone }),
    })
    const json = await res.json()
    if (json.success) setTasks((ts) => ts.map((t) => t.id === task.id ? { ...t, sessionDone: !t.sessionDone } : t))
  }

  const completeTask = async (task: Task) => {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, completed: true }),
    })
    const json = await res.json()
    if (json.success) setTasks((ts) => ts.filter((t) => t.id !== task.id))
  }

  const deleteTask = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTasks((ts) => ts.filter((t) => t.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timer Panel */}
      <div className="panel p-6 sm:p-8 flex flex-col items-center">
        {/* Mode selector */}
        <div className="flex gap-1 mb-8 w-full">
          {MODES.map((m, i) => (
            <button
              key={m.label}
              onClick={() => selectMode(i)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-mono transition-all ${
                modeIdx === i
                  ? 'text-black font-bold'
                  : 'btn-ghost text-slate-500'
              }`}
              style={modeIdx === i ? { background: m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Ring Timer */}
        <div className="relative w-64 h-64 mb-8">
          <svg width="256" height="256" viewBox="0 0 256 256" className="timer-ring">
            {/* Track */}
            <circle
              cx="128" cy="128" r={radius}
              fill="none"
              stroke="#1e2030"
              strokeWidth="8"
            />
            {/* Progress */}
            <circle
              cx="128" cy="128" r={radius}
              fill="none"
              stroke={mode.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="timer-ring-progress"
              style={{ filter: `drop-shadow(0 0 8px ${mode.color}60)` }}
            />
          </svg>

          {/* Center display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="font-mono text-5xl font-bold tracking-tight"
              style={{ color: mode.color, textShadow: `0 0 20px ${mode.color}60` }}
            >
              {pad(mins)}:{pad(secs)}
            </div>
            <div className="font-mono text-xs mt-1" style={{ color: `${mode.color}80` }}>
              {mode.desc}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={reset}
            className="btn-ghost w-12 h-12 rounded-full flex items-center justify-center text-lg"
          >
            ↺
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-16 h-16 rounded-full flex items-center justify-center text-black font-bold text-xl btn-primary"
            style={{ background: mode.color }}
          >
            {running ? '⏸' : '▶'}
          </button>
          <div className="w-12 h-12 rounded-full border border-bg-border flex items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-xs text-amber-glow font-bold">{sessions}</div>
              <div className="font-mono text-[9px] text-slate-600">done</div>
            </div>
          </div>
        </div>

        {/* Pomodoro pips */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border-2 transition-all"
              style={{
                borderColor: i < (sessions % 4) ? mode.color : '#1e2030',
                background: i < (sessions % 4) ? `${mode.color}40` : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      {/* Task Queue */}
      <div className="panel p-6 flex flex-col">
        <div className="font-mono text-xs text-slate-600 mb-4 flex items-center gap-2">
          <span className="text-amber-glow">◆</span> TASK.QUEUE
          <span className="ml-auto text-slate-700">{tasks.length} items</span>
        </div>

        {/* Add task */}
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a task..."
            className="input-base flex-1 px-3 py-2.5 text-sm"
          />
          <button
            onClick={addTask}
            className="btn-primary px-4 py-2.5 text-sm font-bold"
          >
            +
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-80">
          {loadingTasks ? (
            <div className="font-mono text-xs text-slate-600 text-center py-8">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✨</div>
              <p className="font-mono text-xs text-slate-600">No tasks yet. Add one above!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  task.sessionDone
                    ? 'bg-amber-glow/5 border-amber-glow/20'
                    : 'bg-bg-elevated border-bg-border hover:border-slate-700'
                }`}
              >
                {/* Session done toggle */}
                <button
                  onClick={() => toggleSessionDone(task)}
                  className={`habit-check ${task.sessionDone ? 'checked' : ''} text-sm`}
                >
                  {task.sessionDone && <span className="text-amber-glow">✓</span>}
                </button>

                <span
                  className={`flex-1 text-sm leading-snug ${
                    task.sessionDone ? 'text-amber-glow/70 line-through' : 'text-slate-300'
                  }`}
                >
                  {task.title}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => completeTask(task)}
                    className="text-emerald-400/60 hover:text-emerald-400 text-xs px-2 py-1 rounded font-mono transition-colors"
                    title="Mark done"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400/40 hover:text-red-400 text-sm px-2 py-1 rounded transition-colors"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
