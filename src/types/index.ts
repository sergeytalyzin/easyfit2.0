// Доменные типы приложения. Вынесены отдельно, чтобы их было удобно
// расширять в будущем (история, шаблоны, экспорт и т.д.).

export interface Person {
  id: string
  name: string
  avatar?: string | null // dataURL картинки или null (тогда показываем букву)
  createdAt: string // ISO-строка
}

export interface WorkoutSet {
  id: string
  weight: number // вес в кг
  reps: number // количество повторений
}

export interface Exercise {
  id: string
  name: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  personId: string // к какому человеку относится тренировка
  name: string
  date: string // ISO-строка даты создания
  exercises: Exercise[]
}

// Выполненная тренировка — снимок шаблона на конкретную дату.
// Хранится отдельно от шаблонов: редактируется независимо и не меняет шаблон.
export interface CompletedWorkout {
  id: string
  personId: string
  templateId: string | null // шаблон-источник (если был); null если шаблон удалён
  name: string
  date: string // день выполнения в формате YYYY-MM-DD
  createdAt: string // ISO-строка момента отметки
  exercises: Exercise[] // копия упражнений шаблона на момент отметки
}
