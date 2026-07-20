import { prisma } from '../lib/db'
import { congressApi } from '../lib/congress-api'

/**
 * Sync member data from Congress.gov API
 */
async function main() {
  console.log('Starting member sync...')

  try {
    // Fetch all current members
    console.log('Fetching members from Congress.gov...')
    const members = await congressApi.getAllMembers()
    console.log(`Found ${members.length} current members`)

    // Upsert each member
    let created = 0
    let updated = 0

    for (const member of members) {
      const existing = await prisma.member.findUnique({
        where: { bioguideId: member.bioguideId },
      })

      if (existing) {
        // Update existing member
        await prisma.member.update({
          where: { bioguideId: member.bioguideId },
          data: {
            firstName: member.firstName,
            lastName: member.lastName,
            party: member.party,
            state: member.state,
            chamber: member.chamber,
            photoUrl: member.photoUrl,
            isCurrent: true,
            updatedAt: new Date(),
          },
        })
        updated++
      } else {
        // Create new member
        await prisma.member.create({
          data: {
            bioguideId: member.bioguideId,
            firstName: member.firstName,
            lastName: member.lastName,
            party: member.party,
            state: member.state,
            chamber: member.chamber,
            photoUrl: member.photoUrl,
            isCurrent: true,
          },
        })
        created++
      }
    }

    // Mark members not in the current list as no longer current
    const currentBioguideIds = members.map(m => m.bioguideId)
    const { count: markedInactive } = await prisma.member.updateMany({
      where: {
        bioguideId: { notIn: currentBioguideIds },
        isCurrent: true,
      },
      data: { isCurrent: false },
    })

    console.log(`\nSync complete:`)
    console.log(`  Created: ${created}`)
    console.log(`  Updated: ${updated}`)
    console.log(`  Marked inactive: ${markedInactive}`)
  } catch (error) {
    console.error('Error syncing members:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()
