import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { govinfo } from '@/lib/govinfo'
import { parseCongressionalRecordHtml, normalizeSpeakerName, groupConsecutiveSegments } from '@/lib/parser'
import { translateSegments } from '@/lib/translator'

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')
  const chamber = searchParams.get('chamber') as 'senate' | 'house' | null

  if (!date) {
    return NextResponse.json({ error: 'date parameter required' }, { status: 400 })
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be in YYYY-MM-DD format' }, { status: 400 })
  }

  try {
    const packages = await govinfo.getCongressionalRecordPackages(date, date)

    if (packages.length === 0) {
      return NextResponse.json({ error: 'No Congressional Record found for this date' }, { status: 404 })
    }

    const results: Array<{ chamber: string; sessionId: string; messages: number }> = []

    for (const pkg of packages) {
      const chambers = chamber ? [chamber] : ['senate', 'house'] as const

      for (const ch of chambers) {
        // Check if already processed
        const existing = await prisma.session.findFirst({
          where: {
            govinfoPackageId: pkg.packageId,
            sessionType: `floor_${ch}`,
          },
        })

        if (existing) {
          results.push({
            chamber: ch,
            sessionId: existing.id,
            messages: await prisma.message.count({ where: { sessionId: existing.id } }),
          })
          continue
        }

        // Process the section
        const result = await processSection(pkg.packageId, date, ch)
        if (result) {
          results.push(result)
        }
      }
    }

    return NextResponse.json({
      success: true,
      date,
      results,
    })
  } catch (error) {
    console.error('Processing error:', error)
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
): Promise<{ chamber: string; sessionId: string; messages: number } | null> {
  // Create session record
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
    // Fetch transcript HTML
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

    // Parse transcript
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
    const memberMap = new Map<string, { id: string; bioguideId: string }>()
    for (const member of members) {
      memberMap.set(member.lastName.toUpperCase(), { id: member.id, bioguideId: member.bioguideId })
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

      // Store original transcript segment
      await prisma.transcriptSegment.create({
        data: {
          sessionId: session.id,
          memberId: segment.isProceduralSpeaker ? null : member?.id || null,
          originalText: segment.text,
          pageNumber: segment.pageNumber || null,
        },
      })
    }

    // Update session status
    await prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'complete',
        title: parsed.agendaItems[0]?.title || `${chamber === 'senate' ? 'Senate' : 'House'} Floor - ${date}`,
      },
    })

    return { chamber, sessionId: session.id, messages: displayOrder }
  } catch (error) {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'pending' },
    })
    throw error
  }
}
