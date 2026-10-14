import type { SetPlan, WorkoutSet } from '../types'

// Подход учитывается в статистике, если в нём есть повторения и он не
// помечен как невыполненный (у старых записей отметки нет — считаем выполненным).
export function isEffectiveSet(s: WorkoutSet): boolean {
  return s.reps > 0 && s.done !== false
}

const num = (n: number) => n.toLocaleString('ru-RU')

// «8–12» для диапазона, «10» для точного значения.
export function formatRange(min: number, max?: number): string {
  return max !== undefined && max > min ? `${num(min)}–${num(max)}` : num(min)
}

// «60–70 кг × 8–12» — краткая запись плана подхода.
export function formatPlan(p: SetPlan): string {
  return `${formatRange(p.weight, p.weightMax)} кг × ${formatRange(p.reps, p.repsMax)}`
}

export function planOf(s: WorkoutSet): SetPlan {
  return { weight: s.weight, weightMax: s.weightMax, reps: s.reps, repsMax: s.repsMax }
}

// Одинаковый ли план у всех подходов (для краткой сводки «3 × 8–12»).
export function samePlan(a: SetPlan, b: SetPlan): boolean {
  return (
    a.weight === b.weight &&
    a.weightMax === b.weightMax &&
    a.reps === b.reps &&
    a.repsMax === b.repsMax
  )
}
