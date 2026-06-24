// Вся логика сохранения людей и тренировок в localStorage собрана здесь.
// Это единственное место, которое знает про localStorage — поэтому
// в будущем легко заменить хранилище (IndexedDB, экспорт/импорт, облако).

import type { Person, Workout } from '../types'
import { uid } from './id'

const WORKOUTS_KEY = 'gym-tracker:workouts'
const PEOPLE_KEY = 'gym-tracker:people'
// Версия схемы данных. Пригодится для будущих миграций при изменении формата.
const SCHEMA_VERSION = 2

interface StoredWorkouts {
  version: number
  workouts: Workout[]
}

interface StoredPeople {
  version: number
  people: Person[]
}

function readWorkoutsRaw(): Workout[] {
  try {
    const raw = localStorage.getItem(WORKOUTS_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as StoredWorkouts
    return Array.isArray(data?.workouts) ? data.workouts : []
  } catch (e) {
    console.error('Не удалось загрузить тренировки:', e)
    return []
  }
}

function readPeopleRaw(): Person[] {
  try {
    const raw = localStorage.getItem(PEOPLE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as StoredPeople
    return Array.isArray(data?.people) ? data.people : []
  } catch (e) {
    console.error('Не удалось загрузить людей:', e)
    return []
  }
}

// --- Миграция ---
// Безопасно приводит старые данные к схеме v2: если есть тренировки без
// personId, создаём дефолтного человека «Я» и привязываем их к нему.
// Функция идемпотентна — повторный вызов ничего не портит.
let migrationDone = false
function runMigration(): void {
  if (migrationDone) return
  migrationDone = true

  const workouts = readWorkoutsRaw()
  const people = readPeopleRaw()

  const orphans = workouts.filter((w) => !w.personId)
  if (orphans.length === 0) return // всё уже привязано — миграция не нужна

  let defaultPerson = people[0]
  if (!defaultPerson) {
    defaultPerson = {
      id: uid(),
      name: 'Я',
      avatar: null,
      createdAt: new Date().toISOString(),
    }
    people.push(defaultPerson)
  }

  for (const w of orphans) w.personId = defaultPerson.id

  savePeople(people)
  saveWorkouts(workouts)
}

// --- Публичное API ---

export function loadWorkouts(): Workout[] {
  runMigration()
  return readWorkoutsRaw()
}

export function saveWorkouts(workouts: Workout[]): void {
  try {
    const data: StoredWorkouts = { version: SCHEMA_VERSION, workouts }
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Не удалось сохранить тренировки:', e)
  }
}

export function loadPeople(): Person[] {
  runMigration()
  return readPeopleRaw()
}

export function savePeople(people: Person[]): void {
  try {
    const data: StoredPeople = { version: SCHEMA_VERSION, people }
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Не удалось сохранить людей:', e)
  }
}

// Удобно для будущего экспорта данных.
export function exportData(): string {
  return JSON.stringify(
    { version: SCHEMA_VERSION, people: loadPeople(), workouts: loadWorkouts() },
    null,
    2,
  )
}
