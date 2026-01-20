import { prisma } from '@/lib/db'
import { SessionCard } from '@/components/home/SessionCard'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const sessions = await prisma.session.findMany({
    where: { status: 'complete' },
    orderBy: { sessionDate: 'desc' },
    take: 10,
    include: {
      _count: {
        select: { messages: true },
      },
      messages: {
        orderBy: { displayOrder: 'desc' },
        take: 1,
        include: {
          member: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  })

  // Get recent activity (last 10 messages across all sessions)
  const recentMessages = await prisma.message.findMany({
    where: {
      member: { isNot: null },
      messageType: 'speech',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      member: {
        select: { firstName: true, lastName: true, party: true, chamber: true },
      },
      session: {
        select: { title: true, chamber: true },
      },
    },
  })

  // Separate Senate and House sessions
  const senateSessions = sessions.filter(s => s.chamber === 'senate')
  const houseSessions = sessions.filter(s => s.chamber === 'house')

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Floor Sessions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-[var(--muted)]">
          Floor Sessions
        </h2>

        <div className="space-y-3">
          {/* Senate */}
          {senateSessions.length > 0 ? (
            senateSessions.slice(0, 1).map((session) => {
              const lastMessage = session.messages[0]
              const lastSpeaker = lastMessage?.member
                ? `${lastMessage.member.firstName} ${lastMessage.member.lastName}`
                : null
              return (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  sessionType={session.sessionType}
                  sessionDate={session.sessionDate}
                  title={session.title}
                  chamber={session.chamber}
                  messageCount={session._count.messages}
                  currentSpeaker={lastSpeaker}
                />
              )
            })
          ) : (
            <div className="border border-[var(--border)] border-l-4 border-l-[var(--democrat)] rounded-lg p-4 text-[var(--muted)]">
              <div className="flex items-center gap-2 mb-2">
                <span>&#128309;</span>
                <span className="font-semibold">Senate Floor</span>
              </div>
              <p>No recent sessions</p>
            </div>
          )}

          {/* House */}
          {houseSessions.length > 0 ? (
            houseSessions.slice(0, 1).map((session) => {
              const lastMessage = session.messages[0]
              const lastSpeaker = lastMessage?.member
                ? `${lastMessage.member.firstName} ${lastMessage.member.lastName}`
                : null
              return (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  sessionType={session.sessionType}
                  sessionDate={session.sessionDate}
                  title={session.title}
                  chamber={session.chamber}
                  messageCount={session._count.messages}
                  currentSpeaker={lastSpeaker}
                />
              )
            })
          ) : (
            <div className="border border-[var(--border)] border-l-4 border-l-[var(--republican)] rounded-lg p-4 text-[var(--muted)]">
              <div className="flex items-center gap-2 mb-2">
                <span>&#128308;</span>
                <span className="font-semibold">House Floor</span>
              </div>
              <p>No recent sessions</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      {recentMessages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 uppercase tracking-wide text-[var(--muted)]">
            Recent Activity
          </h2>

          <div className="space-y-2">
            {recentMessages.map((message) => {
              const partyIcon = message.member?.party === 'D' ? '&#128309;' : message.member?.party === 'R' ? '&#128308;' : '&#128995;'
              const chamberLabel = message.member?.chamber === 'senate' ? 'Sen.' : 'Rep.'
              const timeAgo = formatDistanceToNow(message.createdAt, { addSuffix: true })

              return (
                <div key={message.id} className="flex items-start justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <span className="text-[var(--muted)]">&#8226; </span>
                    <span dangerouslySetInnerHTML={{ __html: partyIcon }} />
                    {' '}
                    <span className="font-medium">
                      {chamberLabel} {message.member?.firstName} {message.member?.lastName}
                    </span>
                    {' '}
                    <span className="text-[var(--muted)]">
                      spoke on {message.session.title?.slice(0, 40) || 'floor session'}
                      {message.session.title && message.session.title.length > 40 ? '...' : ''}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--muted)] whitespace-nowrap ml-4">
                    {timeAgo}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* All Sessions */}
      {sessions.length > 2 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-[var(--muted)]">
              Past Sessions
            </h2>
            <div className="flex gap-2">
              <a href="/senate" className="text-sm text-[var(--democrat)] hover:underline">
                Senate
              </a>
              <span className="text-[var(--muted)]">|</span>
              <a href="/house" className="text-sm text-[var(--republican)] hover:underline">
                House
              </a>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.slice(2).map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                sessionType={session.sessionType}
                sessionDate={session.sessionDate}
                title={session.title}
                chamber={session.chamber}
                messageCount={session._count.messages}
              />
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">No sessions available yet.</p>
          <p className="text-sm text-[var(--muted)]">
            Sessions will appear here once transcripts have been processed.
          </p>
        </div>
      )}
    </div>
  )
}
