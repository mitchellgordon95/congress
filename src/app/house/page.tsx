import { prisma } from '@/lib/db'
import { SessionCard } from '@/components/home/SessionCard'

export const dynamic = 'force-dynamic'

export default async function HousePage() {
  const sessions = await prisma.session.findMany({
    where: {
      sessionType: 'floor_house',
      status: 'complete',
    },
    orderBy: { sessionDate: 'desc' },
    take: 50,
    include: {
      _count: {
        select: { messages: true },
      },
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[var(--republican)]">
          House Floor
        </h1>
        <p className="text-[var(--muted)]">
          Floor proceedings from the United States House of Representatives
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">No House sessions available yet.</p>
          <p className="text-sm text-[var(--muted)]">
            Sessions will appear here once transcripts have been processed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
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
      )}
    </div>
  )
}
