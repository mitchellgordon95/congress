import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chamber = searchParams.get('chamber')
  const party = searchParams.get('party')
  const state = searchParams.get('state')
  const currentOnly = searchParams.get('current') !== 'false'

  const where: Record<string, unknown> = {}

  if (currentOnly) {
    where.isCurrent = true
  }
  if (chamber) {
    where.chamber = chamber
  }
  if (party) {
    where.party = party
  }
  if (state) {
    where.state = state
  }

  const members = await prisma.member.findMany({
    where,
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  })

  return NextResponse.json({
    members: members.map(m => ({
      id: m.id,
      bioguideId: m.bioguideId,
      firstName: m.firstName,
      lastName: m.lastName,
      party: m.party,
      state: m.state,
      chamber: m.chamber,
      photoUrl: m.photoUrl,
      isCurrent: m.isCurrent,
    })),
    count: members.length,
  })
}
