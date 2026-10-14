import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
}

export function Button({ variant = 'primary', full, className = '', ...rest }: Props) {
  const cls = [styles.btn, styles[variant], full ? styles.full : '', className]
    .filter(Boolean)
    .join(' ')
  return <button className={cls} {...rest} />
}
