import { useNavigate, useParams } from 'react-router-dom'
import { usePeopleContext } from '../hooks/PeopleContext'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { Card } from '../components/Card'
import { formatDate } from '../utils/date'
import { exerciseStats, type ExerciseStat } from '../utils/workouts'
import styles from './StatsPage.module.css'

export function StatsPage() {
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const { people } = usePeopleContext()
  const { workouts } = useWorkoutsContext()

  const person = people.find((p) => p.id === personId)
  const stats = exerciseStats(workouts, personId)

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/person/${personId}`)}>
        ‹ Назад
      </button>

      <h1 className={styles.title}>История и прогресс</h1>
      {person && <p className={styles.subtitle}>{person.name}</p>}

      {stats.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📈</div>
          <p>Пока нет данных. Добавьте упражнения с подходами в тренировках.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {stats.map((stat, i) => (
            <ExerciseCard key={stat.name} stat={stat} delay={Math.min(i, 8) * 40} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ stat, delay }: { stat: ExerciseStat; delay: number }) {
  const sessions = stat.sessions
  const last = sessions[sessions.length - 1]
  const prev = sessions[sessions.length - 2]
  const diff = prev ? last.maxWeight - prev.maxWeight : 0

  return (
    <Card className={`${styles.card} appear`} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.head}>
        <span className={styles.name}>{stat.name}</span>
        <span className={styles.best}>рекорд {stat.bestWeight} кг</span>
      </div>

      <div className={styles.current}>
        <span className={styles.curWeight}>{last.maxWeight} кг</span>
        {prev && (
          <span
            className={`${styles.trend} ${
              diff > 0 ? styles.up : diff < 0 ? styles.down : styles.flat
            }`}
          >
            {diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : '→ без изменений'}
          </span>
        )}
      </div>

      <ProgressChart stat={stat} />

      <div className={styles.history}>
        {[...sessions].reverse().map((s) => (
          <div key={s.workoutId} className={styles.row}>
            <span className={styles.date}>{formatDate(s.date)}</span>
            <span className={styles.detail}>
              {s.maxWeight} кг × {s.topReps}
            </span>
            <span className={styles.volume}>{s.volume} кг</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Простой столбчатый график максимального веса по сеансам.
function ProgressChart({ stat }: { stat: ExerciseStat }) {
  const max = stat.bestWeight || 1
  return (
    <div className={styles.chart}>
      {stat.sessions.map((s) => {
        const h = Math.max(8, Math.round((s.maxWeight / max) * 100))
        const isBest = s.maxWeight === stat.bestWeight
        return (
          <div
            key={s.workoutId}
            className={`${styles.bar} ${isBest ? styles.barBest : ''}`}
            style={{ height: `${h}%` }}
            title={`${formatDate(s.date)} · ${s.maxWeight} кг`}
          />
        )
      })}
    </div>
  )
}
