import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET() {
  try {
    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
    const dateFull = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const userName = process.env.USER_NAME || 'there'

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are the AI core of DayOS, a personal productivity OS. Generate a daily brief for ${greeting.toLowerCase()} on ${dayName}, ${dateFull}. The user's name is "${userName}".

Return ONLY a valid JSON object with exactly these fields (no markdown, no code fences):
{
  "greeting": "A short warm greeting for ${userName} that references the day/time (1 sentence)",
  "insight": "A sharp actionable productivity insight or mindset tip for today (2-3 sentences, specific not generic)",
  "focus_word": "One powerful single word to anchor today (e.g. MOMENTUM, CLARITY, EXECUTE)",
  "quote": "An inspiring quote from a real person relevant to productivity or creativity",
  "quote_author": "The real person who said the quote",
  "intention": "A suggested daily intention — one concrete thing to accomplish today (start with action verb)"
}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Brief API error:', err)
    return NextResponse.json({
      success: true,
      data: {
        greeting: `Great to see you! Let's make today count.`,
        insight: `Focus on the one task that will move the needle most today. Protect your deep work hours and ship before you scroll.`,
        focus_word: 'EXECUTE',
        quote: 'The secret of getting ahead is getting started.',
        quote_author: 'Mark Twain',
        intention: 'Ship one meaningful piece of work before noon.',
      },
    })
  }
}
