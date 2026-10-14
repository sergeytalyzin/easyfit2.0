// Хук с состоянием всех тренировок + операции CRUD.
// Автоматически сохраняет любые изменения в localStorage.

import { useCallback, useEffect, useState } from 'react'
import type { Exercise, Workout, WorkoutSet } from '../types'
import { loadWorkouts, saveWorkouts } from '../utils/storage'
import { cloneSets } from '../utils/workouts'
import { uid } from '../utils/id'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts())

  // Любое изменение списка сразу пишем в localStorage.
  useEffect(() => {
    saveWorkouts(workouts)
  }, [workouts])

  const createWorkout = useCallback((personId: string, name: string): Workout => {
    const workout: Workout = {
      id: uid(),
      personId,
      name: name.trim() || 'Без названия',
      date: new Date().toISOString(),
      exercises: [],
    }
    setWorkouts((prev) => [workout, ...prev])
    return workout
  }, [])

  // Копирование тренировки другому человеку (или себе же).
  // Создаём независимый дубликат: новые id у тренировки, упражнений и
  // подходов, дата — текущая, привязка к выбранному человеку.
  const copyWorkout = useCallback(
    (workoutId: string, targetPersonId: string): Workout | null => {
      const src = workouts.find((w) => w.id === workoutId)
      if (!src) return null
      const copy: Workout = {
        id: uid(),
        personId: targetPersonId,
        name: src.name,
        date: new Date().toISOString(),
        exercises: src.exercises.map((e) => ({
          id: uid(),
          name: e.name,
          sets: cloneSets(e.sets, uid),
        })),
      }
      setWorkouts((prev) => [copy, ...prev])
      return copy
    },
    [workouts],
  )

  // Удаление всех тренировок человека — для каскадного удаления профиля.
  const deleteWorkoutsByPerson = useCallback((personId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.personId !== personId))
  }, [])

  const updateWorkout = useCallback(
    (id: string, patch: Partial<Omit<Workout, 'id'>>) => {
      setWorkouts((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      )
    },
    [],
  )

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }, [])

  // --- Упражнения ---

  const addExercise = useCallback((workoutId: string, name: string) => {
    const exercise: Exercise = { id: uid(), name: name.trim(), sets: [] }
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: [...w.exercises, exercise] }
          : w,
      ),
    )
  }, [])

  const updateExercise = useCallback(
    (workoutId: string, exerciseId: string, name: string) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exerciseId ? { ...e, name } : e,
                ),
              }
            : w,
        ),
      )
    },
    [],
  )

  const deleteExercise = useCallback(
    (workoutId: string, exerciseId: string) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? { ...w, exercises: w.exercises.filter((e) => e.id !== exerciseId) }
            : w,
        ),
      )
    },
    [],
  )

  // --- Подходы ---

  const addSet = useCallback(
    (workoutId: string, exerciseId: string) => {
      setWorkouts((prev) =>
        prev.map((w) => {
          if (w.id !== workoutId) return w
          return {
            ...w,
            exercises: w.exercises.map((e) => {
              if (e.id !== exerciseId) return e
              // Новый подход наследует значения предыдущего — меньше ввода.
              const last = e.sets[e.sets.length - 1]
              const set: WorkoutSet = {
                id: uid(),
                weight: last ? last.weight : 0,
                reps: last ? last.reps : 0,
              }
              return { ...e, sets: [...e.sets, set] }
            }),
          }
        }),
      )
    },
    [],
  )

  const updateSet = useCallback(
    (
      workoutId: string,
      exerciseId: string,
      setId: string,
      patch: Partial<Omit<WorkoutSet, 'id'>>,
    ) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exerciseId
                    ? {
                        ...e,
                        sets: e.sets.map((s) =>
                          s.id === setId ? { ...s, ...patch } : s,
                        ),
                      }
                    : e,
                ),
              }
            : w,
        ),
      )
    },
    [],
  )

  const deleteSet = useCallback(
    (workoutId: string, exerciseId: string, setId: string) => {
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exerciseId
                    ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
                    : e,
                ),
              }
            : w,
        ),
      )
    },
    [],
  )

  return {
    workouts,
    createWorkout,
    copyWorkout,
    updateWorkout,
    deleteWorkout,
    deleteWorkoutsByPerson,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  }
}

export type WorkoutsApi = ReturnType<typeof useWorkouts>
