'use client'

import { MemberAvatar } from '../member/MemberAvatar'

interface Member {
  id: string
  bioguideId: string
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I' | string
  state: string
  photoUrl?: string | null
}

interface MessageBubbleProps {
  content: string
  messageType: 'speech' | 'procedural' | 'question' | 'answer' | 'system' | 'vote_result'
  member?: Member | null
  originalPage?: string | null
  timestamp?: string | null
  showOriginal?: boolean
  originalExcerpt?: string | null
}

export function MessageBubble({
  content,
  messageType,
  member,
  originalPage,
  timestamp,
  showOriginal = false,
  originalExcerpt,
}: MessageBubbleProps) {
  // System messages (centered, muted)
  if (messageType === 'system') {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
          <span>&#128220;</span>
          <span>{content}</span>
          {timestamp && <span className="text-xs">{timestamp}</span>}
        </div>
      </div>
    )
  }

  // Procedural messages (centered with icon)
  if (messageType === 'procedural') {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
          <span>&#9881;</span>
          <span>{content}</span>
          {timestamp && <span className="text-xs">{timestamp}</span>}
        </div>
      </div>
    )
  }

  // Vote result (special card)
  if (messageType === 'vote_result') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-6 py-4 max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">&#128499;</span>
            <span className="font-semibold">Vote Result</span>
          </div>
          <p className="text-lg font-medium">{content}</p>
          {timestamp && <p className="text-xs text-[var(--muted)] mt-2">{timestamp}</p>}
        </div>
      </div>
    )
  }

  // Party colors for badge
  const partyIcon = member?.party === 'D' ? '\uD83D\uDD35' : member?.party === 'R' ? '\uD83D\uDD34' : '\uD83D\uDFE3'

  // Regular message (speech, question, answer)
  return (
    <div className="flex gap-3 py-3 border-b border-[var(--border)]">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {member ? (
          <a href={`/member/${member.bioguideId}`}>
            <MemberAvatar
              firstName={member.firstName}
              lastName={member.lastName}
              party={member.party}
              photoUrl={member.photoUrl}
              size="md"
              showBadge={false}
            />
          </a>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--card)] flex items-center justify-center text-[var(--muted)]">
            ?
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header with name, party badge, state, and timestamp */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {member ? (
            <>
              <span>{partyIcon}</span>
              <a
                href={`/member/${member.bioguideId}`}
                className="font-semibold hover:underline"
              >
                {member.firstName} {member.lastName}
              </a>
              <span className="text-[var(--muted)] text-sm">
                ({member.party}-{member.state})
              </span>
            </>
          ) : (
            <span className="font-semibold text-[var(--muted)]">Unknown Speaker</span>
          )}
          {timestamp && (
            <span className="text-xs text-[var(--muted)] ml-auto">{timestamp}</span>
          )}
        </div>

        {/* Message body */}
        <div className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* Page reference on hover */}
        {originalPage && (
          <a
            href={`https://www.congress.gov/congressional-record/search?pageNumber=${originalPage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--muted)] hover:underline mt-1 inline-block"
          >
            p. {originalPage}
          </a>
        )}

        {/* Original excerpt (collapsible) */}
        {showOriginal && originalExcerpt && (
          <details className="mt-2">
            <summary className="text-xs text-[var(--muted)] cursor-pointer hover:underline">
              View original text
            </summary>
            <blockquote className="mt-2 text-sm text-[var(--muted)] border-l-2 border-[var(--border)] pl-3 italic">
              {originalExcerpt}
            </blockquote>
          </details>
        )}
      </div>
    </div>
  )
}
