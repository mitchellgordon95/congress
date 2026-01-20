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
  showOriginal?: boolean
  originalExcerpt?: string | null
}

export function MessageBubble({
  content,
  messageType,
  member,
  originalPage,
  showOriginal = false,
  originalExcerpt,
}: MessageBubbleProps) {
  // System messages (centered, muted)
  if (messageType === 'system' || messageType === 'procedural') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-[var(--card)] text-[var(--muted)] px-4 py-2 rounded-lg text-sm max-w-md text-center">
          {messageType === 'procedural' && <span className="mr-1">&#9881;</span>}
          {content}
        </div>
      </div>
    )
  }

  // Vote result (special card)
  if (messageType === 'vote_result') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-6 py-4 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">&#x1F5F3;</span>
            <span className="font-semibold">Vote Result</span>
          </div>
          <p className="text-lg font-medium">{content}</p>
        </div>
      </div>
    )
  }

  // Regular message (speech, question, answer)
  return (
    <div className="flex gap-3 py-2 group">
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
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          {member ? (
            <>
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
          {originalPage && (
            <a
              href={`https://www.congress.gov/congressional-record/search?pageNumber=${originalPage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--muted)] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
            >
              p. {originalPage}
            </a>
          )}
        </div>

        {/* Message body */}
        <div className="text-[var(--foreground)]">
          <p className="leading-relaxed">{content}</p>
        </div>

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
