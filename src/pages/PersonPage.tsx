import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Avatar } from '../components/Avatar'
import { formatDate } from '../utils/date'
import { lastWorkoutOf, workoutsOf } from '../utils/workouts'
import type { Workout } from '../types'
import styles from './PersonPage.module.css'

export function PersonPage() {
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const { people, favoriteId, deletePerson, toggleFavorite } = usePeopleContext()
  const { workouts, deleteWorkoutsByPerson } = useWorkoutsContext()
  const { deleteCompletedByPerson } = useCompletedWorkoutsContext()

  const person = people.find((p) => p.id === personId)

  if (!person) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate('/')}>
          ‹ Назад
        </button>
        <p className={styles.missing}>Человек не найден.</p>
      </div>
    )
  }

  // Тренировки конкретного человека — фильтр по personId.
  const own = workoutsOf(workouts, person.id)
  const last = lastWorkoutOf(workouts, person.id)
  const isFavorite = favoriteId === person.id

  function onDeletePerson() {
    if (confirm(`Удалить «${person!.name}» и все его тренировки?`)) {
      deleteWorkoutsByPerson(person!.id)
      deleteCompletedByPerson(person!.id)
      deletePerson(person!.id)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/')}>
        ‹ Назад
      </button>

      <header className={`${styles.profile} appear`}>
        <Avatar name={person.name} avatar={person.avatar} size={96} />
        <h1 className={styles.name}>{person.name}</h1>
        <p className={styles.stats}>
          {own.length === 0
            ? 'Пока нет тренировок'
            : `${own.length} трен.${last ? ` · последняя ${formatDate(last.date)}` : ''}`}
        </p>
        <button
          className={`${styles.favBtn} ${isFavorite ? styles.favBtnOn : ''}`}
          onClick={() => toggleFavorite(person.id)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '★ Основной' : '☆ Сделать основным'}
        </button>
      </header>

      <Button
        full
        onClick={() => navigate(`/person/${person.id}/progress`)}
      >
        📅 Прогресс
      </Button>

      {/* Шаблоны тренировок — внутри открываешь и отмечаешь выполнение */}
      <h2 className={styles.section}>Шаблоны тренировок</h2>

      <Button
        full
        variant="secondary"
        onClick={() => navigate(`/person/${person.id}/new`)}
      >
        + Новый шаблон
      </Button>

      {own.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏋️</div>
          <p>Создайте первый шаблон тренировки</p>
        </div>
      ) : (
        <div className={styles.list}>
          {own.map((w, i) => (
            <div
              key={w.id}
              className="appear"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <TemplateCard
                workout={w}
                onOpen={() => navigate(`/person/${person.id}/workout/${w.id}`)}
              />
            </div>
          ))}
        </div>
      )}

      <button className={styles.deletePerson} onClick={onDeletePerson}>
        Удалить человека
      </button>
    </div>
  )
}

// Сворачиваемая карточка шаблона: свёрнуто — только название, развёрнуто —
// все упражнения с подходами. «Открыть» ведёт в полный редактор.
function TemplateCard({
  workout,
  onOpen,
}: {
  workout: Workout
  onOpen: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Card className={styles.tplCard}>
      <button
        className={styles.tplHead}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.wName}>{workout.name}</span>
        <span className={styles.tplCount}>{workout.exercises.length} упр.</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          ›
        </span>
      </button>

      {open && (
        <div className={styles.tplBody}>
          {workout.exercises.length === 0 ? (
            <p className={styles.tplEmpty}>Упражнений пока нет</p>
          ) : (
            <ul className={styles.exList}>
              {workout.exercises.map((ex) => (
                <li key={ex.id} className={styles.exRow}>
                  <span className={styles.exName}>{ex.name || 'Без названия'}</span>
                  <span className={styles.exSets}>
                    {ex.sets.length
                      ? ex.sets.slice(0,3).map((s) => `${s.weight}×${s.reps}`).join(', ')
                      : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Button full variant="secondary" onClick={onOpen}>
            Открыть
          </Button>
        </div>
      )}
    </Card>
  )
}
