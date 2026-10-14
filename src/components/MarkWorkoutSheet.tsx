import { useEffect, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Calendar } from './Calendar'
import { dayKey } from '../utils/date'
import type { Workout } from '../types'
import styles from './MarkWorkoutSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  template: Workout
  markedKeys: Set<string>
  onSave: (dayKeyValue: string, exerciseIds: string[]) => void
}

// Отметить выполнение шаблона: выбрать дату, отметить сделанные упражнения,
// сохранить или отменить. Календарь внутри попапа — не мешает на экране.
export function MarkWorkoutSheet({
  open,
  onClose,
  template,
  markedKeys,
  onSave,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(() => dayKey(new Date()))
  const [checked, setChecked] = useState<Set<string>>(new Set())

  // При открытии: дата — сегодня, все упражнения отмечены сделанными.
  useEffect(() => {
    if (open) {
      setSelectedDate(dayKey(new Date()))
      setChecked(new Set(template.exercises.map((e) => e.id)))
    }
  }, [open, template])

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function save() {
    if (checked.size === 0) return
    onSave(selectedDate, [...checked])
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className={styles.title}>Отметить «{template.name}»</h2>

      <Calendar
        flat
        selectedKey={selectedDate}
        markedKeys={markedKeys}
        onSelect={setSelectedDate}
      />

      {template.exercises.length === 0 ? (
        <p className={styles.empty}>В шаблоне пока нет упражнений.</p>
      ) : (
        <>
          <p className={styles.subhead}>Какие упражнения сделали?</p>
          <div className={styles.list}>
            {template.exercises.map((ex) => {
              const on = checked.has(ex.id)
              return (
                <button
                  key={ex.id}
                  className={`${styles.row} ${on ? styles.rowOn : ''}`}
                  onClick={() => toggle(ex.id)}
                >
                  <span className={styles.check}>{on ? '✓' : ''}</span>
                  <span className={styles.name}>{ex.name || 'Без названия'}</span>
                  <span className={styles.count}>{ex.sets.length} подх.</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <Button full variant="secondary" onClick={onClose}>
          Отменить
        </Button>
        <Button full disabled={checked.size === 0} onClick={save}>
          Сохранить
        </Button>
      </div>
    </BottomSheet>
  )
}
