import { useState } from 'react'
import { dayKey } from '../utils/date'
import styles from './Calendar.module.css'

interface Props {
  selectedKey: string // выбранный день YYYY-MM-DD
  markedKeys: Set<string> // дни, в которые есть выполненные тренировки
  onSelect: (key: string) => void
  flat?: boolean // без фона-карточки — для встраивания в шит
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Простой календарь в стиле iOS: месяц, навигация по месяцам, точки на днях
// с тренировками. Без сторонних библиотек.
export function Calendar({ selectedKey, markedKeys, onSelect, flat }: Props) {
  const initial = parseKey(selectedKey)
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  })

  const todayKey = dayKey(new Date())
  const first = new Date(view.year, view.month, 1)
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  // Сдвиг: делаем неделю с понедельника (JS getDay: 0 = воскресенье).
  const lead = (first.getDay() + 6) % 7

  const monthLabel = first.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const cells: Array<number | null> = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className={`${styles.calendar} ${flat ? styles.flat : ''}`}>
      <div className={styles.header}>
        <button
          className={styles.nav}
          onClick={() => shiftMonth(-1)}
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <span className={styles.month}>{monthLabel}</span>
        <button
          className={styles.nav}
          onClick={() => shiftMonth(1)}
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((w) => (
          <span key={w} className={styles.weekday}>
            {w}
          </span>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />
          const key = dayKey(new Date(view.year, view.month, day))
          const isSelected = key === selectedKey
          const isToday = key === todayKey
          const marked = markedKeys.has(key)
          return (
            <button
              key={key}
              className={[
                styles.day,
                isSelected ? styles.selected : '',
                isToday && !isSelected ? styles.today : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(key)}
            >
              {day}
              {marked && <span className={styles.dot} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
