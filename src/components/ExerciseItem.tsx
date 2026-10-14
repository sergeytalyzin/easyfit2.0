import { useState } from 'react'
import { CheckCheck, ChevronDown, ChevronsUpDown, Layers, Plus, X } from 'lucide-react'
import type { Exercise, WorkoutSet } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SetRow, type SetMode } from './SetRow'
import { formatRange, isEffectiveSet, planOf, samePlan } from '@/utils/sets'
import { cn } from '@/lib/utils'

interface Props {
  exercise: Exercise
  mode: SetMode
  defaultOpen?: boolean
  onPickName: () => void // открыть выбор упражнения из справочника
  onDelete: () => void
  onAddSet: () => void
  onBulkAdd: () => void // план: несколько подходов сразу
  onEditSet: (setId: string) => void // план: редактор подхода
  onUpdateSet: (setId: string, patch: Partial<Omit<WorkoutSet, 'id'>>) => void
  onDeleteSet: (setId: string) => void
}

export function ExerciseItem({
  exercise,
  mode,
  defaultOpen = false,
  onPickName,
  onDelete,
  onAddSet,
  onBulkAdd,
  onEditSet,
  onUpdateSet,
  onDeleteSet,
}: Props) {
  // По умолчанию свёрнуто — список компактный; при записи факта — развёрнуто.
  const [open, setOpen] = useState(defaultOpen)
  const { sets } = exercise
  const doneCount = sets.filter((s) => s.done !== false).length

  return (
    <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-1 p-2 pr-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Свернуть упражнение' : 'Развернуть упражнение'}
        >
          <ChevronDown className={cn('transition-transform duration-200', open && 'rotate-180')} />
        </Button>

        <button className="group min-w-0 flex-1 rounded-xl px-1 py-1 text-left" onClick={onPickName}>
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                'truncate text-[17px] font-bold leading-tight',
                exercise.name ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {exercise.name || 'Выберите упражнение'}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </span>
          <span className="mt-0.5 block text-xs font-medium tabular-nums text-muted-foreground">
            {mode === 'plan' ? planSummary(sets) : factSummary(sets, doneCount)}
          </span>
        </button>

        <Button
          variant="secondary"
          size="icon"
          className="size-8 shrink-0 rounded-full text-muted-foreground"
          onClick={onDelete}
          aria-label="Удалить упражнение"
        >
          <X className="!size-4" />
        </Button>
      </div>

      {open && (
        <div className="border-t border-border/60 px-3 pb-3 pt-2 animate-in fade-in">
          {sets.map((set, i) => (
            <SetRow
              key={set.id}
              index={i}
              set={set}
              mode={mode}
              onChange={(patch) => onUpdateSet(set.id, patch)}
              onEdit={() => onEditSet(set.id)}
              onDelete={() => onDeleteSet(set.id)}
            />
          ))}

          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              // Пустой шаблон — сразу схема из нескольких подходов.
              onClick={mode === 'plan' && sets.length === 0 ? onBulkAdd : onAddSet}
            >
              <Plus /> Подход
            </Button>
            {mode === 'plan' && sets.length > 0 && (
              <Button variant="secondary" className="flex-1" onClick={onBulkAdd}>
                <Layers /> Несколько
              </Button>
            )}
            {mode === 'fact' && sets.length > 0 && doneCount < sets.length && (
              <Button
                variant="secondary"
                className="flex-1 text-primary"
                onClick={() => sets.forEach((s) => s.done === false && onUpdateSet(s.id, { done: true }))}
              >
                <CheckCheck /> Отметить все
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

// «3 × 8–12 · 60–70 кг», если подходы одинаковые; иначе «4 подх. · до 80 кг».
function planSummary(sets: WorkoutSet[]): string {
  if (sets.length === 0) return 'Нет подходов'
  const first = planOf(sets[0])
  if (sets.every((s) => samePlan(planOf(s), first))) {
    const weight = first.weight > 0 ? ` · ${formatRange(first.weight, first.weightMax)} кг` : ''
    return `${sets.length} × ${formatRange(first.reps, first.repsMax)}${weight}`
  }
  const top = Math.max(...sets.map((s) => s.weightMax ?? s.weight))
  return `${sets.length} подх.${top > 0 ? ` · до ${top.toLocaleString('ru-RU')} кг` : ''}`
}

function factSummary(sets: WorkoutSet[], doneCount: number): string {
  if (sets.length === 0) return 'Нет подходов'
  const effective = sets.filter(isEffectiveSet)
  const max = effective.length ? Math.max(...effective.map((s) => s.weight)) : 0
  return `${doneCount}/${sets.length} выполнено${max > 0 ? ` · макс ${max.toLocaleString('ru-RU')} кг` : ''}`
}
