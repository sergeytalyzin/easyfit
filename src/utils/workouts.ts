import type { Workout, WorkoutSet } from '../types'

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
  workoutId: string
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

// Группирует все подходы человека по названию упражнения, чтобы строить
// историю и прогресс по весам. Упражнения без названия или без подходов
// пропускаем. Группировка регистронезависимая, но имя берём как введено.
export function exerciseStats(
  workouts: Workout[],
  personId: string,
): ExerciseStat[] {
  const map = new Map<string, ExerciseStat>()

  for (const w of workoutsOf(workouts, personId)) {
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
        workoutId: w.id,
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
