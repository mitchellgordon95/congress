import { CongressMember, CongressMemberResponse } from '@/types'

const CONGRESS_API_KEY = process.env.CONGRESS_GOV_API_KEY
const CONGRESS_API_BASE_URL = 'https://api.congress.gov/v3'

export interface CongressMemberDetail {
  bioguideId: string
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I'
  state: string
  chamber: 'senate' | 'house'
  photoUrl: string | null
  district?: number
}

export class CongressApiClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || CONGRESS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Congress.gov API key not configured')
    }
  }

  /**
   * Fetch all current members of Congress
   */
  async getAllMembers(): Promise<CongressMemberDetail[]> {
    const members: CongressMemberDetail[] = []

    // Fetch Senate members
    const senateMembersRaw = await this.fetchChamberMembers('senate')
    members.push(...senateMembersRaw.map(m => this.transformMember(m, 'senate')))

    // Fetch House members
    const houseMembersRaw = await this.fetchChamberMembers('house')
    members.push(...houseMembersRaw.map(m => this.transformMember(m, 'house')))

    return members
  }

  /**
   * Fetch members from a specific chamber
   */
  private async fetchChamberMembers(chamber: 'senate' | 'house'): Promise<CongressMember[]> {
    const members: CongressMember[] = []
    let url = `${CONGRESS_API_BASE_URL}/member?chamber=${chamber}&currentMember=true&limit=250&api_key=${this.apiKey}`

    while (url) {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Congress API error: ${response.status}`)
      }

      const data: CongressMemberResponse = await response.json()
      members.push(...data.members)

      // Handle pagination
      url = data.pagination?.next ? `${data.pagination.next}&api_key=${this.apiKey}` : ''
    }

    return members
  }

  /**
   * Transform API response to our member format
   */
  private transformMember(member: CongressMember, chamber: 'senate' | 'house'): CongressMemberDetail {
    // Parse name - format is usually "LastName, FirstName"
    const nameParts = member.name.split(', ')
    const lastName = nameParts[0] || ''
    const firstName = nameParts[1]?.split(' ')[0] || ''

    // Map party name to abbreviation
    let party: 'D' | 'R' | 'I' = 'I'
    if (member.partyName?.toLowerCase().includes('democrat')) {
      party = 'D'
    } else if (member.partyName?.toLowerCase().includes('republican')) {
      party = 'R'
    }

    return {
      bioguideId: member.bioguideId,
      firstName,
      lastName,
      party,
      state: member.state,
      chamber,
      photoUrl: member.depiction?.imageUrl || null,
      district: member.district,
    }
  }

  /**
   * Fetch a single member by bioguide ID
   */
  async getMember(bioguideId: string): Promise<CongressMemberDetail | null> {
    const url = `${CONGRESS_API_BASE_URL}/member/${bioguideId}?api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Congress API error: ${response.status}`)
    }

    const data = await response.json()
    const member = data.member

    // Determine chamber from terms
    const currentTerm = member.terms?.item?.find((t: { endYear?: number }) => !t.endYear)
    const chamber = currentTerm?.chamber?.toLowerCase() === 'senate' ? 'senate' : 'house'

    return this.transformMember(
      {
        bioguideId: member.bioguideId,
        name: `${member.lastName}, ${member.firstName}`,
        partyName: member.partyName,
        state: member.state,
        district: member.district,
        terms: member.terms,
        depiction: member.depiction,
      },
      chamber
    )
  }

  /**
   * Get bill details by congress/type/number
   */
  async getBill(congress: number, type: string, number: number): Promise<Record<string, unknown> | null> {
    const url = `${CONGRESS_API_BASE_URL}/bill/${congress}/${type.toLowerCase()}/${number}?api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Congress API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Generate a Congress.gov URL for a bill
   */
  getBillUrl(congress: number, type: string, number: number): string {
    // Map type abbreviations to URL format
    const typeMap: Record<string, string> = {
      's': 'senate-bill',
      'hr': 'house-bill',
      'sres': 'senate-resolution',
      'hres': 'house-resolution',
      'sjres': 'senate-joint-resolution',
      'hjres': 'house-joint-resolution',
      'sconres': 'senate-concurrent-resolution',
      'hconres': 'house-concurrent-resolution',
    }

    const urlType = typeMap[type.toLowerCase().replace(/\./g, '')] || type.toLowerCase()
    return `https://www.congress.gov/bill/${congress}th-congress/${urlType}/${number}`
  }

  /**
   * Generate member profile URL
   */
  getMemberUrl(bioguideId: string, name?: string): string {
    const slug = name?.toLowerCase().replace(/\s+/g, '-') || bioguideId
    return `https://www.congress.gov/member/${slug}/${bioguideId}`
  }
}

// Default singleton instance
export const congressApi = new CongressApiClient()

export default congressApi
