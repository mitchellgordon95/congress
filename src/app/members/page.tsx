import { prisma } from '@/lib/db'
import { MemberCard } from '@/components/member/MemberCard'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    where: { isCurrent: true },
    orderBy: [
      { chamber: 'asc' },
      { lastName: 'asc' },
    ],
  })

  const senators = members.filter(m => m.chamber === 'senate')
  const representatives = members.filter(m => m.chamber === 'house')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Members of Congress</h1>
        <p className="text-[var(--muted)]">
          {members.length} current members
        </p>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">No members loaded yet.</p>
          <p className="text-sm text-[var(--muted)]">
            Run the member sync script to populate member data.
          </p>
        </div>
      ) : (
        <>
          {/* Senators */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-[var(--democrat)]">
              Senate ({senators.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {senators.map((member) => (
                <MemberCard
                  key={member.bioguideId}
                  bioguideId={member.bioguideId}
                  firstName={member.firstName}
                  lastName={member.lastName}
                  party={member.party}
                  state={member.state}
                  chamber={member.chamber}
                  photoUrl={member.photoUrl}
                />
              ))}
            </div>
          </section>

          {/* Representatives */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--republican)]">
              House of Representatives ({representatives.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {representatives.map((member) => (
                <MemberCard
                  key={member.bioguideId}
                  bioguideId={member.bioguideId}
                  firstName={member.firstName}
                  lastName={member.lastName}
                  party={member.party}
                  state={member.state}
                  chamber={member.chamber}
                  photoUrl={member.photoUrl}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
