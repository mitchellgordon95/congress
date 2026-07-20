'use client'

import { MemberAvatar } from './MemberAvatar'

interface MemberCardProps {
  bioguideId: string
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I' | string
  state: string
  chamber: string
  photoUrl?: string | null
}

export function MemberCard({
  bioguideId,
  firstName,
  lastName,
  party,
  state,
  chamber,
  photoUrl,
}: MemberCardProps) {
  const chamberLabel = chamber === 'senate' ? 'Sen.' : 'Rep.'

  return (
    <a
      href={`/member/${bioguideId}`}
      className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-lg hover:border-[var(--muted)] hover:shadow-sm transition-all"
    >
      <MemberAvatar
        firstName={firstName}
        lastName={lastName}
        party={party}
        photoUrl={photoUrl}
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          {chamberLabel} {firstName} {lastName}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {party === 'D' ? 'Democrat' : party === 'R' ? 'Republican' : 'Independent'} - {state}
        </p>
      </div>
    </a>
  )
}
