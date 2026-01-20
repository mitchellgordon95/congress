import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      agendaItems: {
        orderBy: { startOrder: 'asc' },
      },
      messages: {
        orderBy: { displayOrder: 'asc' },
        include: {
          member: {
            select: {
              id: true,
              bioguideId: true,
              firstName: true,
              lastName: true,
              party: true,
              state: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  })

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: session.id,
    sessionType: session.sessionType,
    sessionDate: session.sessionDate,
    title: session.title,
    chamber: session.chamber,
    status: session.status,
    rawTranscriptUrl: session.rawTranscriptUrl,
    createdAt: session.createdAt,
    agendaItems: session.agendaItems.map(item => ({
      id: item.id,
      title: item.title,
      itemType: item.itemType,
      billNumber: item.billNumber,
      billUrl: item.billUrl,
      startOrder: item.startOrder,
    })),
    messages: session.messages.map(msg => ({
      id: msg.id,
      memberId: msg.memberId,
      member: msg.member,
      messageType: msg.messageType,
      content: msg.content,
      originalExcerpt: msg.originalExcerpt,
      originalPage: msg.originalPage,
      displayOrder: msg.displayOrder,
    })),
  })
}
