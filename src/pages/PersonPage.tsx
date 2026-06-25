import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Avatar } from '../components/Avatar'
import { formatDate } from '../utils/date'
import { lastWorkoutOf, workoutsOf } from '../utils/workouts'
import styles from './PersonPage.module.css'

export function PersonPage() {
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const { people, favoriteId, deletePerson, toggleFavorite } = usePeopleContext()
  const { workouts, deleteWorkoutsByPerson } = useWorkoutsContext()

  const person = people.find((p) => p.id === personId)

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
      deletePerson(person!.id)
      navigate('/', { replace: true })
    }
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

      <Button full onClick={() => navigate(`/person/${person.id}/new`)}>
        Новая тренировка
      </Button>

      {own.length > 0 && (
        <Button
          full
          variant="secondary"
          onClick={() => navigate(`/person/${person.id}/stats`)}
        >
          📈 История и прогресс
        </Button>
      )}

      {own.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏋️</div>
          <p>Создайте первую тренировку</p>
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
    </div>
  )
}
