import { useNavigate, useParams } from 'react-router-dom'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { ExerciseItem } from '../components/ExerciseItem'
import { Button } from '../components/Button'
import { formatDate } from '../utils/date'
import styles from './WorkoutPage.module.css'

export function WorkoutPage() {
  const { id = '', personId = '' } = useParams()
  const navigate = useNavigate()
  const backToPerson = `/person/${personId}`
  const {
    workouts,
    updateWorkout,
    deleteWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  } = useWorkoutsContext()

  const workout = workouts.find((w) => w.id === id)

  if (!workout) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate(backToPerson)}>
          ‹ Назад
        </button>
        <p className={styles.missing}>Тренировка не найдена.</p>
      </div>
    )
  }

  function onDeleteWorkout() {
    if (confirm('Удалить тренировку целиком?')) {
      deleteWorkout(workout!.id)
      navigate(backToPerson, { replace: true })
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(backToPerson)}>
        ‹ Назад
      </button>

      <div className={styles.head}>
        <input
          className={styles.title}
          value={workout.name}
          placeholder="Название тренировки"
          onChange={(e) => updateWorkout(workout.id, { name: e.target.value })}
        />
        <div className={styles.date}>{formatDate(workout.date)}</div>
      </div>

      <div className={styles.exercises}>
        {workout.exercises.map((ex) => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            onRename={(name) => updateExercise(workout.id, ex.id, name)}
            onDelete={() => deleteExercise(workout.id, ex.id)}
            onAddSet={() => addSet(workout.id, ex.id)}
            onUpdateSet={(setId, patch) => updateSet(workout.id, ex.id, setId, patch)}
            onDeleteSet={(setId) => deleteSet(workout.id, ex.id, setId)}
          />
        ))}
      </div>

      <Button full variant="secondary" onClick={() => addExercise(workout.id, '')}>
        + упражнение
      </Button>

      <button className={styles.deleteWorkout} onClick={onDeleteWorkout}>
        Удалить тренировку
      </button>
    </div>
  )
}
