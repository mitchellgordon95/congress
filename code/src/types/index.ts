// Member of Congress
export interface Member {
  id: string
  bioguideId: string
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I'
  state: string
  chamber: 'senate' | 'house'
  photoUrl: string | null
  isCurrent: boolean
  createdAt: Date
  updatedAt: Date
}

// Floor session or committee hearing
export interface Session {
  id: string
  sessionType: 'floor_senate' | 'floor_house' | 'committee'
  sessionDate: Date
  title: string | null
  govinfoPackageId: string | null
  chamber: 'senate' | 'house' | null
  committeeCode: string | null
  startTime: Date | null
  endTime: Date | null
  status: 'pending' | 'processing' | 'complete'
  rawTranscriptUrl: string | null
  createdAt: Date
  agendaItems?: AgendaItem[]
  messages?: Message[]
}

// Agenda items within a session
export interface AgendaItem {
  id: string
  sessionId: string
  title: string | null
  itemType: 'bill' | 'resolution' | 'motion' | 'tribute' | 'nomination' | 'other'
  billNumber: string | null
  billUrl: string | null
  startOrder: number
  createdAt: Date
}

// Translated chat message
export interface Message {
  id: string
  sessionId: string
  agendaItemId: string | null
  memberId: string | null
  member?: Member | null
  messageType: 'speech' | 'procedural' | 'question' | 'answer' | 'system' | 'vote_result'
  content: string
  originalExcerpt: string | null
  originalPage: string | null
  timestampInSession: Date | null
  displayOrder: number
  createdAt: Date
}

// Parsed transcript segment from Congressional Record
export interface TranscriptSegment {
  speaker: string
  text: string
  pageNumber: string
  isProceduralSpeaker: boolean
}

// Session context for LLM translation
export interface SessionContext {
  chamber: 'senate' | 'house'
  date: string
  agendaItem?: {
    title: string
    billNumber?: string
  }
}

// LLM translation result
export interface TranslatedMessage {
  type: 'speech' | 'procedural' | 'system' | 'vote_result'
  content: string
  originalExcerpt: string
}

// GovInfo API types
export interface GovInfoPackage {
  packageId: string
  lastModified: string
  packageLink: string
  docClass: string
  title: string
  congress: string
  dateIssued: string
}

export interface GovInfoCollectionResponse {
  count: number
  message: string | null
  nextPage: string | null
  previousPage: string | null
  packages: GovInfoPackage[]
}

// Congress.gov API types
export interface CongressMember {
  bioguideId: string
  name: string
  partyName: string
  state: string
  district?: number
  terms: {
    item: Array<{
      chamber: string
      startYear: number
      endYear?: number
    }>
  }
  depiction?: {
    imageUrl: string
    attribution: string
  }
}

export interface CongressMemberResponse {
  members: CongressMember[]
  pagination: {
    count: number
    next?: string
  }
}
