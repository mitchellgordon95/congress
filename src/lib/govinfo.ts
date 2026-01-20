import { GovInfoCollectionResponse, GovInfoPackage } from '@/types'

const GOVINFO_API_KEY = process.env.GOVINFO_API_KEY
const GOVINFO_BASE_URL = 'https://api.govinfo.gov'

export interface GovInfoGranule {
  granuleId: string
  granuleClass: string // 'HOUSE', 'SENATE', 'EXTENSIONS', 'DAILYDIGEST'
  title: string
  granuleLink: string
}

export interface GovInfoGranuleDetail {
  granuleId: string
  granuleClass: string
  title: string
  members?: Array<{
    bioGuideId: string
    memberName: string
    party: string
    state: string
    role: string
  }>
  references?: Array<{
    collectionCode: string
    contents: Array<{
      number: string
      congress: string
      type: string
    }>
  }>
  download: {
    txtLink?: string
    pdfLink?: string
  }
}

export class GovInfoClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GOVINFO_API_KEY || ''
    if (!this.apiKey) {
      console.warn('GovInfo API key not configured')
    }
  }

  /**
   * Get Congressional Record packages for a date range
   */
  async getCongressionalRecordPackages(
    fromDate: string,
    toDate?: string,
    pageSize: number = 100
  ): Promise<GovInfoPackage[]> {
    const endpoint = toDate
      ? `${GOVINFO_BASE_URL}/collections/CREC/${fromDate}T00:00:00Z/${toDate}T23:59:59Z`
      : `${GOVINFO_BASE_URL}/collections/CREC/${fromDate}T00:00:00Z`

    const url = `${endpoint}?pageSize=${pageSize}&offsetMark=*&api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`GovInfo API error: ${response.status} ${response.statusText}`)
    }

    const data: GovInfoCollectionResponse = await response.json()
    return data.packages || []
  }

  /**
   * Get all granules for a package, optionally filtered by chamber
   */
  async getPackageGranules(
    packageId: string,
    chamber?: 'senate' | 'house'
  ): Promise<GovInfoGranule[]> {
    const granules: GovInfoGranule[] = []
    let nextPage: string | null = `${GOVINFO_BASE_URL}/packages/${packageId}/granules?offsetMark=*&pageSize=100&api_key=${this.apiKey}`

    while (nextPage) {
      const response = await fetch(nextPage)
      if (!response.ok) {
        throw new Error(`Failed to fetch granules: ${response.status}`)
      }

      const data = await response.json()

      for (const granule of data.granules || []) {
        // Filter by chamber if specified
        if (chamber) {
          const granuleClass = granule.granuleClass?.toUpperCase()
          const targetClass = chamber.toUpperCase()
          if (granuleClass !== targetClass) continue
        }
        granules.push(granule)
      }

      // Handle pagination
      nextPage = data.nextPage ? `${data.nextPage}&api_key=${this.apiKey}` : null
    }

    return granules
  }

  /**
   * Get detailed info for a granule including speaker metadata
   */
  async getGranuleDetails(packageId: string, granuleId: string): Promise<GovInfoGranuleDetail> {
    const url = `${GOVINFO_BASE_URL}/packages/${packageId}/granules/${granuleId}/summary?api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch granule details: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get the HTM (text) content for a granule
   */
  async getGranuleContent(packageId: string, granuleId: string): Promise<string> {
    const url = `${GOVINFO_BASE_URL}/packages/${packageId}/granules/${granuleId}/htm?api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch granule content: ${response.status}`)
    }

    return response.text()
  }

  /**
   * Get the HTML content URL for a Congressional Record section (legacy)
   */
  getTranscriptHtmlUrl(packageId: string, section: 'senate' | 'house'): string {
    return `https://www.govinfo.gov/app/details/${packageId}`
  }

  /**
   * Get package details/metadata
   */
  async getPackageDetails(packageId: string): Promise<Record<string, unknown>> {
    const url = `${GOVINFO_BASE_URL}/packages/${packageId}/summary?api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to get package details: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Check if a transcript exists for a given date
   */
  async hasTranscriptForDate(date: string): Promise<boolean> {
    const packages = await this.getCongressionalRecordPackages(date, date, 1)
    return packages.length > 0
  }

  /**
   * Get the Congressional Record page URL for citation linking
   */
  getCongressionalRecordPageUrl(pageNumber: string): string {
    const chamber = pageNumber.startsWith('S') ? 'senate' : 'house'
    return `https://www.congress.gov/congressional-record/search?pageSort=relevancy&pageNumber=${pageNumber}&chamber=${chamber}`
  }
}

// Default singleton instance
export const govinfo = new GovInfoClient()

export default govinfo
