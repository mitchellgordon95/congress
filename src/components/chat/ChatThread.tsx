'use client'

import { MessageBubble } from './MessageBubble'

interface Member {
  id: string
  bioguideId: string
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I' | string
  state: string
  photoUrl?: string | null
}

interface Message {
  id: string
  memberId: string | null
  member: Member | null
  messageType: 'speech' | 'procedural' | 'question' | 'answer' | 'system' | 'vote_result'
  content: string
  originalExcerpt?: string | null
  originalPage?: string | null
  displayOrder: number
}

interface ChatThreadProps {
  messages: Message[]
  showOriginals?: boolean
}

export function ChatThread({ messages, showOriginals = false }: ChatThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--muted)]">
        No messages yet
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          messageType={message.messageType}
          member={message.member}
          originalPage={message.originalPage}
          originalExcerpt={message.originalExcerpt}
          showOriginal={showOriginals}
        />
      ))}
    </div>
  )
}
