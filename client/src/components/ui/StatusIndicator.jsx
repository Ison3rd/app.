import React from 'react'
import { clsx } from 'clsx'

const StatusIndicator = ({ status, size = 'md', showText = false, className = '' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'status-online'
      case 'busy':
        return 'status-busy'
      case 'away':
        return 'status-away'
      case 'offline':
      default:
        return 'status-offline'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'busy':
        return 'Busy'
      case 'away':
        return 'Away'
      case 'offline':
      default:
        return 'Offline'
    }
  }

  return (
    <div className={clsx('flex items-center', className)}>
      <div
        className={clsx(
          'status-dot',
          getStatusColor(status),
          sizeClasses[size]
        )}
      />
      {showText && (
        <span className="ml-2 text-sm text-gray-600">
          {getStatusText(status)}
        </span>
      )}
    </div>
  )
}

export default StatusIndicator