import React from 'react'
import { clsx } from 'clsx'
import { UserIcon } from '@heroicons/react/24/solid'
import StatusIndicator from './StatusIndicator'

const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  status = null, 
  showStatus = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  }

  const statusSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    '2xl': 'lg',
  }

  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full bg-gray-200 flex items-center justify-center',
            sizeClasses[size]
          )}
        >
          <UserIcon className="w-1/2 h-1/2 text-gray-400" />
        </div>
      )}
      
      {showStatus && status && (
        <div className="absolute -bottom-0 -right-0">
          <StatusIndicator 
            status={status} 
            size={statusSizes[size]} 
          />
        </div>
      )}
    </div>
  )
}

export default Avatar