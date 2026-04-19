import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET() {
  try {
    const notes = await prisma.note.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ success: true, notes })
  } catch (err) {
    console.error('GET notes error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }

    let tags: string[] = []
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(
        `Generate 2-4 concise tags for this note. Return ONLY a JSON array of lowercase strings, no markdown, no code fences, no explanation.
Note: "${content}"
Example: ["idea","product","ux"]`
      )
      const raw = result.response.text().trim()
      const match = raw.match(/\[[\s\S]*?\]/)
      tags = match ? JSON.parse(match[0]) : ['note']
    } catch {
      tags = ['note']
    }

    const note = await prisma.note.create({
      data: { content: content.trim(), tags: JSON.stringify(tags) },
    })

    return NextResponse.json({ success: true, note: { ...note, tags } })
  } catch (err) {
    console.error('POST note error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE note error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 })
  }
}
