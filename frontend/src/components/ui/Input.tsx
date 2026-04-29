import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-neon ${error ? 'border-[var(--neon-pink)]' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[10px] text-[var(--neon-pink)] mt-1">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input