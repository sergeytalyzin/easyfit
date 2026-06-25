import type { Workout } from '../types'

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
