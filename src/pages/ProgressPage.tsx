import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import type { CompletedWorkout } from '../types'
import { dayKey, formatDayKey } from '../utils/date'
import { exerciseStats, type ExerciseStat } from '../utils/workouts'
import styles from './ProgressPage.module.css'

const DAYS = 14

export function ProgressPage() {
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const { people } = usePeopleContext()
  const { completed, deleteCompletedByPerson } = useCompletedWorkoutsContext()

  const person = people.find((p) => p.id === personId)
  // Выполненные тренировки человека, свежие сверху.
  const own = completed
    .filter((c) => c.personId === personId)
    .sort((a, b) =>
      a.date === b.date
        ? b.createdAt.localeCompare(a.createdAt)
        : b.date.localeCompare(a.date),
    )

  // Прогресс по весам считаем по фактически выполненным тренировкам.
  const weightStats = exerciseStats(own)

  function onClear() {
    if (confirm('Очистить весь прогресс? Выполненные тренировки будут удалены.')) {
      deleteCompletedByPerson(personId)
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/person/${personId}`)}>
        ‹ Назад
      </button>

      <h1 className={styles.title}>Прогресс</h1>
      {person && <p className={styles.subtitle}>{person.name}</p>}

      {own.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📅</div>
          <p>Отметьте выполнение тренировки в шаблоне.</p>
        </div>
      ) : (
        <>
          <ActivityChart items={own} />

          {weightStats.length > 0 && (
            <>
              <h2 className={styles.section}>Прогресс по весам</h2>
              {weightStats.map((stat) => (
                <WeightCard key={stat.name} stat={stat} />
              ))}
            </>
          )}

          <h2 className={styles.section}>История</h2>
          <div className={styles.list}>
            {own.map((c, i) => (
              <Link
                key={c.id}
                to={`/person/${personId}/completed/${c.id}`}
                className={`${styles.link} appear`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className={`${styles.glass} ${styles.entry}`}>
                  <div className={styles.dateBox}>
                    <span className={styles.date}>{formatDayKey(c.date)}</span>
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>{c.name}</div>
                    <div className={styles.meta}>{c.exercises.length} упр.</div>
                  </div>
                  <span className={styles.chevron}>›</span>
                </div>
              </Link>
            ))}
          </div>

          <button className={styles.clear} onClick={onClear}>
            Очистить прогресс
          </button>
        </>
      )}
    </div>
  )
}

// Красивый график активности по дням за последние DAYS дней.
// Столбики тапаются — показываем дату и число тренировок.
function ActivityChart({ items }: { items: CompletedWorkout[] }) {
  const today = new Date()

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    d.setDate(d.getDate() - (DAYS - 1 - i))
    return { key: dayKey(d), label: d.getDate() }
  })

  const counts = days.map((d) => items.filter((c) => c.date === d.key).length)
  const max = Math.max(1, ...counts)
  const [sel, setSel] = useState(DAYS - 1)

  const monthKey = dayKey(today).slice(0, 7)
  const thisMonth = items.filter((c) => c.date.slice(0, 7) === monthKey).length

  return (
    <div className={`${styles.glass} ${styles.chartCard} appear`}>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{items.length}</span>
          <span className={styles.statLabel}>всего</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{thisMonth}</span>
          <span className={styles.statLabel}>в этом месяце</span>
        </div>
      </div>

      <div className={styles.readout}>
        {formatDayKey(days[sel].key)} · {counts[sel]}{' '}
        {counts[sel] === 1 ? 'тренировка' : 'трен.'}
      </div>

      <div className={styles.chart}>
        {days.map((d, i) => (
          <div key={d.key} className={styles.col}>
            <div className={styles.barTrack}>
              <button
                className={`${styles.bar} ${counts[i] === 0 ? styles.barEmpty : ''} ${
                  i === sel ? styles.barSel : ''
                }`}
                style={{ height: `${(counts[i] / max) * 100}%` }}
                onClick={() => setSel(i)}
                aria-label={`${formatDayKey(d.key)}: ${counts[i]}`}
              />
            </div>
            <span className={styles.barLabel}>{d.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartCaption}>тренировок по дням</div>
    </div>
  )
}

// Компактная карточка прогресса по весам одного упражнения. Столбики тапаются —
// показываем, в какой день какой вес был.
function WeightCard({ stat }: { stat: ExerciseStat }) {
  const sessions = stat.sessions
  const [sel, setSel] = useState(sessions.length - 1)
  const cur = sessions[sel]
  const prev = sessions[sel - 1]
  const diff = prev ? cur.maxWeight - prev.maxWeight : 0
  const max = stat.bestWeight || 1

  return (
    <div className={`${styles.glass} ${styles.weightCard} appear`}>
      <div className={styles.weightTop}>
        <div className={styles.weightInfo}>
          <span className={styles.weightName}>{stat.name}</span>
          <span className={styles.weightSub}>
            {formatDayKey(cur.date)} · {cur.maxWeight} кг × {cur.topReps}
          </span>
        </div>
        <div className={styles.weightRight}>
          <span className={styles.weightNum}>{cur.maxWeight} кг</span>
          {prev && (
            <span
              className={`${styles.trend} ${
                diff > 0 ? styles.up : diff < 0 ? styles.down : styles.flat
              }`}
            >
              {diff > 0 ? `↑+${diff}` : diff < 0 ? `↓${diff}` : '→'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.weightChart}>
        {sessions.map((s, i) => (
          <button
            key={i}
            className={`${styles.wBar} ${
              s.maxWeight === stat.bestWeight ? styles.wBarBest : ''
            } ${i === sel ? styles.wBarSel : ''}`}
            style={{ height: `${Math.max(8, (s.maxWeight / max) * 100)}%` }}
            onClick={() => setSel(i)}
            aria-label={`${formatDayKey(s.date)} ${s.maxWeight} кг`}
          />
        ))}
      </div>
    </div>
  )
}
