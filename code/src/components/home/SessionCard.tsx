'use client'

import { format, formatDistanceToNow } from 'date-fns'

interface SessionCardProps {
  id: string
  sessionType: string
  sessionDate: Date | string
  title: string | null
  chamber: string | null
  messageCount: number
  isLive?: boolean
  currentSpeaker?: string | null
  speakerCount?: number
}

export function SessionCard({
  id,
  sessionType,
  sessionDate,
  title,
  chamber,
  messageCount,
  isLive = false,
  currentSpeaker,
  speakerCount = 0,
}: SessionCardProps) {
  const date = typeof sessionDate === 'string' ? new Date(sessionDate) : sessionDate
  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

  const isSenate = chamber === 'senate'
  const chamberLabel = isSenate ? 'Senate Floor' : 'House Floor'
  const chamberIcon = isSenate ? '\uD83D\uDD35' : '\uD83D\uDD34'
  const borderColor = isSenate ? 'border-l-[var(--democrat)]' : 'border-l-[var(--republican)]'

  return (
    <a
      href={`/session/${id}`}
      className={`block border border-[var(--border)] ${borderColor} border-l-4 rounded-lg p-4 hover:bg-[var(--card)] transition-all`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{chamberIcon}</span>
          <span className="font-semibold">{chamberLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isLive ? (
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE
              {speakerCount > 0 && <span className="text-[var(--muted)]">&#183; {speakerCount} speaking</span>}
            </span>
          ) : (
            <span className="text-[var(--muted)]">Session ended</span>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="text-[var(--muted)] mb-2 line-clamp-1">
        {title || `${chamberLabel} Session`}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <span>
          {currentSpeaker ? (
            isLive ? <>{currentSpeaker} is speaking...</> : <>{currentSpeaker} spoke</>
          ) : (
            <>{messageCount} messages</>
          )}
        </span>
        <span>{timeAgo}</span>
      </div>
    </a>
  )
}
