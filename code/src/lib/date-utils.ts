import { format } from 'date-fns'

/**
 * Format a date stored in UTC without timezone shift.
 * Database dates are stored at midnight UTC, so we need to
 * parse them as local dates to avoid off-by-one errors.
 */
export function formatSessionDate(date: Date | string, formatStr: string = 'MMMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const dateStr = dateObj.toISOString().split('T')[0]
  const [year, month, day] = dateStr.split('-').map(Number)
  return format(new Date(year, month - 1, day), formatStr)
}
