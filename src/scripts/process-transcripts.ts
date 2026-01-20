import { prisma } from '../lib/db'
import { govinfo } from '../lib/govinfo'
import { parseCongressionalRecordHtml, normalizeSpeakerName, groupConsecutiveSegments } from '../lib/parser'
import { translateSegments } from '../lib/translator'
import { format, subDays } from 'date-fns'

/**
 * Main transcript processing script
 * Polls for new Congressional Record packages and processes them
 */
async function main() {
  console.log('Starting transcript processing...')

  try {
    // Check for transcripts from yesterday and today
    const today = new Date()
    const yesterday = subDays(today, 1)

    const datesToCheck = [
      format(yesterday, 'yyyy-MM-dd'),
      format(today, 'yyyy-MM-dd'),
    ]

    for (const date of datesToCheck) {
      console.log(`\nChecking for transcripts on ${date}...`)

      const packages = await govinfo.getCongressionalRecordPackages(date, date)
      console.log(`Found ${packages.length} packages`)

      for (const pkg of packages) {
        // Check if already processed
        const existing = await prisma.session.findFirst({
          where: { govinfoPackageId: pkg.packageId },
        })

        if (existing) {
          console.log(`Package ${pkg.packageId} already processed, skipping`)
          continue
        }

        // Process Senate section
        await processSection(pkg.packageId, date, 'senate')

        // Process House section
        await processSection(pkg.packageId, date, 'house')
      }
    }

    console.log('\nTranscript processing complete!')
  } catch (error) {
    console.error('Error processing transcripts:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Process a single section (Senate or House) from a package
 */
async function processSection(
  packageId: string,
  date: string,
  chamber: 'senate' | 'house'
) {
  console.log(`\nProcessing ${chamber} section of ${packageId}...`)

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
        console.log(`No ${chamber} transcript found for ${date}`)
        await prisma.session.delete({ where: { id: session.id } })
        return
      }
      throw error
    }

    // Parse transcript
    const parsed = parseCongressionalRecordHtml(html, chamber)
    const segments = groupConsecutiveSegments(parsed.segments)
    console.log(`Parsed ${segments.length} segments, ${parsed.agendaItems.length} agenda items`)

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

    // Load member lookup map
    const memberMap = await buildMemberLookup()

    // Translate segments
    const context = {
      chamber,
      date,
      agendaItem: parsed.agendaItems[0]
        ? { title: parsed.agendaItems[0].title, billNumber: parsed.agendaItems[0].billNumber }
        : undefined,
    }

    console.log('Translating segments...')
    const translations = await translateSegments(segments, context)

    // Store messages
    let displayOrder = 0
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const messages = translations.get(i) || []

      // Look up member
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

    console.log(`Completed processing ${chamber} section: ${displayOrder} messages created`)
  } catch (error) {
    // Mark session as failed
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'pending' },
    })
    throw error
  }
}

/**
 * Build a lookup map of member names to member records
 */
async function buildMemberLookup(): Promise<Map<string, { id: string; bioguideId: string }>> {
  const members = await prisma.member.findMany({
    where: { isCurrent: true },
    select: { id: true, bioguideId: true, lastName: true },
  })

  const map = new Map<string, { id: string; bioguideId: string }>()

  for (const member of members) {
    // Add by last name (uppercase for matching)
    map.set(member.lastName.toUpperCase(), { id: member.id, bioguideId: member.bioguideId })
  }

  return map
}

// Run the script
main()
