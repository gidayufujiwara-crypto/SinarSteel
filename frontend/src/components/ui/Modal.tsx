import React from 'react'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onConfirm?: () => void
  confirmText?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'KONFIRMASI',
  confirmVariant = 'primary',
  isLoading,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="card-neon p-6 w-full max-w-md mx-4"
        style={{ borderColor: 'rgba(0,245,255,0.3)' }}
      >
        <h3
          className="text-lg font-bold mb-4 uppercase tracking-[2px] font-orbitron"
          style={{ color: 'var(--neon-cyan)' }}
        >
          {title}
        </h3>
        <div className="mb-4 text-sm text-text-dim font-rajdhani">{children}</div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            BATAL
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal