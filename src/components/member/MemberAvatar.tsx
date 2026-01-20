'use client'

import { PartyBadge } from '../shared/PartyBadge'

interface MemberAvatarProps {
  firstName: string
  lastName: string
  party: 'D' | 'R' | 'I' | string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function MemberAvatar({
  firstName,
  lastName,
  party,
  photoUrl,
  size = 'md',
  showBadge = true,
}: MemberAvatarProps) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }

  const badgePosition = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: '-bottom-1 -right-1',
  }

  const partyColors = {
    D: 'bg-blue-100 text-blue-700',
    R: 'bg-red-100 text-red-700',
    I: 'bg-purple-100 text-purple-700',
  }

  const colorClass = partyColors[party as keyof typeof partyColors] || 'bg-gray-100 text-gray-700'

  return (
    <div className="relative inline-block">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold`}
        >
          {initials}
        </div>
      )}
      {showBadge && (
        <div className={`absolute ${badgePosition[size]}`}>
          <PartyBadge party={party} size={size === 'lg' ? 'md' : 'sm'} />
        </div>
      )}
    </div>
  )
}
