'use client'

interface AgendaItem {
  id: string
  title: string | null
  itemType: string
  billNumber: string | null
  billUrl: string | null
  startOrder: number
}

interface AgendaCardProps {
  item: AgendaItem
  isActive?: boolean
  onClick?: () => void
}

export function AgendaCard({ item, isActive = false, onClick }: AgendaCardProps) {
  const typeIcons: Record<string, string> = {
    bill: '\uD83D\uDCDD',
    resolution: '\uD83D\uDCC4',
    motion: '\u26A1',
    tribute: '\uD83C\uDF96',
    nomination: '\uD83C\uDFAD',
    other: '\uD83D\uDCCB',
  }

  const icon = typeIcons[item.itemType] || typeIcons.other

  // Generate Congress.gov URL for bill if we have a bill number
  const getBillUrl = () => {
    if (item.billUrl) return item.billUrl
    if (!item.billNumber) return null

    // Parse bill number and construct URL
    // Example: S.J. Res. 90 -> senate-joint-resolution/90
    const normalized = item.billNumber.toLowerCase().replace(/\s+/g, '')
    const match = normalized.match(/^(s|h|sj|hj|scon|hcon)(res|r)?\.?(\d+)$/i)

    if (!match) return null

    const typeMap: Record<string, string> = {
      's': 'senate-bill',
      'sr': 'senate-bill',
      'h': 'house-bill',
      'hr': 'house-bill',
      'sres': 'senate-resolution',
      'hres': 'house-resolution',
      'sjres': 'senate-joint-resolution',
      'hjres': 'house-joint-resolution',
      'sconres': 'senate-concurrent-resolution',
      'hconres': 'house-concurrent-resolution',
    }

    let key = match[1]
    if (match[2]) {
      key += match[2].toLowerCase() === 'res' ? 'res' : 'r'
    }

    const urlType = typeMap[key]
    if (!urlType) return null

    return `https://www.congress.gov/bill/119th-congress/${urlType}/${match[3]}`
  }

  const billUrl = getBillUrl()

  return (
    <div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all
        ${isActive
          ? 'border-[var(--democrat)] bg-blue-50 dark:bg-blue-950'
          : 'border-[var(--border)] hover:border-[var(--muted)]'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">
            {item.title || 'Untitled agenda item'}
          </p>
          {item.billNumber && (
            <p className="text-sm text-[var(--muted)] mt-1">
              {billUrl ? (
                <a
                  href={billUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.billNumber} &#8599;
                </a>
              ) : (
                item.billNumber
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
