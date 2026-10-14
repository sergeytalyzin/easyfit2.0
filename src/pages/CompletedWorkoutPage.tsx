import { useNavigate, useParams } from 'react-router-dom'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import { ExerciseItem } from '../components/ExerciseItem'
import { Button } from '../components/Button'
import { formatDayKeyFull } from '../utils/date'
import styles from './CompletedWorkoutPage.module.css'

export function CompletedWorkoutPage() {
  const { logId = '', personId = '' } = useParams()
  const navigate = useNavigate()
  const {
    completed,
    renameCompleted,
    deleteCompleted,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  } = useCompletedWorkoutsContext()

  const record = completed.find((c) => c.id === logId)

  if (!record) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          ‹ Назад
        </button>
        <p className={styles.missing}>Запись не найдена.</p>
      </div>
    )
  }

  function onDelete() {
    if (confirm('Удалить эту выполненную тренировку?')) {
      deleteCompleted(record!.id)
      navigate(`/person/${personId}/progress`, { replace: true })
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        ‹ Назад
      </button>

      <div className={styles.head}>
        <input
          className={styles.title}
          value={record.name}
          placeholder="Название тренировки"
          onChange={(e) => renameCompleted(record.id, e.target.value)}
        />
        <div className={styles.date}>{formatDayKeyFull(record.date)}</div>
      </div>

      <div className={styles.exercises}>
        {record.exercises.map((ex) => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            onRename={(name) => updateExercise(record.id, ex.id, name)}
            onDelete={() => deleteExercise(record.id, ex.id)}
            onAddSet={() => addSet(record.id, ex.id)}
            onUpdateSet={(setId, patch) => updateSet(record.id, ex.id, setId, patch)}
            onDeleteSet={(setId) => deleteSet(record.id, ex.id, setId)}
          />
        ))}
      </div>

      <Button full variant="secondary" onClick={() => addExercise(record.id, '')}>
        + упражнение
      </Button>

      <button className={styles.deleteWorkout} onClick={onDelete}>
        Удалить запись
      </button>
    </div>
  )
}
