import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import { ExerciseItem } from '../components/ExerciseItem'
import { Button } from '../components/Button'
import { CopyWorkoutSheet } from '../components/CopyWorkoutSheet'
import { MarkWorkoutSheet } from '../components/MarkWorkoutSheet'
import { formatDate } from '../utils/date'
import { fireConfetti } from '../utils/confetti'
import styles from './WorkoutPage.module.css'

export function WorkoutPage() {
  const { id = '', personId = '' } = useParams()
  const navigate = useNavigate()
  const backToPerson = `/person/${personId}`
  const [copyOpen, setCopyOpen] = useState(false)
  const [markOpen, setMarkOpen] = useState(false)
  const { people } = usePeopleContext()
  const { completed, completeTemplate } = useCompletedWorkoutsContext()
  const {
    workouts,
    updateWorkout,
    copyWorkout,
    deleteWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  } = useWorkoutsContext()

  // Дни с уже отмеченными тренировками — для точек в календаре.
  const markedKeys = useMemo(
    () =>
      new Set(
        completed.filter((c) => c.personId === personId).map((c) => c.date),
      ),
    [completed, personId],
  )

  const workout = workouts.find((w) => w.id === id)

  if (!workout) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate(backToPerson)}>
          ‹ Назад
        </button>
        <p className={styles.missing}>Тренировка не найдена.</p>
      </div>
    )
  }

  function onDeleteWorkout() {
    if (confirm('Удалить тренировку целиком?')) {
      deleteWorkout(workout!.id)
      navigate(backToPerson, { replace: true })
    }
  }

  function onCopyTo(targetPersonId: string) {
    const copy = copyWorkout(workout!.id, targetPersonId)
    setCopyOpen(false)
    if (copy) navigate(`/person/${targetPersonId}/workout/${copy.id}`)
  }

  function onMarkDone(dayKeyValue: string, exerciseIds: string[]) {
    const record = completeTemplate(workout!, dayKeyValue, exerciseIds)
    if (!record) return // при неуспехе — без конфетти
    setMarkOpen(false)
    fireConfetti()
    navigate(`/person/${personId}/progress`)
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(backToPerson)}>
        ‹ Назад
      </button>

      <div className={styles.head}>
        <input
          className={styles.title}
          value={workout.name}
          placeholder="Название тренировки"
          onChange={(e) => updateWorkout(workout.id, { name: e.target.value })}
        />
        <div className={styles.date}>{formatDate(workout.date)}</div>
      </div>

      <Button full onClick={() => setMarkOpen(true)}>
        ✓ Отметить выполнение
      </Button>

      <div className={styles.exercises}>
        {workout.exercises.map((ex) => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            onRename={(name) => updateExercise(workout.id, ex.id, name)}
            onDelete={() => deleteExercise(workout.id, ex.id)}
            onAddSet={() => addSet(workout.id, ex.id)}
            onUpdateSet={(setId, patch) => updateSet(workout.id, ex.id, setId, patch)}
            onDeleteSet={(setId) => deleteSet(workout.id, ex.id, setId)}
          />
        ))}
      </div>

      <Button full variant="secondary" onClick={() => addExercise(workout.id, '')}>
        + упражнение
      </Button>

      <Button full variant="secondary" onClick={() => setCopyOpen(true)}>
        ⧉ Копировать другому
      </Button>

      <button className={styles.deleteWorkout} onClick={onDeleteWorkout}>
        Удалить тренировку
      </button>

      <CopyWorkoutSheet
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        people={people}
        currentPersonId={personId}
        onPick={onCopyTo}
      />

      <MarkWorkoutSheet
        open={markOpen}
        onClose={() => setMarkOpen(false)}
        template={workout}
        markedKeys={markedKeys}
        onSave={onMarkDone}
      />
    </div>
  )
}
