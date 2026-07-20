import { prisma } from '@/lib/db'
import { SessionCard } from '@/components/home/SessionCard'

export const dynamic = 'force-dynamic'

export default async function SenatePage() {
  const sessions = await prisma.session.findMany({
    where: {
      chamber: 'senate',
      status: 'complete',
    },
    orderBy: { sessionDate: 'desc' },
    take: 20,
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🔵</span>
        <h1 className="text-2xl font-bold">Senate Floor Sessions</h1>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
          <p className="text-[var(--muted)]">No Senate floor sessions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const lastMessage = session.messages[0]
            const lastSpeaker = lastMessage?.member
              ? `${lastMessage.member.firstName} ${lastMessage.member.lastName}`
              : undefined

            return (
              <SessionCard
                key={session.id}
                id={session.id}
                sessionType={session.sessionType}
                sessionDate={session.sessionDate}
                title={session.title}
                chamber="senate"
                messageCount={session._count.messages}
                currentSpeaker={lastSpeaker}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
