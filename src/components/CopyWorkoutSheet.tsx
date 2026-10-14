import { BottomSheet } from './BottomSheet'
import { Avatar } from './Avatar'
import type { Person } from '../types'
import styles from './CopyWorkoutSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  people: Person[]
  currentPersonId: string
  onPick: (personId: string) => void
}

// Выбор человека, которому копируем тренировку. Текущий владелец
// помечен, но копировать самому себе тоже можно (быстрый дубликат).
export function CopyWorkoutSheet({
  open,
  onClose,
  people,
  currentPersonId,
  onPick,
}: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className={styles.title}>Скопировать тренировку</h2>
      <div className={styles.list}>
        {people.map((p) => (
          <button key={p.id} className={styles.row} onClick={() => onPick(p.id)}>
            <Avatar name={p.name} avatar={p.avatar} size={44} />
            <span className={styles.name}>{p.name}</span>
            {p.id === currentPersonId && (
              <span className={styles.hint}>здесь же</span>
            )}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
