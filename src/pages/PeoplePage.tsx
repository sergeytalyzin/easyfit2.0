import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Avatar } from '../components/Avatar'
import { AddPersonSheet } from '../components/AddPersonSheet'
import { formatDate } from '../utils/date'
import { lastWorkoutOf, workoutsOf, workoutTitle } from '../utils/workouts'
import styles from './PeoplePage.module.css'

export function PeoplePage() {
  const { people, favoriteId, createPerson, toggleFavorite } = usePeopleContext()
  const { workouts } = useWorkoutsContext()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  function onCreate(name: string, avatar: string | null) {
    const person = createPerson(name, avatar)
    setSheetOpen(false)
    navigate(`/person/${person.id}`)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}/>

      <Button full onClick={() => setSheetOpen(true)}>
        + Добавить человека
      </Button>

      {people.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👋</div>
          <p>Добавьте первого человека</p>
        </div>
      ) : (
        <div className={styles.list}>
          {people.map((p, i) => {
            const own = workoutsOf(workouts, p.id)
            const last = lastWorkoutOf(workouts, p.id)
            const isFavorite = favoriteId === p.id
            return (
              <Card
                key={p.id}
                className={`${styles.item} appear`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                onClick={() => navigate(`/person/${p.id}`)}
              >
                <Avatar name={p.name} avatar={p.avatar} size={54} />
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{p.name}</span>
                    {isFavorite && <span className={styles.badge}>Основной</span>}
                  </div>
                  {own.length === 0 ? (
                    <div className={styles.meta}>Тренировок пока нет</div>
                  ) : (
                    <>
                      {last && (
                        <div className={styles.last}>
                          Последняя: {workoutTitle(last)}
                        </div>
                      )}
                      <div className={styles.meta}>
                        {own.length} {pluralWorkouts(own.length)}
                        {last ? ` · ${formatDate(last.date)}` : ''}
                      </div>
                    </>
                  )}
                </div>
                <button
                  className={`${styles.star} ${isFavorite ? styles.starOn : ''}`}
                  aria-label={isFavorite ? 'Снять основного' : 'Сделать основным'}
                  aria-pressed={isFavorite}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(p.id)
                  }}
                >
                  {isFavorite ? '★' : '☆'}
                </button>
              </Card>
            )
          })}
        </div>
      )}

      <AddPersonSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreate={onCreate}
      />
    </div>
  )
}

function pluralWorkouts(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'тренировка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'тренировки'
  return 'тренировок'
}
