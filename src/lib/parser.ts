import * as cheerio from 'cheerio'
import { TranscriptSegment } from '@/types'

// Procedural speakers who are not actual Congress members
const PROCEDURAL_SPEAKERS = [
  'PRESIDING OFFICER',
  'ACTING PRESIDENT pro tempore',
  'PRESIDENT pro tempore',
  'SPEAKER',
  'SPEAKER pro tempore',
  'CLERK',
  'READING CLERK',
  'CHIEF CLERK',
  'CHAIR',
  'CHAIRMAN',
  'CHAIRWOMAN',
]

// Pattern for speaker identification
const SPEAKER_PATTERN = /^\s{2,}(Mr\.|Ms\.|Mrs\.|The)\s+([A-Z][A-Z\s\-']+)\./
const PAGE_PATTERN = /\[\[Page ([SH]\d+)\]\]/

// Pattern for bill/resolution mentions
const BILL_PATTERN = /(S\.|H\.|S\.J\.|H\.J\.|S\.Con\.|H\.Con\.)\s*(Res\.|R\.)\s*(\d+)/gi

export interface ParsedTranscript {
  segments: TranscriptSegment[]
  agendaItems: ParsedAgendaItem[]
  metadata: {
    chamber: 'senate' | 'house'
    date: string
    pages: string[]
  }
}

export interface ParsedAgendaItem {
  title: string
  type: 'bill' | 'resolution' | 'motion' | 'tribute' | 'nomination' | 'other'
  billNumber?: string
  startSegmentIndex: number
}

/**
 * Parse Congressional Record HTML into speaker segments
 */
export function parseCongressionalRecordHtml(html: string, chamber: 'senate' | 'house'): ParsedTranscript {
  const $ = cheerio.load(html)

  // Congressional Record HTML typically has content in <pre> tags
  let content = ''
  $('pre').each((_, el) => {
    content += $(el).text() + '\n'
  })

  // If no <pre> tags, try to get body text
  if (!content.trim()) {
    content = $('body').text()
  }

  const lines = content.split('\n')
  const segments: TranscriptSegment[] = []
  const agendaItems: ParsedAgendaItem[] = []
  const pages: string[] = []

  let currentSpeaker: string | null = null
  let currentText = ''
  let currentPage = ''
  let isProceduralSpeaker = false

  for (const line of lines) {
    // Check for page markers
    const pageMatch = line.match(PAGE_PATTERN)
    if (pageMatch) {
      currentPage = pageMatch[1]
      if (!pages.includes(currentPage)) {
        pages.push(currentPage)
      }
      continue
    }

    // Check for new speaker
    const speakerMatch = line.match(SPEAKER_PATTERN)
    if (speakerMatch) {
      // Save previous segment if exists
      if (currentSpeaker && currentText.trim()) {
        segments.push({
          speaker: currentSpeaker,
          text: cleanText(currentText),
          pageNumber: currentPage,
          isProceduralSpeaker,
        })
      }

      // Extract speaker name
      const title = speakerMatch[1]
      const name = speakerMatch[2].trim()

      // Check if procedural speaker
      isProceduralSpeaker = PROCEDURAL_SPEAKERS.some(ps =>
        name.toUpperCase().includes(ps)
      )

      currentSpeaker = `${title} ${name}`
      currentText = line.replace(SPEAKER_PATTERN, '').trim()

      // Check for agenda items (all-caps titles)
      const potentialTitle = detectAgendaItem(currentText, line)
      if (potentialTitle) {
        agendaItems.push({
          ...potentialTitle,
          startSegmentIndex: segments.length,
        })
      }
    } else if (currentSpeaker) {
      // Continue building current speaker's text
      currentText += ' ' + line.trim()
    } else {
      // Check for standalone agenda items (headers before any speaker)
      const potentialTitle = detectAgendaItem(line, line)
      if (potentialTitle && line.trim().length > 10) {
        agendaItems.push({
          ...potentialTitle,
          startSegmentIndex: segments.length,
        })
      }
    }
  }

  // Save final segment
  if (currentSpeaker && currentText.trim()) {
    segments.push({
      speaker: currentSpeaker,
      text: cleanText(currentText),
      pageNumber: currentPage,
      isProceduralSpeaker,
    })
  }

  return {
    segments,
    agendaItems: deduplicateAgendaItems(agendaItems),
    metadata: {
      chamber,
      date: '', // To be filled by caller
      pages,
    },
  }
}

/**
 * Detect if a line represents an agenda item
 */
function detectAgendaItem(text: string, fullLine: string): Omit<ParsedAgendaItem, 'startSegmentIndex'> | null {
  const trimmed = text.trim()

  // Skip very short or non-uppercase titles
  if (trimmed.length < 5) return null

  // Check for bill/resolution mentions
  const billMatch = trimmed.match(BILL_PATTERN)
  if (billMatch) {
    return {
      title: trimmed,
      type: billMatch[2]?.toLowerCase().includes('res') ? 'resolution' : 'bill',
      billNumber: `${billMatch[1]}${billMatch[2]}${billMatch[3]}`.replace(/\s+/g, ' '),
    }
  }

  // Check for common agenda item patterns
  const upperText = trimmed.toUpperCase()

  if (upperText.includes('NOMINATION')) {
    return { title: trimmed, type: 'nomination' }
  }
  if (upperText.includes('MOTION TO')) {
    return { title: trimmed, type: 'motion' }
  }
  if (upperText.includes('TRIBUTE') || upperText.includes('HONORING') || upperText.includes('RECOGNIZING')) {
    return { title: trimmed, type: 'tribute' }
  }

  // All-caps titles (likely agenda headers)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 20 && /^[A-Z\s\-,]+$/.test(trimmed)) {
    return { title: trimmed, type: 'other' }
  }

  return null
}

/**
 * Clean up text by removing excessive whitespace and formatting artifacts
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\[\[Page [SH]\d+\]\]/g, '')
    .trim()
}

/**
 * Remove duplicate agenda items
 */
function deduplicateAgendaItems(items: ParsedAgendaItem[]): ParsedAgendaItem[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.title.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Extract bill numbers from text
 */
export function extractBillNumbers(text: string): string[] {
  const matches = text.matchAll(BILL_PATTERN)
  const bills: string[] = []

  for (const match of matches) {
    const bill = `${match[1]}${match[2]}${match[3]}`.replace(/\s+/g, ' ')
    if (!bills.includes(bill)) {
      bills.push(bill)
    }
  }

  return bills
}

/**
 * Parse a bill number string into components
 */
export function parseBillNumber(billNumber: string): {
  congress: number
  type: string
  number: number
} | null {
  // Current congress (119th as of 2025-2027)
  const currentCongress = 119

  const normalized = billNumber.replace(/\s+/g, '').toLowerCase()

  // S.J.Res.90 -> { type: 'sjres', number: 90 }
  const pattern = /^(s|h|sj|hj|scon|hcon)(res|r)?\.?(\d+)$/i
  const match = normalized.match(pattern)

  if (!match) return null

  let type = match[1]
  if (match[2]) {
    type += match[2].toLowerCase() === 'res' ? 'res' : 'r'
  }

  return {
    congress: currentCongress,
    type: type.toLowerCase(),
    number: parseInt(match[3], 10),
  }
}

/**
 * Normalize speaker name for matching with member database
 */
export function normalizeSpeakerName(speaker: string): string {
  return speaker
    .replace(/^(Mr\.|Ms\.|Mrs\.|The)\s+/i, '')
    .replace(/\s+of\s+\w+$/i, '') // Remove "of Virginia" etc.
    .trim()
    .toUpperCase()
}

/**
 * Group segments by speaker (combine consecutive segments from same speaker)
 */
export function groupConsecutiveSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
  const grouped: TranscriptSegment[] = []

  for (const segment of segments) {
    const last = grouped[grouped.length - 1]

    if (last && last.speaker === segment.speaker && last.isProceduralSpeaker === segment.isProceduralSpeaker) {
      // Merge with previous segment
      last.text += '\n\n' + segment.text
      last.pageNumber = segment.pageNumber // Update to latest page
    } else {
      grouped.push({ ...segment })
    }
  }

  return grouped
}
