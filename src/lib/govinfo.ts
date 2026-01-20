import { GovInfoCollectionResponse, GovInfoPackage } from '@/types'

const GOVINFO_API_KEY = process.env.GOVINFO_API_KEY
const GOVINFO_BASE_URL = 'https://api.govinfo.gov'

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
   * Collection: CREC (Congressional Record)
   */
  async getCongressionalRecordPackages(
    fromDate: string,
    toDate?: string,
    pageSize: number = 100
  ): Promise<GovInfoPackage[]> {
    const endpoint = toDate
      ? `${GOVINFO_BASE_URL}/collections/CREC/${fromDate}T00:00:00Z/${toDate}T23:59:59Z`
      : `${GOVINFO_BASE_URL}/collections/CREC/${fromDate}T00:00:00Z`

    const url = `${endpoint}?pageSize=${pageSize}&api_key=${this.apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`GovInfo API error: ${response.status} ${response.statusText}`)
    }

    const data: GovInfoCollectionResponse = await response.json()
    return data.packages || []
  }

  /**
   * Get the HTML content URL for a Congressional Record section
   */
  getTranscriptHtmlUrl(packageId: string, section: 'senate' | 'house'): string {
    return `https://www.govinfo.gov/content/pkg/${packageId}/html/${packageId}-${section}.htm`
  }

  /**
   * Get the full package URL for downloading
   */
  getPackageDownloadUrl(packageId: string, format: 'html' | 'pdf' | 'xml' = 'html'): string {
    return `https://www.govinfo.gov/content/pkg/${packageId}/${format}/${packageId}.${format}`
  }

  /**
   * Fetch the raw HTML transcript for a chamber section
   */
  async fetchTranscriptHtml(packageId: string, section: 'senate' | 'house'): Promise<string> {
    const url = this.getTranscriptHtmlUrl(packageId, section)
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Transcript not found for ${packageId} ${section}`)
      }
      throw new Error(`Failed to fetch transcript: ${response.status}`)
    }

    return response.text()
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
    // Page format is like S7945 (Senate) or H1234 (House)
    const chamber = pageNumber.startsWith('S') ? 'senate' : 'house'
    // This is the direct link format for Congress.gov
    return `https://www.congress.gov/congressional-record/search?pageSort=relevancy&pageNumber=${pageNumber}&chamber=${chamber}`
  }
}

// Default singleton instance
export const govinfo = new GovInfoClient()

export default govinfo
