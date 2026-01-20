'use client'

import { format } from 'date-fns'

interface SessionCardProps {
  id: string
  sessionType: string
  sessionDate: Date | string
  title: string | null
  chamber: string | null
  messageCount: number
}

export function SessionCard({
  id,
  sessionType,
  sessionDate,
  title,
  chamber,
  messageCount,
}: SessionCardProps) {
  const date = typeof sessionDate === 'string' ? new Date(sessionDate) : sessionDate
  const formattedDate = format(date, 'MMMM d, yyyy')

  const chamberLabel = chamber === 'senate' ? 'Senate' : chamber === 'house' ? 'House' : 'Congress'
  const chamberColor = chamber === 'senate' ? 'text-[var(--democrat)]' : 'text-[var(--republican)]'

  return (
    <a
      href={`/session/${id}`}
      className="block border border-[var(--border)] rounded-lg p-4 hover:border-[var(--muted)] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-sm font-semibold ${chamberColor}`}>
          {chamberLabel} Floor
        </span>
        <span className="text-sm text-[var(--muted)]">
          {formattedDate}
        </span>
      </div>

      <h3 className="font-medium mb-2 line-clamp-2">
        {title || `${chamberLabel} Floor Session`}
      </h3>

      <p className="text-sm text-[var(--muted)]">
        {messageCount} messages
      </p>
    </a>
  )
}
