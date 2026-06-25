import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import { Card } from '../components/Card'
import { formatDayKey } from '../utils/date'
import styles from './ProgressPage.module.css'

export function ProgressPage() {
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const { people } = usePeopleContext()
  const { completed } = useCompletedWorkoutsContext()

  const person = people.find((p) => p.id === personId)
  // Выполненные тренировки человека, свежие сверху.
  const own = completed
    .filter((c) => c.personId === personId)
    .sort((a, b) =>
      a.date === b.date
        ? b.createdAt.localeCompare(a.createdAt)
        : b.date.localeCompare(a.date),
    )

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/person/${personId}`)}>
        ‹ Назад
      </button>

      <h1 className={styles.title}>Прогресс</h1>
      {person && <p className={styles.subtitle}>{person.name}</p>}

      {own.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📅</div>
          <p>Отметьте выполненную тренировку в календаре.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {own.map((c, i) => (
            <Link
              key={c.id}
              to={`/person/${personId}/completed/${c.id}`}
              className={`${styles.link} appear`}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <Card className={styles.item}>
                <div className={styles.dateBox}>
                  <span className={styles.date}>{formatDayKey(c.date)}</span>
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{c.name}</div>
                  <div className={styles.meta}>{c.exercises.length} упр.</div>
                </div>
                <span className={styles.chevron}>›</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
