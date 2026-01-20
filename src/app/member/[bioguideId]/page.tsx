import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MemberAvatar } from '@/components/member/MemberAvatar'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ bioguideId: string }>
}

export default async function MemberPage({ params }: PageProps) {
  const { bioguideId } = await params

  const member = await prisma.member.findUnique({
    where: { bioguideId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 20,
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
    notFound()
  }

  const chamberLabel = member.chamber === 'senate' ? 'Senator' : 'Representative'
  const partyLabel = member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-start gap-6 mb-8 pb-8 border-b border-[var(--border)]">
        <MemberAvatar
          firstName={member.firstName}
          lastName={member.lastName}
          party={member.party}
          photoUrl={member.photoUrl}
          size="lg"
          showBadge={false}
        />
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {chamberLabel} {member.firstName} {member.lastName}
          </h1>
          <p className="text-lg text-[var(--muted)] mb-4">
            {partyLabel} - {member.state}
          </p>
          <div className="flex gap-4">
            <a
              href={`https://www.congress.gov/member/${member.lastName.toLowerCase()}-${member.firstName.toLowerCase()}/${member.bioguideId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--democrat)] hover:underline"
            >
              Congress.gov profile &#8599;
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--card)] rounded-lg p-4">
          <p className="text-2xl font-bold">{member._count.messages}</p>
          <p className="text-sm text-[var(--muted)]">Floor remarks</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4">
          <p className="text-2xl font-bold">{member.chamber === 'senate' ? 'Senate' : 'House'}</p>
          <p className="text-sm text-[var(--muted)]">Chamber</p>
        </div>
      </div>

      {/* Recent activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Floor Activity</h2>
        {member.messages.length === 0 ? (
          <p className="text-[var(--muted)]">No floor activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {member.messages.map((message) => (
              <a
                key={message.id}
                href={`/session/${message.session.id}`}
                className="block border border-[var(--border)] rounded-lg p-4 hover:border-[var(--muted)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--muted)]">
                    {message.session.sessionType === 'floor_senate' ? 'Senate' : 'House'} Floor
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {format(new Date(message.session.sessionDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="line-clamp-2">{message.content}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
