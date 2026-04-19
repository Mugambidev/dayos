import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { completed: false },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, tasks })
  } catch (err) {
    console.error('GET tasks error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST create task
export async function POST(request: Request) {
  try {
    const { title } = await request.json()
    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }
    const task = await prisma.task.create({ data: { title: title.trim() } })
    return NextResponse.json({ success: true, task })
  } catch (err) {
    console.error('POST task error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 })
  }
}

// PATCH update task (complete / session done)
export async function PATCH(request: Request) {
  try {
    const { id, completed, sessionDone } = await request.json()
    const data: Record<string, unknown> = {}
    if (completed !== undefined) data.completed = completed
    if (sessionDone !== undefined) data.sessionDone = sessionDone
    const task = await prisma.task.update({ where: { id }, data })
    return NextResponse.json({ success: true, task })
  } catch (err) {
    console.error('PATCH task error:', err)
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE task
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE task error:', err)
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 })
  }
}
