'use client'

import { useState, useEffect, useCallback } from 'react'

interface Note {
  id: string
  content: string
  tags: string[] | string
  createdAt: string
}

function parseTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) return tags
  try { return JSON.parse(tags) } catch { return [] }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TAG_COLORS: Record<string, string> = {
  idea: 'rgba(245,158,11,0.15)',
  task: 'rgba(34,211,238,0.15)',
  meeting: 'rgba(52,211,153,0.15)',
  bug: 'rgba(248,113,113,0.15)',
  note: 'rgba(167,139,250,0.15)',
}

function tagStyle(tag: string) {
  const bg = TAG_COLORS[tag.toLowerCase()] || 'rgba(100,116,139,0.15)'
  return { background: bg }
}

export default function QuickCapture() {
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes')
      const json = await res.json()
      if (json.success) setNotes(json.notes)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const saveNote = async () => {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const json = await res.json()
      if (json.success) {
        setNotes((n) => [{ ...json.note, tags: parseTags(json.note.tags) }, ...n])
        setContent('')
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (id: string) => {
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotes((n) => n.filter((note) => note.id !== id))
  }

  // Collect all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => parseTags(n.tags)))
  ).slice(0, 12)

  const filtered = notes.filter((note) => {
    const tags = parseTags(note.tags)
    const matchSearch = !search || note.content.toLowerCase().includes(search.toLowerCase())
    const matchTag = !filterTag || tags.includes(filterTag)
    return matchSearch && matchTag
  })

  return (
    <div className="space-y-5">
      {/* Capture input */}
      <div className="panel p-5">
        <div className="font-mono text-xs text-slate-600 mb-3 flex items-center gap-2">
          <span className="text-cyan-glow">◆</span> NEW.CAPTURE
          <span className="ml-auto text-slate-700">AI will auto-tag</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote()
          }}
          placeholder="What's on your mind? Jot down ideas, tasks, thoughts... (⌘+Enter to save)"
          rows={3}
          className="input-base w-full px-4 py-3 text-sm resize-none mb-3"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-slate-600">
            {content.length > 0 ? `${content.length} chars` : 'Start typing...'}
          </span>
          <button
            onClick={saveNote}
            disabled={!content.trim() || saving}
            className="btn-primary px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin text-xs">◌</span>
                AI tagging...
              </>
            ) : (
              <>
                <span>⚡</span>
                Capture
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="input-base px-3 py-2 text-xs flex-1 min-w-32"
        />
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
            className={`tag cursor-pointer transition-all ${filterTag === tag ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            #{tag}
          </button>
        ))}
        {filterTag && (
          <button
            onClick={() => setFilterTag('')}
            className="font-mono text-xs text-red-400/70 hover:text-red-400"
          >
            ✕ clear
          </button>
        )}
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="panel p-4 animate-pulse h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="font-mono text-xs text-slate-600">
            {notes.length === 0 ? 'No captures yet. Write your first thought!' : 'No notes match your filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((note, i) => {
            const tags = parseTags(note.tags)
            return (
              <div
                key={note.id}
                className="panel p-4 group hover:border-slate-700 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-4">
                  {note.content}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="tag cursor-pointer hover:opacity-100 opacity-80"
                        style={tagStyle(tag)}
                        onClick={() => setFilterTag(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-xs text-slate-600">
                      {timeAgo(note.createdAt)}
                    </span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-sm transition-all"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="font-mono text-xs text-slate-700 text-right">
        {notes.length} total captures
      </div>
    </div>
  )
}
