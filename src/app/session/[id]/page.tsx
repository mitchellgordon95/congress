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
  const chamberIcon = session.chamber === 'senate' ? '\uD83D\uDD35' : '\uD83D\uDD34'
  const formattedDate = format(new Date(session.sessionDate), 'MMMM d, yyyy')

  // Get first agenda item for the "Floor Item" card
  const currentAgendaItem = session.agendaItems[0]

  // Count messages per speaker
  type MemberType = NonNullable<typeof session.messages[0]['member']>
  const speakerCounts = new Map<string, { member: MemberType; count: number }>()

  for (const msg of session.messages) {
    if (msg.member) {
      const existing = speakerCounts.get(msg.member.bioguideId)
      if (existing) {
        existing.count++
      } else {
        speakerCounts.set(msg.member.bioguideId, { member: msg.member, count: 1 })
      }
    }
  }

  // Convert to sorted array (most messages first)
  const speakersWithCounts = Array.from(speakerCounts.values())
    .map(({ member, count }) => ({
      ...member,
      messageCount: count,
    }))
    .sort((a, b) => b.messageCount - a.messageCount)

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Back link and breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
            <a href="/" className="hover:text-[var(--foreground)]">
              &#8592; Back
            </a>
            <span>|</span>
            <span>{chamberIcon}</span>
            <a href={`/${session.chamber}`} className="hover:underline">
              {chamberLabel} Floor
            </a>
            <span>&#8250;</span>
            <span>{formattedDate}</span>
          </div>

          {/* Floor Item Card */}
          {currentAgendaItem && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] uppercase tracking-wide mb-2">
                <span>&#128203;</span>
                <span>Floor Item</span>
              </div>
              <h1 className="text-lg font-semibold mb-1">
                {currentAgendaItem.billNumber && (
                  <span className="text-[var(--muted)]">{currentAgendaItem.billNumber} — </span>
                )}
                {currentAgendaItem.title || session.title}
              </h1>
              {currentAgendaItem.itemType && (
                <p className="text-sm text-[var(--muted)]">
                  {currentAgendaItem.itemType === 'bill' ? 'Bill' :
                   currentAgendaItem.itemType === 'resolution' ? 'Resolution' :
                   currentAgendaItem.itemType === 'motion' ? 'Motion' :
                   currentAgendaItem.itemType}
                  {' '}&#183; {session.messages.length} messages
                </p>
              )}
              {currentAgendaItem.billNumber && (
                <a
                  href={`https://www.congress.gov/search?q=${encodeURIComponent(currentAgendaItem.billNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--democrat)] hover:underline mt-2 inline-block"
                >
                  View full resolution &#8594;
                </a>
              )}
            </div>
          )}

          {/* Messages */}
          <ChatThread
            messages={session.messages.map(m => ({
              ...m,
              messageType: m.messageType as 'speech' | 'procedural' | 'question' | 'answer' | 'system' | 'vote_result',
            }))}
            showOriginals={false}
          />

          {/* Load more indicator */}
          {session.messages.length > 0 && (
            <div className="text-center py-6 text-[var(--muted)]">
              &#8595; End of transcript &#8595;
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <SessionSidebar
        agendaItems={session.agendaItems}
        speakers={speakersWithCounts}
        transcriptUrl={session.rawTranscriptUrl}
        sessionTitle={session.title}
        chamber={session.chamber}
      />
    </div>
  )
}
