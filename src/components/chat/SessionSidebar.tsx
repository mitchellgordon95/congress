'use client'

import { AgendaCard } from './AgendaCard'
import { MemberAvatar } from '../member/MemberAvatar'

interface AgendaItem {
  id: string
  title: string | null
  itemType: string
  billNumber: string | null
  billUrl: string | null
  startOrder: number
}

interface Member {
  id: string
  bioguideId: string
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I' | string
  state: string
  photoUrl?: string | null
}

interface SessionSidebarProps {
  agendaItems: AgendaItem[]
  speakers: Member[]
  activeAgendaItem?: string | null
  onAgendaItemClick?: (id: string) => void
  onSpeakerClick?: (bioguideId: string) => void
  transcriptUrl?: string | null
}

export function SessionSidebar({
  agendaItems,
  speakers,
  activeAgendaItem,
  onAgendaItemClick,
  onSpeakerClick,
  transcriptUrl,
}: SessionSidebarProps) {
  // Remove duplicate speakers
  const uniqueSpeakers = speakers.reduce((acc, speaker) => {
    if (!acc.find(s => s.bioguideId === speaker.bioguideId)) {
      acc.push(speaker)
    }
    return acc
  }, [] as Member[])

  return (
    <aside className="w-72 border-l border-[var(--border)] bg-[var(--background)] overflow-y-auto">
      <div className="p-4">
        {/* Agenda Items */}
        {agendaItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Agenda
            </h3>
            <div className="space-y-2">
              {agendaItems.map((item) => (
                <AgendaCard
                  key={item.id}
                  item={item}
                  isActive={item.id === activeAgendaItem}
                  onClick={() => onAgendaItemClick?.(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Speakers */}
        {uniqueSpeakers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Speakers ({uniqueSpeakers.length})
            </h3>
            <div className="space-y-2">
              {uniqueSpeakers.map((speaker) => (
                <button
                  key={speaker.bioguideId}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card)] transition-colors text-left"
                  onClick={() => onSpeakerClick?.(speaker.bioguideId)}
                >
                  <MemberAvatar
                    firstName={speaker.firstName}
                    lastName={speaker.lastName}
                    party={speaker.party}
                    photoUrl={speaker.photoUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {speaker.lastName}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {speaker.party}-{speaker.state}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {transcriptUrl && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Resources
            </h3>
            <a
              href={transcriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <span>&#128196;</span>
              View full transcript
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}
