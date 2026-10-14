import { useEffect, type ReactNode } from 'react'
import styles from './BottomSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: Props) {
  // Блокируем прокрутку фона, пока шит открыт.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.grabber} />
        {children}
      </div>
    </div>
  )
}
