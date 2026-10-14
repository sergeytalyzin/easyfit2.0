import { useState } from 'react'
import type { Exercise } from '../types'
import { Card } from './Card'
import { Button } from './Button'
import { SetRow } from './SetRow'
import styles from './ExerciseItem.module.css'

interface Props {
  exercise: Exercise
  onRename: (name: string) => void
  onDelete: () => void
  onAddSet: () => void
  onUpdateSet: (setId: string, patch: { weight?: number; reps?: number }) => void
  onDeleteSet: (setId: string) => void
}

export function ExerciseItem({
  exercise,
  onRename,
  onDelete,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}: Props) {
  // По умолчанию упражнение свёрнуто — список компактный при открытии тренировки.
  const [open, setOpen] = useState(false)

  return (
    <Card className={`${styles.card} appear`}>
      <div className={styles.header}>
        <button
          className={styles.toggle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Свернуть упражнение' : 'Развернуть упражнение'}
        >
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
            ›
          </span>
        </button>
        <input
          className={styles.name}
          value={exercise.name}
          placeholder="Упражнение"
          onChange={(e) => onRename(e.target.value)}
        />
        <span className={styles.count}>{exercise.sets.length} подх.</span>
        <button className={styles.remove} onClick={onDelete} aria-label="Удалить упражнение">
          ✕
        </button>
      </div>

      {open && (
        <>
          {exercise.sets.length > 0 && (
            <div className={styles.sets}>
              {exercise.sets.map((set, i) => (
                <SetRow
                  key={set.id}
                  index={i}
                  set={set}
                  onChange={(patch) => onUpdateSet(set.id, patch)}
                  onDelete={() => onDeleteSet(set.id)}
                />
              ))}
            </div>
          )}

          <Button variant="secondary" full onClick={onAddSet} className={styles.addSet}>
            + подход
          </Button>
        </>
      )}
    </Card>
  )
}
