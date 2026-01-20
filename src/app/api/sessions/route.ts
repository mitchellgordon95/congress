import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chamber = searchParams.get('chamber')
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const where = chamber
    ? { sessionType: `floor_${chamber}`, status: 'complete' }
    : { status: 'complete' }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { sessionDate: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.session.count({ where }),
  ])

  return NextResponse.json({
    sessions: sessions.map(s => ({
      id: s.id,
      sessionType: s.sessionType,
      sessionDate: s.sessionDate,
      title: s.title,
      chamber: s.chamber,
      status: s.status,
      messageCount: s._count.messages,
      createdAt: s.createdAt,
    })),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + sessions.length < total,
    },
  })
}
