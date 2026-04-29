import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  glow?: 'cyan' | 'orange' | 'yellow' | 'green' | 'pink'
}

const glowColors = {
  cyan: {
    border: 'rgba(0,245,255,0.35)',
    shadow: '0 0 15px rgba(0,245,255,0.1)',
  },
  orange: {
    border: 'rgba(255,107,0,0.35)',
    shadow: '0 0 15px rgba(255,107,0,0.1)',
  },
  yellow: {
    border: 'rgba(245,230,66,0.35)',
    shadow: '0 0 15px rgba(245,230,66,0.1)',
  },
  green: {
    border: 'rgba(57,255,20,0.35)',
    shadow: '0 0 15px rgba(57,255,20,0.1)',
  },
  pink: {
    border: 'rgba(255,45,120,0.35)',
    shadow: '0 0 15px rgba(255,45,120,0.1)',
  },
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  glow = 'cyan',
}) => {
  const glowStyle = glowColors[glow] || glowColors.cyan

  return (
    <div
      className={`card-neon p-5 ${className}`}
      style={{
        borderColor: glowStyle.border,
        boxShadow: glowStyle.shadow,
        background: 'var(--bg-card)',
        transition: 'all 0.25s',
      }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="panel-title">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

export default Card