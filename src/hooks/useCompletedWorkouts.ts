// Хук с состоянием выполненных тренировок + операции.
// Хранится отдельно от шаблонов и автоматически пишется в localStorage.

import { useCallback, useEffect, useState } from 'react'
import type { CompletedWorkout, Exercise, SetPlan, Workout, WorkoutSet } from '../types'
import { loadCompleted, saveCompleted } from '../utils/storage'
import {
  addExerciseTo,
  addSetTo,
  addSetsTo,
  removeExerciseFrom,
  removeSetFrom,
  renameExerciseIn,
  updateSetIn,
} from '../utils/workouts'
import { uid } from '../utils/id'
import { isEffectiveSet, planOf } from '../utils/sets'
import { sameExercise } from '../utils/exercises'

export function useCompletedWorkouts() {
  const [completed, setCompleted] = useState<CompletedWorkout[]>(() =>
    loadCompleted(),
  )

  useEffect(() => {
    saveCompleted(completed)
  }, [completed])

  // Отметить шаблон выполненным на дату (YYYY-MM-DD) — начать запись факта.
  // exerciseIds — какие упражнения реально сделаны (если не задано — все).
  // Каждый подход: снимок плана + факт, подставленный из прошлого результата
  // по этому упражнению (или нижняя граница плана), пока не отмеченный ✓.
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
        exercises: source.map((ex) => {
          const last = lastResult(completed, ex, dayKeyValue)
          return {
            id: uid(),
            name: ex.name,
            catalogId: ex.catalogId,
            sets: ex.sets.map((s, i) => ({
              id: uid(),
              weight: last[i]?.weight ?? s.weight,
              reps: last[i]?.reps ?? s.reps,
              done: false,
              plan: planOf(s),
            })),
          }
        }),
      }
      setCompleted((prev) => [record, ...prev])
      return record
    },
    [completed],
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
    (id: string, name: string, catalogId?: string) =>
      patchExercises(id, (ex) => addExerciseTo(ex, name, uid, catalogId)),
    [patchExercises],
  )

  const updateExercise = useCallback(
    (id: string, exerciseId: string, name: string, catalogId?: string) =>
      patchExercises(id, (ex) => renameExerciseIn(ex, exerciseId, name, catalogId)),
    [patchExercises],
  )

  // Преобразование упражнений во всех записях — для синхронизации со справочником.
  const mapAllExercises = useCallback((fn: (e: Exercise) => Exercise) => {
    setCompleted((prev) =>
      prev.map((c) => ({ ...c, exercises: c.exercises.map(fn) })),
    )
  }, [])

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

  const addSets = useCallback(
    (id: string, exerciseId: string, count: number, plan: SetPlan) =>
      patchExercises(id, (ex) => addSetsTo(ex, exerciseId, count, plan, uid)),
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
    mapAllExercises,
    addSet,
    addSets,
    updateSet,
    deleteSet,
  }
}

export type CompletedWorkoutsApi = ReturnType<typeof useCompletedWorkouts>

// Выполненные подходы упражнения из последней записи не позже даты day.
function lastResult(
  records: CompletedWorkout[],
  exercise: Exercise,
  day: string,
): WorkoutSet[] {
  const sorted = records
    .filter((r) => r.date <= day)
    .sort((a, b) =>
      a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
    )
  for (const r of sorted) {
    const sets = r.exercises
      .filter((e) => sameExercise(e, exercise))
      .flatMap((e) => e.sets.filter(isEffectiveSet))
    if (sets.length) return sets
  }
  return []
}
