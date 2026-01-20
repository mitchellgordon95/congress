import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { govinfo } from '@/lib/govinfo'
import { parseCongressionalRecordHtml, normalizeSpeakerName, groupConsecutiveSegments } from '@/lib/parser'
import { translateSegments } from '@/lib/translator'
import { format, subDays } from 'date-fns'

// This endpoint can be called by Railway's cron service
// Configure in Railway: POST /api/cron/process every 30 minutes
export async function POST(request: NextRequest) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  console.log('Starting scheduled transcript processing...')

  try {
    const today = new Date()
    const yesterday = subDays(today, 1)

    const datesToCheck = [
      format(yesterday, 'yyyy-MM-dd'),
      format(today, 'yyyy-MM-dd'),
    ]

    const results: Array<{ date: string; chamber: string; status: string; messages?: number }> = []

    for (const date of datesToCheck) {
      console.log(`Checking ${date}...`)

      const packages = await govinfo.getCongressionalRecordPackages(date, date)

      for (const pkg of packages) {
        for (const chamber of ['senate', 'house'] as const) {
          // Check if already processed
          const existing = await prisma.session.findFirst({
            where: {
              govinfoPackageId: pkg.packageId,
              sessionType: `floor_${chamber}`,
            },
          })

          if (existing) {
            results.push({ date, chamber, status: 'already_processed' })
            continue
          }

          // Process the section
          try {
            const result = await processSection(pkg.packageId, date, chamber)
            if (result) {
              results.push({ date, chamber, status: 'success', messages: result.messages })
            } else {
              results.push({ date, chamber, status: 'no_transcript' })
            }
          } catch (error) {
            console.error(`Error processing ${chamber} for ${date}:`, error)
            results.push({ date, chamber, status: 'error' })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('Cron processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}

async function processSection(
  packageId: string,
  date: string,
  chamber: 'senate' | 'house'
): Promise<{ messages: number } | null> {
  const session = await prisma.session.create({
    data: {
      sessionType: `floor_${chamber}`,
      sessionDate: new Date(date),
      chamber,
      govinfoPackageId: packageId,
      rawTranscriptUrl: govinfo.getTranscriptHtmlUrl(packageId, chamber),
      status: 'processing',
    },
  })

  try {
    let html: string
    try {
      html = await govinfo.fetchTranscriptHtml(packageId, chamber)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        await prisma.session.delete({ where: { id: session.id } })
        return null
      }
      throw error
    }

    const parsed = parseCongressionalRecordHtml(html, chamber)
    const segments = groupConsecutiveSegments(parsed.segments)

    // Create agenda items
    for (let i = 0; i < parsed.agendaItems.length; i++) {
      const item = parsed.agendaItems[i]
      await prisma.agendaItem.create({
        data: {
          sessionId: session.id,
          title: item.title,
          itemType: item.type,
          billNumber: item.billNumber || null,
          startOrder: i,
        },
      })
    }

    // Build member lookup
    const members = await prisma.member.findMany({
      where: { isCurrent: true },
      select: { id: true, bioguideId: true, lastName: true },
    })
    const memberMap = new Map<string, { id: string }>()
    for (const member of members) {
      memberMap.set(member.lastName.toUpperCase(), { id: member.id })
    }

    // Translate segments
    const context = {
      chamber,
      date,
      agendaItem: parsed.agendaItems[0]
        ? { title: parsed.agendaItems[0].title, billNumber: parsed.agendaItems[0].billNumber }
        : undefined,
    }

    const translations = await translateSegments(segments, context)

    // Store messages
    let displayOrder = 0
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const messages = translations.get(i) || []
      const speakerName = normalizeSpeakerName(segment.speaker)
      const member = memberMap.get(speakerName)

      for (const msg of messages) {
        await prisma.message.create({
          data: {
            sessionId: session.id,
            memberId: segment.isProceduralSpeaker ? null : member?.id || null,
            messageType: msg.type,
            content: msg.content,
            originalExcerpt: msg.originalExcerpt || null,
            originalPage: segment.pageNumber || null,
            displayOrder: displayOrder++,
          },
        })
      }

      await prisma.transcriptSegment.create({
        data: {
          sessionId: session.id,
          memberId: segment.isProceduralSpeaker ? null : member?.id || null,
          originalText: segment.text,
          pageNumber: segment.pageNumber || null,
        },
      })
    }

    await prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'complete',
        title: parsed.agendaItems[0]?.title || `${chamber === 'senate' ? 'Senate' : 'House'} Floor - ${date}`,
      },
    })

    return { messages: displayOrder }
  } catch (error) {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'pending' },
    })
    throw error
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger transcript processing',
    endpoint: '/api/cron/process',
  })
}
