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
