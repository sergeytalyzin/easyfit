import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Avatar } from '../components/Avatar'
import { Calendar } from '../components/Calendar'
import { TemplatePickerSheet } from '../components/TemplatePickerSheet'
import { formatDate, dayKey, formatDayKeyFull } from '../utils/date'
import { lastWorkoutOf, workoutsOf } from '../utils/workouts'
import type { Workout } from '../types'
import styles from './PersonPage.module.css'

export function PersonPage() {
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const { people, favoriteId, deletePerson, toggleFavorite } = usePeopleContext()
  const { workouts, deleteWorkoutsByPerson } = useWorkoutsContext()
  const { completed, completeTemplate, deleteCompletedByPerson } =
    useCompletedWorkoutsContext()

  const [selectedKey, setSelectedKey] = useState(() => dayKey(new Date()))
  const [pickerOpen, setPickerOpen] = useState(false)

  const person = people.find((p) => p.id === personId)

  // Выполненные тренировки человека + индексы по дням (для точек и списка).
  const ownCompleted = useMemo(
    () => completed.filter((c) => c.personId === personId),
    [completed, personId],
  )
  const markedKeys = useMemo(
    () => new Set(ownCompleted.map((c) => c.date)),
    [ownCompleted],
  )
  const dayCompleted = ownCompleted.filter((c) => c.date === selectedKey)

  if (!person) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate('/')}>
          ‹ Назад
        </button>
        <p className={styles.missing}>Человек не найден.</p>
      </div>
    )
  }

  // Тренировки конкретного человека — фильтр по personId.
  const own = workoutsOf(workouts, person.id)
  const last = lastWorkoutOf(workouts, person.id)
  const isFavorite = favoriteId === person.id

  function onDeletePerson() {
    if (confirm(`Удалить «${person!.name}» и все его тренировки?`)) {
      deleteWorkoutsByPerson(person!.id)
      deleteCompletedByPerson(person!.id)
      deletePerson(person!.id)
      navigate('/', { replace: true })
    }
  }

  function onPickTemplate(template: Workout) {
    completeTemplate(template, selectedKey)
    setPickerOpen(false)
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/')}>
        ‹ Назад
      </button>

      <header className={`${styles.profile} appear`}>
        <Avatar name={person.name} avatar={person.avatar} size={96} />
        <h1 className={styles.name}>{person.name}</h1>
        <p className={styles.stats}>
          {own.length === 0
            ? 'Пока нет тренировок'
            : `${own.length} трен.${last ? ` · последняя ${formatDate(last.date)}` : ''}`}
        </p>
        <button
          className={`${styles.favBtn} ${isFavorite ? styles.favBtnOn : ''}`}
          onClick={() => toggleFavorite(person.id)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '★ Основной' : '☆ Сделать основным'}
        </button>
      </header>

      {/* Календарь и отметка выполненной тренировки */}
      <Calendar
        selectedKey={selectedKey}
        markedKeys={markedKeys}
        onSelect={setSelectedKey}
      />

      <div className={styles.dayHead}>{formatDayKeyFull(selectedKey)}</div>

      {dayCompleted.length > 0 && (
        <div className={styles.dayList}>
          {dayCompleted.map((c) => (
            <Link
              key={c.id}
              to={`/person/${person.id}/completed/${c.id}`}
              className={styles.dayLink}
            >
              <Card className={styles.dayItem}>
                <span className={styles.dayCheck}>✓</span>
                <span className={styles.dayName}>{c.name}</span>
                <span className={styles.dayCount}>{c.exercises.length} упр.</span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Button full onClick={() => setPickerOpen(true)}>
        + Отметить тренировку
      </Button>

      <Button
        full
        variant="secondary"
        onClick={() => navigate(`/person/${person.id}/progress`)}
      >
        📅 Прогресс
      </Button>

      {/* Шаблоны тренировок */}
      <h2 className={styles.section}>Шаблоны тренировок</h2>

      <Button
        full
        variant="secondary"
        onClick={() => navigate(`/person/${person.id}/new`)}
      >
        + Новый шаблон
      </Button>

      {own.length > 0 && (
        <Button
          full
          variant="secondary"
          onClick={() => navigate(`/person/${person.id}/stats`)}
        >
          📈 Прогресс по весам
        </Button>
      )}

      {own.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏋️</div>
          <p>Создайте первый шаблон тренировки</p>
        </div>
      ) : (
        <div className={styles.list}>
          {own.map((w, i) => (
            <Link
              key={w.id}
              to={`/person/${person.id}/workout/${w.id}`}
              className={`${styles.link} appear`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <Card className={styles.item}>
                <div>
                  <div className={styles.wName}>{w.name}</div>
                  <div className={styles.wMeta}>{formatDate(w.date)}</div>
                </div>
                <div className={styles.count}>
                  {w.exercises.length}
                  <span className={styles.countLabel}>упр.</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <button className={styles.deletePerson} onClick={onDeletePerson}>
        Удалить человека
      </button>

      <TemplatePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        dateLabel={formatDayKeyFull(selectedKey)}
        templates={own}
        onPick={onPickTemplate}
      />
    </div>
  )
}
