import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bioguideId: string }> }
) {
  const { bioguideId } = await params

  const member = await prisma.member.findUnique({
    where: { bioguideId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          session: {
            select: {
              id: true,
              title: true,
              sessionDate: true,
              sessionType: true,
            },
          },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: member.id,
    bioguideId: member.bioguideId,
    firstName: member.firstName,
    lastName: member.lastName,
    party: member.party,
    state: member.state,
    chamber: member.chamber,
    photoUrl: member.photoUrl,
    isCurrent: member.isCurrent,
    totalMessages: member._count.messages,
    recentActivity: member.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      messageType: msg.messageType,
      session: msg.session,
    })),
  })
}
