'use client'

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

interface SpeakerWithCount extends Member {
  messageCount: number
}

interface SessionSidebarProps {
  agendaItems: AgendaItem[]
  speakers: SpeakerWithCount[]
  activeAgendaItem?: string | null
  onAgendaItemClick?: (id: string) => void
  onSpeakerClick?: (bioguideId: string) => void
  transcriptUrl?: string | null
  sessionTitle?: string | null
  chamber?: string | null
}

export function SessionSidebar({
  agendaItems,
  speakers,
  activeAgendaItem,
  onAgendaItemClick,
  onSpeakerClick,
  transcriptUrl,
  sessionTitle,
  chamber,
}: SessionSidebarProps) {
  const partyIcon = (party: string) => {
    if (party === 'D') return '\uD83D\uDD35'
    if (party === 'R') return '\uD83D\uDD34'
    return '\uD83D\uDFE3'
  }

  return (
    <aside className="w-64 border-l border-[var(--border)] bg-[var(--background)] overflow-y-auto hidden lg:block">
      <div className="p-4">
        {/* Today's Agenda */}
        {agendaItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Today's Agenda
            </h3>
            <div className="space-y-2">
              {agendaItems.map((item, index) => {
                const isActive = item.id === activeAgendaItem || (index === 0 && !activeAgendaItem)
                const itemIcon = item.itemType === 'bill' || item.itemType === 'resolution'
                  ? '\uD83D\uDCC4'
                  : item.itemType === 'motion'
                  ? '\u26A1'
                  : '\u25CB'

                return (
                  <button
                    key={item.id}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--card)] border-l-2 border-l-[var(--democrat)]'
                        : 'hover:bg-[var(--card)]'
                    }`}
                    onClick={() => onAgendaItemClick?.(item.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className={isActive ? 'text-[var(--democrat)]' : 'text-[var(--muted)]'}>
                        {isActive ? '\u25B8' : itemIcon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${isActive ? 'font-medium' : ''}`}>
                          {item.billNumber || item.title?.slice(0, 30) || 'Agenda Item'}
                          {item.title && item.title.length > 30 && !item.billNumber ? '...' : ''}
                        </p>
                        {item.billNumber && item.title && (
                          <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">
                            {item.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        {agendaItems.length > 0 && speakers.length > 0 && (
          <hr className="border-[var(--border)] my-4" />
        )}

        {/* Speakers */}
        {speakers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Speakers This Item
            </h3>
            <div className="space-y-1">
              {speakers.map((speaker) => (
                <a
                  key={speaker.bioguideId}
                  href={`/member/${speaker.bioguideId}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                >
                  <MemberAvatar
                    firstName={speaker.firstName}
                    lastName={speaker.lastName}
                    party={speaker.party}
                    photoUrl={speaker.photoUrl}
                    size="sm"
                    showBadge={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {speaker.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                    <span>{partyIcon(speaker.party)}</span>
                    <span>{speaker.messageCount} msgs</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {transcriptUrl && (
          <div>
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
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
