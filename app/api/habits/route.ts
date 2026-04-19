import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// GET all habits with today's completion status
export async function GET() {
  try {
    const today = todayStr()
    const habits = await prisma.habit.findMany({
      include: {
        logs: { where: { date: today } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const data = habits.map((h) => ({
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      streak: h.streak,
      completedToday: h.logs.length > 0,
    }))

    return NextResponse.json({ success: true, habits: data })
  } catch (err) {
    console.error('GET habits error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch habits' }, { status: 500 })
  }
}

// POST create habit
export async function POST(request: Request) {
  try {
    const { name, emoji } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    const habit = await prisma.habit.create({
      data: { name: name.trim(), emoji: emoji || '✅' },
    })

    return NextResponse.json({ success: true, habit: { ...habit, completedToday: false } })
  } catch (err) {
    console.error('POST habit error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create habit' }, { status: 500 })
  }
}

// PATCH toggle habit completion
export async function PATCH(request: Request) {
  try {
    const { id, completed } = await request.json()
    const today = todayStr()

    if (completed) {
      // Mark as done
      await prisma.habitLog.upsert({
        where: { habitId_date: { habitId: id, date: today } },
        create: { habitId: id, date: today },
        update: {},
      })

      // Recalculate streak
      const logs = await prisma.habitLog.findMany({
        where: { habitId: id },
        orderBy: { date: 'desc' },
      })

      let streak = 0
      let checkDate = new Date()
      for (const log of logs) {
        const logDate = new Date(log.date + 'T00:00:00')
        const diff = Math.floor((checkDate.getTime() - logDate.getTime()) / 86400000)
        if (diff <= 1) {
          streak++
          checkDate = logDate
        } else {
          break
        }
      }

      await prisma.habit.update({ where: { id }, data: { streak } })
    } else {
      // Unmark
      await prisma.habitLog.deleteMany({
        where: { habitId: id, date: today },
      })

      const logs = await prisma.habitLog.findMany({
        where: { habitId: id },
        orderBy: { date: 'desc' },
      })

      let streak = 0
      let checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - 1) // yesterday
      for (const log of logs) {
        const logDate = new Date(log.date + 'T00:00:00')
        const diff = Math.floor((checkDate.getTime() - logDate.getTime()) / 86400000)
        if (diff <= 1) {
          streak++
          checkDate = logDate
        } else {
          break
        }
      }

      await prisma.habit.update({ where: { id }, data: { streak } })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH habit error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update habit' }, { status: 500 })
  }
}

// DELETE habit
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await prisma.habit.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE habit error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete habit' }, { status: 500 })
  }
}
