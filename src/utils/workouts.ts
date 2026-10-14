import type { Exercise, Workout, WorkoutSet } from '../types'

// Тренировки конкретного человека — единый фильтр по personId,
// чтобы данные разных людей не смешивались.
export function workoutsOf(workouts: Workout[], personId: string): Workout[] {
  return workouts.filter((w) => w.personId === personId)
}

// Последняя (самая свежая по дате) тренировка человека или null.
export function lastWorkoutOf(
  workouts: Workout[],
  personId: string,
): Workout | null {
  return workoutsOf(workouts, personId).reduce<Workout | null>(
    (latest, w) => (!latest || w.date > latest.date ? w : latest),
    null,
  )
}

// Название тренировки с подстановкой для пустого.
export function workoutTitle(w: Workout): string {
  return w.name.trim() || 'Без названия'
}

// --- Статистика по упражнениям ---

// Один «сеанс» упражнения: данные одной тренировки по этому упражнению.
export interface ExerciseSession {
  date: string
  maxWeight: number // максимальный вес в этот день
  topReps: number // повторения в подходе с максимальным весом
  volume: number // суммарный тоннаж (вес × повторения)
}

// Сводка по одному упражнению: его сеансы по возрастанию даты + пики.
export interface ExerciseStat {
  name: string
  sessions: ExerciseSession[] // отсортированы по дате (старые → новые)
  bestWeight: number // лучший вес за всё время
}

// Группирует подходы по названию упражнения, чтобы строить прогресс по весам.
// Принимает уже отфильтрованный список сеансов (дата + упражнения) — подходит
// и для шаблонов, и для выполненных тренировок. Упражнения без названия или
// без подходов пропускаем. Группировка регистронезависимая.
export function exerciseStats(
  sessions: { date: string; exercises: Exercise[] }[],
): ExerciseStat[] {
  const map = new Map<string, ExerciseStat>()

  for (const w of sessions) {
    for (const ex of w.exercises) {
      const name = ex.name.trim()
      if (!name || ex.sets.length === 0) continue

      const maxWeight = Math.max(...ex.sets.map((s) => s.weight))
      const top = ex.sets.reduce(
        (best, s) => (s.weight > best.weight ? s : best),
        ex.sets[0],
      )
      const volume = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)

      const key = name.toLowerCase()
      let stat = map.get(key)
      if (!stat) {
        stat = { name, sessions: [], bestWeight: 0 }
        map.set(key, stat)
      }
      stat.sessions.push({
        date: w.date,
        maxWeight,
        topReps: top.reps,
        volume,
      })
      stat.bestWeight = Math.max(stat.bestWeight, maxWeight)
    }
  }

  const result = [...map.values()]
  for (const stat of result) {
    stat.sessions.sort((a, b) => (a.date < b.date ? -1 : 1))
  }
  // Упражнения с самым свежим сеансом — выше.
  result.sort((a, b) => {
    const la = a.sessions[a.sessions.length - 1].date
    const lb = b.sessions[b.sessions.length - 1].date
    return la < lb ? 1 : -1
  })
  return result
}

// Глубокая копия подходов с новыми id — для дублирования тренировки.
export function cloneSets(sets: WorkoutSet[], makeId: () => string): WorkoutSet[] {
  return sets.map((s) => ({ id: makeId(), weight: s.weight, reps: s.reps }))
}

// Глубокая копия упражнений с новыми id — снимок шаблона.
export function cloneExercises(
  exercises: Exercise[],
  makeId: () => string,
): Exercise[] {
  return exercises.map((e) => ({
    id: makeId(),
    name: e.name,
    sets: cloneSets(e.sets, makeId),
  }))
}

// --- Чистые иммутабельные операции над списком упражнений ---
// Вынесены отдельно, чтобы их могли переиспользовать разные хранилища
// (шаблоны и выполненные тренировки) без дублирования логики.

export function addExerciseTo(
  exercises: Exercise[],
  name: string,
  makeId: () => string,
): Exercise[] {
  return [...exercises, { id: makeId(), name: name.trim(), sets: [] }]
}

export function renameExerciseIn(
  exercises: Exercise[],
  exerciseId: string,
  name: string,
): Exercise[] {
  return exercises.map((e) => (e.id === exerciseId ? { ...e, name } : e))
}

export function removeExerciseFrom(
  exercises: Exercise[],
  exerciseId: string,
): Exercise[] {
  return exercises.filter((e) => e.id !== exerciseId)
}

export function addSetTo(
  exercises: Exercise[],
  exerciseId: string,
  makeId: () => string,
): Exercise[] {
  return exercises.map((e) => {
    if (e.id !== exerciseId) return e
    // Новый подход наследует значения предыдущего — меньше ввода.
    const last = e.sets[e.sets.length - 1]
    const set: WorkoutSet = {
      id: makeId(),
      weight: last ? last.weight : 0,
      reps: last ? last.reps : 0,
    }
    return { ...e, sets: [...e.sets, set] }
  })
}

export function updateSetIn(
  exercises: Exercise[],
  exerciseId: string,
  setId: string,
  patch: Partial<Omit<WorkoutSet, 'id'>>,
): Exercise[] {
  return exercises.map((e) =>
    e.id === exerciseId
      ? {
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        }
      : e,
  )
}

export function removeSetFrom(
  exercises: Exercise[],
  exerciseId: string,
  setId: string,
): Exercise[] {
  return exercises.map((e) =>
    e.id === exerciseId
      ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
      : e,
  )
}
