// Хук с состоянием выполненных тренировок + операции.
// Хранится отдельно от шаблонов и автоматически пишется в localStorage.

import { useCallback, useEffect, useState } from 'react'
import type { CompletedWorkout, Workout, WorkoutSet } from '../types'
import { loadCompleted, saveCompleted } from '../utils/storage'
import {
  addExerciseTo,
  addSetTo,
  cloneExercises,
  removeExerciseFrom,
  removeSetFrom,
  renameExerciseIn,
  updateSetIn,
} from '../utils/workouts'
import { uid } from '../utils/id'

export function useCompletedWorkouts() {
  const [completed, setCompleted] = useState<CompletedWorkout[]>(() =>
    loadCompleted(),
  )

  useEffect(() => {
    saveCompleted(completed)
  }, [completed])

  // Отметить шаблон выполненным на дату (YYYY-MM-DD): снимаем копию упражнений.
  // exerciseIds — какие упражнения реально сделаны (если не задано — все).
  const completeTemplate = useCallback(
    (
      template: Workout,
      dayKeyValue: string,
      exerciseIds?: string[],
    ): CompletedWorkout => {
      const source = exerciseIds
        ? template.exercises.filter((e) => exerciseIds.includes(e.id))
        : template.exercises
      const record: CompletedWorkout = {
        id: uid(),
        personId: template.personId,
        templateId: template.id,
        name: template.name,
        date: dayKeyValue,
        createdAt: new Date().toISOString(),
        exercises: cloneExercises(source, uid),
      }
      setCompleted((prev) => [record, ...prev])
      return record
    },
    [],
  )

  const deleteCompleted = useCallback((id: string) => {
    setCompleted((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Каскадное удаление при удалении человека.
  const deleteCompletedByPerson = useCallback((personId: string) => {
    setCompleted((prev) => prev.filter((c) => c.personId !== personId))
  }, [])

  // Хелпер: применить трансформацию упражнений к нужной записи.
  const patchExercises = useCallback(
    (
      id: string,
      fn: (exercises: CompletedWorkout['exercises']) => CompletedWorkout['exercises'],
    ) => {
      setCompleted((prev) =>
        prev.map((c) => (c.id === id ? { ...c, exercises: fn(c.exercises) } : c)),
      )
    },
    [],
  )

  const renameCompleted = useCallback((id: string, name: string) => {
    setCompleted((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const addExercise = useCallback(
    (id: string, name: string) =>
      patchExercises(id, (ex) => addExerciseTo(ex, name, uid)),
    [patchExercises],
  )

  const updateExercise = useCallback(
    (id: string, exerciseId: string, name: string) =>
      patchExercises(id, (ex) => renameExerciseIn(ex, exerciseId, name)),
    [patchExercises],
  )

  const deleteExercise = useCallback(
    (id: string, exerciseId: string) =>
      patchExercises(id, (ex) => removeExerciseFrom(ex, exerciseId)),
    [patchExercises],
  )

  const addSet = useCallback(
    (id: string, exerciseId: string) =>
      patchExercises(id, (ex) => addSetTo(ex, exerciseId, uid)),
    [patchExercises],
  )

  const updateSet = useCallback(
    (
      id: string,
      exerciseId: string,
      setId: string,
      patch: Partial<Omit<WorkoutSet, 'id'>>,
    ) => patchExercises(id, (ex) => updateSetIn(ex, exerciseId, setId, patch)),
    [patchExercises],
  )

  const deleteSet = useCallback(
    (id: string, exerciseId: string, setId: string) =>
      patchExercises(id, (ex) => removeSetFrom(ex, exerciseId, setId)),
    [patchExercises],
  )

  return {
    completed,
    completeTemplate,
    deleteCompleted,
    deleteCompletedByPerson,
    renameCompleted,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  }
}

export type CompletedWorkoutsApi = ReturnType<typeof useCompletedWorkouts>
