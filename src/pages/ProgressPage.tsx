import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useCompletedWorkoutsContext } from '../hooks/CompletedWorkoutsContext'
import type { CompletedWorkout } from '../types'
import { Card } from '../components/Card'
import { dayKey, formatDayKey } from '../utils/date'
import styles from './ProgressPage.module.css'

const WEEKS = 8

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
        <>
          <ActivityChart items={own} />

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
        </>
      )}
    </div>
  )
}

// Понедельник недели, в которую попадает дата (локально, 00:00).
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const shift = (x.getDay() + 6) % 7 // 0 = понедельник
  x.setDate(x.getDate() - shift)
  return x
}

// Красивый график активности: количество тренировок по неделям.
function ActivityChart({ items }: { items: CompletedWorkout[] }) {
  const thisMonday = startOfWeek(new Date())

  // Границы последних WEEKS недель (от старых к новым) в виде ключей дней.
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(thisMonday)
    start.setDate(start.getDate() - 7 * (WEEKS - 1 - i))
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { startKey: dayKey(start), endKey: dayKey(end), label: start.getDate() }
  })

  const counts = weeks.map(
    (w) => items.filter((c) => c.date >= w.startKey && c.date < w.endKey).length,
  )
  const max = Math.max(1, ...counts)

  const monthKey = dayKey(new Date()).slice(0, 7)
  const thisMonth = items.filter((c) => c.date.slice(0, 7) === monthKey).length

  return (
    <Card className={`${styles.chartCard} appear`}>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{items.length}</span>
          <span className={styles.statLabel}>всего</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{thisMonth}</span>
          <span className={styles.statLabel}>в этом месяце</span>
        </div>
      </div>

      <div className={styles.chart}>
        {weeks.map((w, i) => (
          <div key={w.startKey} className={styles.col}>
            <span className={styles.barVal}>{counts[i] || ''}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{ height: `${(counts[i] / max) * 100}%` }}
              />
            </div>
            <span className={styles.barLabel}>{w.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartCaption}>тренировок по неделям</div>
    </Card>
  )
}
