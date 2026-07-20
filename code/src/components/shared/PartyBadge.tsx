'use client'

interface PartyBadgeProps {
  party: 'D' | 'R' | 'I' | string
  size?: 'sm' | 'md'
}

export function PartyBadge({ party, size = 'sm' }: PartyBadgeProps) {
  const colors = {
    D: 'bg-[var(--democrat)]',
    R: 'bg-[var(--republican)]',
    I: 'bg-[var(--independent)]',
  }

  const labels = {
    D: 'D',
    R: 'R',
    I: 'I',
  }

  const bgColor = colors[party as keyof typeof colors] || 'bg-gray-400'
  const label = labels[party as keyof typeof labels] || party

  const sizeClasses = size === 'sm'
    ? 'w-4 h-4 text-[10px]'
    : 'w-5 h-5 text-xs'

  return (
    <span
      className={`${bgColor} ${sizeClasses} rounded-full text-white font-bold flex items-center justify-center`}
    >
      {label}
    </span>
  )
}
