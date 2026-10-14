import { gradientFor, initialOf } from '../utils/avatar'
import styles from './Avatar.module.css'

interface Props {
  name: string
  avatar?: string | null
  size?: number
}

export function Avatar({ name, avatar, size = 52 }: Props) {
  const style = { width: size, height: size, fontSize: size * 0.42 }

  if (avatar) {
    return (
      <div className={styles.avatar} style={style}>
        <img src={avatar} alt={name} className={styles.img} />
      </div>
    )
  }

  return (
    <div
      className={styles.avatar}
      style={{ ...style, background: gradientFor(name) }}
    >
      <span className={styles.initial}>{initialOf(name)}</span>
    </div>
  )
}
