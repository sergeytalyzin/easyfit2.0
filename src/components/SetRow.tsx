import type { WorkoutSet } from '../types'
import styles from './SetRow.module.css'

interface Props {
  index: number
  set: WorkoutSet
  onChange: (patch: Partial<Omit<WorkoutSet, 'id'>>) => void
  onDelete: () => void
}

export function SetRow({ index, set, onChange, onDelete }: Props) {
  return (
    <div className={`${styles.row} appear`}>
      <span className={styles.num}>{index + 1}</span>

      <label className={styles.field}>
        <input
          className={styles.input}
          type="number"
          inputMode="decimal"
          min={0}
          step={2.5}
          value={set.weight === 0 ? '' : set.weight}
          placeholder="0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })}
        />
        <span className={styles.unit}>кг</span>
      </label>

      <span className={styles.times}>×</span>

      <label className={styles.field}>
        <input
          className={styles.input}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={set.reps === 0 ? '' : set.reps}
          placeholder="0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange({ reps: Number(e.target.value) || 0 })}
        />
        <span className={styles.unit}>повт</span>
      </label>

      <button className={styles.delete} onClick={onDelete} aria-label="Удалить подход">
        ✕
      </button>
    </div>
  )
}
