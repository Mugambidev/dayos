'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import DailyBrief from '@/components/DailyBrief'
import FocusTimer from '@/components/FocusTimer'
import QuickCapture from '@/components/QuickCapture'
import HabitTracker from '@/components/HabitTracker'
import SettingsPanel from '@/components/Settings'

type Tab = 'brief' | 'focus' | 'capture' | 'habits' | 'settings'

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'brief',    label: 'Daily Brief',   icon: '🌅', desc: 'AI morning summary' },
  { id: 'focus',    label: 'Focus Timer',   icon: '⏱',  desc: 'Pomodoro + tasks'  },
  { id: 'capture',  label: 'Quick Capture', icon: '📝', desc: 'Notes with AI tags' },
  { id: 'habits',   label: 'Habit Tracker', icon: '🔥', desc: 'Daily streaks'      },
  { id: 'settings', label: 'Settings',      icon: '⚙️', desc: 'Customize DayOS'   },
]

function Clock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="text-right hidden sm:block">
      <div className="font-mono text-xl font-bold text-amber-glow text-glow-amber tracking-wider">
        {time}<span className="animate-blink ml-0.5">_</span>
      </div>
      <div className="font-mono text-xs text-slate-600 mt-0.5">{date}</div>
    </div>
  )
}

function DashboardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = (searchParams.get('tab') as Tab) || 'brief'
  const [activeTab, setActiveTab] = useState<Tab>(tabParam)

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    router.replace(`/?tab=${tab}`, { scroll: false })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-base/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-amber-glow/10 border border-amber-glow/30 flex items-center justify-center glow-amber">
                <span className="font-mono text-amber-glow font-bold text-sm">OS</span>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-bg-base animate-pulse-slow" />
            </div>
            <div>
              <div className="font-mono font-bold text-white tracking-wide text-lg leading-none">DayOS</div>
              <div className="font-mono text-xs text-slate-600 leading-none mt-0.5">v2.0 // online</div>
            </div>
          </div>
          <Clock />
        </div>

        {/* Tab Bar — scrollable on mobile */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-all duration-200
                ${activeTab === tab.id
                  ? 'border-amber-glow text-amber-glow'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }
              `}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden text-xs">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
            <span className="text-amber-glow/60">›</span>
            <span>{TABS.find((t) => t.id === activeTab)?.desc}</span>
          </div>
        </div>

        <div key={activeTab} className="animate-fade-in-up">
          {activeTab === 'brief'    && <DailyBrief />}
          {activeTab === 'focus'    && <FocusTimer />}
          {activeTab === 'capture'  && <QuickCapture />}
          {activeTab === 'habits'   && <HabitTracker />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>

      <footer className="border-t border-bg-border py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-700">DayOS // Powered by Gemini AI</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-slate-700">sys.running</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <DashboardInner />
    </Suspense>
  )
}
