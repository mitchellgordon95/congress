import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { govinfo, GovInfoGranule, GovInfoGranuleDetail } from '@/lib/govinfo'
import { parseCongressionalRecordHtml } from '@/lib/parser'
import { translateSpeech, translateProceduralEvent } from '@/lib/translator'
import { TranscriptSegment } from '@/types'

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')
  const chamber = searchParams.get('chamber') as 'senate' | 'house' | null
  const limit = parseInt(searchParams.get('limit') || '5', 10) // Limit granules for testing

  if (!date) {
    return NextResponse.json({ error: 'date parameter required' }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be in YYYY-MM-DD format' }, { status: 400 })
  }

  try {
    const packages = await govinfo.getCongressionalRecordPackages(date, date)

    if (packages.length === 0) {
      return NextResponse.json({ error: 'No Congressional Record found for this date' }, { status: 404 })
    }

    const results: Array<{ chamber: string; sessionId: string; messages: number; granules: number }> = []

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

        if (existing && existing.status === 'complete') {
          const msgCount = await prisma.message.count({ where: { sessionId: existing.id } })
          results.push({
            chamber: ch,
            sessionId: existing.id,
            messages: msgCount,
            granules: 0,
          })
          continue
        }

        // Delete existing incomplete session if any
        if (existing) {
          await prisma.session.delete({ where: { id: existing.id } })
        }

        // Process the section
        const result = await processSection(pkg.packageId, date, ch, limit)
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
  chamber: 'senate' | 'house',
  limit: number
): Promise<{ chamber: string; sessionId: string; messages: number; granules: number } | null> {
  console.log(`Processing ${chamber} for ${packageId}...`)

  // Get granules for this chamber
  const granules = await govinfo.getPackageGranules(packageId, chamber)
  console.log(`Found ${granules.length} ${chamber} granules`)

  if (granules.length === 0) {
    return null
  }

  // Create session record
  const session = await prisma.session.create({
    data: {
      sessionType: `floor_${chamber}`,
      sessionDate: new Date(date),
      chamber,
      govinfoPackageId: packageId,
      rawTranscriptUrl: `https://www.govinfo.gov/app/details/${packageId}`,
      status: 'processing',
    },
  })

  try {
    // Build member lookup by bioguideId
    const members = await prisma.member.findMany({
      where: { isCurrent: true },
      select: { id: true, bioguideId: true, lastName: true },
    })
    const memberByBioguide = new Map<string, { id: string }>()
    const memberByLastName = new Map<string, { id: string }>()
    for (const member of members) {
      memberByBioguide.set(member.bioguideId, { id: member.id })
      memberByLastName.set(member.lastName.toUpperCase(), { id: member.id })
    }

    let displayOrder = 0
    let processedGranules = 0
    const previousSpeakers: string[] = []

    // Process each granule (up to limit for testing)
    const granulesToProcess = granules.slice(0, limit)

    for (const granule of granulesToProcess) {
      console.log(`Processing granule: ${granule.title}`)

      try {
        // Get granule details (includes speaker metadata)
        const details = await govinfo.getGranuleDetails(packageId, granule.granuleId)

        // Get granule content
        const html = await govinfo.getGranuleContent(packageId, granule.granuleId)

        // Parse into segments
        const parsed = parseCongressionalRecordHtml(html, chamber)
        const segments = parsed.segments

        // Create agenda item for this granule
        const agendaItem = await prisma.agendaItem.create({
          data: {
            sessionId: session.id,
            title: granule.title,
            itemType: detectItemType(granule.title),
            startOrder: processedGranules,
          },
        })

        // Get member IDs from granule metadata
        const granuleMembers = new Map<string, string>()
        if (details.members) {
          for (const m of details.members) {
            const member = memberByBioguide.get(m.bioGuideId)
            if (member) {
              granuleMembers.set(m.bioGuideId, member.id)
            }
          }
        }

        // Context for translation
        const context = {
          chamber,
          date,
          agendaItem: { title: granule.title },
        }

        // Process each segment
        for (const segment of segments) {
          // Try to match speaker to a member
          let memberId: string | null = null

          if (!segment.isProceduralSpeaker) {
            // First try to match from granule metadata (most reliable)
            if (details.members && details.members.length > 0) {
              // Try to find matching member by parsed name
              for (const m of details.members) {
                if (segment.speaker.toUpperCase().includes(m.memberName.split(',')[0].toUpperCase())) {
                  const member = memberByBioguide.get(m.bioGuideId)
                  if (member) {
                    memberId = member.id
                    break
                  }
                }
              }
            }

            // Fallback to last name matching
            if (!memberId) {
              const lastName = extractLastName(segment.speaker)
              const member = memberByLastName.get(lastName.toUpperCase())
              if (member) {
                memberId = member.id
              }
            }
          }

          // Translate the segment
          let translatedMessages
          if (segment.isProceduralSpeaker) {
            translatedMessages = await translateProceduralEvent(segment, context)
          } else {
            const result = await translateSpeech(segment, context, previousSpeakers)
            translatedMessages = result.messages

            // Track speaker for context
            if (!previousSpeakers.includes(segment.speaker)) {
              previousSpeakers.push(segment.speaker)
              if (previousSpeakers.length > 5) previousSpeakers.shift()
            }
          }

          // Store translated messages
          for (const msg of translatedMessages) {
            await prisma.message.create({
              data: {
                sessionId: session.id,
                agendaItemId: agendaItem.id,
                memberId,
                messageType: msg.type,
                content: msg.content,
                originalExcerpt: msg.originalExcerpt || null,
                originalPage: segment.pageNumber || null,
                displayOrder: displayOrder++,
              },
            })
          }

          // Store original segment
          await prisma.transcriptSegment.create({
            data: {
              sessionId: session.id,
              memberId,
              originalText: segment.text.slice(0, 10000), // Limit size
              pageNumber: segment.pageNumber || null,
            },
          })
        }

        processedGranules++

        // Small delay to avoid rate limits
        await sleep(200)
      } catch (error) {
        console.error(`Error processing granule ${granule.granuleId}:`, error)
        // Continue with next granule
      }
    }

    // Update session status
    await prisma.session.update({
      where: { id: session.id },
      data: {
        status: 'complete',
        title: `${chamber === 'senate' ? 'Senate' : 'House'} Floor - ${date}`,
      },
    })

    return { chamber, sessionId: session.id, messages: displayOrder, granules: processedGranules }
  } catch (error) {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'pending' },
    })
    throw error
  }
}

function detectItemType(title: string): string {
  const upper = title.toUpperCase()
  if (upper.includes('NOMINATION')) return 'nomination'
  if (upper.includes('MOTION')) return 'motion'
  if (upper.includes('RESOLUTION') || upper.includes('H.R.') || upper.includes('S.')) return 'bill'
  if (upper.includes('TRIBUTE') || upper.includes('HONORING') || upper.includes('RECOGNIZING')) return 'tribute'
  return 'other'
}

function extractLastName(speaker: string): string {
  // "Mr. WALBERG" -> "WALBERG"
  // "Ms. KAPTUR" -> "KAPTUR"
  return speaker.replace(/^(Mr\.|Ms\.|Mrs\.|The)\s+/i, '').trim()
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
