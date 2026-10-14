import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { Button } from '../components/Button'
import styles from './NewWorkoutPage.module.css'

// Быстрые подсказки названий — минимум ввода для частых тренировок.
const PRESETS = ['Грудь', 'Спина', 'Ноги', 'Руки', 'Плечи']

export function NewWorkoutPage() {
  const { personId = '' } = useParams()
  const { createWorkout } = useWorkoutsContext()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  function create(value: string) {
    const workout = createWorkout(personId, value)
    navigate(`/person/${personId}/workout/${workout.id}`, { replace: true })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    create(name)
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/person/${personId}`)}>
        ‹ Назад
      </button>

      <h1 className={styles.title}>Новая тренировка</h1>

      <form onSubmit={onSubmit} className={styles.form}>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название тренировки"
          autoFocus
          enterKeyHint="done"
        />

        <div className={styles.presets}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={styles.chip}
              onClick={() => create(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <Button type="submit" full disabled={!name.trim()}>
          Создать
        </Button>
      </form>
    </div>
  )
}
