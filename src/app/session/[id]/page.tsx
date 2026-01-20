import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ChatThread } from '@/components/chat/ChatThread'
import { SessionSidebar } from '@/components/chat/SessionSidebar'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: PageProps) {
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
    notFound()
  }

  const chamberLabel = session.chamber === 'senate' ? 'Senate' : 'House'
  const formattedDate = format(new Date(session.sessionDate), 'MMMM d, yyyy')

  // Extract unique speakers from messages
  type MemberType = NonNullable<typeof session.messages[0]['member']>
  const speakers = session.messages
    .filter((m): m is typeof m & { member: MemberType } => m.member !== null)
    .map(m => m.member)
    .reduce((acc, member) => {
      if (!acc.find(existing => existing.bioguideId === member.bioguideId)) {
        acc.push(member)
      }
      return acc
    }, [] as MemberType[])

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-2">
              <a href={`/${session.chamber}`} className="hover:underline">
                {chamberLabel} Floor
              </a>
              <span>&#8250;</span>
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-2xl font-bold">
              {session.title || `${chamberLabel} Floor Session`}
            </h1>
            <p className="text-[var(--muted)] mt-1">
              {session.messages.length} messages
            </p>
          </div>

          {/* Messages */}
          <ChatThread
            messages={session.messages.map(m => ({
              ...m,
              messageType: m.messageType as 'speech' | 'procedural' | 'question' | 'answer' | 'system' | 'vote_result',
            }))}
            showOriginals={false}
          />
        </div>
      </div>

      {/* Sidebar */}
      <SessionSidebar
        agendaItems={session.agendaItems}
        speakers={speakers}
        transcriptUrl={session.rawTranscriptUrl}
      />
    </div>
  )
}
